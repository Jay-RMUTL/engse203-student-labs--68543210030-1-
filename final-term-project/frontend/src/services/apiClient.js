const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function clearToken() {
  localStorage.removeItem('printjobs_token');
  localStorage.removeItem('printjobs_role');
}

export function getToken() {
  return localStorage.getItem('printjobs_token');
}

export function getRole() {
  return localStorage.getItem('printjobs_role');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session หมดอายุหรือไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ใช้ข้อความผิดพลาดเริ่มต้นเมื่อ response ไม่ใช่ JSON
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function login(email, password) {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const token = result.token || result.accessToken;
  const role = result.role || result.user?.role || '';

  if (!token) {
    throw new Error('รูปแบบข้อมูลล็อกอินไม่ถูกต้อง');
  }

  localStorage.setItem('printjobs_token', token);

  if (role) {
    localStorage.setItem('printjobs_role', role);
  }

  return { ...result, token, role };
}

export function getPrintJobs() {
  return apiRequest('/api/print-jobs');
}

export function getPrintShops() {
  return apiRequest('/api/print-shops');
}

export function createPrintJob(job) {
  return apiRequest('/api/print-jobs', {
    method: 'POST',
    body: JSON.stringify(job)
  });
}

export function updatePrintJobStatus(id, status) {
  return apiRequest(`/api/print-jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export function deletePrintJob(id) {
  return apiRequest(`/api/print-jobs/${id}`, {
    method: 'DELETE'
  });
}
