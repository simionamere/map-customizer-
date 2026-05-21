import { useState, useEffect, useCallback } from 'react';
import { saveLabel, loadLabels, deleteLabel, saveLine, loadLines, deleteLine } from '../firebase/labels';

const LS_LABELS = 'act_map_labels';
const LS_LINES  = 'act_map_lines';

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function writeLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useLabels(user) {
  const [labels, setLabels] = useState(() => readLocal(LS_LABELS));
  const [lines,  setLines]  = useState(() => readLocal(LS_LINES));

  // Sync from Firebase when user logs in
  useEffect(() => {
    if (!user) return;
    loadLabels(user.uid).then(remote => {
      setLabels(remote);
      writeLocal(LS_LABELS, remote);
    }).catch(console.error);
    loadLines(user.uid).then(remote => {
      setLines(remote);
      writeLocal(LS_LINES, remote);
    }).catch(console.error);
  }, [user]);

  const addLabel = useCallback(async (label) => {
    const newLabel = { ...label, id: Date.now().toString() };
    const updated  = [...labels, newLabel];
    setLabels(updated);
    writeLocal(LS_LABELS, updated);
    if (user) {
      try { await saveLabel(user.uid, label); } catch (e) { console.error(e); }
    }
    return newLabel;
  }, [labels, user]);

  const removeLabel = useCallback(async (id) => {
    const updated = labels.filter(l => l.id !== id);
    setLabels(updated);
    writeLocal(LS_LABELS, updated);
    if (user) {
      try { await deleteLabel(id); } catch (e) { console.error(e); }
    }
  }, [labels, user]);

  const addLine = useCallback(async (line) => {
    const newLine = { ...line, id: Date.now().toString() };
    const updated = [...lines, newLine];
    setLines(updated);
    writeLocal(LS_LINES, updated);
    if (user) {
      try { await saveLine(user.uid, line); } catch (e) { console.error(e); }
    }
    return newLine;
  }, [lines, user]);

  const removeLine = useCallback(async (id) => {
    const updated = lines.filter(l => l.id !== id);
    setLines(updated);
    writeLocal(LS_LINES, updated);
    if (user) {
      try { await deleteLine(id); } catch (e) { console.error(e); }
    }
  }, [lines, user]);

  return { labels, lines, addLabel, removeLabel, addLine, removeLine };
}
