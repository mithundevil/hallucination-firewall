import React, { useState } from 'react';
import axios from 'axios';
import { FileSearch, AlertCircle, CheckCircle2, Info, Loader2, Eraser } from 'lucide-react';

const TextCheck = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze/text', { text });
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Failed to reach analysis engine.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setText('');
        setResult(null);
        setError(null);
    };

    return (
        <div className="page fade-in">
            <header className="page-header">
                <h2>Linguistic <span className="accent-text">Audit</span></h2>
                <p>Heuristic analysis for identifying hallucinations and over-confidence markers.</p>
            </header>

            <div className="analysis-grid">
                <div className="glass-card input-section">
                    <h3><FileSearch size={20} /> Content Input</h3>
                    <textarea
                        className="editor"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste AI system response here for integrity check..."
                    />
                    <div className="button-row">
                        <button
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={!text.trim() || loading}
                            onClick={handleAnalyze}
                        >
                            {loading ? <Loader2 className="spinner" /> : "Audit Content"}
                        </button>
                        <button className="btn btn-outline" onClick={clearAll} disabled={loading}>
                            <Eraser size={18} /> Clear
                        </button>
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                </div>

                <div className={`glass-card result-section ${!result ? 'empty' : ''}`}>
                    <div className="result-header">
                        <h4>Hallucination Score</h4>
                        {result && (
                            <span className={`badge badge-${result.risk_level.toLowerCase()}`}>
                                {result.risk_level} Risk
                            </span>
                        )}
                    </div>

                    {!result ? (
                        <div className="idle-state">
                            <Info size={40} />
                            <p>Enter text output for analysis to view linguistic reliability metrics.</p>
                        </div>
                    ) : (
                        <div className="result-content">
                            <div className="score-display">
                                <div className="score-circle">
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle className="bg" cx="60" cy="60" r="54" />
                                        <circle
                                            className="progress"
                                            cx="60" cy="60" r="54"
                                            style={{ strokeDashoffset: 339 - (339 * result.score) / 100 }}
                                        />
                                    </svg>
                                    <div className="score-text">
                                        <span className="val">{result.text_score}</span>
                                        <span className="total">/100</span>
                                    </div>
                                </div>
                                <div className="verdict-meta">
                                    <div className="verdict-text" style={{ color: result.text_score > 60 ? 'var(--error)' : (result.text_score > 30 ? 'var(--warning)' : 'var(--success)') }}>
                                        {result.text_score > 60 ? <AlertCircle /> : <CheckCircle2 />}
                                        <span>{result.risk_level === 'Low' ? 'Reliable Content' : (result.risk_level === 'Medium' ? 'Uncertain Patterns' : 'High Hallucination Risk')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="explanation-box">
                                <h5>Linguistic breakdown</h5>
                                <p>{result.explanation}</p>
                            </div>

                            <div className="marker-grid">
                                {result.detected_signals.map((signal, idx) => (
                                    <div key={idx} className="marker-item">
                                        <span className="label">Signal Target</span>
                                        <span className="status warning">{signal}</span>
                                    </div>
                                ))}
                                {result.detected_signals.length === 0 && (
                                    <div className="marker-item">
                                        <span className="label">Status</span>
                                        <span className="status safe">Clean Stream</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .input-section { padding: 2.5rem; display: flex; flex-direction: column; }
        .editor {
          flex: 1; min-height: 280px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
          border-radius: 16px; color: var(--text); padding: 1.5rem; font-size: 1rem; margin: 1.5rem 0;
          resize: none; outline: none; transition: 0.3s;
        }
        .editor:focus { border-color: var(--primary); background: rgba(0,0,0,0.3); }
        .button-row { display: flex; gap: 1rem; }
        .button-row .btn-primary { flex: 2; }
        .button-row .btn-outline { flex: 1; }

        .result-section { padding: 2.5rem; }
        .result-section.empty { opacity: 0.6; }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .idle-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-dim); gap: 1rem; text-align: center; }

        .score-display { display: flex; align-items: center; gap: 2rem; margin-bottom: 2.5rem; }
        .score-circle { position: relative; width: 120px; height: 120px; }
        .score-circle svg { transform: rotate(-90deg); }
        .score-circle circle { fill: none; stroke-width: 8; stroke-linecap: round; }
        .score-circle circle.bg { stroke: rgba(255,255,255,0.05); }
        .score-circle circle.progress { 
          stroke: var(--primary); 
          stroke-dasharray: 339; 
          transition: stroke-dashoffset 1s ease-out; 
        }
        .score-text { 
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
          text-align: center; display: flex; flex-direction: column; 
        }
        .score-text .val { font-size: 1.8rem; font-weight: 700; }
        .score-text .total { font-size: 0.8rem; color: var(--text-dim); }

        .verdict-text { display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 600; }
        
        .marker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
        .marker-item { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .marker-item .label { font-size: 0.85rem; color: var(--text-dim); }
        .marker-item .status { font-size: 0.85rem; font-weight: 700; }
        .status.safe { color: var(--success); }
        .status.warning { color: var(--error); }

        @media (max-width: 850px) { .analysis-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default TextCheck;
