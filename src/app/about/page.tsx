export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--tbl-bg)', padding: '60px 24px 100px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            About Us
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
            Who We <span style={{ color: 'var(--tbl-neon)', textShadow: '0 0 20px rgba(158, 251, 254, 0.6)' }}>Are</span>
          </h1>
        </div>

        {/* Story */}
        <div style={{
          background: 'var(--tbl-bg-2)',
          border: '1px solid var(--tbl-border)',
          borderRadius: '8px',
          padding: '48px',
          marginBottom: '32px',
          position: 'relative' as const,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute' as const,
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(158, 251, 254, 0.4), transparent)',
          }}></div>
          <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '20px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            Our Mission
          </h2>
          <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '16px' }}>
            Tech Base LK was born from a passion for making cutting-edge AI knowledge accessible to everyone. We believe that the tools to create viral content, grow a powerful social media presence, and leverage AI — should not be locked behind expensive courses or paywalls.
          </p>
          <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '1.05rem', lineHeight: '1.8' }}>
            Through our Facebook page and this website, we share daily master prompts, AI video creation techniques, and proven strategies for growing Facebook pages targeting high CPM audiences — all for free.
          </p>
        </div>

        {/* What we do */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {[
            { icon: '🤖', title: 'AI Video Creation', desc: 'We teach you how to use the latest AI tools to create stunning, professional-quality videos without expensive equipment.' },
            { icon: '📈', title: 'Facebook Page Growth', desc: 'Strategies specifically designed to grow Facebook pages targeting high CPM audiences for maximum monetization.' },
            { icon: '⚡', title: 'Daily Prompt Giveaways', desc: 'Every day, we release new master prompts via our Facebook page and website — completely free.' },
            { icon: '🎓', title: 'Education First', desc: 'We believe knowledge should be shared. Everything we teach is based on real experience and proven results.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--tbl-bg-2)',
              border: '1px solid var(--tbl-border)',
              borderRadius: '8px',
              padding: '28px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                {item.title}
              </h3>
              <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Connect */}
        <div style={{
          background: 'rgba(158, 251, 254, 0.03)',
          border: '1px solid rgba(158, 251, 254, 0.1)',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            Part of <span style={{ color: 'var(--tbl-neon)' }}>Ideolabz</span>
          </h2>
          <p style={{ color: 'rgba(160, 160, 160, 1)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
            Tech Base LK is the educational arm of Ideolabz, a full-service creative digital agency offering AI video ads, social media management, and Meta campaigns.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(158, 251, 254, 0.3)',
                color: 'var(--tbl-neon)',
                padding: '12px 24px',
                borderRadius: '4px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.5px',
              }}
            >
              Visit Ideolabz ↗
            </a>
            <a
              href="https://facebook.com/techbaselk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1877f2',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '4px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              📘 Follow on Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
