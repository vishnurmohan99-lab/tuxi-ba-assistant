'use client';
import { useState, useEffect, useRef } from 'react';

interface Context {
  filename: string;
  updatedAt: string;
  text: string;
}

export default function SettingsPage() {
  const [context, setContext] = useState<Context | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [pdfName, setPdfName] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchContext(); }, []);

  async function fetchContext() {
    setLoadingContext(true);
    try {
      const res = await fetch('/api/project-context');
      const data = await res.json();
      setContext(data.context);
    } catch { setContext(null); } finally { setLoadingContext(false); }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfName(file.name);
    setPdfLoading(true);
    setError('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        // Extract text from PDF
        const extractRes = await fetch('/api/extract-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64 }),
        });
        const extractData = await extractRes.json();
        const text = extractData.text || '';

        if (!text) {
          setError('Could not extract text from PDF. Make sure it is a text-based PDF, not a scanned image.');
          setPdfLoading(false);
          return;
        }

        setPdfLoading(false);
        setSaving(true);

        // Save to Google Sheets
        const saveRes = await fetch('/api/project-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, filename: file.name }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error);

        setSuccessMsg(`Project context saved! AI will now use "${file.name}" as reference for all story generation.`);
        fetchContext();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setPdfLoading(false);
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const envVars = [
    { key: 'GEMINI_API_KEY', desc: 'Your Google Gemini API key.', hint: 'Get from aistudio.google.com/app/apikey' },
    { key: 'GOOGLE_SHEET_ID', desc: 'The ID of your Google Sheet.', hint: 'Found in the sheet URL: /spreadsheets/d/{SHEET_ID}/edit' },
    { key: 'GOOGLE_CLIENT_EMAIL', desc: 'Service account email from your JSON credentials.', hint: 'Ends with @...iam.gserviceaccount.com' },
    { key: 'GOOGLE_PRIVATE_KEY', desc: 'Private key from your service account JSON.', hint: 'Include the full key with BEGIN/END headers.' },
  ];

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your project context and environment configuration.</p>
      </div>

      {/* Project Context Card */}
      <div className="card" style={{ marginBottom: '24px', borderColor: context ? 'var(--accent)' : 'var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>Project Context</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Upload your existing user stories PDF once. AI will automatically use it as reference for every story generation.
            </div>
          </div>
          {context && <span className="badge badge-saved">Active</span>}
        </div>

        {/* Current Context Status */}
        {loadingContext ? (
          <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ marginRight: '8px' }} />Loading context status...
          </div>
        ) : context ? (
          <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current File</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--accent)', marginTop: '3px' }}>📄 {context.filename}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Updated</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginTop: '3px' }}>
                  {new Date(context.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Context Size</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginTop: '3px' }}>
                  {(context.text.length / 1000).toFixed(1)}k characters
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            No project context saved yet. Upload a PDF to get started.
          </div>
        )}

        {/* Upload Area */}
        <div
          style={{
            border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: pdfName ? 'var(--accent-dim)' : 'var(--surface-2)', transition: 'all 0.15s',
          }}
          onClick={() => fileRef.current?.click()}
        >
          {pdfLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}><span className="spinner" style={{ marginRight: '8px' }} />Reading PDF...</div>
          ) : saving ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}><span className="spinner" style={{ marginRight: '8px' }} />Saving to Google Sheets...</div>
          ) : (
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
                {context ? 'Upload New PDF to Replace Context' : 'Upload Project User Stories PDF'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Saved permanently to Google Sheets · Used automatically in all generations
              </div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfUpload} />

        {error && <div className="alert alert-error" style={{ marginTop: '12px' }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginTop: '12px' }}>{successMsg}</div>}
      </div>

      {/* AI Model */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>AI Model</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Google Gemini · gemini-1.5-flash</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Fast and capable multimodal model by Google</div>
          </div>
          <span className="badge badge-saved">Active</span>
        </div>
      </div>

      {/* Env Vars */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-label" style={{ marginBottom: '12px' }}>Google Documents</div>
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
          <div>Doc name: <strong style={{ color: 'var(--text)' }}>BAflow - User Stories</strong></div>
          <div>Structure: <strong style={{ color: 'var(--text)' }}>HEADING 1 per Feature · HEADING 2 per Story</strong></div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
            Auto-created on first save. Each feature gets its own section. New stories are appended under the correct feature automatically.
          </div>
          <div style={{ marginTop: '8px', color: 'var(--warning)', fontSize: '12px' }}>
            ⚠ Make sure both Google Docs API and Google Drive API are enabled in your Google Cloud project.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: '16px' }}>Required Environment Variables</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Set these in <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'var(--mono)' }}>.env.local</code> for local dev, and in Vercel project settings for production.
        </div>
        {envVars.map((v, i) => (
          <div key={v.key}>
            {i > 0 && <div className="divider" />}
            <div style={{ marginBottom: '4px' }}>
              <code style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '4px' }}>{v.key}</code>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>{v.desc}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{v.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
