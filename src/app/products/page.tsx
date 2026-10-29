export default function ProductsPage() {
  const products = [
    {
      icon: '📦',
      title: 'Prompt Packs',
      desc: 'Curated collections of premium master prompts for specific niches — AI video, ads, copywriting, and more.',
      tag: 'Coming Soon',
    },
    {
      icon: '🎓',
      title: 'Mini Courses',
      desc: 'Short, focused courses on AI video creation tools, Facebook ad strategies, and content automation.',
      tag: 'Coming Soon',
    },
    {
      icon: '🤖',
      title: 'AI Toolkits',
      desc: 'Curated lists of the best AI tools for content creators, with setup guides and prompt libraries.',
      tag: 'Coming Soon',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tbl-bg)', padding: '60px 24px 100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px', paddingTop: '40px' }}>
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
            marginBottom: '20px',
            background: 'rgba(158, 251, 254, 0.05)',
          }}>
            Products
          </div>
          <h1 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            color: 'white',
            textTransform: 'uppercase' as const,
            letterSpacing: '-1px',
            marginBottom: '16px',
          }}>
            Tech Base <span style={{ color: 'var(--tbl-neon)', textShadow: '0 0 20px rgba(158, 251, 254, 0.6)' }}>Store</span>
          </h1>
          <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' }}>
            Premium digital products to supercharge your AI content creation journey. Launching soon.
          </p>
        </div>

        {/* Products */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {products.map((product, i) => (
            <div
              key={i}
              style={{
                background: 'var(--tbl-bg-2)',
                border: '1px solid var(--tbl-border)',
                borderRadius: '8px',
                padding: '36px 28px',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{product.icon}</div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(158, 251, 254, 0.05)',
                border: '1px solid rgba(158, 251, 254, 0.15)',
                color: 'var(--tbl-neon)',
                fontSize: '0.7rem',
                fontFamily: 'Orbitron, monospace',
                padding: '2px 10px',
                borderRadius: '3px',
                letterSpacing: '1px',
                textTransform: 'uppercase' as const,
                marginBottom: '16px',
              }}>
                {product.tag}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '12px', fontFamily: 'Orbitron, monospace', letterSpacing: '0.5px' }}>
                {product.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(160, 160, 160, 1)', lineHeight: '1.6' }}>{product.desc}</p>
            </div>
          ))}
        </div>

        {/* Coming soon note */}
        <div style={{
          textAlign: 'center',
          marginTop: '64px',
          padding: '40px',
          background: 'rgba(158, 251, 254, 0.03)',
          border: '1px solid rgba(158, 251, 254, 0.1)',
          borderRadius: '8px',
        }}>
          <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '1rem', marginBottom: '16px' }}>
            Be the first to know when products launch. Follow us on Facebook!
          </p>
          <a
            href="https://facebook.com/techbaselk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#1877f2',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '4px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            📘 Follow Tech Base LK
          </a>
        </div>
      </div>
    </div>
  );
}
