import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Upload, X, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

const ImageCheck = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 10 * 1024 * 1024) {
                alert("File is too large. Primary limit is 10MB.");
                return;
            }
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith('image/')) {
            setFile(dropped);
            setPreview(URL.createObjectURL(dropped));
            setResult(null);
        }
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        setResult(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Failed to connect to the analysis engine. Ensure the backend is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page fade-in">
            <header className="page-header">
                <h2>AI Image <span className="accent-text">Authentication</span></h2>
                <p>Verification module for identifying synthetic artifacts and deepfakes.</p>
            </header>

            <div className="analysis-grid">
                <div className="glass-card upload-section">
                    <h3><Upload size={20} /> Upload Target</h3>

                    <div
                        className={`drop-zone ${preview ? 'has-preview' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !file && document.getElementById('file-input').click()}
                    >
                        {!preview ? (
                            <div className="drop-content">
                                <Upload size={40} className="icon" />
                                <p>Drag & drop or <span>browse</span></p>
                                <small>Supports JPG, PNG, WEBP (Max 10MB)</small>
                            </div>
                        ) : (
                            <div className="preview-wrap">
                                <img src={preview} alt="Preview" />
                                <button className="remove-btn" onClick={clearFile}><X size={16} /></button>
                            </div>
                        )}
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                        />
                    </div>

                    <button
                        className={`btn btn-primary analyze-btn ${loading ? 'loading' : ''}`}
                        disabled={!file || loading}
                        onClick={handleAnalyze}
                    >
                        {loading ? <Loader2 className="spinner" /> : "Run Deepfake Scan"}
                    </button>

                    {error && <div className="error-msg">{error}</div>}
                </div>

                <div className={`glass-card result-section ${!result ? 'empty' : ''}`}>
                    <div className="result-header">
                        <h4>Analysis Verdict</h4>
                        {result && (
                            <span className={`badge badge-${result.risk_level.toLowerCase()}`}>
                                {result.risk_level} Risk
                            </span>
                        )}
                    </div>

                    {!result ? (
                        <div className="idle-state">
                            <Info size={40} />
                            <p>Upload and scan an image to view structural reliability data.</p>
                        </div>
                    ) : (
                        <div className="result-content">
                            <div className="verdict-container">
                                <div className="verdict-label" style={{
                                    color: result.risk_level === 'High' ? 'var(--error)' :
                                        (result.risk_level === 'Medium' ? 'var(--warning)' : 'var(--success)')
                                }}>
                                    {result.risk_level === 'High' ? <AlertTriangle /> :
                                        (result.risk_level === 'Medium' ? <AlertTriangle /> : <CheckCircle />)}
                                    <span>{result.result}</span>
                                </div>
                                <div className="type-badge" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                    Source Type: <strong>{result.image_type}</strong> {result.metrics?.resolution && `(${result.metrics.resolution})`}
                                </div>
                            </div>

                            <div className="stat-group">
                                <div className="stat-header">
                                    <span>AI Detection Score (Integrated)</span>
                                    <span>{result.score}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${result.score}%` }}></div>
                                </div>
                            </div>

                            {result.image_type === 'Photograph' && (
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <span className="m-label">CNN Confidence</span>
                                        <span className="m-val">{result.cnn_score}%</span>
                                    </div>
                                    <div className="metric-card">
                                        <span className="m-label">Heuristic Score</span>
                                        <span className="m-val">{result.heuristic_score}%</span>
                                    </div>
                                </div>
                            )}

                            <div className="explanation-box">
                                <h5>Explainable AI Insights</h5>
                                <p>{result.explanation.split('|').map((line, i) => (
                                    <span key={i}>• {line.trim()}<br /></span>
                                ))}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        header { margin-bottom: 3rem; }
        h2 { font-size: 2.2rem; margin-bottom: 0.5rem; }
        
        .upload-section { padding: 2.5rem; }
        .drop-zone {
          border: 2px dashed var(--glass-border);
          border-radius: 16px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.3s;
          margin: 1.5rem 0;
          overflow: hidden;
          position: relative;
        }
        .drop-zone:hover { border-color: var(--primary); background: rgba(6, 182, 212, 0.02); }
        .drop-zone.has-preview { border-style: solid; padding: 1rem; }
        
        .drop-content { text-align: center; color: var(--text-dim); }
        .drop-content .icon { margin-bottom: 1rem; opacity: 0.5; }
        .drop-content span { color: var(--primary); font-weight: 600; text-decoration: underline; }
        
        .preview-wrap { width: 100%; height: 100%; border-radius: 10px; overflow: hidden; position: relative; }
        .preview-wrap img { width: 100%; height: 100%; object-fit: contain; }
        .remove-btn { 
          position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); 
          color: white; border: none; padding: 6px; border-radius: 50%; 
        }

        .analyze-btn { width: 100%; height: 3.5rem; justify-content: center; font-size: 1.1rem; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .result-section { padding: 2.5rem; display: flex; flex-direction: column; }
        .result-section.empty { opacity: 0.6; }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .idle-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-dim); gap: 1rem; text-align: center; }
        
        .verdict-container { margin-bottom: 2.5rem; }
        .verdict-label { display: flex; align-items: center; gap: 0.75rem; font-size: 1.8rem; font-weight: 700; }
        
        .stat-group { margin-bottom: 2rem; }
        .stat-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; font-weight: 500; }
        .progress-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(to right, var(--primary), var(--accent)); transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .metric-card { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; }
        .m-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.25rem; }
        .m-val { font-size: 1.2rem; font-weight: 700; color: var(--primary); }

        .explanation-box { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border); }
        .explanation-box h5 { margin-bottom: 0.75rem; color: var(--primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .explanation-box p { font-size: 0.95rem; color: var(--text-dim); line-height: 1.7; }
        
        .error-msg { margin-top: 1rem; color: var(--error); font-size: 0.85rem; text-align: center; }

        @media (max-width: 850px) {
          .analysis-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default ImageCheck;
