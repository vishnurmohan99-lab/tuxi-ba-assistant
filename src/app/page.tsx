'use client';
import Link from 'next/link';

const cards = [
  {
    href: '/create',
    icon: '✦',
    title: 'Create User Stories',
    desc: 'Generate user stories for a completely new feature.',
    color: '#4f8ef7',
  },
  {
    href: '/update',
    icon: '⟳',
    title: 'Update User Story',
    desc: 'Modify an existing user story with new requirements.',
    color: '#a78bfa',
  },
  {
    href: '/add',
    icon: '+',
    title: 'Add User Stories',
    desc: 'Extend an existing feature with new user stories.',
    color: '#34c98a',
  },
  {
    href: '/settings',
    icon: '⚙',
    title: 'Settings',
    desc: 'View environment configuration and model info.',
    color: '#6b7591',
  },
];

export default function Dashboard() {
  return (
    <div className="page container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>AI-powered Business Analyst assistant for the Tuxi platform.</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.1s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = card.color;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: card.color + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: '15px',
                    color: 'var(--text)',
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                  }}
                >
                  {card.desc}
                </div>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  fontSize: '12px',
                  color: card.color,
                  fontWeight: '500',
                }}
              >
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info strip */}
      <div
        style={{
          marginTop: '36px',
          padding: '16px 20px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'AI Model', value: 'DeepSeek R1 (Free)' },
          { label: 'Storage', value: 'Google Sheets' },
          { label: 'Format', value: 'Tuxi BA Standard' },
        ].map((item) => (
          <div key={item.label}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                marginTop: '3px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text)',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
