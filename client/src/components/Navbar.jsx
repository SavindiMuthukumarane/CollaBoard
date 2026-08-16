import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <Link className="brand" to="/dashboard"><span className="brand-mark">C</span>CollabBoard</Link>
      <div className="nav-user"><span>{user?.name}</span><button className="ghost-button" onClick={logout}>Logout</button></div>
    </header>
  );
}
