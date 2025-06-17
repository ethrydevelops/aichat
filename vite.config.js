import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	define: {
		__DEFAULT_INSTANCE_URL__: JSON.stringify(process.env.API_HOSTNAME || 'https://localhost:3000')
	}
});
