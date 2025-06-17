import { useEffect, useState } from "preact/hooks";
import io from '../Socket';

export function Message({ msg, onMessageUpdate }) {
    const [thinkingBlockOpen, setThinkingBlockOpen] = useState(false);
    const [messageContent, setMessageContent] = useState(msg.content);

    function openThinkingBlock(e) {
        e.preventDefault();
        
        const block = e.target.closest('.chat-message-model-thinking-placeholder');
        if (block) {
            block.querySelector('.chat-message-model-thought-block').classList.toggle('d-none');
        }

        setThinkingBlockOpen(!thinkingBlockOpen);
        e.target.blur();
    }

    function getThoughts(text) {
		const closedMatches = text.match(/<think>(.*?)<\/think>/gs);
		const unclosedMatch = text.match(/<think>(?!.*<\/think>)(.*)/s);
		
		const blocks = [];

		if (closedMatches && closedMatches.length > 0) {
			blocks.push(...closedMatches.map(match => 
				match.replace(/<\/?think>/g, '').trim()
			));
		}
		
		if (unclosedMatch) {
			blocks.push(unclosedMatch[1].trim());
		}
		
		return blocks.length > 0 ? blocks.join('\n--\n') : null;
	}

	function removeAllThinking(text) {
		return text
			.replace(/<think>.*?<\/think>/gs, '')
			.replace(/<think>.*$/s, '')
			.trim();
	}	

    function openThinkingBlock(e) {
        e.preventDefault();
        
        const block = e.target.closest('.chat-message-model-thinking-placeholder');
        if (block) {
            block.querySelector('.chat-message-model-thought-block').classList.toggle('d-none');
        }

        setThinkingBlockOpen(!thinkingBlockOpen);

        e.target.blur();
    }

    useEffect(() => {
        if (!io) return;

        const handleMessageUpdate = (data) => {
            if (msg.uuid === data.uuid) {
                setMessageContent(data.content);
                
                if (onMessageUpdate) {
                    onMessageUpdate(data);
                }
            }
        };

        io.on("message_updated", handleMessageUpdate);

        return () => {
            io.off("message_updated", handleMessageUpdate);
        };
    }, [msg.uuid]);

    return (
        <div key={msg.uuid} className={"chat-message " + (msg.role === "assistant" ? "chat-message-model" : "chat-message-user")}>
            <div className="chat-message-content">
                {msg.role === "assistant" ? (
                    <>
                        {(getThoughts(messageContent) == null || getThoughts(messageContent).trim() == "") ? (
                            <span className="chat-message-model-text">{removeAllThinking(messageContent)}</span>
                        ) : (
                            <span className="chat-message-model-text">
                                <div className="chat-message-model-thinking-placeholder">
                                    <button className="chat-message-model-thinking-placeholder-box" onClick={openThinkingBlock}>
                                        <span class="material-symbols-rounded chat-message-model-thinking-placeholder-box-icon">neurology</span>
                                        <span>{messageContent.includes('</think>') ? "Thought for a few seconds" : "Thinking..."}</span>
                                        <span class={"material-symbols-rounded chat-message-model-thinking-placeholder-box-icon chat-message-model-thinking-placeholder-box-opener-floating " + (thinkingBlockOpen ? "icon-spin-once" : "")}>keyboard_arrow_down</span>
                                    </button>
                                    <div className="chat-message-model-thought-block d-none">
                                        {getThoughts(messageContent)}
                                    </div>
                                </div>
                                <div className="chat-message-message-text-output">
                                    {removeAllThinking(messageContent)}
                                </div>
                            </span>
                        )}
                    </>
                ) : (
                    messageContent
                )}
            </div>
        </div>
    );
}