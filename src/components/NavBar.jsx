import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import "../nav.css";
import { Toaster, toast } from 'react-hot-toast';
import Cookies from 'universal-cookie';

export function NavBar() {
	const { url } = useLocation();
	const location = useLocation();

	const [navVisible, setNavVisible] = useState(true);
	const [chats, setChats] = useState([]);
	
	const cookies = new Cookies(null, { path: "/" });
	const authToken = cookies.get("gronk_tk");
	const instanceUrl = cookies.get("gronk_instance_url");
	
	const isLoggedIn = !!authToken;

	async function getConversations() {
		await fetch(instanceUrl + "/conversations", {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + authToken,
				"Content-Type": "application/json"
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("Failed to fetch conversations");
			}
			return response.json();
		})
		.then(data => {
			setChats(data.conversations);
		})
	}

	useEffect(() => {
		if(isLoggedIn) {
			// get chats
			getConversations();
		}
	}, [url]);

	async function deleteChatById(chatid) {
		await fetch(instanceUrl + "/conversations/" + chatid, {
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + authToken,
				"Content-Type": "application/json"
			}
		})
		.then(response => {
			if (!response.ok) {
				toast.error("Failed to delete conversation");
				throw new Error("Failed to delete conversation");
			}
			return response.json();
		})
		.then(async () => {
			getConversations();
		})
		.catch(error => {
			console.error("Error deleting chat:", error);
		});
	}

	function newChat() {
		location.route("/");
	}
	
	return (
		<div className="nav-container">
			{ /* TODO: should focus on message bar first */ }

			<div className="secondary-nav-outer-top">
				{ /* replaces hidden navbar */ }
				<div className={"nav-outer-top-in-nav" + (!navVisible ? "" : " d-none")}>
					<button title="Toggle Sidebar" aria-label="Toggle Sidebar" className="nav-button" onClick={() => setNavVisible(!navVisible)}>
						<span className="material-symbols-rounded nav-icon">thumbnail_bar</span>
					</button>
				</div>
			</div>

			<div className="nav-outer" data-nav-hidden={!navVisible}>
				<nav>
					<div className="nav-top-flex">
						<img src="/gronk.svg" alt="" className="nav-logo" />
						<div className="nav-icons-flex">
							{isLoggedIn ? (
								<button title="New Chat" aria-label="New Chat" className="nav-button nav-open-nav-button" onClick={newChat}>
									<span className="material-symbols-rounded nav-icon">add</span>
								</button>
							) : null}
							
							<button title="Toggle Sidebar" aria-label="Toggle Sidebar" className="nav-button nav-open-nav-button" onClick={() => setNavVisible(!navVisible)}>
								<span className="material-symbols-rounded nav-icon">thumbnail_bar</span>
							</button>
						</div>
					</div>

					{/* chats */}

					{
						isLoggedIn ? (
							<div className="nav-chats-list">
								<div className="nav-chats-list-top">
									<form className="nav-chats-list-search-flex">
										<input type="text" className="nav-chats-list-search-input-text" placeholder="Search" />

										<button type="submit" className="btn btn-primary h-100 nav-chats-list-search-submit square" onClick={() => {alert("// TODO: search bar functionality")}}>
											<span class="material-symbols-rounded">
												search
											</span>
										</button>
									</form>
								</div>

								{/* TODO: skeleton loader for chats */}

								<div className="nav-chats-list-items">
									{ chats.length > 0 ? ( <p className="m-0 p-0 nav-chats-list-items-caption">Your Chats</p> ) : null }

									{ chats.length > 0 ? (
										chats.map(chat => (
											<a href={`/chat/${chat.uuid}`} className={"nav-chat-item " + (url.endsWith("/chat/" + chat.uuid) ? "nav-chat-item-focused" : "")} key={chat.id}>
												<div className="nav-chat-item-title-container">
													<p className="m-0 p-0 nav-chat-item-button-title">
														{chat.title || chat.uuid}
													</p>
												</div>

												<div className={"nav-chat-item-buttons" + (url.endsWith("/chat/" + chat.uuid) ? "" : "-d-hover")}>
													<button className="nav-chat-item-button-icon-btn" title="Delete" aria-label={'Delete "' + chat.title + '"'} onClick={() => {toast.promise(deleteChatById(chat.uuid), { loading: 'Deleting chat...', success: '"' + chat.title + '" deleted successfully!', error: 'Failed to delete chat' });}}>
														<span className="material-symbols-rounded nav-chat-item-button-icon">
															close
														</span>
													</button>
													{ /* TODO: delete, rename */ }
												</div>
											</a>
										))
									) : null}
								</div>
							</div>
						) : null
					}
				</nav>
			</div>

			<Toaster
				position="top-center"
				reverseOrder={false}
			/>
		</div>
	);
}
