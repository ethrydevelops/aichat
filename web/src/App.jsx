import { useState } from 'react';
import { useNavigate } from 'react-router';

import ModelSelectDialog from './components/ModelSelector';
import Cookies from 'universal-cookie'

import Greeting from './components/Greeting';

function App() {
    const cookies = new Cookies();

    const navigate = useNavigate();

    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState(() => {
        try {
            const stored = cookies.get("askllm_favourite_model"); 

            if (stored) {
                return typeof stored === "object" ? stored : JSON.parse(stored);
            }
        } catch (e) {
            console.error("Invalid JSON in cookie:", e);
        }

        return { name: "Select a model", uuid: 0 };
    });

    const [modelSelectorDialogOpen, setModelSelectorDialogOpen] = useState(false);

    function handleSendMessage(ev) {
        ev.preventDefault();

        if(prompt.trim() === "") return;

        let promptToSend = prompt.trim();
        setPrompt("");

        fetch(import.meta.env.VITE_API_URL + "conversations/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("askllm_tk")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.conversation && data.conversation.uuid) {
                fetch(import.meta.env.VITE_API_URL + "conversations/" + data.conversation.uuid + "/messages/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cookies.get("askllm_tk")}`
                    },
                    body: JSON.stringify({
                        content: promptToSend,
                        model_uuid: model.uuid
                    })
                })
                .then(() => {
                    navigate("/c/" + data.conversation.uuid);
                })
                .catch(err => {
                    console.error("Error sending message:", err);
                    alert("There was an error sending the message."); // TODO: use toasts
                });
            } else {
                alert("Error creating conversation");
            }
        })
        .catch(err => {
            console.error("Error creating conversation:", err);
            alert("There was an error creating the conversation."); // TODO: use toasts
        });
    }

    function modelPopup(ev) {
        ev.preventDefault();
        setModelSelectorDialogOpen(!modelSelectorDialogOpen);
    }

    return (
        <div className="d-flex-middle">
            <div>
                <h1 className="landing-page-title"><Greeting /></h1>
                <form action="/">
                    <div className="landing-page-prompt-box-outer"> {/* TODO: expand after typed in*/}
                        <textarea name="prompt" id="prompt" placeholder="Ask anything" className="landing-page-prompt-box" rows={1} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {handleSendMessage(e);}}}></textarea>
                        <button type="submit" className="landing-page-prompt-box-btn-ol" onClick={handleSendMessage} aria-label="Send Message">
                            <span className="material-symbols-rounded">arrow_forward</span>
                        </button>
                    </div>
                    <div className="landing-page-prompt-under-box">
                        <div>
                            <button className="landing-page-prompt-model-select-btn" onClick={modelPopup}>
                                <span className="landing-page-prompt-model-select-btn-selected-name">
                                    {model.name}
                                </span>
                                <span className="material-symbols-rounded">expand_more</span>
                            </button>
                            <div className="landing-page-model-select-container">
                                <ModelSelectDialog modelSelectorDialogOpen={modelSelectorDialogOpen} activeModel={model} onModelChange={async (newModel) => {
                                    if(!newModel) return setModelSelectorDialogOpen(false);
                                    setModel(newModel);

                                    cookies.set("askllm_favourite_model", JSON.stringify({ name: newModel.name, uuid: newModel.uuid }), { path: '/' });
                                    setModelSelectorDialogOpen(false);
                                }} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default App
