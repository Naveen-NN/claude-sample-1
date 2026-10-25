import { Link, Outlet } from "react-router-dom";
import { useStore } from "../store";

export function Layout() {
  const { notice, setNotice } = useStore();
  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="brand">
          Posts
        </Link>
        <Link to="/posts/new" className="button">
          New post
        </Link>
      </header>
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button className="link" onClick={() => setNotice(undefined)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
