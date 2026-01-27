import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Image, FileText, Activity, History, Info } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/" className="logo">
                    <Shield className="logo-icon" />
                    <span>FIREWALL<span className="accent-text">.AI</span></span>
                </NavLink>
                <div className="nav-links">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                        <Activity size={18} /> Home
                    </NavLink>
                    <NavLink to="/image-check" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <Image size={18} /> Image Check
                    </NavLink>
                    <NavLink to="/text-check" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FileText size={18} /> Text Check
                    </NavLink>
                    <NavLink to="/firewall" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <Shield size={18} /> Firewall
                    </NavLink>
                    <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <History size={18} /> History
                    </NavLink>
                    <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <Info size={18} /> About
                    </NavLink>
                </div>
            </div>

            <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(3, 7, 18, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          font-weight: 700;
          font-size: 1.4rem;
        }
        .logo-icon {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-links a {
          text-decoration: none;
          color: var(--text-dim);
          font-weight: 500;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
        }
        .nav-links a:hover {
          color: var(--text);
          background: var(--glass);
        }
        .nav-links a.active {
          color: var(--primary);
          background: rgba(6, 182, 212, 0.1);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
