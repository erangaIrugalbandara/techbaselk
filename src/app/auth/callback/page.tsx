'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          router.replace('/prompts');
        } else {
          // If session is still resolving or needs hash parsing
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              authListener.subscription.unsubscribe();
              router.replace('/prompts');
            }
          });
        }
      } catch (err) {
        setErrorMsg('Authentication callback error');
        console.error(err);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(10, 15, 30, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          padding: '2.5rem',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        {errorMsg ? (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>Sign-in Failed</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #00f0ff, #0099ff)',
                color: '#050b14',
                fontWeight: 700,
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Return Home
            </a>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(0, 240, 255, 0.2)',
                borderTopColor: '#00f0ff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1.25rem',
              }}
            />
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.4rem' }}>Verifying Credentials</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Securely authenticating with Tech Base LK...</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
