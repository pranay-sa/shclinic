import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./db.js";
import { env } from "./config.js";
import { emitClinicEvent } from "./realtime.js";

type Role = "frontdesk_exec" | "doctor" | "lab_technician" | "clinic_admin";
type AuthPayload = { sub: string; role: Role; clinicId: string };

type AuthedRequest = express.Request & { auth?: AuthPayload };

function makeCode(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

function parseAuth(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ code: "UNAUTHORIZED", message: "Missing bearer token" });
  try {
    req.auth = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    return next();
  } catch {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid bearer token" });
  }
}

function requireClinic(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const clinicHeader = req.headers["x-clinic-id"] as string | undefined;
  const clinicId = clinicHeader || req.auth?.clinicId;
  if (!clinicId || clinicId !== req.auth?.clinicId) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Invalid clinic context" });
  }
  next();
}

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(8),
  clinicCode: z.string().min(2)
});

const patientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.string().min(1),
  dateOfBirth: z.string(),
  mobile: z.string().min(8),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().optional()
});

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.API_CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString()
  });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const row = await db.query(
      `SELECT u.id, u.full_name, u.username, u.role, c.id AS clinic_id
       FROM users u
       JOIN user_clinics uc ON uc.user_id = u.id
       JOIN clinics c ON c.id = uc.clinic_id
       WHERE u.username = $1
         AND c.code = $2
         AND u.password_hash = crypt($3, u.password_hash)
         AND u.is_active = true`,
      [body.username, body.clinicCode, body.password]
    );
    const user = row.rows[0];
    if (!user) return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id, role: user.role, clinicId: user.clinic_id }, env.JWT_SECRET, { expiresIn: "12h" });
    res.json({
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.full_name,
        role: user.role,
        clinicIds: [user.clinic_id]
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", parseAuth, requireClinic);

app.get("/api/dashboard/frontdesk", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const [{ rows: apptRows }, { rows: patientRows }, { rows: labsRows }, { rows: invoiceRows }] = await Promise.all([
    db.query("SELECT COUNT(*)::int AS count FROM appointments WHERE clinic_id = $1 AND appointment_date = CURRENT_DATE", [clinicId]),
    db.query("SELECT COUNT(*)::int AS count FROM patients WHERE clinic_id = $1", [clinicId]),
    db.query("SELECT COUNT(*)::int AS count FROM lab_orders WHERE clinic_id = $1", [clinicId]),
    db.query("SELECT COALESCE(SUM(total),0)::float AS total FROM invoices WHERE clinic_id = $1", [clinicId])
  ]);
  res.json({
    appointmentsToday: apptRows[0].count,
    totalPatients: patientRows[0].count,
    labsToday: labsRows[0].count,
    totalRevenue: invoiceRows[0].total
  });
});

app.get("/api/dashboard/doctor", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const doctorId = req.auth!.sub;
  const rows = await db.query<{
    appointment_code: string;
    appointment_date: string;
    slot_time: string;
    status: string;
    first_name: string;
    last_name: string;
  }>(
    `SELECT appointment_code, appointment_date, slot_time, status, p.first_name, p.last_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.clinic_id = $1 AND a.doctor_id = $2
     ORDER BY appointment_date, slot_time`,
    [clinicId, doctorId]
  );
  res.json({
    appointments: rows.rows.map((r: {
      appointment_code: string;
      appointment_date: string;
      slot_time: string;
      status: string;
      first_name: string;
      last_name: string;
    }) => ({
      appointmentCode: r.appointment_code,
      date: r.appointment_date,
      time: r.slot_time,
      status: r.status,
      patientName: `${r.first_name} ${r.last_name}`
    }))
  });
});

app.get("/api/dashboard/lab", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const rows = await db.query(
    `SELECT
      COUNT(*) FILTER (WHERE report_status = 'done')::int AS reports_completed,
      COUNT(*) FILTER (WHERE process_status = 'active')::int AS in_processing,
      COUNT(*) FILTER (WHERE sample_status = 'pending')::int AS pending_orders,
      COUNT(*)::int AS total_today
    FROM lab_orders
    WHERE clinic_id = $1`,
    [clinicId]
  );
  res.json(rows.rows[0]);
});

