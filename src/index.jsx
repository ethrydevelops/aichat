import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { NavBar } from './components/NavBar.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';

import './style.css';
import './mobile.css';
import './colors.css';

export function App() {
	return (
		<LocationProvider>
			<NavBar />
			<main>
				<Router>
					<Route path="/" component={Home} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById('app'));
