import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import 'material-symbols/rounded.css';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import { NavBar } from './components/NavBar.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';

import './colors.css';
import './fonts.css';

import './style.css';
import './buttons.css';

import './mobile.css';

import { Login } from './pages/Login/Login.jsx';
import { Logout } from './pages/Login/Logout.jsx';
import { Register } from './pages/Login/Register.jsx';
import { Chat } from './pages/Chats/Chat.jsx';
import { Settings } from './pages/Settings.jsx';

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
					
					<Route path="/login" component={Login} />
					<Route path="/logout" component={Logout} />
					<Route path="/signup" component={Register} />
					<Route path="/chat/:id" component={(props) => 
						<ProtectedRoute>
							<Chat id={
								// @ts-ignore
								props.id
							}></Chat>
						</ProtectedRoute>} />

					<Route path="/settings" component={(props) => (
						<ProtectedRoute><Settings category={undefined}></Settings></ProtectedRoute>)} />
					<Route path="/settings/:category" component={(props) => 
						<ProtectedRoute><Settings category={props.category}></Settings></ProtectedRoute>} />

					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById('app'));
