'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/create', label: 'Create Stories', icon: '✦' },
  { href: '/update', label: 'Update Story', icon: '⟳' },
  { href: '/add', label: 'Extend Feature', icon: '↗' },
  { href: '/test-from-story', label: 'Test from Story', icon: '🧪' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{
        width: '240px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff',
            }}
          >
            T
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text)',
              }}
            >
              Tuxi BA
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  margin: '1px 8px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: active ? '500' : '400',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-dim)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px 0',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <div>Model: DeepSeek R1</div>
        <div style={{ marginTop: '2px' }}>via OpenRouter · Free</div>
      </div>
    </aside>
  );
}
