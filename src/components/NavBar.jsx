import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import "../nav.css";
import { Toaster } from 'react-hot-toast';
import Cookies from 'universal-cookie';

export function NavBar() {
	const { url } = useLocation();

	const [navVisible, setNavVisible] = useState(true);
	
	const cookies = new Cookies(null, { path: "/" });
	const authToken = cookies.get("gronk_tk");
	
	const isLoggedIn = !!authToken;
	
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

										<button className="btn btn-primary square h-100 nav-chats-list-search-submit">
											<span class="material-symbols-rounded">
												search
											</span>
										</button>	
									</form>
								</div>

								{/* TODO: scrolling */}
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
