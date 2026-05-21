# ACT Map App

React + Capacitor mapping app with Google satellite tiles, custom labels, line drawing, distance measuring, area/polygon tool, and map export.

## Stack
- React 18 + Vite
- Capacitor 6 (Android)
- Leaflet 1.9
- Firebase 10 (Firestore + Google Auth)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Open `src/firebase/config.js` and replace the placeholder values with your new Firebase project credentials:
- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Add a Web app
- Enable **Firestore Database**
- Enable **Authentication → Google sign-in**
- Copy the config object into `src/firebase/config.js`

### 3. Run in browser
```bash
npm run dev
```

### 4. Build for Android
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

---

## Features

| Tool | What it does |
|------|-------------|
| **Custom Label** | Enter a coordinate + name → pins a cyan dot on the map, syncs to Firebase if signed in |
| **Draw Lines** | Add point-by-point → draws yellow polyline on the map |
| **Measure Distance** | Enter 2+ points → calculates total distance in m/km |
| **Area / Polygon** | Enter 3+ boundary points → draws green polygon + calculates area in m²/ha |
| **Export Map** | Instructions for screenshotting map view (extend with html2canvas if needed) |

---

## Firestore Collections
- `mapLabels` — `{ uid, name, lat, lng, createdAt }`
- `mapLines`  — `{ uid, name, points[], createdAt }`

---

## Extending Export
Install html2canvas:
```bash
npm install html2canvas
```
Then in `MapPage.jsx`, add a button that calls:
```js
import html2canvas from 'html2canvas';
html2canvas(document.querySelector('#map')).then(canvas => {
  const link = document.createElement('a');
  link.download = 'map.png';
  link.href = canvas.toDataURL();
  link.click();
});
```
