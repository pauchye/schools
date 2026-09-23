import React from 'react'
import { NavLink } from 'react-router-dom'
import './header.css'

function Header({ compareCount, savedCount }) {
  return (
    <div className="nav-bar">
      <div className="nav-left">
        <div className="nav-logo">
          <span className="nav-logo-mark" />
          <span className="nav-logo-text">Smart hat</span>
        </div>
        <nav className="nav-links">
          <NavLink exact to="/" activeClassName="is-active">Explore</NavLink>
          <NavLink to="/map" activeClassName="is-active">Map</NavLink>
          <NavLink to="/compare" activeClassName="is-active">Compare{compareCount > 0 ? ` · ${compareCount}` : ''}</NavLink>
          <NavLink to="/saved" activeClassName="is-active">Saved{savedCount > 0 ? ` · ${savedCount}` : ''}</NavLink>
        </nav>
      </div>
      <span className="nav-source">NYC OPEN DATA &middot; SHSAT ADMISSIONS</span>
    </div>
  )
}

export default Header;