app.get("/api/patients", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const q = (req.query.search as string | undefined)?.trim() ?? "";
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 50);
  const offset = (page - 1) * pageSize;
  const search = `%${q.toLowerCase()}%`;
  const [rows, count] = await Promise.all([
    db.query(
      `SELECT id, patient_code, first_name, last_name, mobile, gender, date_of_birth, created_at
       FROM patients
       WHERE clinic_id = $1
       AND ($2 = '%%' OR LOWER(first_name || ' ' || last_name) LIKE $2 OR LOWER(patient_code) LIKE $2 OR LOWER(mobile) LIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [clinicId, search, pageSize, offset]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total
       FROM patients
       WHERE clinic_id = $1
       AND ($2 = '%%' OR LOWER(first_name || ' ' || last_name) LIKE $2 OR LOWER(patient_code) LIKE $2 OR LOWER(mobile) LIKE $2)`,
      [clinicId, search]
    )
  ]);
  res.json({
    items: rows.rows,
    page,
    pageSize,
    total: count.rows[0].total
  });
});

app.post("/api/patients", async (req: AuthedRequest, res, next) => {
  try {
    const clinicId = req.auth!.clinicId;
    const body = patientCreateSchema.parse(req.body);
    const patientCode = `PT-${crypto.randomInt(1000, 9999)}`;
    const inserted = await db.query(
      `INSERT INTO patients (
        patient_code, clinic_id, first_name, last_name, gender, date_of_birth, mobile, email, address_line, city, state, pin
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, patient_code, first_name, last_name, mobile, gender, date_of_birth, created_at`,
      [
        patientCode,
        clinicId,
        body.firstName,
        body.lastName,
        body.gender,
        body.dateOfBirth,
        body.mobile,
        body.email ?? null,
        body.address ?? null,
        body.city ?? null,
        body.state ?? null,
        body.pin ?? null
      ]
    );
    emitClinicEvent(clinicId, "patients.updated", { action: "created", patientId: inserted.rows[0].id });
    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/patients/:patientId", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const { patientId } = req.params;
  const row = await db.query(
    `SELECT id, patient_code, first_name, last_name, mobile, email, gender, date_of_birth, address_line, city, state, pin, created_at
     FROM patients WHERE clinic_id = $1 AND id = $2`,
    [clinicId, patientId]
  );
  if (!row.rows[0]) return res.status(404).json({ code: "NOT_FOUND", message: "Patient not found" });
  res.json(row.rows[0]);
});

app.get("/api/appointments", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const date = (req.query.date as string | undefined) ?? undefined;
  const rows = await db.query(
    `SELECT a.id, a.appointment_code, a.appointment_date, a.slot_time, a.visit_type, a.status,
      p.id AS patient_id, p.first_name, p.last_name, u.full_name AS doctor_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     LEFT JOIN users u ON u.id = a.doctor_id
     WHERE a.clinic_id = $1 AND ($2::date IS NULL OR a.appointment_date = $2::date)
     ORDER BY a.appointment_date, a.slot_time`,
    [clinicId, date ?? null]
  );
  res.json(rows.rows);
});

app.get("/api/doctors", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const rows = await db.query(
    `SELECT u.id, u.full_name, u.username
     FROM users u
     JOIN user_clinics uc ON uc.user_id = u.id
     WHERE uc.clinic_id = $1 AND u.role = 'doctor' AND u.is_active = true`,
    [clinicId]
  );
  res.json(rows.rows);
});

app.get("/api/queue", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const rows = await db.query(
    `SELECT q.id, q.position, q.status, q.doctor_id, p.patient_code, p.first_name, p.last_name, u.full_name AS doctor_name
      FROM queue_entries q
      JOIN patients p ON p.id = q.patient_id
      LEFT JOIN users u ON u.id = q.doctor_id
      WHERE q.clinic_id = $1
      ORDER BY q.position`,
    [clinicId]
  );
  res.json(rows.rows);
});

app.delete("/api/queue/:id", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  await db.query("DELETE FROM queue_entries WHERE clinic_id = $1 AND id = $2", [clinicId, req.params.id]);
  emitClinicEvent(clinicId, "queue.updated", { action: "deleted", id: req.params.id });
  res.status(204).send();
});

app.get("/api/medical-records", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const patientId = req.query.patientId as string;
  const type = req.query.type as string | undefined;
  const rows = await db.query(
    `SELECT id, record_type, title, ref_code, source, file_name, created_at
     FROM medical_records
     WHERE clinic_id = $1 AND patient_id = $2
     AND ($3::text IS NULL OR record_type = $3::text)
     ORDER BY created_at DESC`,
    [clinicId, patientId, type ?? null]
  );
  res.json(rows.rows);
});

