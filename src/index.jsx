import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import 'material-symbols/rounded.css';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import { NavBar } from './components/NavBar.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';

import './fonts.css';

import './style.css';
import './mobile.css';
import './colors.css';
import { Login } from './pages/Login/Login.jsx';

export function App() {
	return (
		<LocationProvider>
			<NavBar />
			<main>
				<Router>
					<Route path="/" component={() =>
						<ProtectedRoute>
							<Home></Home>
						</ProtectedRoute>} />
					<Route path="login" component={Login} />

					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById('app'));
