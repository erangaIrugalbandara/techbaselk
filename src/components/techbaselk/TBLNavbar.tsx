'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './TBLNavbar.module.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Prompt Library', href: '/prompts' },
  { label: 'Book a Class', href: '/classes' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
];

export default function TBLNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const { user, profile, loading, openAuthModal, signOut } = useAuth();

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>Tech Base LK</span>
        </Link>

        {/* Desktop Nav */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          {navItems.map(item => {
            const isActive = activeTab === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={() => {
                  setActiveTab(item.href);
                  setMenuOpen(false);
                }}
              >
                <span>{item.label}</span>
                {isActive && <span className={styles.activeBar}></span>}
              </Link>
            );
          })}

          {/* Mobile Auth Button (inside mobile drawer) */}
          {menuOpen && (
            <div style={{ marginTop: '1rem', width: '80%', textAlign: 'center' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ color: '#00f0ff', fontSize: '0.95rem', fontWeight: 600 }}>
                    Hi, {displayName}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className={styles.authBtn}
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#ef4444', color: '#fca5a5' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('signin');
                    setMenuOpen(false);
                  }}
                  className={styles.authBtn}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop Auth Controls */}
        <div className={styles.authSection}>
          {!loading && (
            <>
              {user ? (
                <div className={styles.userMenu} ref={dropdownRef}>
                  <button
                    className={styles.userPill}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="User profile menu"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className={styles.userAvatar}>{initial}</div>
                    <span className={styles.userName}>{displayName}</span>
                    <span className={`${styles.chevron} ${userDropdownOpen ? styles.chevronOpen : ''}`}>▼</span>
                  </button>

                  {userDropdownOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownName}>{displayName}</div>
                        <div className={styles.dropdownEmail}>{user.email}</div>
                      </div>
                      <Link
                        href="/prompts"
                        className={styles.dropdownItem}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>📋</span>
                        <span>Prompt Library</span>
                      </Link>
                      <button
                        className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                        }}
                      >
                        <span>⎋</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={styles.authBtn}
                  onClick={() => openAuthModal('signin')}
                  id="nav-signin-btn"
                >
                  <span>Sign In</span>
                  <span style={{ fontSize: '0.75rem' }}>→</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="tbl-mobile-menu"
        >
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineTop : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineMid : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineBot : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
