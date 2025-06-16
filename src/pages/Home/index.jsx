function generateGronk() {
	const gronks = ["Feelin' gronky today?", "Let's get gronkin'!", "Get your gronk on!", "A gronk a day keeps the doctor away"]; // hopefully theo will appreciate my ideas
	return gronks[Math.floor(Math.random() * gronks.length)];
}

export function Home() {
	const theGronk = generateGronk();

	function createChatSend(e) {
		e.preventDefault();
		// ...
	}

    function autoResize(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

	return (
		<div class="home page-container h-100 m-0 p-0">
			<div className="homepage-chat-container">
				<div className="homepage-chat-inner">
					<img src="/gronk.svg" alt="Gronk logo" className="homepage-logo" />

					<form action="/" className="homepage-input-text-flex" onSubmit={createChatSend}>
						<div className="homepage-input-textarea-outer">
							<textarea name="content" rows={1} placeholder={generateGronk()} onInput={autoResize} className="homepage-input-textarea" autoFocus={true}></textarea>
						</div>

						<button type="submit" className="btn btn-primary h-100 square homepage-input-submit" title="Send Message" aria-label="Send Message">
							<span className="material-symbols-rounded">arrow_right_alt</span>
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
