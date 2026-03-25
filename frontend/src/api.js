const BASE = "http://localhost:5000/api";

export const getToken = () => sessionStorage.getItem("token");

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const text = await res.text();
  
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (res.ok) return {};
    throw new Error(`Server error: ${res.status}`);
  }

  if (!res.ok) {
    // Extract the real error message from backend
    const errorMsg = data.message || data.error || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data;
};
