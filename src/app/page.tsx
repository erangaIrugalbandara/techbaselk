'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Video, TrendingUp, Terminal, GraduationCap } from 'lucide-react';
import HeroTitle from '@/components/techbaselk/HeroTitle';
import styles from './page.module.css';

function AnimatedCounter({
  end,
  suffix = '',
  duration = 2000,
  start = false,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  start: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic easing so the increasing animation is steady and satisfying
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [start, end, duration]);

  return (
    <span suppressHydrationWarning>
      {count}
      {suffix}
    </span>
  );
}

export default function TechBaseLKHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsSectionRef = useRef<HTMLElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Trigger counters and glow animations every time scrolled into view
  useEffect(() => {
    const el = statsSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          } else {
            // Reset to 0 when scrolled away so it re-triggers next time
            setStatsVisible(false);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mouse-motion interactive particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    type HeroParticle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    };

    const particles: HeroParticle[] = [];

    const getTargetCount = (w: number, h: number) => {
      // Scale count smoothly based on screen width & area so density remains consistent across all desktop/laptop resolutions
      const fromWidth = Math.floor(w / 11);
      const fromArea = Math.floor((w * h) / 11000);
      return Math.max(70, Math.min(Math.max(fromWidth, fromArea), 220));
    };

    const spawnParticle = (w: number, h: number, x?: number, y?: number): HeroParticle => ({
      x: x !== undefined ? x : Math.random() * w,
      y: y !== undefined ? y : Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.2 + 0.8,
      opacity: Math.random() * 0.65 + 0.2,
    });

    const updateSize = () => {
      const hero = canvas.parentElement;
      const rect = hero ? hero.getBoundingClientRect() : null;
      const newWidth = Math.ceil(rect ? rect.width : window.innerWidth) || window.innerWidth || 800;
      const newHeight = Math.ceil(rect ? rect.height : window.innerHeight) || window.innerHeight || 600;

      if (newWidth <= 0 || newHeight <= 0) return;
      if (newWidth === width && newHeight === height) return;

      const prevWidth = width;
      const prevHeight = height;

      width = canvas.width = newWidth;
      height = canvas.height = newHeight;

      const targetCount = getTargetCount(newWidth, newHeight);

      if (prevWidth > 0 && prevHeight > 0) {
        // The screen size changed (window resize, snap, or monitor drag-and-drop)
        const scaleX = newWidth / prevWidth;
        const scaleY = newHeight / prevHeight;

        // 1. Proportionally reposition existing particles so they immediately span the entire new canvas dimensions
        for (let i = 0; i < particles.length; i++) {
          particles[i].x *= scaleX;
          particles[i].y *= scaleY;

          // Clamping safeguards
          if (particles[i].x < 0 || particles[i].x > newWidth) {
            particles[i].x = Math.random() * newWidth;
          }
          if (particles[i].y < 0 || particles[i].y > newHeight) {
            particles[i].y = Math.random() * newHeight;
          }
        }

        // 2. If the canvas expanded, immediately spawn additional particles uniformly across the canvas
        if (particles.length < targetCount) {
          const needed = targetCount - particles.length;
          for (let k = 0; k < needed; k++) {
            particles.push(spawnParticle(newWidth, newHeight));
          }
        } else if (particles.length > targetCount + 30) {
          particles.splice(targetCount);
        }
      } else {
        // Initial spawn covering the entire screen
        particles.length = 0;
        for (let i = 0; i < targetCount; i++) {
          particles.push(spawnParticle(newWidth, newHeight));
        }
      }
    };

    updateSize();

    // Mouse tracking
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 170,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw mouse halo when on canvas, with smooth edge fading to eliminate harsh black cutoff line
      if (mouse.x !== null && mouse.y !== null) {
        let edgeFade = 1;
        const edgeMargin = mouse.radius;

        // Smooth fade near edges so glow never clips as a sharp horizontal line
        if (mouse.y < edgeMargin) {
          edgeFade = Math.min(edgeFade, Math.max(0, mouse.y / edgeMargin));
        } else if (mouse.y > height - edgeMargin) {
          edgeFade = Math.min(edgeFade, Math.max(0, (height - mouse.y) / edgeMargin));
        }
        if (mouse.x < edgeMargin) {
          edgeFade = Math.min(edgeFade, Math.max(0, mouse.x / edgeMargin));
        } else if (mouse.x > width - edgeMargin) {
          edgeFade = Math.min(edgeFade, Math.max(0, (width - mouse.x) / edgeMargin));
        }

        const glowAlpha = 0.16 * edgeFade;

        if (glowAlpha > 0.002) {
          const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
          glow.addColorStop(0, `rgba(158, 251, 254, ${glowAlpha})`);
          glow.addColorStop(0.5, `rgba(158, 251, 254, ${glowAlpha * 0.25})`);
          glow.addColorStop(1, 'rgba(158, 251, 254, 0)');
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Pulsing cursor core
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(158, 251, 254, ${edgeFade})`;
          ctx.shadowColor = '#9efbfe';
          ctx.shadowBlur = 12 * edgeFade;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Interaction with mouse motion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            // Interactive connection line to mouse
            const lineAlpha = (1 - dist / mouse.radius) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(158, 251, 254, ${lineAlpha})`;
            ctx.lineWidth = (1 - dist / mouse.radius) * 1.4;
            ctx.stroke();

            // Gentle elastic deflection
            const force = (mouse.radius - dist) / mouse.radius;
            const fx = (dx / dist) * force * 1.8;
            const fy = (dy / dist) * force * 1.8;
            p.x -= fx;
            p.y -= fy;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(158, 251, 254, ${p.opacity})`;
        ctx.shadowColor = '#9efbfe';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw particle-to-particle connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(158, 251, 254, ${0.06 * (1 - dist / 105)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', updateSize);

    // ResizeObserver ensures instantaneous detection when dragging between monitors or snapping
    let resizeObserver: ResizeObserver | null = null;
    const heroElem = canvas.parentElement;
    if (heroElem && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(heroElem);
    }

    return () => {
      cancelAnimationFrame(animId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);



  const features = [
    {
      Icon: Video,
      title: 'AI Video Creation',
      tag: 'CREATIVE AI',
      desc: 'Learn how to create stunning AI-generated videos using the latest tools. From concept to viral content.',
    },
    {
      Icon: TrendingUp,
      title: 'Facebook Growth',
      tag: 'MONETIZATION',
      desc: 'Strategies to grow your Facebook page targeting high CPM audiences and maximizing monetization.',
    },
    {
      Icon: Terminal,
      title: 'Master Prompts',
      tag: 'ENGINEERING',
      desc: 'Daily giveaway of exclusive master prompts crafted to supercharge your AI content workflow.',
    },
    {
      Icon: GraduationCap,
      title: 'Live Classes',
      tag: 'COMMUNITY',
      desc: 'Interactive online classes covering AI tools, social media strategy, and content creation.',
    },
  ];

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <canvas ref={canvasRef} className={styles.heroCanvas} />
        <div className={styles.heroOverlay}></div>

        {/* Neon grid lines */}
        <div className={styles.heroGrid}></div>

        {/* Glowing orb */}
        <div className={styles.heroOrb}></div>

        <div className={`${styles.heroContent} container`}>
          <HeroTitle />

          <p className={styles.heroSubtitle}>
            Explore Powerful <span className={styles.neonWord}>AI Tools</span>. Create Beyond{' '}
            <span className={styles.neonWord}>Limits</span>.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/prompts" className={styles.ctaPrimary} id="tbl-hero-prompts-btn">
              <span>Browse Prompts</span>
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link href="/classes" className={styles.ctaSecondary} id="tbl-hero-class-btn">
              Book a Class
            </Link>
          </div>
        </div>

        {/* Scroll indicator — always visible with optimized spacing */}
        <div className={styles.scrollHint}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollWheel}></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ===== STATS LINE WITH INCREASING ANIMATIONS ===== */}
      <section ref={statsSectionRef} className={styles.statsBarWrapper}>
        <div className={`container ${styles.statsBarInner}`}>
          <div
            className={`${styles.statBox} ${statsVisible ? styles.statBoxAnimated : ''}`}
            style={{ animationDelay: '0ms' }}
          >
            <div className={styles.statValue}>
              <AnimatedCounter end={10} suffix="K+" start={statsVisible} />
            </div>
            <div className={styles.statLabel}>Community Members</div>
            <div className={`${styles.statGlow} ${statsVisible ? styles.statGlowAnimated : ''}`}></div>
          </div>

          <div className={`${styles.statDivider} ${statsVisible ? styles.statDividerAnimated : ''}`}></div>

          <div
            className={`${styles.statBox} ${statsVisible ? styles.statBoxAnimated : ''}`}
            style={{ animationDelay: '100ms' }}
          >
            <div className={styles.statValue}>
              <AnimatedCounter end={100} suffix="+" start={statsVisible} />
            </div>
            <div className={styles.statLabel}>Prompts Shared</div>
            <div className={`${styles.statGlow} ${statsVisible ? styles.statGlowAnimated : ''}`}></div>
          </div>

          <div className={`${styles.statDivider} ${statsVisible ? styles.statDividerAnimated : ''}`}></div>

          <div
            className={`${styles.statBox} ${statsVisible ? styles.statBoxAnimated : ''}`}
            style={{ animationDelay: '200ms' }}
          >
            <div className={styles.statValue}>
              <AnimatedCounter end={100} suffix="%" start={statsVisible} />
            </div>
            <div className={styles.statLabel}>Free Access</div>
            <div className={`${styles.statGlow} ${statsVisible ? styles.statGlowAnimated : ''}`}></div>
          </div>

          <div className={`${styles.statDivider} ${statsVisible ? styles.statDividerAnimated : ''}`}></div>

          <div
            className={`${styles.statBox} ${statsVisible ? styles.statBoxAnimated : ''}`}
            style={{ animationDelay: '300ms' }}
          >
            <div className={styles.statValue}>
              <span className={`${styles.dailyText} ${statsVisible ? styles.dailyTextAnimated : ''}`}>
                Daily
              </span>
            </div>
            <div className={styles.statLabel}>New Prompts</div>
            <div className={`${styles.statGlow} ${statsVisible ? styles.statGlowAnimated : ''}`}></div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES (WHAT WE OFFER) ===== */}
      <section className={styles.features} id="tbl-what-we-offer">
        <div className={`container ${styles.featuresContentContainer}`}>
          <div className={styles.featuresHeader}>
            <div className="tbl-section-badge">What We Offer</div>
            <h2 className="tbl-section-title">
              Knowledge That <span className="tbl-neon-word">Empowers</span>
            </h2>
            <p className="tbl-section-desc">
              Everything you need to master AI content creation and grow a monetizable social media presence
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, i) => {
              const IconComp = feature.Icon;
              return (
                <div key={i} className={styles.featureCard} id={`tbl-feature-${i}`}>
                  {/* Cyber glass corner brackets */}
                  <div className={styles.cardCornerTL} />
                  <div className={styles.cardCornerBR} />
                  <div className={styles.cardTopEdge} />

                  {/* Neon Tech Icon */}
                  <div className={styles.neonIconBox}>
                    <IconComp className={styles.neonIconSvg} size={28} />
                    <div className={styles.iconGlowAura} />
                  </div>

                  {/* Feature Content */}
                  <div className={styles.featureTag}>{feature.tag}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                  <div className={styles.featureGlowLine} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PROMPT PREVIEW ===== */}
      <section className={styles.promptPreview}>
        <div className="container">
          <div className={styles.promptPreviewGrid}>
            <div className={styles.promptPreviewContent}>
              <div className="tbl-section-badge">Prompt Library</div>
              <h2 className="tbl-section-title">
                Free Master <span className="tbl-neon-word">Prompts</span>
              </h2>
              <p className="tbl-section-desc" style={{ marginBottom: '32px' }}>
                Browse and copy tested AI prompts ready to use for your projects and workflows.
              </p>
              <div className={styles.promptFeatures}>
                {[
                  'Free to access',
                  'Categorized by niche',
                  'Regularly updated with new prompts',
                ].map((f, i) => (
                  <div key={i} className={styles.promptFeatureItem}>
                    <span className={styles.promptFeatureCheck}>◈</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/prompts" className="tbl-btn-primary" id="tbl-view-prompts-btn">
                <span>View All Prompts</span>
                <span>→</span>
              </Link>
            </div>
            <div className={styles.promptPreviewDemo}>
              <div className={styles.demoTerminal}>
                <div className={styles.demoTerminalHeader}>
                  <span className={styles.demoTerminalDot} style={{ background: '#ff5f57' }}></span>
                  <span className={styles.demoTerminalDot} style={{ background: '#febc2e' }}></span>
                  <span className={styles.demoTerminalDot} style={{ background: '#28c840' }}></span>
                  <span className={styles.demoTerminalTitle}>master-prompt.txt</span>
                </div>
                <div className={styles.demoTerminalBody}>
                  <p className={styles.demoLine}><span className={styles.demoPromptLabel}>TITLE:</span> Viral AI Video Script</p>
                  <p className={styles.demoLine}><span className={styles.demoPromptLabel}>CATEGORY:</span> AI Video Creation</p>
                  <br />
                  <p className={styles.demoPromptText}>
                    &quot;Create a viral 30-second AI video script for [TOPIC] targeting [AUDIENCE]. The hook must appear within the first 3 seconds. Use emotional storytelling and a clear CTA at the end. Format: [Hook] → [Problem] → [Solution] → [CTA]&quot;
                  </p>
                  <div className={styles.demoCopyBtn}>
                    <span>📋</span> Copy Prompt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACEBOOK PAGE CTA ===== */}
      <section className={styles.fbCta}>
        <div className="container">
          <div className={styles.fbCtaInner}>
            <div className={styles.fbCtaContent}>
              <h2 className="tbl-section-title" style={{ marginBottom: '12px' }}>
                Join the <span className="tbl-neon-word">Community</span>
              </h2>
              <p className="tbl-section-desc">
                Follow Tech Base LK on Facebook to receive daily prompt giveaways, AI tips, and exclusive content.
              </p>
            </div>
            <a
              href="https://facebook.com/techbaselk"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fbCtaBtn}
              id="tbl-fb-page-btn"
            >
              <span>📘</span>
              Follow on Facebook
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
