import React, { useState } from 'react';
import { useVerificationSubmit } from '@/hooks/useVerification';

const LandlordVerification: React.FC = () => {
  const [identity, setIdentity] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File | null>(null);
  const mutation = useVerificationSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !supporting) return alert('Please attach both files');

    const fd = new FormData();
    fd.append('identity_document', identity);
    fd.append('landlord_supporting_document', supporting);

    mutation.mutate(fd, {
      onSuccess: () => alert('Verification submitted'),
      onError: (err: any) => alert(err?.message || 'Submission failed'),
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Landlord Verification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Identity document</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdentity(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <label className="block mb-1">Supporting document</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setSupporting(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <button type="submit" disabled={mutation.isLoading} className="btn btn-primary">
            {mutation.isLoading ? 'Submitting...' : 'Submit for verification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LandlordVerification;
