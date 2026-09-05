const rawUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:5000/api';
const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
export const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 503) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const sessionStr = localStorage.getItem('supabase_session');
  let token = '';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token || '';
    } catch (e) {
      // Ignore parsing errors
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message || 'Failed to connect to backend server. Make sure the backend server is running.',
      500
    );
  }
}

