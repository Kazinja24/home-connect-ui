import { useMutation } from '@tanstack/react-query';

async function submitVerification(formData: FormData) {
  const res = await fetch('/api/verification/landlords/submit/', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to submit verification');
  return res.json();
}

export function useVerificationSubmit() {
  return useMutation((formData: FormData) => submitVerification(formData));
}
