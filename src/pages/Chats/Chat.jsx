import { useLocation } from 'preact-iso';
import { useEffect, useState, useMemo } from 'preact/hooks';
import toast from 'react-hot-toast';
import Cookies from 'universal-cookie';
import { Message } from '../../components/ChatPage/Message';

export function Chat({ id }) {
	const [models, setModels] = useState([]);
	const [selectedModel, setSelectedModel] = useState(null);
	const [submitDisabled, setSubmitDisabled] = useState(false);
	const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
	const [chatMessages, setChatMessages] = useState([]);

	const { url } = useLocation();

	const cookies = new Cookies(null, { path: "/" });
	const instanceUrl = cookies.get("gronk_instance_url");
	const authToken = cookies.get("gronk_tk");

	function scrollBottom(elm) {
		elm.scrollTo({
			top: elm.scrollHeight,
			behavior: 'smooth'
		});
	}

	function autoResize(e) {
		e.target.style.height = 'auto';
		const newHeight = Math.min(e.target.scrollHeight, 200);
		e.target.style.height = newHeight + 'px';
	}

	async function fetchModels() {
		await fetch(instanceUrl + "/models/", {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + authToken,
				'Content-Type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(data => {
			setModels(data.models);

			if (data.last_used_model != null) {
				setSelectedModel(data.last_used_model);
			}
		})
		.catch(error => console.error('Error fetching models:', error));
	}

	async function refreshMessages() {
		await fetch(instanceUrl + "/conversations/" + id + "/messages/", {
			method: "GET",
			headers: {
				'Authorization': 'Bearer ' + authToken,
				'Content-Type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				toast.error(data.error);
				return;
			}
			
			// sort:
			const messages = data.messages;
			messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

			setChatMessages(messages);
		})
		.catch(error => {
			console.error('Error fetching messages:', error)
			toast.error('Failed to fetch messages.');
		});
	}

	function sendMessage(e) {
		e.preventDefault();

		const formData = new FormData(e.target);
		const content = formData.get("content").toString().trim();
		const model = selectedModel?.uuid;

		if (!content || content.length === 0) {
			toast.error("Message cannot be empty.");
			return;
		}

		if (!model) {
			toast.error("Please select a model before sending a message.");
			return;
		}

		setSubmitDisabled(true);

		const messageData = {
			content: content,
			model: model
		};

		// add new message to chatMessages
		setChatMessages(prev => [...prev, { chat_uuid: id, created_at: new Date().toISOString(), completed: null, updated_at: new Date().toISOString(), role: "user", content: content }]);

		setChatMessages(prev => [...prev, { chat_uuid: id, created_at: new Date().toISOString(), completed: null, updated_at: new Date().toISOString(), role: "assistant", content: "" }]);

		fetch(instanceUrl + "/conversations/" + id + "/messages/", {
			method: "POST",
			headers: {
				'Authorization': 'Bearer ' + authToken,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(messageData)
		})
		.then(response => {
			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let fullMessage = "";
		
			function readChunk() {
				// TODO: this should be replaced with socket.io to sync properly between clients later
				return reader.read().then(({ done, value }) => {
					if (done) {
						setSubmitDisabled(false);
						return;
					}
				
					const chunkText = decoder.decode(value, { stream: true });
					
					const lines = chunkText.split('\n');
					for (const line of lines) {
						if (line.startsWith('data: ')) {
							try {
								const data = JSON.parse(line.slice(6));
								if (data.type === 'chunk' && data.content) {
									fullMessage += data.content;
								}
							} catch (e) {
								continue;
							}
						}
					}
				
					let updatedMessages = [...chatMessages];
					if (updatedMessages.length > 0) {
						updatedMessages[updatedMessages.length - 1] = {
							...updatedMessages[updatedMessages.length - 1],
							content: fullMessage
						};
						setChatMessages(updatedMessages);
					}
				
					scrollBottom(document.querySelector(".chat-area-messages"));
				
					return readChunk();
				});
			}
		
			return readChunk();
		})
		.catch(error => {
			toast.error("Failed to send message");
			console.error(error);
			setSubmitDisabled(false);
		});
		

	}

	useEffect(() => {
		setChatMessages([]);
		fetchModels();
		
		refreshMessages().then(() => {
			scrollBottom(document.querySelector(".chat-area-messages"));
		});
	}, [url]);

	async function openModelList(e) {
		e.preventDefault();

		if(!modelSelectorOpen) {
			fetchModels();
		}

		setModelSelectorOpen(!modelSelectorOpen);
	}
	
	return (
		<div class="chat-page page-container h-100 m-0 p-0">
			<div className="chat-area-messages">
				{chatMessages.map((msg) => (
					<Message msg={msg}></Message>
				))}

				{/* TODO: scroll down button */}
			</div>
			<div className="chat-area-input-container">
				<div className="chat-area-input-container-inner-part">
					<form action="/" className="chatpage-input-text-flex" onSubmit={sendMessage}>
						<div className="homepage-input-textarea-outer">
							<textarea name="content" rows={1} placeholder={"Talk to " + (selectedModel?.name ? selectedModel?.name : "AI")} onInput={autoResize} className="homepage-input-textarea" autoFocus={true}></textarea>
						</div>

						<button type="submit" className="btn btn-primary h-100 square homepage-input-submit" title="Send Message" aria-label="Send Message" {...(selectedModel == null || submitDisabled) ? { disabled: true } : {} }>
							<span className="material-symbols-rounded">arrow_right_alt</span>
						</button>
					</form>

					<div className="homepage-chat-input-under">
						<a href="javascript:void(0)" onClick={openModelList} className="model-selector-button">
							{ selectedModel != null ? selectedModel.name : <u>Select a model!</u> }
							<span className="material-symbols-rounded">keyboard_arrow_down</span>
						</a>

						<div className={"model-selector-list " + (modelSelectorOpen ? "model-selector-list-open" : "")}>
							<h2 className="m-0 p-0">Models</h2>

							<div className="model-selector-list-grid us-none">
								{models.length > 0 ? models.map((model) => (
									<a href="javascript:void(0)" key={model.uuid} className={"model-selector-grid-item " + (selectedModel?.uuid === model.uuid ? "model-selector-item-selected" : "")} onClick={() => {setSelectedModel(model); setModelSelectorOpen(false);}} onDragStart={(e) => e.preventDefault()}>
										<span class="material-symbols-rounded">smart_toy</span>
										{model.name}
									</a>
								)) : (
									null
								)}

								<a href="/settings/models" className="model-selector-grid-item" onDragStart={(e) => e.preventDefault()}>
									<span class="material-symbols-rounded">tune</span>
									Configure Models
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}