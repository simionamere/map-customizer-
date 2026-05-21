import { useState, useRef } from 'react';
import * as L from 'leaflet';

// ── helpers ────────────────────────────────────────────────────
function haversine(a, b) {
  const R = 6371000;
  const toR = d => d * Math.PI / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function totalDistance(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i]);
  return d;
}

function polygonArea(pts) {
  // Shoelace on lat/lng approximation converted to m²
  if (pts.length < 3) return 0;
  const R = 6371000;
  const toR = d => d * Math.PI / 180;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += toR(pts[j].lng - pts[i].lng) *
            (2 + Math.sin(toR(pts[i].lat)) + Math.sin(toR(pts[j].lat)));
  }
  return Math.abs(area * R * R / 2);
}

function fmtDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`;
}
function fmtArea(m2) {
  return m2 >= 10000 ? `${(m2 / 10000).toFixed(4)} ha` : `${m2.toFixed(1)} m²`;
}

// ── Point list editor ──────────────────────────────────────────
function PointList({ points, onChange }) {
  const addPoint = () => onChange([...points, { lat: '', lng: '' }]);
  const updatePoint = (i, field, val) => {
    const next = [...points];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const removePoint = (i) => onChange(points.filter((_, idx) => idx !== i));

  return (
    <div className="point-list">
      {points.map((p, i) => (
        <div key={i} className="point-row">
          <span className="point-num">{i + 1}</span>
          <input
            className="coord-input"
            placeholder="Latitude"
            value={p.lat}
            onChange={e => updatePoint(i, 'lat', e.target.value)}
          />
          <input
            className="coord-input"
            placeholder="Longitude"
            value={p.lng}
            onChange={e => updatePoint(i, 'lng', e.target.value)}
          />
          <button className="remove-btn" onClick={() => removePoint(i)}>×</button>
        </div>
      ))}
      <button className="add-point-btn" onClick={addPoint}>+ Add Point</button>
    </div>
  );
}

// ── Main Tools Page ────────────────────────────────────────────
export default function ToolsPage({ user, onLogin, onLogout, addLabel, addLine, addPolygon, onGoToMap }) {
  const [activeTab, setActiveTab] = useState('label');

  // Label tool state
  const [labelName, setLabelName] = useState('');
  const [labelLat,  setLabelLat]  = useState('');
  const [labelLng,  setLabelLng]  = useState('');

  // Line tool state
  const [lineName,   setLineName]   = useState('');
  const [linePoints, setLinePoints] = useState([{ lat: '', lng: '' }, { lat: '', lng: '' }]);

  // Measure state
  const [measurePoints, setMeasurePoints] = useState([{ lat: '', lng: '' }, { lat: '', lng: '' }]);
  const [measureResult, setMeasureResult] = useState(null);

  // Polygon state
  const [polyName,   setPolyName]   = useState('');
  const [polyPoints, setPolyPoints] = useState([
    { lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' }
  ]);
  const [polyResult, setPolyResult] = useState(null);

  // Export handled via mapRef passed down
  const handleExport = () => {
    alert('Switch to the Map tab, then use your device screenshot or the export button will capture the map.');
  };

  // ── Label apply ─────────────────────────────────────────────
  const applyLabel = async () => {
    const lat = parseFloat(labelLat);
    const lng = parseFloat(labelLng);
    if (!labelName || isNaN(lat) || isNaN(lng)) return alert('Enter a valid name and coordinates.');
    await addLabel({ name: labelName, lat, lng });
    onGoToMap({ lat, lng });
    setLabelName(''); setLabelLat(''); setLabelLng('');
  };

  // ── Line apply ──────────────────────────────────────────────
  const applyLine = async () => {
    const pts = linePoints.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }));
    if (pts.some(p => isNaN(p.lat) || isNaN(p.lng))) return alert('All points need valid coordinates.');
    if (pts.length < 2) return alert('Need at least 2 points.');
    await addLine({ name: lineName || 'Line', points: pts });
    onGoToMap({ lat: pts[0].lat, lng: pts[0].lng });
    setLineName(''); setLinePoints([{ lat: '', lng: '' }, { lat: '', lng: '' }]);
  };

  // ── Measure apply ───────────────────────────────────────────
  const applyMeasure = () => {
    const pts = measurePoints.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }));
    if (pts.some(p => isNaN(p.lat) || isNaN(p.lng))) return alert('All points need valid coordinates.');
    setMeasureResult(fmtDist(totalDistance(pts)));
  };

  // ── Polygon apply ───────────────────────────────────────────
  const applyPolygon = async () => {
    const pts = polyPoints.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }));
    if (pts.some(p => isNaN(p.lat) || isNaN(p.lng))) return alert('All points need valid coordinates.');
    if (pts.length < 3) return alert('Need at least 3 points for a polygon.');
    const area = fmtArea(polygonArea(pts));
    setPolyResult(area);
    await addPolygon({ name: polyName || 'Area', points: pts, area });
    onGoToMap({ lat: pts[0].lat, lng: pts[0].lng });
    setPolyName(''); setPolyPoints([{ lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' }]);
  };

  const tabs = [
    { id: 'label',   icon: '📍', label: 'Label' },
    { id: 'line',    icon: '✏️',  label: 'Lines' },
    { id: 'measure', icon: '📏', label: 'Measure' },
    { id: 'polygon', icon: '⬡',  label: 'Area' },
    { id: 'export',  icon: '💾', label: 'Export' },
  ];

  return (
    <div className="tools-page">
      {/* Header */}
      <div className="tools-header">
        <span className="tools-title">Tools</span>
        {user ? (
          <div className="user-info">
            <img src={user.photoURL} alt="" className="user-avatar"/>
            <button className="auth-btn" onClick={onLogout}>Sign out</button>
          </div>
        ) : (
          <button className="auth-btn" onClick={onLogin}>Sign in with Google</button>
        )}
      </div>

      {/* Tool tabs */}
      <div className="tool-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tool-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tool-tab-icon">{t.icon}</span>
            <span className="tool-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tool panels */}
      <div className="tool-panel">

        {/* ── Label ── */}
        {activeTab === 'label' && (
          <div className="panel-content">
            <h3 className="panel-title">Custom Label</h3>
            <p className="panel-desc">Name a coordinate and pin it to your map.</p>
            <label className="field-label">Label Name</label>
            <input className="text-input" placeholder="e.g. Base Camp" value={labelName} onChange={e => setLabelName(e.target.value)}/>
            <div className="coord-row">
              <div className="coord-field">
                <label className="field-label">Latitude</label>
                <input className="text-input" placeholder="-8.9085" value={labelLat} onChange={e => setLabelLat(e.target.value)}/>
              </div>
              <div className="coord-field">
                <label className="field-label">Longitude</label>
                <input className="text-input" placeholder="160.740" value={labelLng} onChange={e => setLabelLng(e.target.value)}/>
              </div>
            </div>
            {!user && <p className="sync-note">⚠ Sign in to sync labels across devices.</p>}
            <button className="apply-btn" onClick={applyLabel}>Apply → Go to Map</button>
          </div>
        )}

        {/* ── Lines ── */}
        {activeTab === 'line' && (
          <div className="panel-content">
            <h3 className="panel-title">Draw Lines</h3>
            <p className="panel-desc">Add points in order to draw a path on the map.</p>
            <label className="field-label">Line Name (optional)</label>
            <input className="text-input" placeholder="e.g. Survey Path" value={lineName} onChange={e => setLineName(e.target.value)}/>
            <label className="field-label" style={{marginTop:'12px'}}>Points</label>
            <PointList points={linePoints} onChange={setLinePoints}/>
            <button className="apply-btn" onClick={applyLine}>Apply → Go to Map</button>
          </div>
        )}

        {/* ── Measure ── */}
        {activeTab === 'measure' && (
          <div className="panel-content">
            <h3 className="panel-title">Measure Distance</h3>
            <p className="panel-desc">Enter two or more points to calculate total distance.</p>
            <PointList points={measurePoints} onChange={setMeasurePoints}/>
            {measureResult && (
              <div className="result-box">
                <span className="result-label">Total Distance</span>
                <span className="result-value">{measureResult}</span>
              </div>
            )}
            <button className="apply-btn" onClick={applyMeasure}>Calculate</button>
          </div>
        )}

        {/* ── Polygon / Area ── */}
        {activeTab === 'polygon' && (
          <div className="panel-content">
            <h3 className="panel-title">Area / Polygon</h3>
            <p className="panel-desc">Mark boundary points — shape closes automatically.</p>
            <label className="field-label">Area Name (optional)</label>
            <input className="text-input" placeholder="e.g. Plot A" value={polyName} onChange={e => setPolyName(e.target.value)}/>
            <label className="field-label" style={{marginTop:'12px'}}>Boundary Points</label>
            <PointList points={polyPoints} onChange={setPolyPoints}/>
            {polyResult && (
              <div className="result-box">
                <span className="result-label">Calculated Area</span>
                <span className="result-value">{polyResult}</span>
              </div>
            )}
            <button className="apply-btn" onClick={applyPolygon}>Apply → Go to Map</button>
          </div>
        )}

        {/* ── Export ── */}
        {activeTab === 'export' && (
          <div className="panel-content">
            <h3 className="panel-title">Export Map</h3>
            <p className="panel-desc">Save or share your current map view as an image.</p>
            <div className="export-instructions">
              <div className="export-step">
                <span className="export-num">1</span>
                <span>Switch to the Map tab and position your view.</span>
              </div>
              <div className="export-step">
                <span className="export-num">2</span>
                <span>Tap the <strong>📸 snapshot</strong> button that appears on the map.</span>
              </div>
              <div className="export-step">
                <span className="export-num">3</span>
                <span>The image saves to your device or share sheet opens.</span>
              </div>
            </div>
            <p className="sync-note" style={{marginTop:'16px'}}>
              Note: Map export uses <strong>html2canvas</strong>. Add it via <code>npm i html2canvas</code> for full support.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
