const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

function hasInvalidQuery(endpoint: string) {
  return endpoint.includes("=undefined") || endpoint.includes("=null");
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!endpoint) {
    throw new Error("apiFetch called without endpoint");
  }

  if (hasInvalidQuery(endpoint)) {
    console.warn("🚨 Blocked invalid api request:", endpoint);
    throw new Error("Invalid API query (undefined parameter)");
  }

  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "API Error";
    try {
      const data = await res.json();
      message = data?.error || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
