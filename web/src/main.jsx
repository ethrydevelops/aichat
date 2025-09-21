import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';

import '@material-symbols/font-700';

import App from './App.jsx'
import AuthPage from './AuthPage.jsx';
import NavBar from './components/NavBar.jsx';

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
)
