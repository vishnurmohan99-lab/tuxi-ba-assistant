'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/create',
    label: 'Create Stories',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    href: '/update',
    label: 'Update Story',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    href: '/add',
    label: 'Extend Feature',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>
      </svg>
    ),
  },
  {
    href: '/test-from-story',
    label: 'Test Cases',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: '240px',
      background: 'linear-gradient(180deg, #0f172a 0%, #162040 50%, #1a2a55 100%)',
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '1px 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.20)',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #4f6ef7, #7c9bff)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: '#fff',
            boxShadow: '0 4px 12px rgba(79,110,247,0.45)',
            flexShrink: 0,
          }}>B</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              BA<span style={{ color: '#818cf8' }}>flow</span>
            </div>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', fontWeight: '500', letterSpacing: '0.3px' }}>
              BA Automation
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.9px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', padding: '12px 8px 8px' }}>
          Workspace
        </div>
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ display: 'block', marginBottom: '2px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '9px',
                fontSize: '13.5px',
                fontWeight: active ? '600' : '400',
                background: active
                  ? 'linear-gradient(135deg, rgba(79,110,247,0.30), rgba(79,110,247,0.15))'
                  : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.18s ease',
                border: active ? '1px solid rgba(79,110,247,0.35)' : '1px solid transparent',
                boxShadow: active ? '0 2px 8px rgba(79,110,247,0.15)' : 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'rgba(255,255,255,0.07)';
                  el.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'transparent';
                  el.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
              >
                <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0, display: 'flex' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && (
                  <span style={{
                    width: '5px', height: '5px',
                    borderRadius: '50%',
                    background: '#818cf8',
                    flexShrink: 0,
                    boxShadow: '0 0 8px rgba(129,140,248,0.8)',
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          padding: '11px 14px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 6px rgba(74,222,128,0.7)', flexShrink: 0,
            }} />
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Engine
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
            OpenRouter · Free
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
            5-model fallback active
          </div>
        </div>
      </div>
    </aside>
  );
}
