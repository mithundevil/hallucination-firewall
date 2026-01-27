import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, ShieldX, Ghost, Cpu, Network, Loader2, ArrowRight, RotateCcw } from 'lucide-react';

const Firewall = () => {
    const [step, setStep] = useState(1);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleProcess = async () => {
        if (!text && !image) return;
        setStep(2);
        setLoading(true);

        const formData = new FormData();
        formData.append('text', text);
        if (image) formData.append('image', image);

        try {
            // Small artificial delay for effect
            await new Promise(r => setTimeout(r, 2000));
            const res = await axios.post('http://127.0.0.1:5000/analyze/firewall', formData);
            if (res.data.success) {
                setResult(res.data.data);
                setStep(3);
            }
        } catch (err) {
            console.error(err);
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setText('');
        setImage(null);
        setPreview(null);
        setResult(null);
    };

    const getVerdictIcon = (verdict) => {
        const size = 80;
        if (verdict === 'SAFE') return <ShieldCheck size={size} color="var(--success)" />;
        if (verdict === 'WARNING') return <ShieldAlert size={size} color="var(--warning)" />;
        return <ShieldX size={size} color="var(--error)" />;
    };

    return (
        <div className="page fade-in">
            <header className="page-header center">
                <h2>Multimodal <span className="accent-text">Security Firewall</span></h2>
                <p>Combine signals from vision and language for the ultimate reliability verdict.</p>
            </header>

            <div className="stepper">
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div className={`step ${step === s ? 'active' : ''} ${step > s ? 'complete' : ''}`}>
                            <div className="step-num">{s}</div>
                            <span className="step-label">{['Input', 'Verification', 'Verdict'][s - 1]}</span>
                        </div>
                        {s < 3 && <div className={`line ${step > s ? 'complete' : ''}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className="step-content">
                {step === 1 && (
                    <div className="glass-card fade-in">
                        <div className="firewall-input-grid">
                            <div className="input-group">
                                <label>Multimodal Payload (Text)</label>
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="Paste context or response text..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Evidence Image</label>
                                <div
                                    className={`firewall-drop ${preview ? 'has-preview' : ''}`}
                                    onClick={() => !image && document.getElementById('firewall-f').click()}
                                >
                                    {!preview ? (
                                        <div className="drop-content">
                                            <Network size={32} />
                                            <p>Browse for assets</p>
                                        </div>
                                    ) : (
                                        <img src={preview} alt="Preview" />
                                    )}
                                    <input id="firewall-f" type="file" hidden onChange={handleFile} />
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary next-btn" onClick={handleProcess} disabled={!text && !image}>
                            Initiate Neural Audit <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="glass-card process-card fade-in">
                        <div className="loader-container">
                            <Loader2 size={60} className="spinner" />
                            <h3>Analyzing neural fragments...</h3>
                            <div className="log-window">
                                <p className="typing">Checking FFT magnitude spectrum...</p>
                                <p className="typing delay-1">Auditing linguistic markers...</p>
                                <p className="typing delay-2">Calculating weighted score...</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && result && (
                    <div className="glass-card verdict-card fade-in">
                        <div className="verdict-banner">
                            <div className="v-icon">{getVerdictIcon(result.firewall_verdict.verdict)}</div>
                            <h2 className={`v-label ${result.firewall_verdict.verdict.toLowerCase()}`}>
                                {result.firewall_verdict.verdict}
                            </h2>
                            <span className={`badge badge-${result.firewall_verdict.risk_level.toLowerCase()}`}>
                                {result.firewall_verdict.risk_level} RISK
                            </span>
                        </div>

                        <div className="verdict-details-grid">
                            <div className="detail-box">
                                <h5>System Decision</h5>
                                <p>{result.firewall_verdict.decision}</p>
                            </div>
                            <div className="detail-actions">
                                <div className="score-wrap">
                                    <div className="score-top">
                                        <span>Unified Security Score</span>
                                        <span>{result.firewall_verdict.score}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${result.firewall_verdict.score}%` }}></div>
                                    </div>
                                </div>
                                <button className="btn btn-outline" onClick={reset}>
                                    <RotateCcw size={18} /> New Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .center { text-align: center; }
        .stepper { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 3rem; }
        .step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--text-dim); }
        .step-num { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 700; transition: 0.3s; }
        .step-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .line { width: 60px; height: 1px; background: var(--glass-border); margin-bottom: 1.5rem; }
        
        .step.active { color: var(--primary); }
        .step.active .step-num { border-color: var(--primary); background: var(--primary-glow); }
        .step.complete { color: var(--success); }
        .step.complete .step-num { border-color: var(--success); background: rgba(16, 185, 129, 0.1); }
        .line.complete { background: var(--success); }

        .firewall-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        textarea { width: 100%; height: 200px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 16px; color: var(--text); padding: 1rem; resize: none; }
        .firewall-drop { height: 200px; border: 2px dashed var(--glass-border); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; overflow: hidden; }
        .firewall-drop:hover { border-color: var(--primary); }
        .firewall-drop img { width: 100%; height: 100%; object-fit: cover; }
        .next-btn { width: 100%; margin-top: 2rem; height: 3.5rem; justify-content: center; }

        .process-card { padding: 5rem; text-align: center; }
        .loader-container { max-width: 400px; margin: 0 auto; }
        .spinner { color: var(--primary); animation: spin 2s linear infinite; margin-bottom: 2rem; }
        .log-window { margin-top: 2rem; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 12px; font-family: monospace; text-align: left; font-size: 0.85rem; }
        .typing { color: var(--success); }
        
        .verdict-banner { text-align: center; margin-bottom: 3rem; }
        .v-icon { margin-bottom: 1rem; }
        .v-label { font-size: 2.5rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .v-label.safe { color: var(--success); }
        .v-label.warning { color: var(--warning); }
        .v-label.blocked { color: var(--error); }

        .verdict-details-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 2rem; }
        .detail-box { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 16px; }
        .detail-box h5 { color: var(--primary); margin-bottom: 0.75rem; text-transform: uppercase; font-size: 0.8rem; }
        
        .score-wrap { margin-bottom: 2rem; }
        .score-top { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .progress-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(to right, var(--primary), var(--accent)); transition: width 1s; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Firewall;
