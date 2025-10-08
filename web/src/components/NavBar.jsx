import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useLocation, Link } from 'react-router';

import './NavBar.css';

function NavBar() {
    const location = useLocation();
    const cookies = new Cookies();

    const [conversations, setConversations] = useState([]);

    var showBigNavbar = true;

    const [navbarOpen, setNavbarOpen] = useState(() => {
        if((window.innerWidth < 600)) return false; // closed by default on mobile
        return cookies.get("nav-status-open") !== "closed";
    });

    function mobileNavbarClose() {
        if(window.innerWidth < 600) {
            setNavbarOpen(false);
        }
    }

    function toggleNavbar() {
        if(!showBigNavbar) return setNavbarOpen(false);
        
        setNavbarOpen(!navbarOpen);
    }

    useEffect(() => {
        if(!showBigNavbar) setNavbarOpen(false);
    }, [showBigNavbar]);

    useEffect(() => {
        if(cookies.get("nav-status-open") !== (navbarOpen ? "open" : "closed")) {
            cookies.set("nav-status-open", navbarOpen ? "open" : "closed", { path: '/' });
        }
    }, [navbarOpen]);

    useEffect(() => {
        if(!cookies.get("askllm_tk")) {
            setConversations([]);
            return;
        }
        
        fetch(import.meta.env.VITE_API_URL + "conversations/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + cookies.get("askllm_tk")
            }
        }).then(res => res.json()).then(data => {
            if(data.conversations && data.conversations.length > 0) {
                let conversationsResp = data.conversations;

                // newest -> oldest
                conversationsResp.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

                setConversations(conversationsResp);
            } else {
                setConversations([]);
            }
        }).catch(err => {
            console.error("Error fetching conversations:", err);
        });
    }, [location]);

    // dont show full navbar on these paths:
    const navExcludedPaths = ["/login", "/signup"];
    if (navExcludedPaths.includes(location.pathname.toLowerCase())) {
        showBigNavbar = false;
        if(navbarOpen) setNavbarOpen(false);
    }

    return (
        <nav>
            {/* big navbar */}
            <div className={"navbar-col" + (navbarOpen ? " navbar-open" : "")} inert={navbarOpen ? false : true} onDragStart={(e) => e.preventDefault()}>
                <div className="navbar-col-header">
                    <Link to="/" className="navbar-logo-link" tabIndex={-1} onDragStart={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()} onClick={mobileNavbarClose}>
                        <img src="/logo.svg" className="navbar-logo" />
                    </Link>
                    <div className="navbar-col-header-btns">
                        <Link to="/" className="navbar-col-header-btn col-nav-link" aria-label="New Chat" onClick={mobileNavbarClose}>
                            <span className="material-symbols-rounded navbar-btn-icon">add_2</span>
                        </Link>
                        <button className="navbar-col-header-btn col-nav-link" aria-label="Close Sidebar" onClick={toggleNavbar}>
                            <span className="material-symbols-rounded navbar-btn-icon">dock_to_right</span>
                        </button>
                    </div>
                </div>

                <div className="chats-list">
                    <div className="chats-list-inner">
                        {conversations.length === 0 ? (
                            <div>
                                {/*<p className="m-0 p-0">No conversations found</p>*/}
                            </div>
                        ) : (conversations.map((chat) => (
                            <Link to={`/c/${chat.uuid}`} key={chat.uuid} className="nav-conversation-box" data-chat-active={location.pathname === `/c/${chat.uuid}` ? "true" : "false"} onClick={mobileNavbarClose} aria-label={"Chat " + chat.title} onDragStart={(e) => e.preventDefault()}>
                                <span>
                                    {chat.title}
                                </span>
                                <div className="nav-conversation-box-opts">
                                    <button className="nav-conversation-box-opt-btn material-symbols-rounded" aria-label={"Delete chat \"" + chat.title + "\""} onClick={() => alert("// TODO: chat delete")} onDragStart={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
                                        close
                                    </button>
                                </div>
                            </Link>
                        )))}
                    </div>
                </div>
            </div>

            {/* mini navbar */}
            <div className="mini-navbar" inert={navbarOpen ? true : false} onDragStart={(e) => e.preventDefault()}>
                <div className="mini-navbar-btns">
                    { showBigNavbar ? (
                        <button className="navbar-col-header-btn col-nav-link" aria-label="Open Sidebar" onClick={toggleNavbar}>
                            <span className="material-symbols-rounded navbar-btn-icon">dock_to_right</span>
                        </button>
                    ) : (
                        <Link to="/" className="navbar-col-header-btn col-nav-link" aria-label="New Chat">
                            <span className="material-symbols-rounded navbar-btn-icon">home</span>
                        </Link>
                    ) }
                    <Link to="/" className="navbar-col-header-btn col-nav-link" aria-label="New Chat">
                        <span className="material-symbols-rounded navbar-btn-icon">add_2</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;