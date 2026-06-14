'use client';
import { useState } from 'react';

interface Props {
  story: { content: string; saved: boolean; title: string };
  feature: string;
  index: number;
  onEdit: (value: string) => void;
}

interface TestCase {
  content: string;
  saved: boolean;
}

export default function StoryCard({ story, feature, index, onEdit }: Props) {
  const [tab, setTab] = useState<'story' | 'tests'>('story');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [savingTests, setSavingTests] = useState(false);
  const [testError, setTestError] = useState('');
  const [testSuccess, setTestSuccess] = useState('');

  async function handleGenerateTests() {
    setLoadingTests(true);
    setTestError('');
    setTestSuccess('');
    try {
      const res = await fetch('/api/generate-test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          storyTitle: story.title,
          storyContent: story.content,
          save: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestCases(data.testCases.map((t: string) => ({ content: t, saved: false })));
      setTab('tests');
    } catch (e: unknown) {
      setTestError(e instanceof Error ? e.message : 'Test generation failed');
    } finally {
      setLoadingTests(false);
    }
  }

  async function handleSaveTests() {
    setSavingTests(true);
    setTestError('');
    try {
      const unsaved = testCases.filter((t) => !t.saved);
      for (const tc of unsaved) {
        const titleMatch = tc.content.match(/^Test Case Title:\s*(.+)/m);
        const tcTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Test Case';
        const res = await fetch('/api/generate-test-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feature,
            storyTitle: story.title,
            storyContent: tc.content,
            save: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        void tcTitle;
      }
      setTestCases((prev) => prev.map((t) => ({ ...t, saved: true })));
      setTestSuccess(`All test cases saved to Google Sheets!`);
    } catch (e: unknown) {
      setTestError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSavingTests(false);
    }
  }

  const allTestsSaved = testCases.length > 0 && testCases.every((t) => t.saved);

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>{story.title}</div>
        <span className={`badge ${story.saved ? 'badge-saved' : 'badge-unsaved'}`}>
          {story.saved ? 'Saved' : 'Unsaved'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {(['story', 'tests'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: tab === t ? '600' : '400',
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            {t === 'story' ? 'User Story' : `Test Cases ${testCases.length > 0 ? `(${testCases.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Story Tab */}
      {tab === 'story' && (
        <>
          <textarea
            className="story-preview"
            style={{ width: '100%', minHeight: '280px', border: 'none' }}
            value={story.content}
            onChange={(e) => onEdit(e.target.value)}
          />
          <div style={{ marginTop: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleGenerateTests}
              disabled={loadingTests}
              style={{ fontSize: '13px' }}
            >
              {loadingTests ? <><span className="spinner" /> Generating Test Cases...</> : '⚡ Generate Test Cases'}
            </button>
          </div>
        </>
      )}

      {/* Test Cases Tab */}
      {tab === 'tests' && (
        <>
          {testCases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧪</div>
              No test cases yet.
              <div style={{ marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={handleGenerateTests} disabled={loadingTests}>
                  {loadingTests ? <><span className="spinner" /> Generating...</> : 'Generate Test Cases'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Save All Tests Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  <strong style={{ color: 'var(--text)' }}>{testCases.length}</strong> test cases generated
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleGenerateTests} disabled={loadingTests}>
                    {loadingTests ? <><span className="spinner" /> Regenerating...</> : 'Regenerate'}
                  </button>
                  <button className="btn btn-success" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleSaveTests} disabled={allTestsSaved || savingTests}>
                    {savingTests ? <><span className="spinner" /> Saving...</> : allTestsSaved ? '✓ Saved to Sheets' : `Save All to Sheets`}
                  </button>
                </div>
              </div>

              {testError && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{testError}</div>}
              {testSuccess && <div className="alert alert-success" style={{ marginBottom: '12px' }}>{testSuccess}</div>}

              {testCases.map((tc, i) => {
                const titleMatch = tc.content.match(/^Test Case Title:\s*(.+)/m);
                const tcTitle = titleMatch ? titleMatch[1].trim() : `Test Case ${i + 1}`;
                return (
                  <div key={i} style={{ marginBottom: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', background: 'var(--surface-2)', fontSize: '13px', fontWeight: '500', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{tcTitle}</span>
                      <span className={`badge ${tc.saved ? 'badge-saved' : 'badge-unsaved'}`} style={{ fontSize: '11px' }}>{tc.saved ? 'Saved' : 'Unsaved'}</span>
                    </div>
                    <textarea
                      className="story-preview"
                      style={{ width: '100%', minHeight: '200px', border: 'none', borderRadius: '0', margin: '0' }}
                      value={tc.content}
                      onChange={(e) => setTestCases((prev) => prev.map((t, j) => j === i ? { ...t, content: e.target.value, saved: false } : t))}
                    />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
