import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return <div className="offline-banner" role="status">You are offline. CollabBoard is displaying cached data and preserving your task draft.</div>;
}