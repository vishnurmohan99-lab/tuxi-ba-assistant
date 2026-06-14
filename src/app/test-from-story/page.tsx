'use client';
import { useState } from 'react';

interface TestCase {
  content: string;
  saved: boolean;
  title: string;
}

export default function TestFromStoryPage() {
  const [featureName, setFeatureName] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  async function handleGenerate() {
    setError(''); setSuccessMsg(''); setTestCases([]); setLoading(true);
    try {
      const res = await fetch('/api/generate-test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: featureName, storyTitle, storyContent, save: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const parsed: TestCase[] = data.testCases.map((t: string) => {
        const titleMatch = t.match(/^Test Case Title:\s*(.+)/m);
        return { content: t, saved: false, title: titleMatch ? titleMatch[1].trim() : 'Untitled Test Case' };
      });
      setTestCases(parsed);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Generation failed'); } finally { setLoading(false); }
  }

  async function handleSaveAll() {
    setSavingAll(true); setError(''); setSuccessMsg('');
    try {
      const unsaved = testCases.filter((t) => !t.saved);
      for (const tc of unsaved) {
        const res = await fetch('/api/generate-test-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: featureName, storyTitle, storyContent: tc.content, save: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setTestCases((prev) => prev.map((t) => ({ ...t, saved: true })));
      setSuccessMsg(`All ${unsaved.length} test cases saved to Google Sheets!`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed'); } finally { setSavingAll(false); }
  }

  const allSaved = testCases.length > 0 && testCases.every((t) => t.saved);
  const unsavedCount = testCases.filter((t) => !t.saved).length;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Test from Story</h1>
        <p>Paste any user story and generate test cases instantly.</p>
      </div>

      <div className="card">
        <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', marginBottom: '20px', fontSize: '13px', color: 'var(--accent)' }}>
          Project context is loaded automatically from Settings.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Feature Name</label>
            <input value={featureName} onChange={(e) => setFeatureName(e.target.value)} placeholder="e.g. Ride Receipt" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>User Story Title</label>
            <input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="e.g. Driver Receipt View" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>User Story Content</label>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Paste the full user story including As a / I want / So that, Acceptance Criteria, and Edge Cases.
          </div>
          <textarea
            rows={14}
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            placeholder={`Title: Driver Receipt View

As a Driver
I want to view my trip receipt
So that I can verify my earnings

---

Acceptance Criteria

Receipt Details

1. Driver can view trip distance
2. Driver can view fare breakdown
3. Driver can view platform commission deducted

---

Edge Cases

* Receipt unavailable for cancelled trips
* Receipt shows refund status for disputed trips`}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading || !storyContent.trim()}
        >
          {loading ? <><span className="spinner" /> Generating Test Cases...</> : '🧪 Generate Test Cases'}
        </button>
      </div>

      {/* Test Cases Output */}
      {testCases.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px', padding: '14px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
              <strong style={{ color: 'var(--text)' }}>{testCases.length} test cases</strong> generated
              {unsavedCount > 0 && <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>· {unsavedCount} unsaved</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
                {loading ? <><span className="spinner" /> Regenerating...</> : 'Regenerate'}
              </button>
              <button className="btn btn-success" onClick={handleSaveAll} disabled={allSaved || savingAll}>
                {savingAll ? <><span className="spinner" /> Saving All...</> : allSaved ? '✓ All Saved to Sheets' : `Save All ${unsavedCount} to Sheets`}
              </button>
            </div>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {testCases.map((tc, i) => (
            <div key={i} className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{tc.title}</div>
                <span className={`badge ${tc.saved ? 'badge-saved' : 'badge-unsaved'}`}>
                  {tc.saved ? 'Saved' : 'Unsaved'}
                </span>
              </div>
              <textarea
                className="story-preview"
                style={{ width: '100%', minHeight: '220px', border: 'none' }}
                value={tc.content}
                onChange={(e) => setTestCases((prev) => prev.map((t, j) => j === i ? { ...t, content: e.target.value, saved: false } : t))}
              />
            </div>
          ))}

          {!allSaved && (
            <button className="btn btn-success" style={{ width: '100%', padding: '14px' }} onClick={handleSaveAll} disabled={savingAll}>
              {savingAll ? <><span className="spinner" /> Saving All...</> : `Save All ${unsavedCount} Test Cases to Google Sheets`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
