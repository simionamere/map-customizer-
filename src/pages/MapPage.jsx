import MapView from '../components/MapView';

export default function MapPage({ mapRef, labels, lines, polygons }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapView ref={mapRef} labels={labels} lines={lines} polygons={polygons} />
    </div>
  );
}
