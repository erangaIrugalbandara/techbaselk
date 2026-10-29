'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, openAuthModal, isAuthModalOpen } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/prompts');
    } else if (!isAuthModalOpen) {
      openAuthModal('signin');
    }
  }, [user, isAuthModalOpen, openAuthModal, router]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Loading sign in...</p>
    </div>
  );
}
