import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Cookies from "universal-cookie";
import Greeting from "./components/Greeting";
import socket from "./components/Socket"; 
import Message from "./components/Message";

import "./Conversation.css";

function Conversation() {
    const cookies = new Cookies();
    const [nextPrompt, setNextPrompt] = useState("");

    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);

    const { id: chatId } = useParams();

    useEffect(() => {
        setMessagesLoading(true);

        fetch(import.meta.env.VITE_API_URL + "conversations/" + chatId + "/messages", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("askllm_tk")}`
            }
        }).then(res => res.json()).then(data => {
            if (data.messages) {
                setMessages(formatMessages(data.messages));
                setMessagesLoading(false);
            }
        });

        socket.emit("subscribeChat", "conv_" + chatId);

        socket.on("chat_message", (message) => {
            if (message.conversation === chatId) {
                setMessages(prevMessages => formatMessages([...prevMessages, {
                    uuid: message.id,
                    content: message.content || "",
                    reasoning: message.reasoning || "",
                    role: message.role,
                    status: message.status,
                    error_message: message.error_message || ""
                }]));
            }
        });

        socket.on("chat_message_update", (messageUpdate) => {
            if (messageUpdate.conversation === chatId) {
                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(msg => 
                        msg.uuid === messageUpdate.message.id ? {
                            ...msg,
                            reasoning: messageUpdate.message.reasoning || msg.reasoning || "",
                            content: messageUpdate.message.content || msg.content + messageUpdate.message.delta,
                            status: messageUpdate.status,
                            error_message: messageUpdate.message.error_message || msg.error_message || ""
                        } : msg
                    );

                    return formatMessages(updatedMessages);
                });
            }
        });

        return () => {
            socket.emit("unsubscribeChat", "conv_" + chatId);
            socket.off("chat_message");
            socket.off("chat_message_update");
        };

    }, [chatId]);

    function formatMessages(inputMsgs) {
        let tempMsgs = inputMsgs;

        return tempMsgs;
    }

    return (
        <div className="conversation-container">
            <div className="conversation-container-content">
                <div className="conversation-messages">
                    <div></div>
                    <div className="conversation-messages-inner">
                        {messages.length === 0 && !messagesLoading && (
                            <div className="conversation-no-messages-placeholder">
                                <h1><Greeting /></h1>
                                <p className="conversation-no-messages-placeholder-subhead">Start the conversation by typing below.</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <Message key={msg.uuid} msg={msg} />
                        ))}
                    </div>
                    <div></div>
                </div>
            </div>
            <form
                onSubmit={(ev) => {
                    ev.preventDefault();
                    // TODO: handle sending message
                    alert("Send message: " + ev.target.elements.prompt.value);
                    ev.target.elements.prompt.value = "";
                }}
                className="conversation-input"
            >
                <textarea name="prompt" id="prompt" placeholder="Ask anything" className="in-conversation-prompt-box" value={nextPrompt} onChange={(e) => setNextPrompt(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {handleSendMessage(e);}}}></textarea>

                <div className="under-input-options">
                    abc
                </div>
            </form>
        </div>
    )
}

export default Conversation;
