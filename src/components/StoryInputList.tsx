'use client';
import { useEffect, useRef } from 'react';

export interface StoryInput {
  id: string;
  name: string;
  description: string;
}

interface Props {
  stories: StoryInput[];
  onChange: (stories: StoryInput[]) => void;
}

export default function StoryInputList({ stories, onChange }: Props) {
  const lastNameRef = useRef<HTMLInputElement>(null);

  // Always have at least one empty slot
  useEffect(() => {
    if (stories.length === 0) {
      onChange([{ id: crypto.randomUUID(), name: '', description: '' }]);
    }
  }, []);

  function updateStory(id: string, field: 'name' | 'description', value: string) {
    const updated = stories.map((s) => s.id === id ? { ...s, [field]: value } : s);

    // Auto-add new slot when last story's name is filled
    const last = updated[updated.length - 1];
    if (last.name.trim() !== '' && field === 'name' && last.id === id) {
      updated.push({ id: crypto.randomUUID(), name: '', description: '' });
    }

    onChange(updated);
  }

  function removeStory(id: string) {
    const filtered = stories.filter((s) => s.id !== id);
    onChange(filtered.length === 0 ? [{ id: crypto.randomUUID(), name: '', description: '' }] : filtered);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {stories.map((story, index) => {
        const isLast = index === stories.length - 1;
        const isEmpty = !story.name.trim();

        return (
          <div
            key={story.id}
            style={{
              border: `1px solid ${isEmpty && !isLast ? 'var(--border)' : story.name ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '14px',
              background: 'var(--surface)',
              transition: 'border-color 0.2s',
              opacity: isLast && index > 0 && !story.name ? 0.6 : 1,
            }}
          >
            {/* Story number + remove */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: story.name ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                Story {index + 1}
              </div>
              {stories.length > 1 && (
                <button
                  onClick={() => removeStory(story.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1,
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Story Name */}
            <input
              ref={isLast ? lastNameRef : undefined}
              value={story.name}
              onChange={(e) => updateStory(story.id, 'name', e.target.value)}
              placeholder={`e.g. Driver Receipt View`}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                marginBottom: '8px',
                fontFamily: 'var(--font)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />

            {/* Description — only show if name is filled */}
            {story.name.trim() && (
              <textarea
                value={story.description}
                onChange={(e) => updateStory(story.id, 'description', e.target.value)}
                placeholder={`Describe what this story should cover — behaviour, rules, special conditions, who it applies to, etc.`}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 12px',
                  color: 'var(--text)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'var(--font)',
                  lineHeight: '1.5',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            )}
          </div>
        );
      })}

      {/* Add manually */}
      <button
        onClick={() => onChange([...stories, { id: crypto.randomUUID(), name: '', description: '' }])}
        style={{
          background: 'none',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
        }}
      >
        + Add another story
      </button>
    </div>
  );
}
