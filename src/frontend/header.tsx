import { NavLink } from 'react-router-dom'
import './header.css'

interface HeaderProps {
  compareCount: number
  savedCount: number
}

function navClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'is-active' : ''
}

function Header({ compareCount, savedCount }: HeaderProps) {
  return (
    <div className="nav-bar">
      <div className="nav-left">
        <div className="nav-logo">
          <span className="nav-logo-mark" />
          <span className="nav-logo-text">Smart hat</span>
        </div>
        <nav className="nav-links">
          <NavLink end to="/" className={navClassName}>Explore</NavLink>
          <NavLink to="/map" className={navClassName}>Map</NavLink>
          <NavLink to="/compare" className={navClassName}>Compare{compareCount > 0 ? ` · ${compareCount}` : ''}</NavLink>
          <NavLink to="/saved" className={navClassName}>Saved{savedCount > 0 ? ` · ${savedCount}` : ''}</NavLink>
        </nav>
      </div>
      <span className="nav-source">NYC OPEN DATA &middot; SHSAT ADMISSIONS</span>
    </div>
  )
}

export default Header;
