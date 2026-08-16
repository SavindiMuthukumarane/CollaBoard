export function notFound(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.' });
  if (err?.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err?.name === 'CastError') return res.status(404).json({ message: 'Resource not found.' });
  const status = Number.isInteger(err.status) ? err.status : 500;
  return res.status(status).json({ message: status === 500 ? 'Unexpected server error.' : err.message });
}
