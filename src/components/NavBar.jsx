import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import "../nav.css";
import { Toaster, toast } from 'react-hot-toast';
import Cookies from 'universal-cookie';
import io from '../components/Socket';

export function NavBar() {
	const { url } = useLocation();
	const location = useLocation();

	const [navVisible, setNavVisible] = useState(true);
	const [chatsBeingRenamed, setChatsBeingRenamed] = useState([]);
	const [chats, setChats] = useState([]);
	const [avtUuid, setAvtUuid] = useState(null);
	
	const cookies = new Cookies(null, { path: "/" });
	const authToken = cookies.get("gronk_tk");
	const instanceUrl = cookies.get("gronk_instance_url");
	
	const isLoggedIn = !!authToken;

	useEffect(() => {
		getSetAvatarUuid();

		// socket io

        if (!io) return;

        io.on("message_created", getConversations);
        io.on("message_updated", getConversations);
		io.on("nav_chats_updated", getConversations);

        return () => {
            io.off("message_updated", getConversations);
            io.off("message_created", getConversations);
            io.off("nav_chats_updated", getConversations);
        };
    }, []);

	async function getSetAvatarUuid() {
		fetch(instanceUrl + "/accounts/me", {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + authToken,
				"Content-Type": "application/json"
			}
		})
		.then(response => {
			if(!response.ok) throw new Error("Failed to fetch user info")
			return response.json();
		})
		.then((data) => {
			if(data.uuid) {
				setAvtUuid(data.uuid);
			}
		})
		.catch(err => {
			toast.error(err);
		})
	}

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

	function renameChat(id) {
		if(chatsBeingRenamed.includes(id)) return;
		setChatsBeingRenamed([...chatsBeingRenamed, id]);

		setTimeout(() => {
			const txtareaelm = document.querySelector("textarea[data-renaming_chat_title_id=\"" + id + "\"]");

			txtareaelm.focus();
			txtareaelm.setSelectionRange(txtareaelm.value.length, txtareaelm.value.length);
		}, 30);
	}

	async function renameChatUpd(id, text) {
		// remove from chats being renamed
		let chatsBeingRenamedWithoutId = chatsBeingRenamed.filter(item => item !== id);
		setChatsBeingRenamed(chatsBeingRenamedWithoutId);

		await toast.promise(async () => await renameChatUpdRequest(id, text),  { loading: 'Renaming chat...', success: 'Renamed successfully!', error: 'Failed to rename chat ' + id });

		// reload chats
		getConversations();
	}

	async function renameChatUpdRequest(id, text) {
		return await fetch(instanceUrl + "/conversations/" + id + "/rename", {
			method: "POST",
			headers: {
				"Authorization": "Bearer " + authToken,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				title: text
			})
		})
		.then((r) => {
			if (!r.ok) {
				throw new Error(`HTTP error! status: ${r.status}`);
			}
			return r.json();
		})
		.then((data) => {
			return true;
		});
	}

	function newChat() {
		location.route("/");
	}

	function textareaKeyDown(e, elm) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			elm.click();
		}
	}

	function submitSearchForm(e) {
		e.preventDefault();

		alert("// TODO: chat search functionality")
	}
	
	return (
		<div className="nav-container">
			<div className="secondary-nav-outer-top">
				{ /* replaces hidden navbar */ }
				<div className={"nav-outer-top-in-nav" + (!navVisible ? "" : " d-none")}>
					<button title="Toggle Sidebar" aria-label="Toggle Sidebar" className="nav-button" onClick={() => setNavVisible(!navVisible)}>
						<span className="material-symbols-rounded nav-icon">thumbnail_bar</span>
					</button>
				</div>

				<div className={"nav-outer-top-in-nav-placeholder-div" + (!navVisible ? " d-none" : "")}>{/*placeholder*/}</div>

				{/* TODO: settings */}

				<div className="nav-outer-top-in-nav-end">
					<a href="/settings" className="nav-settings-btn">
						<i className="material-symbols-rounded">
							settings
						</i>
					</a>
					<a href="/settings" className="nav-end-avatar-img-outer">
						<img src={instanceUrl + "/accounts/" + avtUuid + "/avatar.png"} alt="" className="nav-end-avatar-img" aria-hidden="true" />
					</a>
				</div>
			</div>

			<div className="nav-outer" data-nav-hidden={!navVisible}>
				<nav>
					<div className="nav-top-flex">
						<img src="/gronk.svg" alt="" className="nav-logo" onClick={() => {location.route("/")}}/>
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
									<form className="nav-chats-list-search-flex" onSubmit={submitSearchForm}>
										<input type="text" className="nav-chats-list-search-input-text" onKeyDown={(e) => textareaKeyDown(e, document.querySelector('#search-navbar-btn'))} placeholder="Search" />

										<button type="submit" className="btn btn-primary h-100 nav-chats-list-search-submit square" id="search-navbar-btn">
											<span class="material-symbols-rounded">
												search
											</span>
										</button>
									</form>
								</div>

								<div className="nav-chats-list-items">
									{ chats.length > 0 ? ( <p className="m-0 p-0 nav-chats-list-items-caption">Your Chats</p> ) : null }

									{ chats.length > 0 ? (
										chats.map(chat => (
											<a href={`/chat/${chat.uuid}`} className={"nav-chat-item " + (url.endsWith("/chat/" + chat.uuid) ? "nav-chat-item-focused" : "")} key={chat.id}>
												<div className="nav-chat-item-title-container">
													{chatsBeingRenamed.includes(chat.uuid) ? (
														<div className="nav-chat-item-title-rename-flex">
															<textarea
																data-renaming_chat_title_id={chat.uuid}
																className="renaming-chat-title-textarea"
																defaultValue={chat.title}
																onKeyDown={(e) => textareaKeyDown(e, e.target.parentNode.children[1])}
															/>

															<button className="nav-chat-item-button-icon-btn" title="Rename" aria-label={'Rename "' + chat.title + '"'} onClick={(e) => {
																const textarea = e.currentTarget.parentNode.querySelector(".renaming-chat-title-textarea");
																renameChatUpd(chat.uuid, textarea.value.toString().trim());
															}}>
																<span className="material-symbols-rounded nav-chat-item-button-icon">
																	save
																</span>
															</button>
														</div>
													) : (
														<p className="m-0 p-0 nav-chat-item-button-title" title={chat.title || chat.uuid} aria-label={chat.title || chat.uuid}>
															{chat.title || chat.uuid}
														</p>
													)}
												</div>

												<div className={"nav-chat-item-buttons" + (url.endsWith("/chat/" + chat.uuid) ? "" : "-d-hover")}>
													{
														chatsBeingRenamed.includes(chat.uuid) ? null : (
															<>
																<button className="nav-chat-item-button-icon-btn" title="Delete" aria-label={'Rename "' + chat.title + '"'} onClick={() => {renameChat(chat.uuid)}}>
																	<span className="material-symbols-rounded nav-chat-item-button-icon">
																		edit
																	</span>
																</button>

																<button className="nav-chat-item-button-icon-btn" title="Delete" aria-label={'Delete "' + chat.title + '"'} onClick={() => {toast.promise(deleteChatById(chat.uuid), { loading: 'Deleting chat...', success: '"' + chat.title + '" deleted successfully!', error: 'Failed to delete chat' });}}>
																	<span className="material-symbols-rounded nav-chat-item-button-icon">
																		close
																	</span>
																</button>
															</>
														)
													}
													
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
