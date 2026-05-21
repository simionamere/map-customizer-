import { useState, useRef } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase/config';
import { useLabels } from './hooks/useLabels';
import MapPage from './pages/MapPage';
import ToolsPage from './pages/ToolsPage';
import './index.css';

export default function App() {
  const [tab,  setTab]  = useState('map');
  const [user, setUser] = useState(null);
  const mapRef = useRef(null);

  // polygons are local only (not Firebase yet — easy to extend)
  const [polygons, setPolygons] = useState([]);

  const { labels, lines, addLabel, removeLabel, addLine, removeLine } = useLabels(user);

  const addPolygon = (poly) => setPolygons(prev => [...prev, { ...poly, id: Date.now().toString() }]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleGoToMap = ({ lat, lng }) => {
    setTab('map');
    setTimeout(() => mapRef.current?.flyTo(lat, lng, 16), 100);
  };

  return (
    <div className="app-shell">
      {/* Pages */}
      <div className="page-container">
        <div className={`page ${tab === 'map' ? 'page-active' : 'page-hidden'}`}>
          <MapPage mapRef={mapRef} labels={labels} lines={lines} polygons={polygons}/>
        </div>
        <div className={`page ${tab === 'tools' ? 'page-active' : 'page-hidden'}`}>
          <ToolsPage
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            addLabel={addLabel}
            addLine={addLine}
            addPolygon={addPolygon}
            onGoToMap={handleGoToMap}
          />
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn ${tab === 'map' ? 'nav-active' : ''}`}
          onClick={() => setTab('map')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/>
            <line x1="9" y1="3" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          <span>Map</span>
        </button>
        <button
          className={`nav-btn ${tab === 'tools' ? 'nav-active' : ''}`}
          onClick={() => setTab('tools')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>Tools</span>
        </button>
      </nav>
    </div>
  );
}
