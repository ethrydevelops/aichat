import TypingAnimation from "./TypingAnimation";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import CodeBlock from "./CodeBlock";
import { Link } from "react-router";

import "@fontsource/jetbrains-mono";
import "./Message.css";

function Message({msg}) {
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
                                <>
                                    {msg.reasoning ? (
                                        <div className="markdown-message-reasoning">
                                            <b>Reasoning:</b>
                                            <Markdown {...highlightProps}>
                                                {msg.reasoning.trim()}
                                            </Markdown>
                                        </div>
                                    ) : null}

                                    {msg.content.replace(/<think>.*?<\/think>/s, "") ? (
                                        <div className="markdown-message-content">
                                            <Markdown {...highlightProps}>
                                                {msg.content.trim()}
                                            </Markdown>
                                        </div>
                                    ) : null}
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