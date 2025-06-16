import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import toast from 'react-hot-toast';
import Cookies from 'universal-cookie';

function generateGronk() {
	const gronks = ["Feelin' gronky today?", "Let's get gronkin'!", "Get your gronk on!", "A gronk a day keeps the doctor away"]; // hopefully theo will appreciate my ideas
	return gronks[Math.floor(Math.random() * gronks.length)];
}

export function Home() {
	const [models, setModels] = useState([]);
	const [selectedModel, setSelectedModel] = useState(null);
	const [submitDisabled, setSubmitDisabled] = useState(false);

	const cookies = new Cookies(null, { path: "/" });
	const instanceUrl = cookies.get("gronk_instance_url");
	const authToken = cookies.get("gronk_tk");

	const location = useLocation();

	const theGronk = generateGronk();

	function createChatSend(e) {
		e.preventDefault();

		setSubmitDisabled(true);

		const formData = new FormData(e.target);
		const content = formData.get("content").toString().trim();
		if (content === "") {
			toast.error("Message content cannot be empty.");
			return;
		}

		const model = selectedModel != null ? selectedModel.uuid : null;
		if (model == null) {
			toast.error("Please select a model before sending a message.");
			return;
		}

		const toSendMsgData = {
			content: content,
			model: model
		};

		fetch(instanceUrl + "/conversations/", {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + authToken,
				'Content-Type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(async (data) => {
			if (data.error) {
				toast.error(data.error);
				setSubmitDisabled(false);
				return;
			}

			fetch(instanceUrl + "/conversations/" + data.uuid + "/messages/", {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + authToken,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(toSendMsgData)
			});
				
			location.route("/chat/" + data.uuid);
		});
	}

	function autoResize(e) {
		e.target.style.height = 'auto';
		const newHeight = Math.min(e.target.scrollHeight, 200);
		e.target.style.height = newHeight + 'px';
	}

	useEffect(() => {
		fetch(instanceUrl + "/models/", {
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
	}, []);

	function openModelList(e) {

	}
	
	return (
		<div class="home page-container h-100 m-0 p-0">
			<div className="homepage-chat-container">
				<div className="homepage-chat-inner">
					<img src="/gronk.svg" alt="Gronk logo" className="homepage-logo" />

					<form action="/" className="homepage-input-text-flex" onSubmit={createChatSend}>
						<div className="homepage-input-textarea-outer">
							<textarea name="content" rows={1} placeholder={theGronk} onInput={autoResize} className="homepage-input-textarea" autoFocus={true}></textarea>
						</div>

						<button type="submit" className="btn btn-primary h-100 square homepage-input-submit" title="Send Message" aria-label="Send Message" {...(selectedModel == null || submitDisabled) ? { disabled: true } : {} }>
							<span className="material-symbols-rounded">arrow_right_alt</span>
						</button>
					</form>

					<div className="homepage-chat-input-under">
						<a href="#" onClick={openModelList} className="model-selector-button">
							{ selectedModel != null ? selectedModel.name : <u>Select your first model!</u> }
							<span className="material-symbols-rounded">keyboard_arrow_down</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
