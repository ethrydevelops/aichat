import TypingAnimation from "./TypingAnimation";

function Message({msg}) {
    return (
        <div key={msg.uuid} className={"conversation-message-box " + (msg.role === "user" ? "user-message" : "assistant-message")}>
            {
                msg.role === "user" ? (
                    <div className="conversation-message-user-container">
                        <div className="conversation-message-user">
                            {msg.content}
                        </div>
                    </div>
                ) : (
                    msg.role === "assistant" && (
                        msg.status == "generating" && msg.content == "" ? (
                            <TypingAnimation />
                        ) : (
                            <div className="conversation-message-assistant">
                                {msg.content.trim().startsWith("<think>") ? (
                                    <>
                                        {/<think>.*?<\/think>/s.test(msg.content) && (
                                            <div className="assistant-think-box">
                                                <strong>Thinking...</strong>
                                                {/* TODO: style */}
                                            </div>
                                        )}

                                        {msg.content.replace(/<think>.*?<\/think>/s, "") ? (
                                            <div>
                                                <div>
                                                    {msg.content.replace(/<think>.*?<\/think>/s, "").trim()}
                                                </div>
                                            </div>
                                        ) : null}
                                    </>

                                ) : (
                                    <div>
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        )
                    )
                )
            }
        </div>
    )
}

export default Message;