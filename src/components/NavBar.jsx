import { useLocation } from 'preact-iso';
import "../nav.css";

export function NavBar() {
	const { url } = useLocation();

	return (
		<nav>
			<img src="/gronk.svg" alt="" className="nav-logo" />
		</nav>
	);
}
