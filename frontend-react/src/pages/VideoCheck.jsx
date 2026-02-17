
import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
    Video, Shield, AlertTriangle, CheckCircle, Upload,
    Loader2, Info, FileVideo, ChevronRight, BarChart3,
    Clock, RefreshCw, XCircle
} from 'lucide-react';

// --- Sub-Components ---

const RiskBadge = ({ level }) => {
    const config = {
        High: { color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.15)', icon: <AlertTriangle size={14} /> },
        Medium: { color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.15)', icon: <AlertTriangle size={14} /> },
        Low: { color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={14} /> }
    };

    const { color, bg, icon } = config[level] || config.Low;

    return (
        <div className="risk-badge-modern" style={{ color, backgroundColor: bg, border: `1px solid ${color}` }}>
            {icon}
            <span>{level} RISK</span>
        </div>
    );
};

const ResultCard = ({ result }) => {
    const isHigh = result.risk_level === 'High';
    const isMedium = result.risk_level === 'Medium';
    const color = isHigh ? 'var(--error)' : (isMedium ? 'var(--warning)' : 'var(--success)');

    return (
        <div className="result-card-premium slide-up">
            <div className="result-main-header">
                <div className="verdict-group">
                    <span className="verdict-label-small">Security Verdict</span>
                    <h2 style={{ color }}>{result.video_label}</h2>
                </div>
                <RiskBadge level={result.risk_level} />
            </div>

            <div className="result-stats-grid">
                <div className="stat-box-modern">
                    <div className="stat-icon-wrapper" style={{ color }}>
                        <BarChart3 size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-val">{result.ai_frame_percentage}%</span>
                        <span className="stat-lbl">AI Indicators Found</span>
                    </div>
                    <div className="stat-progress-bg">
                        <div className="stat-progress-bar" style={{ width: `${result.ai_frame_percentage}%`, backgroundColor: color }}></div>
                    </div>
                </div>

                <div className="stat-box-modern">
                    <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
                        <Clock size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-val">{result.total_frames_analyzed}</span>
                        <span className="stat-lbl">Frames Analyzed</span>
                    </div>
                </div>
            </div>

            <div className="explanation-section-modern">
                <div className="ex-header">
                    <Info size={18} className="ex-icon" />
                    <h3>Detailed Breakdown</h3>
                </div>
                <p>{result.explanation}</p>
                <div className="metadata-tag">
                    Avg. Frame Score: {result.average_ai_score}%
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const VideoCheck = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (selectedFile) => {
        if (selectedFile && (selectedFile.type === 'video/mp4' || selectedFile.type === 'video/x-msvideo' || selectedFile.name.endsWith('.avi'))) {
            if (selectedFile.size > 16 * 1024 * 1024) {
                setError("File too large. Maximum size is 16MB.");
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setResult(null);
            setError(null);
        } else {
            setError("Invalid file format. Please upload an .mp4 or .avi file.");
            setFile(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://127.0.0.1:5000/analyze/video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Verification engine unavailable. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="video-verify-page fade-in">
            <div className="abstract-bg-blob"></div>

            <header className="page-header-premium">
                <div className="brand-badge">Premium Security Layer</div>
                <h1>Video Authenticity <span className="text-gradient">Verification</span></h1>
                <p>Advanced frame-level acoustic and visual hallucination detection.</p>
            </header>

            <main className="verify-container-modern">
                <div className="analysis-grid">
                    {/* Upload Card */}
                    <div className="glass-card upload-card-premium">
                        <div className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".mp4,.avi"
                                onChange={(e) => handleFile(e.target.files[0])}
                                hidden
                            />

                            <div className="drop-content">
                                {file ? (
                                    <div className="file-preview-modern">
                                        <div className="file-icon-circle">
                                            <FileVideo size={32} />
                                        </div>
                                        <div className="file-details">
                                            <h3>{file.name}</h3>
                                            <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <button className="remove-file" onClick={(e) => { e.stopPropagation(); reset(); }}>
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="upload-glow-icon">
                                            <Upload size={32} />
                                        </div>
                                        <h3>Drag & Drop Video</h3>
                                        <p>Select MP4 or AVI clip for analysis</p>
                                        <span className="limit-info">Standard audit limit: 16MB</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="action-area">
                            <button
                                className={`btn-primary-glow ${loading ? 'btn-loading' : ''}`}
                                onClick={handleAnalyze}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <><Loader2 className="spin" /> Analyzing Deepfake Signatures...</>
                                ) : (
                                    <>Verify Authenticity <ChevronRight size={18} /></>
                                )}
                            </button>
                            {result && !loading && (
                                <button className="btn-secondary-outline" onClick={reset}>
                                    <RefreshCw size={16} /> New Scan
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="error-alert-modern slide-up">
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Result Content */}
                    <div className="results-viewport">
                        {!result && !loading && !error && (
                            <div className="empty-state-modern card-glow">
                                <Shield className="empty-icon" />
                                <h3>Ready for Inspection</h3>
                                <p>Upload a video clip to begin the automated security audit process.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="loading-state-modern card-glow fade-in">
                                <div className="scanner-line"></div>
                                <Loader2 className="loading-logo spin" size={48} />
                                <h3>Deconstructing Video Stream</h3>
                                <p>Running frame-by-frame CNN inference and spectral analysis...</p>
                                <div className="loading-progress-container">
                                    <div className="loading-progress-bar"></div>
                                </div>
                            </div>
                        )}

                        {result && !loading && (
                            <ResultCard result={result} />
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .video-verify-page {
                    min-height: calc(100vh - 80px);
                    padding: 3rem 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .text-gradient {
                    background: linear-gradient(90deg, var(--primary), #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .abstract-bg-blob {
                    position: absolute;
                    top: -10%;
                    right: -5%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
                    z-index: -1;
                    filter: blur(60px);
                    animation: pulse 10s infinite alternate;
                }

                @keyframes pulse {
                    from { opacity: 0.3; transform: scale(1); }
                    to { opacity: 0.6; transform: scale(1.2); }
                }

                .page-header-premium {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .brand-badge {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: rgba(6, 182, 212, 0.1);
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 1rem;
                }

                .page-header-premium h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                    letter-spacing: -1px;
                }

                .page-header-premium p {
                    color: var(--text-dim);
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .verify-container-modern {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .analysis-grid {
                    display: grid;
                    grid-template-columns: 450px 1fr;
                    gap: 3rem;
                    align-items: flex-start;
                }

                /* Cards */
                .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .upload-card-premium {
                    transition: transform 0.3s ease;
                }

                .upload-card-premium:hover {
                    transform: translateY(-5px);
                    border-color: rgba(6, 182, 212, 0.3);
                }

                /* Drop Zone */
                .drop-zone {
                    height: 280px;
                    border: 2px dashed rgba(6, 182, 212, 0.2);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    background: rgba(255, 255, 255, 0.02);
                }

                .drop-zone:hover, .drop-zone.active {
                    background: rgba(6, 182, 212, 0.05);
                    border-color: var(--primary);
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
                }

                .drop-zone.has-file {
                    border-style: solid;
                    border-color: var(--primary);
                    background: rgba(6, 182, 212, 0.08);
                }

                .drop-content { text-align: center; }

                .upload-glow-icon {
                    width: 64px;
                    height: 64px;
                    background: rgba(6, 182, 212, 0.1);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    color: var(--primary);
                    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.3));
                }

                .drop-content h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
                .drop-content p { color: var(--text-dim); font-size: 0.9rem; }
                .limit-info { font-size: 0.75rem; color: rgba(255, 255, 255, 0.3); margin-top: 1rem; display: block; }

                /* File Preview */
                .file-preview-modern {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }

                .file-icon-circle {
                    width: 80px;
                    height: 80px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
                }

                .file-details h3 { font-size: 1.1rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .file-details p { font-weight: 600; color: var(--primary); }

                .remove-file {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: var(--error);
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                .remove-file:hover { opacity: 1; }

                /* Action Area */
                .action-area { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }

                .btn-primary-glow {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
                }

                .btn-primary-glow:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
                    filter: brightness(1.1);
                }

                .btn-primary-glow:disabled {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.2);
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .btn-secondary-outline {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-dim);
                    padding: 0.8rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-secondary-outline:hover { background: rgba(255, 255, 255, 0.05); color: white; }

                /* Results Viewport */
                .results-viewport { min-height: 480px; }

                .empty-state-modern {
                    height: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.01);
                    color: var(--text-dim);
                }

                .empty-icon { size: 64px; margin-bottom: 1.5rem; opacity: 0.2; }

                /* Loading State */
                .loading-state-modern {
                    height: 100%;
                    background: rgba(15, 23, 42, 0.4);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(6, 182, 212, 0.1);
                }

                .scanner-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, var(--primary), transparent);
                    animation: scan 3s infinite;
                    z-index: 10;
                }

                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }

                .loading-logo { color: var(--primary); margin-bottom: 2rem; }
                .loading-state-modern h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
                .loading-state-modern p { color: var(--text-dim); margin-bottom: 2.5rem; }

                .loading-progress-container { width: 300px; height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden; }
                .loading-progress-bar { height: 100%; background: var(--primary); width: 30%; animation: loading-progress 2s infinite ease-in-out; }

                @keyframes loading-progress {
                    0% { transform: translateX(-100%); width: 20%; }
                    50% { width: 50%; }
                    100% { transform: translateX(300px); width: 20%; }
                }

                /* Result Card Modern */
                .result-card-premium {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 2.5rem;
                }

                .result-main-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3rem;
                }

                .verdict-label-small { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: var(--text-dim); letter-spacing: 2px; }
                .result-main-header h2 { font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem; }

                .risk-badge-modern {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .result-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-box-modern {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    position: relative;
                    overflow: hidden;
                }

                .stat-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-info { display: flex; flex-direction: column; }
                .stat-val { font-size: 1.5rem; font-weight: 800; }
                .stat-lbl { font-size: 0.85rem; color: var(--text-dim); }

                .stat-progress-bg { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255, 255, 255, 0.05); }
                .stat-progress-bar { height: 100%; transition: width 1s cubic-bezier(0.19, 1, 0.22, 1); }

                .explanation-section-modern {
                    background: rgba(6, 182, 212, 0.05);
                    border: 1px solid rgba(6, 182, 212, 0.1);
                    border-radius: 20px;
                    padding: 2rem;
                }

                .ex-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: var(--primary); }
                .ex-header h3 { font-size: 1.1rem; font-weight: 700; }
                .explanation-section-modern p { line-height: 1.6; color: var(--text-dim); margin-bottom: 1.5rem; }

                .metadata-tag {
                    display: inline-block;
                    padding: 0.4rem 0.8rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-family: monospace;
                    color: var(--text-dim);
                }

                .error-alert-modern {
                    margin-top: 1.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: var(--error);
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                /* Mobile Optimization */
                @media (max-width: 1000px) {
                    .analysis-grid { grid-template-columns: 1fr; }
                    .page-header-premium h1 { font-size: 2.2rem; }
                }
            `}</style>
        </div>
    );
};

export default VideoCheck;
