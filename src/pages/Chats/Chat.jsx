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
				<form action="" method="post">
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
				</form>
			</div>
		</div>
	);
}