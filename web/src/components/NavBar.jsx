import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useLocation, Link } from 'react-router';

import './NavBar.css';

function NavBar() {
    const location = useLocation();
    const cookies = new Cookies();

    // dont show navbar on these paths:
    const navExcludedPaths = ["/login", "/signup"];
    if (navExcludedPaths.includes(location.pathname.toLowerCase())) return null;

    // if mobile size, dont show navbar by default, otherwise use cookie
    const [navbarOpen, setNavbarOpen] = useState(() => {
        if((window.innerWidth < 600)) return false;
        return cookies.get("nav-status-open") !== "closed";
    });

    function toggleNavbar() {
        setNavbarOpen(!navbarOpen);
    }

    useEffect(() => {
        if(cookies.get("nav-status-open") !== (navbarOpen ? "open" : "closed")) {
            cookies.set("nav-status-open", navbarOpen ? "open" : "closed", { path: '/' });
        }
    }, [navbarOpen]);

    return (
        <nav>
            {/* big navbar */}
            <div className={"navbar-col" + (navbarOpen ? " navbar-open" : "")} inert={navbarOpen ? false : true}>
                <div className="navbar-col-header">
                    <Link to="/" className="navbar-logo-link" tabIndex={-1} onDragStart={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
                        <img src="/logo.svg" className="navbar-logo" />
                    </Link>
                    <div className="navbar-col-header-btns">
                        <Link to="/" className="navbar-col-header-btn col-nav-link" aria-label="New Chat">
                            <span className="material-symbols-rounded navbar-btn-icon">add_2</span>
                        </Link>
                        <button className="navbar-col-header-btn col-nav-link" aria-label="Close Sidebar" onClick={toggleNavbar}>
                            <span className="material-symbols-rounded navbar-btn-icon">dock_to_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* mini navbar */}
            <div className="mini-navbar" inert={navbarOpen ? true : false}>
                <div className="mini-navbar-btns">
                    <button className="navbar-col-header-btn col-nav-link" aria-label="Open Sidebar" onClick={toggleNavbar}>
                        <span className="material-symbols-rounded navbar-btn-icon">dock_to_right</span>
                    </button>
                    <Link to="/" className="navbar-col-header-btn col-nav-link" aria-label="New Chat">
                        <span className="material-symbols-rounded navbar-btn-icon">add_2</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;