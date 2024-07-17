import React from 'react'
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="links">
    <Link className="link" to="/">
      Home
    </Link>
    <Link className="link" to="/ind-teams">
      Individual Teams
    </Link>
    <Link className="link" to="/team-ex">
      Team Exchange
    </Link>
  </div>
  )
}

export default Navbar;