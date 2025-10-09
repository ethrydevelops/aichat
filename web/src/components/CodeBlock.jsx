import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CodeBlock = ({ children: code, plain, language }) => {
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trimEnd());

        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <div className="markdown-message-code-block-container" data-code-block-small={!code.trim()?.includes("\n")}>
            {!code.trim()?.includes("\n") ? null : (
                <button className="markdown-message-copy-button" onClick={handleCopy} data-code-block-small={!code.trim()?.includes("\n")}>
                    {copiedCode ? (
                        <>
                            <span className="material-symbols-rounded markdown-message-copy-button-icon">
                                check
                            </span>
                            <span className="markdown-message-copy-button-label">
                                Copied!
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-rounded markdown-message-copy-button-icon">
                                content_copy
                            </span>
                            <span className="markdown-message-copy-button-label">Copy code</span>
                        </>
                    )}
                </button>
            )}

            { !plain ? (
                <SyntaxHighlighter
                    language={language}
                    style={atomOneLight}
                    PreTag="div"
                    className="markdown-message-code-block"
                >
                    {code.trim() ? code.trim() : ""}
                </SyntaxHighlighter>
            ) : (
                <pre className="markdown-message-code-block">
                    <code className="plain-code-inner">
                        {code.trim() ? code.trim() : ""}
                    </code>
                </pre>
            )}
        </div>
    );
};

export default CodeBlock;