'use client';
import Link from 'next/link';

const cards = [
  {
    href: '/create',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
    title: 'Create Stories',
    desc: 'Generate user stories for a completely new feature with AI.',
    color: '#4f6ef7',
    bg: 'linear-gradient(135deg, #eef1ff, #e0e8ff)',
  },
  {
    href: '/update',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    title: 'Update Story',
    desc: 'Modify an existing user story with new requirements.',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
  },
  {
    href: '/add',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>
      </svg>
    ),
    title: 'Extend Feature',
    desc: 'Add more stories to an existing feature with full consistency.',
    color: '#0891b2',
    bg: 'linear-gradient(135deg, #ecfeff, #cffafe)',
  },
  {
    href: '/test-from-story',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: 'Test Cases',
    desc: 'Paste any user story and generate exhaustive test cases.',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  },
  {
    href: '/settings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    title: 'Settings',
    desc: 'Upload project context PDF and manage configuration.',
    color: '#059669',
    bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
  },
];

const stats = [
  { label: 'AI Engine', value: 'Gemini Flash', sub: 'gemini-1.5-flash', icon: '⚡' },
  { label: 'Storage', value: 'Google Docs', sub: 'Auto-organised', icon: '📄' },
  { label: 'Test Cases', value: 'Google Sheets', sub: '9-column structure', icon: '🧪' },
  { label: 'Format', value: 'BA Standard', sub: 'Context-aware', icon: '✦' },
];

export default function Dashboard() {
  return (
    <div className="page container">

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        borderRadius: '22px',
        padding: '40px 44px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(15,23,42,0.30), 0 4px 12px rgba(0,0,0,0.15)',
      }}>
        {/* Mesh decorations */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,110,247,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '100px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,155,255,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '60%', transform: 'translate(-50%,-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
            borderRadius: '24px', padding: '5px 14px', marginBottom: '18px',
            fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span className="dot-live" />
            Live & Ready
          </div>

          <h1 style={{
            fontSize: '34px', fontWeight: '800', color: '#fff',
            letterSpacing: '-1px', marginBottom: '10px', lineHeight: 1.15,
          }}>
            BA<span style={{ color: '#818cf8' }}>flow</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.60)', maxWidth: '460px', lineHeight: '1.65', marginBottom: '4px' }}>
            Business Analyst automation flow. Generate user stories, extend features, and create test cases — powered by AI.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link href="/create">
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #4f6ef7, #7c9bff)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '10px 20px', fontSize: '13.5px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,110,247,0.40)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                New Story
              </button>
            </Link>
            <Link href="/test-from-story">
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.20)',
                borderRadius: '10px', padding: '10px 20px', fontSize: '13.5px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/></svg>
                Generate Tests
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = 'var(--shadow)';
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = 'var(--shadow-sm)';
            el.style.transform = 'none';
          }}
          >
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{stat.icon}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>{stat.label}</div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Modules
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Feature cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
        {cards.map((card, i) => (
          <Link key={card.href} href={card.href}>
            <div
              className="card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                animationDelay: `${i * 0.07}s`,
                height: '100%',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-5px)';
                el.style.boxShadow = '0 12px 32px rgba(79,110,247,0.13)';
                el.style.borderColor = card.color + '55';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'none';
                el.style.boxShadow = 'var(--shadow-sm)';
                el.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                width: '46px', height: '46px',
                borderRadius: '13px',
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color,
                border: `1px solid ${card.color}18`,
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.2px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  {card.desc}
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12.5px', color: card.color, fontWeight: '700',
              }}>
                Open
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
