'use client';
import { useState } from 'react';
import StoryCard from '@/components/StoryCard';

interface Story { content: string; saved: boolean; title: string; }

export default function AddPage() {
  const [form, setForm] = useState({ featureName: '', newStoriesRequired: '', additionalNotes: '' });
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [stories, setStories] = useState<Story[]>([]);

  async function handleGenerate() {
    setError(''); setSuccessMsg(''); setStories([]); setLoading(true);
    try {
      const res = await fetch('/api/add-user-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStories(data.stories.map((s: string) => {
        const titleMatch = s.match(/^Title:\s*(.+)/m);
        return { content: s, saved: false, title: titleMatch ? titleMatch[1].trim() : 'Untitled Story' };
      }));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Generation failed'); } finally { setLoading(false); }
  }

  async function handleSaveAll() {
    setSavingAll(true); setError(''); setSuccessMsg('');
    try {
      const unsaved = stories.filter((s) => !s.saved);
      for (const s of unsaved) {
        const res = await fetch('/api/save-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature: form.featureName, title: s.title, story: s.content, mode: 'append' }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setStories((prev) => prev.map((s) => ({ ...s, saved: true })));
      setSuccessMsg(`All ${unsaved.length} stories saved to Google Sheets!`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed'); } finally { setSavingAll(false); }
  }

  const allSaved = stories.length > 0 && stories.every((s) => s.saved);
  const unsavedCount = stories.filter((s) => !s.saved).length;

  return (
    <div className="page container">
      <div className="page-header"><h1>Add User Stories</h1><p>Extend an existing feature with new user stories.</p></div>
      <div className="card">
        <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', marginBottom: '20px', fontSize: '13px', color: 'var(--accent)' }}>
          Project context is loaded automatically from Settings.
        </div>
        <div className="form-group"><label>Feature Name</label><input value={form.featureName} onChange={(e) => setForm((f) => ({ ...f, featureName: e.target.value }))} placeholder="e.g. Ride Receipt" /></div>
        <div className="form-group"><label>New User Stories Required</label><textarea rows={4} value={form.newStoriesRequired} onChange={(e) => setForm((f) => ({ ...f, newStoriesRequired: e.target.value }))} placeholder={`One per line, e.g.:\nFinance Receipt View\nSupport Receipt View`} /></div>
        <div className="form-group"><label>Additional Notes (Optional)</label><textarea rows={2} value={form.additionalNotes} onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))} placeholder="e.g. Keep the same receipt calculation rules." /></div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !form.featureName || !form.newStoriesRequired}>
          {loading ? <><span className="spinner" /> Generating...</> : 'Generate New Stories'}
        </button>
      </div>
      {stories.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}><strong style={{ color: 'var(--text)' }}>{stories.length} stories</strong> generated{unsavedCount > 0 && <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>· {unsavedCount} unsaved</span>}</div>
            <button className="btn btn-success" onClick={handleSaveAll} disabled={allSaved || savingAll}>{savingAll ? <><span className="spinner" /> Saving All...</> : allSaved ? '✓ All Saved' : `Save All ${unsavedCount} to Google Sheets`}</button>
          </div>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {stories.map((story, i) => (
            <StoryCard key={i} story={story} feature={form.featureName} index={i}
              onEdit={(value) => setStories((prev) => prev.map((s, j) => j === i ? { ...s, content: value, saved: false } : s))} />
          ))}
          {!allSaved && <button className="btn btn-success" style={{ width: '100%', padding: '14px' }} onClick={handleSaveAll} disabled={savingAll}>{savingAll ? <><span className="spinner" /> Saving All...</> : `Save All ${unsavedCount} Stories to Google Sheets`}</button>}
        </div>
      )}
    </div>
  );
}
