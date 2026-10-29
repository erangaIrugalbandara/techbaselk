'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid}></div>
      <div className={styles.bgGlow}></div>

      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIcon}>◈</div>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <p className={styles.loginSubtitle}>Tech Base LK Control Panel</p>
        </div>

        {error && (
          <div className={styles.errorMsg} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" id="admin-login-btn" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <span className={styles.loginSpinner}></span>
            ) : (
              <span>Access Dashboard →</span>
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <a href="/">← Back to Tech Base LK</a>
        </div>
      </div>
    </div>
  );
}
