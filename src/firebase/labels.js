import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const COL = 'mapLabels';

export async function saveLabel(uid, label) {
  return addDoc(collection(db, COL), {
    uid,
    name: label.name,
    lat:  label.lat,
    lng:  label.lng,
    createdAt: serverTimestamp()
  });
}

export async function loadLabels(uid) {
  const q   = query(collection(db, COL), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteLabel(id) {
  return deleteDoc(doc(db, COL, id));
}

// ── Lines ──────────────────────────────────────────────────────
const LINES_COL = 'mapLines';

export async function saveLine(uid, line) {
  return addDoc(collection(db, LINES_COL), {
    uid,
    name:   line.name,
    points: line.points,
    createdAt: serverTimestamp()
  });
}

export async function loadLines(uid) {
  const q    = query(collection(db, LINES_COL), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteLine(id) {
  return deleteDoc(doc(db, LINES_COL, id));
}
