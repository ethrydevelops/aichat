import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import './mobile.css';
import "@fontsource-variable/inter";

import '@material-symbols/font-700';

import App from './App.jsx'
import AuthPage from './AuthPage.jsx';
import NavBar from './components/NavBar.jsx';

if(!import.meta.env.VITE_API_URL) {
    createRoot(document.getElementById('root')).render(
        <div style={{ padding: "2em" }}>
            <p>Your instance has been configured incorrectly:</p>
            <ul>
                <li>Set <code>VITE_API_URL</code> in your /web/.env file and try again</li>
            </ul>
        </div>
    );

    throw new Error("VITE_API_URL is not set. Please set it in your .env file.");
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <div className="app-container">
            <NavBar />
            <main className="app-screen">
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/signup" element={<AuthPage authType="signup" />} />
                    <Route path="/login" element={<AuthPage authType="login" />} />
                </Routes>
            </main>
        </div>
    </BrowserRouter>
);
