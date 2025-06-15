import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import "../nav.css";
import { Toaster } from 'react-hot-toast';
import Cookies from 'universal-cookie';

export function NavBar() {
	const { url } = useLocation();

	const [navVisible, setNavVisible] = useState(true);
	const [chats, setChats] = useState([]);
	
	const cookies = new Cookies(null, { path: "/" });
	const authToken = cookies.get("gronk_tk");
	const instanceUrl = cookies.get("gronk_instance_url");
	
	const isLoggedIn = !!authToken;

	useEffect(() => {
		if(isLoggedIn) {
			// get chats
			fetch(instanceUrl + "/conversations", {
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
	}, []);
	
	return (
		<div className="nav-container">
			<div className="secondary-nav-outer-top">
				{ /* replaces hidden navbar */ }
				<div className={"nav-outer-top-in-nav" + (!navVisible ? "" : " d-none")}>
					<button title="Toggle Sidebar" className="nav-button" onClick={() => setNavVisible(!navVisible)}>
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
								<button title="New Chat" className="nav-button nav-open-nav-button" onClick={() => alert("// TODO: implement new chat button")}>
									<span className="material-symbols-rounded nav-icon">add</span>
								</button>
							) : null}
							
							<button title="Toggle Sidebar" className="nav-button nav-open-nav-button" onClick={() => setNavVisible(!navVisible)}>
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

										<button className="btn btn-primary square h-100 nav-chats-list-search-submit" onClick={() => {alert("// TODO: search bar functionality")}}>
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
												<div>
													<p className="m-0 p-0">
														{chat.title || chat.uuid}
													</p>
												</div>

												<div>
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
