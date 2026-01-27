import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <div className="app-bg"></div>
            <div className="bg-blur blur-1"></div>
            <div className="bg-blur blur-2"></div>
            <Navbar />
            <main className="container">
                {children}
            </main>

            <style jsx>{`
        .container {
          max-width: 1100px;
          margin: 4rem auto;
          padding: 0 2rem;
        }
      `}</style>
        </div>
    );
};

export default Layout;
