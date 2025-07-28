import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <a className="nav-item">
        <Link to="/">Dashboard</Link>
      </a>
      <a className="nav-item">
        <Link to="journal">Journal</Link>
      </a>
    </header>
  );
}

export default Header;
