import { useEffect } from 'react';
import { useState } from 'react'
import Cookies from 'universal-cookie'

function App() {
    const cookies = new Cookies();

    const [prompt, setPrompt] = useState("");
    const [username, setUsername] = useState(cookies.get('askllm_usernameoverride') || "");

    useEffect(() => {
        // get username from account if logged in
        if(cookies.get("askllm_tk")) {
            fetch((import.meta.env.VITE_API_URL.replace(/\/$/, "")) + "/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${cookies.get("askllm_tk")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.user.username && !cookies.get('askllm_usernameoverride')) {
                    setUsername(data.user.username);
                }
            });
        }
    }, [cookies]);

    return (
        <div className="d-flex-middle">
            <div>
                <h1 className="landing-page-title">How can I help you{username ? (", " + username) : ""}?</h1>
                <form action="/" className="landing-page-prompt-box-outer">
                    <textarea name="prompt" id="prompt" placeholder="Ask anything" className="landing-page-prompt-box" rows={1} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                    <button type="submit" className="landing-page-prompt-box-btn-ol">
                        <span className="material-symbols-rounded">arrow_forward</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default App
