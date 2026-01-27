import React from 'react';
import { BookOpen, Target, Layers, Code, Globe, Terminal } from 'lucide-react';

const About = () => {
    return (
        <div className="page fade-in">
            <header className="page-header">
                <h2>System <span className="accent-text">Intelligence</span></h2>
                <p>A deep dive into the architecture and logic of the Hallucination Firewall.</p>
            </header>

            <section className="about-grid">
                <div className="glass-card about-card">
                    <div className="title-row">
                        <BookOpen className="icon" />
                        <h3>Problem Statement</h3>
                    </div>
                    <p>Generative AI models often produce "hallucinations" — outputs that are plausible but incorrect. In multimodal contexts, this includes synthetically generated images that pass for real and text that makes over-confident, false claims. Existing firewalls focus on network security, leaving a gap in "Semantic Security".</p>
                </div>

                <div className="glass-card about-card">
                    <div className="title-row">
                        <Target className="icon accent" />
                        <h3>Our Objectives</h3>
                    </div>
                    <ul className="obj-list">
                        <li>Detect deepfakes using frequency domain (FFT) analysis.</li>
                        <li>Verify textual semantic integrity via rule-based heuristics.</li>
                        <li>Weighted risk aggregation for multimodal AI payloads.</li>
                        <li>Transparent, explainable security auditing (XAI).</li>
                    </ul>
                </div>

                <div className="glass-card architecture-card">
                    <h3><Layers className="icon primary" /> System Architecture</h3>
                    <div className="flow-grid">
                        {[
                            { id: '01', title: 'Payload Input', desc: 'Secure ingestion of AI-generated text and image data.' },
                            { id: '02', title: 'Neural Analysis', desc: 'Parallel execution of FFT, Laplacian, and Linguistic audits.' },
                            { id: '03', title: 'Risk Synthesis', desc: 'Averaging weighted confidence scores into a final verdict.' },
                            { id: '04', title: 'Audit Persistence', desc: 'Storing encrypted logs for administrative review.' }
                        ].map(item => (
                            <div key={item.id} className="flow-item">
                                <span className="num">{item.id}</span>
                                <div className="f-text">
                                    <strong>{item.title}</strong>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card stack-card">
                    <h3><Terminal className="icon" /> The Tech Stack</h3>
                    <div className="tech-pills">
                        <span>React (Vite)</span>
                        <span>Python Flask</span>
                        <span>OpenCV</span>
                        <span>NumPy</span>
                        <span>Pillow</span>
                        <span>Axios</span>
                        <span>Lucide Icons</span>
                        <span>CSS Glassmorphism</span>
                    </div>
                </div>
            </section>

            <style jsx>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .about-card { padding: 2.5rem; }
        .title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .title-row .icon { color: var(--primary); }
        .title-row .icon.accent { color: var(--accent); }
        h3 { font-size: 1.3rem; }
        p { color: var(--text-dim); line-height: 1.7; }
        
        .obj-list { list-style: none; color: var(--text-dim); margin-top: 1rem; }
        .obj-list li { margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; }
        .obj-list li::before { content: "→"; color: var(--accent); font-weight: bold; }

        .architecture-card { grid-column: span 2; padding: 2.5rem; }
        .flow-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2rem; }
        .flow-item { text-align: left; }
        .flow-item .num { font-size: 1.5rem; font-weight: 800; color: var(--primary); opacity: 0.3; display: block; margin-bottom: 0.5rem; }
        .flow-item strong { display: block; margin-bottom: 0.4rem; color: var(--text); }
        .flow-item p { font-size: 0.85rem; }

        .stack-card { grid-column: span 2; padding: 2.5rem; }
        .tech-pills { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
        .tech-pills span { padding: 0.5rem 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; font-size: 0.9rem; font-weight: 500; }

        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; }
          .architecture-card, .stack-card { grid-column: span 1; }
          .flow-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
        </div>
    );
};

export default About;
