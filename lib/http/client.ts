export type ApiError = {
  status: number;
  code?: string;
  message: string;
  details?: Record<string, string>;
};

// Fallback to local backend if env var is missing
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function resolveUrl(input: RequestInfo): string | Request {
  if (typeof input !== "string") return input as Request;
  if (!input.startsWith("/")) return input; // absolute or full URL
  return `${API_BASE}${input}`;
}

export async function http<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
  const url = resolveUrl(input);
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      code: body?.error?.code || body?.code,
      message: body?.error?.message || body?.message || res.statusText,
      details: body?.error?.details,
    };
    throw err;
  }

  return (body?.data ?? body) as T;
}


