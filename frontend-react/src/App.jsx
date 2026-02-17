import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ImageCheck from './pages/ImageCheck';
import TextCheck from './pages/TextCheck';
import Firewall from './pages/Firewall';
import History from './pages/History';
import About from './pages/About';
import VideoCheck from './pages/VideoCheck';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image-check" element={<ImageCheck />} />
          <Route path="/text-check" element={<TextCheck />} />
          <Route path="/video-check" element={<VideoCheck />} />
          <Route path="/firewall" element={<Firewall />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
