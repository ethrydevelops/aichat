import "./404.css";

export function NotFound() {
	return (
		<section className="center-flex h-100v">
			<div className="center-flex-inner-404">
				<h1>404</h1>
				<p>Page not found. <a href="/">Go home</a></p>
			</div>
		</section>
	);
}
