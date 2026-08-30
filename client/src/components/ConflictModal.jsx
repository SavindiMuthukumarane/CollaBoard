export default function ConflictModal({ conflict, onLoadLatest, onClose }) {
  if (!conflict) return null;
  return (
    <div className="modal-backdrop">
      <section className="modal conflict-panel" role="alertdialog" aria-modal="true" aria-labelledby="conflict-title">
        <p className="eyebrow">Concurrent edit detected</p>
        <h2 id="conflict-title">This task changed before your update was saved</h2>
        <p>CollabBoard did not overwrite your teammate's newer version. Load the current server version before editing again.</p>
        <div className="conflict-summary">
          <strong>Latest task:</strong> {conflict.latestTask?.title || 'Unavailable'}
          <span>Version {conflict.latestTask?.version ?? '—'}</span>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Close</button>
          <button className="primary-button" onClick={onLoadLatest}>Load latest version</button>
        </div>
      </section>
    </div>
  );
}
