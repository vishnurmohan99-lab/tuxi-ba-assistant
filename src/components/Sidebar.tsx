'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/create', label: 'Create Stories', icon: '✦' },
  { href: '/update', label: 'Update Story', icon: '↺' },
  { href: '/add', label: 'Extend Feature', icon: '↗' },
  { href: '/test-from-story', label: 'Test from Story', icon: '⚡' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: '240px',
      background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)',
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      boxShadow: '4px 0 24px rgba(29,78,216,0.25)',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{
        padding: '28px 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800', color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>T</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '-0.2px' }}>
              Tuxi BA
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>
              Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                margin: '2px 0',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: active ? '600' : '400',
                background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.18s',
                backdropFilter: active ? 'blur(8px)' : 'none',
                border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                }
              }}
              >
                <span style={{ fontSize: '15px', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        margin: '0 0 8px',
      }}>
        <div style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.10)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Engine
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
            OpenRouter · Free
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            5-model fallback system
          </div>
        </div>
      </div>
    </aside>
  );
}
