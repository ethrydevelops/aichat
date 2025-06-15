import { useLocation } from 'preact-iso';
import { useState } from 'preact/hooks';
import "../nav.css";

export function NavBar() {
	const { url } = useLocation();

	const [navVisible, setNavVisible] = useState(true);

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
							<button title="New Chat" className="nav-button nav-open-nav-button" onClick={() => alert("// TODO: implement new chat button")}>
								<span className="material-symbols-rounded nav-icon">add</span>
							</button>
							
							<button title="Toggle Sidebar" className="nav-button nav-open-nav-button" onClick={() => setNavVisible(!navVisible)}>
								<span className="material-symbols-rounded nav-icon">thumbnail_bar</span>
							</button>
						</div>
					</div>
				</nav>
			</div>
		</div>
	);
}
