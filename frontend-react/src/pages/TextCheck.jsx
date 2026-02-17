import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileSearch, AlertCircle, CheckCircle2, Info, Loader2,
    Eraser, Shield, BarChart3, Brain, ClipboardCheck,
    Search, RefreshCw, AlertTriangle, Layers
} from 'lucide-react';
import './TextCheck.css';

const TextCheck = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }, [text]);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze/text', { text });
            if (response.data.success) {
                // Add a slight delay for better UX feel during transition
                setTimeout(() => {
                    setResult(response.data.data);
                    setLoading(false);
                }, 800);
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        } catch (err) {
            setError("Analysis engine unreachable. Please ensure the backend is running.");
            console.error(err);
            setLoading(false);
        }
    };

    const clearAll = () => {
        setText('');
        setResult(null);
        setError(null);
    };

    const getRiskStyles = (level) => {
        switch (level) {
            case 'High': return 'risk-high';
            case 'Medium': return 'risk-medium';
            case 'Low': return 'risk-low';
            default: return 'risk-low';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'High': return <AlertCircle size={18} />;
            case 'Medium': return <AlertTriangle size={18} />;
            case 'Low': return <CheckCircle2 size={18} />;
            default: return <CheckCircle2 size={18} />;
        }
    };

    return (
        <div className="text-check-container fade-in">
            <header className="page-header">
                <div className="header-tag">
                    <Brain size={14} /> NLP Security Audit
                </div>
                <h2>Linguistic <span className="accent-text">Integrity</span> Audit</h2>
                <p>Advanced semantic analysis using fine-tuned DistilBERT models to detect AI hallucinations.</p>
            </header>

            <div className="audit-layout">
                {/* Input Panel */}
                <div className="premium-card">
                    <div className="card-title">
                        <Layers size={20} className="accent-text" />
                        Source Content Analysis
                    </div>

                    <div className="editor-surface">
                        <textarea
                            className="premium-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste AI response here for a deep semantic integrity check..."
                            disabled={loading}
                        />
                        <div className="editor-toolbar">
                            <div className="stats-group">
                                <span><strong>{charCount}</strong> Characters</span>
                                <span><strong>{wordCount}</strong> Words</span>
                            </div>
                            <div className="status-label">
                                {wordCount < 10 && wordCount > 0 ? (
                                    <span style={{ color: '#ffa500' }}>Short samples may reduce accuracy</span>
                                ) : (
                                    <span>Ready for audit</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="button-container">
                        <button
                            className="btn-premium"
                            disabled={!text.trim() || loading}
                            onClick={handleAnalyze}
                        >
                            {loading ? (
                                <>Analyzing Performance...</>
                            ) : (
                                <><Search size={20} /> Request Integrity Audit</>
                            )}
                        </button>
                        <button className="btn-ghost" onClick={clearAll} disabled={loading}>
                            <Eraser size={18} /> Clear
                        </button>
                    </div>

                    {error && (
                        <div className="error-banner reveal-animation">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Result Panel */}
                <div className="premium-card">
                    <div className="card-title">
                        <Shield size={20} className="accent-text" />
                        Audit Verdict
                    </div>

                    {loading ? (
                        <div className="loading-indicator">
                            <div className="spinner-outer">
                                <div className="spinner-inner"></div>
                            </div>
                            <p>Scanning linguistic patterns...</p>
                        </div>
                    ) : !result ? (
                        <div className="audit-placeholder">
                            <div className="placeholder-icon-wrap">
                                <BarChart3 size={32} />
                            </div>
                            <h4>No Active Session</h4>
                            <p>Submit text content to trigger the deep learning classification pipeline.</p>
                        </div>
                    ) : (
                        <div className="reveal-animation">
                            <div className="verdict-header">
                                <div className={`risk-tag-large ${getRiskStyles(result.risk_level)}`}>
                                    {getRiskIcon(result.risk_level)}
                                    {result.risk_level} Risk
                                </div>
                                <div className="model-status">
                                    <span className="dot" style={{ backgroundColor: '#00e676' }}></span>
                                    {result.model_status}
                                </div>
                            </div>

                            <div className="confidence-section">
                                <div className="meter-header">
                                    <span>Hallucination Probability</span>
                                    <span className="accent-text">{Math.round(result.text_score)}%</span>
                                </div>
                                <div className="meter-container">
                                    <div
                                        className="meter-fill"
                                        style={{
                                            width: `${result.text_score}%`,
                                            backgroundColor: result.text_score > 60 ? '#ff4d4d' : (result.text_score > 30 ? '#ffa500' : '#00e676')
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-info">
                                        <span className="metric-label">Reliability</span>
                                        <span className="metric-value" style={{ color: '#00e676' }}>{Math.round(result.reliable_prob)}%</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-info">
                                        <span className="metric-label">Engine</span>
                                        <span className="metric-value">BERT</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-info">
                                        <span className="metric-label">Class</span>
                                        <span className="metric-value">{result.text_score > 50 ? 'Synthetic' : 'Grounded'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="explanation-surface">
                                <Info size={24} className="info-circle" />
                                <p>{result.explanation}</p>
                            </div>

                            <button className="btn-ghost" style={{ width: '100%' }} onClick={clearAll}>
                                <RefreshCw size={16} /> Start New Security Scan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextCheck;
