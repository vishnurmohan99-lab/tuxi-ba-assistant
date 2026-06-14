'use client';
import Link from 'next/link';

const cards = [
  { href: '/create', icon: '✦', title: 'Create Stories', desc: 'Generate user stories for a completely new feature with AI.', color: '#2563eb', bg: '#eff4ff' },
  { href: '/update', icon: '↺', title: 'Update Story', desc: 'Modify an existing user story with new requirements.', color: '#7c3aed', bg: '#f5f3ff' },
  { href: '/add', icon: '↗', title: 'Extend Feature', desc: 'Add more stories to an existing feature with full consistency.', color: '#0891b2', bg: '#ecfeff' },
  { href: '/test-from-story', icon: '⚡', title: 'Test from Story', desc: 'Paste any user story and generate exhaustive test cases.', color: '#d97706', bg: '#fffbeb' },
  { href: '/settings', icon: '⚙', title: 'Settings', desc: 'Upload project context PDF and manage configuration.', color: '#059669', bg: '#ecfdf5' },
];

const stats = [
  { label: 'AI Model', value: 'OpenRouter Free', sub: '5-model fallback' },
  { label: 'Storage', value: 'Google Docs', sub: 'Auto-organised by feature' },
  { label: 'Test Cases', value: 'Google Sheets', sub: '9 columns structured' },
  { label: 'Format', value: 'Tuxi BA Standard', sub: 'PDF context aware' },
];

export default function Dashboard() {
  return (
    <div className="page container">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
        borderRadius: '20px',
        padding: '36px 40px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(37,99,235,0.30)',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '20px', right: '160px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: '20px', padding: '4px 12px', marginBottom: '14px',
            fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            Live & Ready
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Tuxi BA Assistant
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', lineHeight: '1.6' }}>
            AI-powered Business Analyst assistant. Generate, update, and extend user stories in the Tuxi format — instantly.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', marginBottom: '2px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {cards.map((card, i) => (
          <Link key={card.href} href={card.href}>
            <div
              className="card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.2s',
                animationDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = '0 8px 24px rgba(37,99,235,0.14)';
                el.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'none';
                el.style.boxShadow = 'var(--shadow-sm)';
                el.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: card.color,
                border: `1px solid ${card.color}22`,
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {card.desc}
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: '13px', color: card.color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open <span style={{ transition: 'transform 0.15s' }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
