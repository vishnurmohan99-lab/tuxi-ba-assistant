'use client';
import { useState } from 'react';

export default function UpdatePage() {
  const [form, setForm] = useState({
    featureName: '',
    existingStoryTitle: '',
    modificationRequest: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [story, setStory] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleGenerate() {
    setError('');
    setStory('');
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch('/api/update-user-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStory(data.story);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: form.featureName,
          title: form.existingStoryTitle,
          story,
          mode: 'update',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Update User Story</h1>
        <p>Modify an existing user story with new requirements or edge cases.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Feature Name</label>
          <input
            value={form.featureName}
            onChange={(e) => setForm((f) => ({ ...f, featureName: e.target.value }))}
            placeholder="e.g. Ride Receipt"
          />
        </div>

        <div className="form-group">
          <label>Existing User Story Title</label>
          <input
            value={form.existingStoryTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, existingStoryTitle: e.target.value }))
            }
            placeholder="e.g. Driver Receipt View"
          />
        </div>

        <div className="form-group">
          <label>Modification Request</label>
          <textarea
            rows={5}
            value={form.modificationRequest}
            onChange={(e) =>
              setForm((f) => ({ ...f, modificationRequest: e.target.value }))
            }
            placeholder={`Describe what needs to change, e.g.:\n- Add privacy rules.\n- Update acceptance criteria.\n- Add edge case for refunded rides.`}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={
            loading ||
            !form.featureName ||
            !form.existingStoryTitle ||
            !form.modificationRequest
          }
        >
          {loading ? (
            <>
              <span className="spinner" /> Generating Update...
            </>
          ) : (
            'Generate Updated Story'
          )}
        </button>
      </div>

      {story && (
        <div style={{ marginTop: '32px' }}>
          <div className="section-label">Updated Story Preview</div>

          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                {form.existingStoryTitle}
              </div>
              <span className={`badge ${saved ? 'badge-saved' : 'badge-unsaved'}`}>
                {saved ? 'Updated in Sheets' : 'Unsaved'}
              </span>
            </div>

            <textarea
              className="story-preview"
              style={{ width: '100%', minHeight: '320px', border: 'none' }}
              value={story}
              onChange={(e) => {
                setStory(e.target.value);
                setSaved(false);
              }}
            />

            <div className="story-actions">
              <button
                className="btn btn-success"
                onClick={handleSave}
                disabled={saved || saving}
              >
                {saving ? (
                  <>
                    <span className="spinner" /> Saving...
                  </>
                ) : saved ? (
                  '✓ Updated in Sheets'
                ) : (
                  'Save Update to Google Sheets'
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleGenerate}
                disabled={loading}
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
