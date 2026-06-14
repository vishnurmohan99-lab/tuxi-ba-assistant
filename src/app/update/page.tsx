'use client';
import { useState } from 'react';
import StoryCard from '@/components/StoryCard';

export default function UpdatePage() {
  const [form, setForm] = useState({ featureName: '', existingStoryTitle: '', modificationRequest: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [story, setStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleGenerate() {
    setError(''); setSuccessMsg(''); setStory(''); setSaved(false); setLoading(true);
    try {
      const res = await fetch('/api/update-user-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStory(data.story);
      setStoryTitle(form.existingStoryTitle);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Generation failed'); } finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/save-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature: form.featureName, title: form.existingStoryTitle, story, mode: 'update' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true); setSuccessMsg('Story updated in Google Sheets!');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed'); } finally { setSaving(false); }
  }

  return (
    <div className="page container">
      <div className="page-header"><h1>Update User Story</h1><p>Modify an existing user story with new requirements or edge cases.</p></div>
      <div className="card">
        <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', marginBottom: '20px', fontSize: '13px', color: 'var(--accent)' }}>
          Project context is loaded automatically from Settings.
        </div>
        <div className="form-group"><label>Feature Name</label><input value={form.featureName} onChange={(e) => setForm((f) => ({ ...f, featureName: e.target.value }))} placeholder="e.g. Ride Receipt" /></div>
        <div className="form-group"><label>Existing User Story Title</label><input value={form.existingStoryTitle} onChange={(e) => setForm((f) => ({ ...f, existingStoryTitle: e.target.value }))} placeholder="e.g. Driver Receipt View" /></div>
        <div className="form-group"><label>Modification Request</label><textarea rows={5} value={form.modificationRequest} onChange={(e) => setForm((f) => ({ ...f, modificationRequest: e.target.value }))} placeholder={`Describe what needs to change, e.g.:\n- Add privacy rules.\n- Update acceptance criteria.`} /></div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !form.featureName || !form.existingStoryTitle || !form.modificationRequest}>
          {loading ? <><span className="spinner" /> Generating Update...</> : 'Generate Updated Story'}
        </button>
      </div>

      {story && (
        <div style={{ marginTop: '32px' }}>
          <div className="section-label">Updated Story Preview</div>
          <StoryCard
            story={{ content: story, saved, title: storyTitle }}
            feature={form.featureName}
            index={0}
            onEdit={(value) => { setStory(value); setSaved(false); }}
          />
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {!saved && (
            <button className="btn btn-success" style={{ width: '100%', padding: '14px', marginTop: '8px' }} onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Update to Google Sheets'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
