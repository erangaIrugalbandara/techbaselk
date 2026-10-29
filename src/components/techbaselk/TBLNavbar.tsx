'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Transparent at the very top so dust particles are fully visible
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          {navItems.map((item) => {
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
