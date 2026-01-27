import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, SearchCheck, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="home fade-in">
            <section className="hero">
                <h1>Trust AI. <span className="accent-text">But Verify Everything.</span></h1>
                <p>The ultimate security layer for multimodal AI systems. Detect deepfakes, hallucinations, and unreliability through explainable AI.</p>
                <div className="cta-group">
                    <Link to="/firewall" className="btn btn-primary">
                        Start Multimodal Scan <ArrowRight size={18} />
                    </Link>
                    <Link to="/about" className="btn btn-outline">Learn Architecture</Link>
                </div>
            </section>

            <div className="feature-grid">
                <div className="glass-card feature-card">
                    <div className="icon-box primary">
                        <Fingerprint size={32} />
                    </div>
                    <h3>Image Detection</h3>
                    <p>Analyze image authenticity using Laplacian noise variance and FFT frequency analysis to detect synthetic patterns.</p>
                    <Link to="/image-check" className="card-link">Try Image Check <ArrowRight size={16} /></Link>
                </div>

                <div className="glass-card feature-card">
                    <div className="icon-box accent">
                        <SearchCheck size={32} />
                    </div>
                    <h3>Text Hallucination</h3>
                    <p>Detect linguistic hallucinations and over-confidence markers in AI-generated text using rule-based heuristic modules.</p>
                    <Link to="/text-check" className="card-link">Try Text Check <ArrowRight size={16} /></Link>
                </div>

                <div className="glass-card feature-card">
                    <div className="icon-box success">
                        <ShieldAlert size={32} />
                    </div>
                    <h3>Multimodal Firewall</h3>
                    <p>Combine image and text analysis for a comprehensive security verdict. The ultimate decision layer for AI security.</p>
                    <Link to="/firewall" className="card-link">Run Firewall <ArrowRight size={16} /></Link>
                </div>
            </div>

            <style jsx>{`
        .home {
          text-align: center;
        }
        .hero {
          margin-bottom: 6rem;
          padding-top: 2rem;
        }
        h1 {
          font-size: 3.8rem;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--text-dim);
          max-width: 650px;
          margin: 0 auto 3rem;
        }
        .cta-group {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 20px var(--primary-glow);
        }
        .btn-primary:hover {
          background: #0891b2;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--primary-glow);
        }
        .btn-outline {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
          border: 1px solid var(--glass-border);
        }
        .btn-outline:hover {
          background: var(--glass);
          transform: translateY(-2px);
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .feature-card {
          padding: 2.5rem;
          text-align: left;
        }
        .icon-box {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .icon-box.primary { background: rgba(6, 182, 212, 0.1); color: var(--primary); }
        .icon-box.accent { background: rgba(139, 92, 246, 0.1); color: var(--accent); }
        .icon-box.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        
        h3 { margin-bottom: 1rem; font-size: 1.25rem; }
        .feature-card p {
          color: var(--text-dim);
          font-size: 0.95rem;
          margin-bottom: 2rem;
          min-height: 80px;
        }
        .card-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: gap 0.2s;
        }
        .card-link:hover { gap: 0.75rem; }

        @media (max-width: 900px) {
          .feature-grid { grid-template-columns: 1fr; }
          h1 { font-size: 2.5rem; }
        }
      `}</style>
        </div>
    );
};

export default Home;
