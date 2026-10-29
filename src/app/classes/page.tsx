export default function ClassesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--tbl-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎓</div>
        <div style={{
          display: 'inline-block',
          border: '1px solid rgba(158, 251, 254, 0.3)',
          color: 'var(--tbl-neon)',
          padding: '6px 16px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontFamily: 'Orbitron, monospace',
          letterSpacing: '2px',
          textTransform: 'uppercase' as const,
          marginBottom: '24px',
          background: 'rgba(158, 251, 254, 0.05)',
        }}>
          Coming Soon
        </div>
        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900,
          color: 'white',
          textTransform: 'uppercase' as const,
          letterSpacing: '-1px',
          marginBottom: '16px',
        }}>
          Book a Class
        </h1>
        <p style={{
          color: 'rgba(160, 160, 160, 1)',
          fontSize: '1.1rem',
          lineHeight: '1.7',
          marginBottom: '40px',
        }}>
          We&apos;re preparing an exceptional learning experience. Online classes on AI video creation, Facebook growth strategies, and mastering content tools are coming soon.
        </p>
        <p style={{ color: 'rgba(158, 251, 254, 0.6)', fontSize: '0.9rem', fontFamily: 'Orbitron, monospace', letterSpacing: '1px' }}>
          Follow Tech Base LK on Facebook for announcements.
        </p>
        <a
          href="https://facebook.com/techbaselk"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '24px',
            background: '#1877f2',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '4px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          📘 Follow on Facebook
        </a>
      </div>
    </div>
  );
}
