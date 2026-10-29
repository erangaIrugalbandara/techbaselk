'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (authModalMode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your name.');
        return;
      }

      setLoading(true);
      const res = await signUpWithEmail(email, password, fullName);
      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else if (res.needsEmailConfirmation) {
        setSuccessMsg(
          'Verification email sent! Please check your inbox and click the confirmation link to activate your account.'
        );
      } else {
        // Logged in automatically
        closeAuthModal();
      }
    } else {
      setLoading(true);
      const res = await signInWithEmail(email, password);
      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        closeAuthModal();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    if (res?.error) {
      setError(res.error);
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={e => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modal}>
        <div className={styles.topGlow} />

        <button
          className={styles.closeBtn}
          onClick={closeAuthModal}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className={styles.badge}>
          <span>◈</span>
          <span>Tech Base LK</span>
        </div>

        <h2 className={styles.title}>
          {authModalMode === 'signin' ? 'Sign In to Your Account' : 'Create Free Account'}
        </h2>

        {authModalReason && (
          <div className={styles.reasonNotice}>
            <span>🔒</span>
            <span>{authModalReason}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${authModalMode === 'signin' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              openAuthModal('signin', authModalReason || undefined);
              setError(null);
              setSuccessMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${authModalMode === 'signup' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              openAuthModal('signup', authModalReason || undefined);
              setError(null);
              setSuccessMsg(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Google 1-Click OAuth */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className={styles.divider}>
          <span>or with email</span>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className={styles.successBanner} role="status">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {authModalMode === 'signup' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="modal-name">
                Full Name
              </label>
              <input
                id="modal-name"
                type="text"
                className={styles.input}
                placeholder="Eranga Bandara"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="modal-email">
              Email Address
            </label>
            <input
              id="modal-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="modal-password">
              Password
            </label>
            <input
              id="modal-password"
              type="password"
              className={styles.input}
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={authModalMode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {authModalMode === 'signup' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="modal-confirm-password">
                Confirm Password
              </label>
              <input
                id="modal-confirm-password"
                type="password"
                className={styles.input}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                <span>{authModalMode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{authModalMode === 'signin' ? 'Sign In →' : 'Create Free Account →'}</span>
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          {authModalMode === 'signin' ? (
            <>
              Don&apos;t have an account?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => {
                  openAuthModal('signup', authModalReason || undefined);
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => {
                  openAuthModal('signin', authModalReason || undefined);
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
