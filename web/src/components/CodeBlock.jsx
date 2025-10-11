import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CodeBlock = ({ children, plain, language } = {}) => {
    const code = typeof children === "string" ? children.trim() : "";
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const isSingleLine = !code.includes("\n");

    return (
        <div className="markdown-message-code-block-container" data-code-block-small={isSingleLine}>
            {!isSingleLine && (
                <button className="markdown-message-copy-button" onClick={handleCopy} data-code-block-small={isSingleLine}>
                    {copiedCode ? (
                        <>
                            <span className="material-symbols-rounded markdown-message-copy-button-icon">
                                check
                            </span>
                            <span className="markdown-message-copy-button-label">Copied!</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-rounded markdown-message-copy-button-icon">
                                content_copy
                            </span>
                            <span className="markdown-message-copy-button-label">
                                Copy code
                            </span>
                        </>
                    )}
                </button>
            )}

            {!plain ? (
                <SyntaxHighlighter
                    language={language}
                    style={atomOneLight}
                    PreTag="div"
                    className="markdown-message-code-block"
                >
                    {code}
                </SyntaxHighlighter>
            ) : (
                <pre className="markdown-message-code-block">
                    <code className="plain-code-inner">
                        {code}
                    </code>
                </pre>
            )}
        </div>
    );
};

export default CodeBlock;
