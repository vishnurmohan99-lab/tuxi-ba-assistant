export default function SettingsPage() {
  const envVars = [
    {
      key: 'OPENROUTER_API_KEY',
      desc: 'Your OpenRouter API key.',
      hint: 'Get from openrouter.ai/keys',
    },
    {
      key: 'GOOGLE_SHEET_ID',
      desc: 'The ID of your Google Sheet.',
      hint: 'Found in the sheet URL: /spreadsheets/d/{SHEET_ID}/edit',
    },
    {
      key: 'GOOGLE_CLIENT_EMAIL',
      desc: 'Service account email from your JSON credentials.',
      hint: 'Ends with @...iam.gserviceaccount.com',
    },
    {
      key: 'GOOGLE_PRIVATE_KEY',
      desc: 'Private key from your service account JSON.',
      hint: 'Include the full key including -----BEGIN / END----- headers. Wrap in double quotes in .env.local and replace newlines with \\n',
    },
  ];

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Environment configuration reference for your Tuxi BA Assistant.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>AI Model</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
              deepseek/deepseek-r1:free
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              via OpenRouter · Free tier · 20 req/min
            </div>
          </div>
          <span className="badge badge-saved">Active</span>
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: '16px' }}>
          Required Environment Variables
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Set these in <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'var(--mono)' }}>.env.local</code> for local dev, and in your Vercel project settings for production.
        </div>

        {envVars.map((v, i) => (
          <div key={v.key}>
            {i > 0 && <div className="divider" />}
            <div style={{ marginBottom: '4px' }}>
              <code
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '13px',
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {v.key}
              </code>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>
              {v.desc}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                fontStyle: 'italic',
              }}
            >
              {v.hint}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="section-label" style={{ marginBottom: '12px' }}>
          Google Sheet Setup
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
          <div>Sheet name: <strong style={{ color: 'var(--text)' }}>Tuxi User Stories</strong></div>
          <div>Columns: <strong style={{ color: 'var(--text)' }}>A: Feature | B: User Story Title | C: User Story</strong></div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
            The service account must be shared as Editor on this sheet.
          </div>
        </div>
      </div>
    </div>
  );
}
