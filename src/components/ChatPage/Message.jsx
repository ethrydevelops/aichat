import { useState } from "preact/hooks";

export function Message({ msg }) {
    const [thinkingBlockOpen, setThinkingBlockOpen] = useState(false);

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
    
    return (
        <div key={msg.uuid} className={"chat-message " + (msg.role === "assistant" ? "chat-message-model" : "chat-message-user")}>
            <div className="chat-message-content">
                {msg.role === "assistant" ? (
                    <>
                        {(getThoughts(msg.content) == null || getThoughts(msg.content).trim() == "") ? (
                            <span className="chat-message-model-text">{removeAllThinking(msg.content)}</span>
                        ) : (
                            <span className="chat-message-model-text">
                                <div className="chat-message-model-thinking-placeholder">
                                    <button className="chat-message-model-thinking-placeholder-box" onClick={openThinkingBlock}>
                                        <span class="material-symbols-rounded chat-message-model-thinking-placeholder-box-icon">neurology</span>
                                        <span>Thinking...{/* TODO: get time spent */} </span>

                                        <span class={"material-symbols-rounded chat-message-model-thinking-placeholder-box-icon chat-message-model-thinking-placeholder-box-opener-floating " + (thinkingBlockOpen ? "icon-spin-once" : "")}>keyboard_arrow_down</span>
                                    </button>
                                    <div className="chat-message-model-thought-block d-none">
                                        {getThoughts(msg.content)}
                                    </div>
                                </div>

                                <div className="chat-message-message-text-output">
                                    {removeAllThinking(msg.content)}
                                </div>
                            </span>
                        )}
                    </>
                ) : (
                    msg.content
                )}
            </div>
        </div>
    );
}