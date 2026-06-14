'use client';
import { useState } from 'react';
import StoryCard from '@/components/StoryCard';
import StoryInputList, { StoryInput } from '@/components/StoryInputList';

interface Story { content: string; saved: boolean; title: string; }

export default function CreatePage() {
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [storyInputs, setStoryInputs] = useState<StoryInput[]>([{ id: crypto.randomUUID(), name: '', description: '' }]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [docUrl, setDocUrl] = useState('');

  const filledStories = storyInputs.filter((s) => s.name.trim());

  function buildStoriesRequired() {
    return filledStories.map((s) =>
      s.description.trim()
        ? `${s.name.trim()}\n  Details: ${s.description.trim()}`
        : s.name.trim()
    ).join('\n\n');
  }

  async function handleGenerate() {
    setError(''); setSuccessMsg(''); setStories([]); setLoading(true);
    try {
      const res = await fetch('/api/create-user-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureName,
          featureDescription,
          storiesRequired: buildStoriesRequired(),
          additionalNotes,
        }),
      });
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
      let url = '';
      for (const s of unsaved) {
        const res = await fetch('/api/save-to-doc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature: featureName, title: s.title, story: s.content }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        url = data.docUrl;
      }
      setStories((prev) => prev.map((s) => ({ ...s, saved: true })));
      setDocUrl(url);
      setSuccessMsg(`All ${unsaved.length} stories saved to Google Docs!`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed'); } finally { setSavingAll(false); }
  }

  const allSaved = stories.length > 0 && stories.every((s) => s.saved);
  const unsavedCount = stories.filter((s) => !s.saved).length;

  return (
    <div className="page container">
      <div className="page-header"><h1>Create User Stories</h1><p>Generate user stories for a completely new feature.</p></div>
      <div className="card">
        <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', marginBottom: '20px', fontSize: '13px', color: 'var(--accent)' }}>
          Project context is loaded automatically from Settings.
        </div>

        <div className="form-group">
          <label>Feature Name</label>
          <input value={featureName} onChange={(e) => setFeatureName(e.target.value)} placeholder="e.g. Ride Receipt" />
        </div>

        <div className="form-group">
          <label>Feature Description</label>
          <textarea rows={3} value={featureDescription} onChange={(e) => setFeatureDescription(e.target.value)} placeholder="e.g. Display receipts differently based on ride category." />
        </div>

        <div className="form-group">
          <label>User Stories Required</label>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Add each story with a name and description. A new box appears automatically as you type.
          </div>
          <StoryInputList stories={storyInputs} onChange={setStoryInputs} />
        </div>

        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea rows={2} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="e.g. Maintain existing functionality for non-auto rides." />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary" onClick={handleGenerate}
          disabled={loading || !featureName || !featureDescription || filledStories.length === 0}>
          {loading ? <><span className="spinner" /> Generating...</> : `Generate ${filledStories.length > 0 ? filledStories.length : ''} User Stories`}
        </button>
      </div>

      {stories.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
              <strong style={{ color: 'var(--text)' }}>{stories.length} stories</strong> generated
              {unsavedCount > 0 && <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>· {unsavedCount} unsaved</span>}
              {docUrl && <a href={docUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>Open Google Doc ↗</a>}
            </div>
            <button className="btn btn-success" onClick={handleSaveAll} disabled={allSaved || savingAll}>
              {savingAll ? <><span className="spinner" /> Saving to Doc...</> : allSaved ? '✓ All Saved to Google Docs' : `📄 Save All ${unsavedCount} to Google Docs`}
            </button>
          </div>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {stories.map((story, i) => (
            <StoryCard key={i} story={story} feature={featureName} index={i}
              onEdit={(value) => setStories((prev) => prev.map((s, j) => j === i ? { ...s, content: value, saved: false } : s))} />
          ))}
          {!allSaved && <button className="btn btn-success" style={{ width: '100%', padding: '14px' }} onClick={handleSaveAll} disabled={savingAll}>{savingAll ? <><span className="spinner" /> Saving to Doc...</> : `📄 Save All ${unsavedCount} Stories to Google Docs`}</button>}
        </div>
      )}
    </div>
  );
}
