import React, { useState } from 'react';
import { signOut } from '../../lib/auth';

interface Props {
  /** Optional extra class for the button element */
  className?: string;
}

export default function SignOutButton({ className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      style={{
        background: 'transparent',
        border: '1px solid currentColor',
        borderRadius: 4,
        padding: '0.4rem 0.9rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
