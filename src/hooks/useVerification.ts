import { useMutation } from '@tanstack/react-query';

async function submitVerification(formData: FormData) {
  const { getToken } = await import('@/lib/api');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/verification/landlords/submit/`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit verification');
  }
  return res.json();
}

export function useVerificationSubmit() {
  return useMutation({
    mutationFn: (formData: FormData) => submitVerification(formData),
  });
}
