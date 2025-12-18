function hasInvalidQuery(endpoint: string) {
  return endpoint.includes("=undefined") || endpoint.includes("=null");
}

function normalizeEndpoint(endpoint: string) {
  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }

  // Sadece frontend api route'larına izin ver
  if (!endpoint.startsWith("/api/")) {
    endpoint = `/api${endpoint}`;
  }

  return endpoint;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!endpoint) {
    throw new Error("apiFetch called without endpoint");
  }

  if (hasInvalidQuery(endpoint)) {
    console.warn("🚨 Blocked invalid api request:", endpoint);
    throw new Error("Invalid API query (undefined parameter)");
  }

  const url = normalizeEndpoint(endpoint);

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type":
        (options.headers as Record<string, string> | undefined)?.[
          "Content-Type"
        ] || "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let message = `API Error (${res.status})`;

    try {
      if (contentType.includes("application/json")) {
        const data = await res.json();
        message = data?.error || data?.message || message;
      } else {
        const text = await res.text();
        if (text) message = text;
      }
    } catch {}

    throw new Error(message);
  }

  return (await res.json()) as T;
}
