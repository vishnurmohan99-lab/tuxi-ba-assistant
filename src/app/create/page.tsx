'use client';
import { useState } from 'react';

interface Story {
  content: string;
  saved: boolean;
  title: string;
}

export default function CreatePage() {
  const [form, setForm] = useState({
    featureName: '',
    featureDescription: '',
    storiesRequired: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  async function handleGenerate() {
    setError('');
    setStories([]);
    setLoading(true);
    try {
      const res = await fetch('/api/create-user-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Extract title from each story (first "Title:" line)
      const parsed: Story[] = data.stories.map((s: string) => {
        const titleMatch = s.match(/^Title:\s*(.+)/m);
        return {
          content: s,
          saved: false,
          title: titleMatch ? titleMatch[1].trim() : 'Untitled Story',
        };
      });
      setStories(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(index: number) {
    setSavingIndex(index);
    try {
      const s = stories[index];
      const res = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: form.featureName,
          title: s.title,
          story: s.content,
          mode: 'append',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStories((prev) =>
        prev.map((st, i) => (i === index ? { ...st, saved: true } : st))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSavingIndex(null);
    }
  }

  function handleEdit(index: number, value: string) {
    setStories((prev) =>
      prev.map((s, i) => (i === index ? { ...s, content: value, saved: false } : s))
    );
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Create User Stories</h1>
        <p>Generate user stories for a completely new feature.</p>
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
          <label>Feature Description</label>
          <textarea
            rows={3}
            value={form.featureDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, featureDescription: e.target.value }))
            }
            placeholder="e.g. Display receipts differently based on ride category."
          />
        </div>

        <div className="form-group">
          <label>User Stories Required</label>
          <textarea
            rows={4}
            value={form.storiesRequired}
            onChange={(e) =>
              setForm((f) => ({ ...f, storiesRequired: e.target.value }))
            }
            placeholder={`One per line, e.g.:\nDriver Receipt View\nRider Receipt View\nAdmin Receipt View`}
          />
        </div>

        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea
            rows={2}
            value={form.additionalNotes}
            onChange={(e) =>
              setForm((f) => ({ ...f, additionalNotes: e.target.value }))
            }
            placeholder="e.g. Maintain existing functionality for non-auto rides."
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={
            loading ||
            !form.featureName ||
            !form.featureDescription ||
            !form.storiesRequired
          }
        >
          {loading ? (
            <>
              <span className="spinner" /> Generating...
            </>
          ) : (
            'Generate User Stories'
          )}
        </button>
      </div>

      {/* Preview */}
      {stories.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div className="section-label">{stories.length} Stories Generated</div>

          {stories.map((story, i) => (
            <div key={i} className="card" style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {story.title}
                </div>
                <span
                  className={`badge ${story.saved ? 'badge-saved' : 'badge-unsaved'}`}
                >
                  {story.saved ? 'Saved' : 'Unsaved'}
                </span>
              </div>

              <textarea
                className="story-preview"
                style={{ width: '100%', minHeight: '280px', border: 'none' }}
                value={story.content}
                onChange={(e) => handleEdit(i, e.target.value)}
              />

              <div className="story-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleSave(i)}
                  disabled={story.saved || savingIndex === i}
                >
                  {savingIndex === i ? (
                    <>
                      <span className="spinner" /> Saving...
                    </>
                  ) : story.saved ? (
                    '✓ Saved to Sheets'
                  ) : (
                    'Save to Google Sheets'
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  Regenerate All
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
