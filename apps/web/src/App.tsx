import { Navigate, Route, Routes } from "react-router-dom";
import { FrontdeskPortalLayout } from "@/modules/frontdesk/layout/FrontdeskPortalLayout";
import { CalendarPage } from "@/modules/frontdesk/pages/CalendarPage";
import { DoctorsSchedulePage } from "@/modules/frontdesk/pages/DoctorsSchedulePage";
import { LabCollectionSlotsPage } from "@/modules/frontdesk/pages/LabCollectionSlotsPage";
import { MedicalRecordsPage } from "@/modules/frontdesk/pages/MedicalRecordsPage";
import { PatientProfilePage } from "@/modules/frontdesk/pages/PatientProfilePage";
import { PatientsDirectoryPage } from "@/modules/frontdesk/pages/PatientsDirectoryPage";
import { BillingCheckoutPage } from "@/modules/frontdesk/pages/BillingCheckoutPage";
import { BillingPage } from "@/modules/frontdesk/pages/BillingPage";
import { FrontdeskHomePage } from "@/modules/frontdesk/pages/FrontdeskHomePage";
import { LoginPage } from "@/modules/frontdesk/pages/LoginPage";
import { OthersHubPage } from "@/modules/frontdesk/pages/OthersHubPage";
import { PatientEnrollmentDataPage } from "@/modules/frontdesk/pages/PatientEnrollmentDataPage";
import { QueueBoardPage } from "@/modules/frontdesk/pages/QueueBoardPage";
import { RegistrationFormsDataPage } from "@/modules/frontdesk/pages/RegistrationFormsDataPage";
import { DoctorPortalLayout } from "@/modules/doctor/layout/DoctorPortalLayout";
import { DoctorCalendarPage } from "@/modules/doctor/pages/DoctorCalendarPage";
import { DoctorConsultationPage } from "@/modules/doctor/pages/DoctorConsultationPage";
import { DoctorHomePage } from "@/modules/doctor/pages/DoctorHomePage";
import { DoctorLoginPage } from "@/modules/doctor/pages/DoctorLoginPage";
import { DoctorPatientsPage } from "@/modules/doctor/pages/DoctorPatientsPage";
import { DoctorPrescriptionLogPage } from "@/modules/doctor/pages/DoctorPrescriptionLogPage";
import { LabPortalLayout } from "@/modules/lab/layout/LabPortalLayout";
import { LabLoginPage } from "@/modules/lab/pages/LabLoginPage";
import { LabPatientsPage } from "@/modules/lab/pages/LabPatientsPage";
import { LabTestOrdersPage } from "@/modules/lab/pages/LabTestOrdersPage";
import { LabWorkflowPage } from "@/modules/lab/pages/LabWorkflowPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doctor/login" element={<DoctorLoginPage />} />
      <Route path="/lab/login" element={<LabLoginPage />} />
      <Route path="/doctor" element={<DoctorPortalLayout />}>
        <Route index element={<Navigate to="/doctor/home" replace />} />
        <Route path="home" element={<DoctorHomePage />} />
        <Route path="calendar" element={<DoctorCalendarPage />} />
        <Route path="patients" element={<DoctorPatientsPage />} />
        <Route path="prescriptions" element={<DoctorPrescriptionLogPage />} />
        <Route path="consultation" element={<DoctorConsultationPage />} />
        <Route path="*" element={<Navigate to="/doctor/home" replace />} />
      </Route>
      <Route path="/lab" element={<LabPortalLayout />}>
        <Route index element={<Navigate to="/lab/home" replace />} />
        <Route path="home" element={<LabWorkflowPage />} />
        <Route path="orders" element={<LabTestOrdersPage />} />
        <Route path="patients" element={<LabPatientsPage />} />
        <Route path="*" element={<Navigate to="/lab/home" replace />} />
      </Route>
      <Route path="/frontdesk" element={<FrontdeskPortalLayout />}>
        <Route index element={<Navigate to="/frontdesk/home" replace />} />
        <Route path="home" element={<FrontdeskHomePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="lab/collection-slots" element={<LabCollectionSlotsPage />} />
        <Route path="doctors" element={<DoctorsSchedulePage />} />
        <Route path="patients/profile/:patientId" element={<PatientProfilePage />} />
        <Route path="patients" element={<PatientsDirectoryPage />} />
        <Route path="queue" element={<QueueBoardPage />} />
        <Route path="billing/checkout" element={<BillingCheckoutPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="others/registration-forms" element={<RegistrationFormsDataPage />} />
        <Route path="others/patient-enrollment" element={<PatientEnrollmentDataPage />} />
        <Route path="others" element={<OthersHubPage />} />
        <Route path="*" element={<Navigate to="/frontdesk/home" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