app.post("/api/medical-records", async (req: AuthedRequest, res, next) => {
  try {
    const clinicId = req.auth!.clinicId;
    const schema = z.object({
      patientId: z.string().uuid(),
      recordType: z.enum(["prescription", "bill", "image_report", "text_report"]),
      title: z.string().min(1),
      source: z.enum(["S&H", "Other"]),
      fileName: z.string().min(3)
    });
    const body = schema.parse(req.body);
    const refCode = makeCode(body.recordType === "prescription" ? "RX" : "REP");
    const row = await db.query(
      `INSERT INTO medical_records (clinic_id, patient_id, author_user_id, record_type, title, ref_code, source, file_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, record_type, title, ref_code, source, file_name, created_at`,
      [clinicId, body.patientId, req.auth!.sub, body.recordType, body.title, refCode, body.source, body.fileName]
    );
    emitClinicEvent(clinicId, "records.updated", { action: "created", patientId: body.patientId });
    res.status(201).json(row.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/medical-records/:id", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  await db.query("DELETE FROM medical_records WHERE clinic_id = $1 AND id = $2", [clinicId, req.params.id]);
  emitClinicEvent(clinicId, "records.updated", { action: "deleted", id: req.params.id });
  res.status(204).send();
});

app.get("/api/lab/orders", async (req: AuthedRequest, res) => {
  const clinicId = req.auth!.clinicId;
  const rows = await db.query(
    `SELECT l.id, l.order_code, l.ordered_at, l.eta_at, l.category, l.tests, l.sample_id, l.sample_status, l.process_status, l.report_status,
      p.first_name, p.last_name, p.patient_code
     FROM lab_orders l
     JOIN patients p ON p.id = l.patient_id
     WHERE l.clinic_id = $1
     ORDER BY l.ordered_at DESC`,
    [clinicId]
  );
  res.json(rows.rows);
});

app.patch("/api/lab/orders/:id/stage", async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      sampleStatus: z.enum(["pending", "active", "done"]).optional(),
      processStatus: z.enum(["pending", "active", "done"]).optional(),
      reportStatus: z.enum(["pending", "active", "done"]).optional()
    });
    const body = schema.parse(req.body);
    const clinicId = req.auth!.clinicId;
    const row = await db.query(
      `UPDATE lab_orders
       SET sample_status = COALESCE($1, sample_status),
           process_status = COALESCE($2, process_status),
           report_status = COALESCE($3, report_status)
       WHERE id = $4 AND clinic_id = $5
       RETURNING *`,
      [body.sampleStatus ?? null, body.processStatus ?? null, body.reportStatus ?? null, req.params.id, clinicId]
    );
    if (!row.rows[0]) return res.status(404).json({ code: "NOT_FOUND", message: "Lab order not found" });
    emitClinicEvent(clinicId, "lab.updated", { orderId: req.params.id });
    res.json(row.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/billing/checkout", async (req: AuthedRequest, res, next) => {
  try {
    const clinicId = req.auth!.clinicId;
    const schema = z.object({
      patientId: z.string().uuid(),
      lines: z.array(
        z.object({
          title: z.string(),
          qty: z.number().int().positive(),
          price: z.number().nonnegative()
        })
      ),
      discount: z.number().nonnegative().default(0),
      coins: z.number().nonnegative().default(0),
      paymentMode: z.enum(["card", "upi", "cash"])
    });
    const body = schema.parse(req.body);
    const subtotal = body.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
    const total = Math.max(0, subtotal - body.discount - body.coins);
    const invoiceCode = makeCode("INV");
    const row = await db.query(
      `INSERT INTO invoices (invoice_code, clinic_id, patient_id, lines, subtotal, discount, coins, total, payment_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, invoice_code, subtotal, discount, coins, total, payment_mode, created_at`,
      [invoiceCode, clinicId, body.patientId, JSON.stringify(body.lines), subtotal, body.discount, body.coins, total, body.paymentMode]
    );
    emitClinicEvent(clinicId, "billing.updated", { invoiceId: row.rows[0].id });
    res.status(201).json(row.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid request payload", details: error.flatten() });
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return res.status(500).json({ code: "INTERNAL_ERROR", message });
});
