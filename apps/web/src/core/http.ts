type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  token?: string;
  clinicId?: string;
  body?: TBody;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

function getStoredSession(): { token: string | null; clinicId: string | null } {
  const token = window.localStorage.getItem("shc.accessToken");
  const rawUser = window.localStorage.getItem("shc.user");
  if (!rawUser) return { token, clinicId: null };
  try {
    const user = JSON.parse(rawUser) as { clinicIds?: string[] };
    return { token, clinicId: user.clinicIds?.[0] ?? null };
  } catch {
    return { token, clinicId: null };
  }
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", token, clinicId, body } = options;
  const session = getStoredSession();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ?? session.token ? { Authorization: `Bearer ${token ?? session.token}` } : {}),
      ...(clinicId ?? session.clinicId ? { "X-Clinic-Id": clinicId ?? session.clinicId ?? "" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as TResponse;
}
