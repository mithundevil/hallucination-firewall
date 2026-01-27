import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Search, Eye, Filter, RefreshCcw, XCircle } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [modalData, setModalData] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:5000/history');
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = filter === 'All'
        ? history
        : history.filter(item => item.risk === filter);

    return (
        <div className="page fade-in">
            <header className="page-header space-between">
                <div>
                    <h2>Audit <span className="accent-text">Ledger</span></h2>
                    <p>Chronological history of all security scans performed by the firewall.</p>
                </div>
                <button className="btn btn-outline" onClick={fetchHistory}>
                    <RefreshCcw size={18} className={loading ? 'spinner' : ''} /> Refresh
                </button>
            </header>

            <div className="filter-chips">
                {['All', 'Low', 'Medium', 'High'].map(f => (
                    <button
                        key={f}
                        className={`chip ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f} Risk
                    </button>
                ))}
            </div>

            <div className="glass-card table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Audit Type</th>
                                <th>Verdict</th>
                                <th>Risk Level</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>Checking neural archives...</td></tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>No records found in this category.</td></tr>
                            ) : filteredHistory.map(item => (
                                <tr key={item.id}>
                                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                                    <td><strong>{item.type}</strong></td>
                                    <td>{item.verdict}</td>
                                    <td>
                                        <span className={`badge badge-${item.risk.toLowerCase()}`}>
                                            {item.risk}
                                        </span>
                                    </td>
                                    <td className="mono">{item.score}%</td>
                                    <td>
                                        <button className="icon-btn" onClick={() => setModalData(item.details)}>
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalData && (
                <div className="modal-overlay" onClick={() => setModalData(null)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detailed Payload Log</h3>
                            <button className="close-btn" onClick={() => setModalData(null)}><XCircle size={24} /></button>
                        </div>
                        <pre className="payload-viewer">
                            {JSON.stringify(modalData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            <style jsx>{`
        .space-between { display: flex; justify-content: space-between; align-items: flex-end; }
        .filter-chips { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
        .chip { 
          padding: 0.5rem 1.25rem; border-radius: 100px; border: 1px solid var(--glass-border);
          background: transparent; color: var(--text-dim); font-weight: 500; font-size: 0.85rem;
        }
        .chip:hover { border-color: var(--primary); color: var(--text); }
        .chip.active { background: var(--primary); color: white; border-color: var(--primary); }

        .table-card { padding: 0; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.02); color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; }
        .mono { font-family: monospace; font-weight: 600; }
        .icon-btn { background: var(--glass); border: 1px solid var(--glass-border); color: var(--primary); padding: 0.5rem; border-radius: 8px; }
        .icon-btn:hover { background: var(--primary); color: white; }

        .spinner { animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-content { max-width: 700px; width: 90%; max-height: 80vh; display: flex; flex-direction: column; padding: 2rem; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .close-btn { background: none; border: none; color: var(--text-dim); }
        .payload-viewer { flex: 1; overflow: auto; background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; color: #a5b4fc; }
      `}</style>
        </div>
    );
};

export default History;
