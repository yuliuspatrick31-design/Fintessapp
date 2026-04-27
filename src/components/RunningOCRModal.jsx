import { useState, useRef } from 'react';
import { performOCR, parseOCRText } from '../lib/ocrService';
import { useApp } from '../context/AppContext';
import { today, parseDuration } from '../utils/calculations';

export default function RunningOCRModal({ onClose }) {
  const { addRunLog } = useApp();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    setFile(selected);
    setLoading(true);
    setError(null);
    
    try {
      const rawText = await performOCR(selected);
      const parsed = parseOCRText(rawText);
      setPreview({
        date: today(),
        distance: parsed.distance || '',
        duration: parsed.duration || '',
        pace: parsed.pace || '',
        confidence: parsed.confidence,
        notes: 'Imported via Screenshot'
      });
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview.distance || !preview.duration) return;
    addRunLog({
      date: preview.date,
      distance: parseFloat(preview.distance),
      duration: preview.duration,
      durationSecs: parseDuration(preview.duration),
      notes: preview.notes,
      source: 'screenshot_ocr'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🏃 Scan Running Screenshot</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {!preview && !loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Upload a screenshot from Strava, Apple Fitness, or Huawei Health.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button className="btn btn-primary w-full" onClick={() => fileInputRef.current.click()}>
              Choose Screenshot
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Analyzing Image...</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Extracting distance and pace</p>
          </div>
        )}

        {preview && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <div style={{ 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)', 
              borderRadius: 12, 
              padding: 14, 
              marginBottom: 16 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  OCR Results
                </span>
                <span className={`badge badge-${preview.confidence.level === 'high' ? 'success' : preview.confidence.level === 'medium' ? 'warning' : 'danger'}`}>
                  {preview.confidence.level.toUpperCase()} CONFIDENCE
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 10 }}>
                <label className="form-label">Distance (km)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={preview.distance} 
                  onChange={e => setPreview(p => ({ ...p, distance: e.target.value }))}
                />
              </div>

              <div className="form-row form-row-2" style={{ marginBottom: 10 }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={preview.duration} 
                    onChange={e => setPreview(p => ({ ...p, duration: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pace (/km)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={preview.pace} 
                    disabled 
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={preview.date} 
                  onChange={e => setPreview(p => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setPreview(null)}>RETAKE</button>
              <button className="btn btn-primary" style={{ flex: 2, padding: '12px', background: 'var(--accent)', color: 'var(--bg)' }} onClick={handleSave}>CONFIRM & SAVE</button>
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 11, textAlign: 'center', marginTop: 10 }}>{error}</p>
        )}
      </div>
    </div>
  );
}
