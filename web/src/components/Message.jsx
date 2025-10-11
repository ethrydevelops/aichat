import { useState } from "react";
import TypingAnimation from "./TypingAnimation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { Link } from "react-router";

import "@fontsource/jetbrains-mono";
import "./Message.css";

function Message({msg}) {
    const [reasoningBoxOpen, setReasoningBoxOpen] = useState(false);

    const highlightProps = {
        components: {
            code(props) {
                const {children, className, node, ...rest} = props
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                    <CodeBlock language={match[1]} plain={false}>{children}</CodeBlock>
                ) : (
                    <CodeBlock plain={true}>{children}</CodeBlock>
                )
            },
            a(props) {
                return <Link {...props} to={props.href} target="_blank" rel="noreferrer" />
            },
            p(props) {
                const {children} = props;
                return <div style={{marginTop: "0", marginBottom: "0.5em"}}>{children}</div>
            }
        },
        remarkPlugins: [remarkGfm],
    }

    return (
        <div className={"conversation-message-box " + (msg.role === "user" ? "user-message" : "assistant-message")}>
            {
                msg.role === "user" ? (
                    <div className="conversation-message-user-container">
                        <div className="conversation-message-user">
                            {msg.content}
                        </div>
                    </div>
                ) : (
                    msg.role === "assistant" && (
                        msg.status == "generating" && !msg.error_message && (msg.content == "" && msg.reasoning == "") ? (
                            <TypingAnimation />
                        ) : (
                            <div className="conversation-message-assistant">
                                <>
                                    {msg.reasoning && (
                                        <div className="message-reasoning-container">
                                            <div className="message-reasoning-announcement-outer">
                                                <div className="message-reasoning-announcement" onClick={() => setReasoningBoxOpen(!reasoningBoxOpen)}>
                                                    <span className="material-symbols-outlined" aria-hidden="true">
                                                        neurology
                                                    </span>
                                                    {msg.content == "" ? "Reasoning" : "Thought for a few moments"}
                                                </div>
                                                { msg.content != "" && (
                                                    <button onClick={() => setReasoningBoxOpen(!reasoningBoxOpen)} className="message-reasoning-announcement-chevron-btn">
                                                        <span className="material-symbols-rounded message-reasoning-announcement-chevron" data-animation-status={reasoningBoxOpen ? "open" : "closed"}>
                                                            chevron_left
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="markdown-message-reasoning message-reasoning-content" data-reasoning-box-open={reasoningBoxOpen || msg.content == "" ? "true" : "false"}>
                                                <Markdown {...highlightProps}>
                                                    {msg.reasoning?.trim()}
                                                </Markdown>
                                            </div>
                                        </div>
                                    )}

                                    {msg.content != "" && (
                                        <div className="markdown-message-content">
                                            <Markdown {...highlightProps}>
                                                {msg.content?.trim()}
                                            </Markdown>
                                        </div>
                                    )}

                                    {msg.status === "error" && (
                                        <div className="message-error-box">
                                            <div className="alert alert-danger" role="alert">
                                                Error while generating: {msg.message?.error_message || msg.error_message || "Unknown error"}
                                            </div>
                                        </div>
                                    )}
                                </>
                            </div>
                        )
                    )
                )
            }
        </div>
    )
}

export default Message;