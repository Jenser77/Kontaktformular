import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self'],
				'font-src': ['self'],
				'img-src': ['self', 'data:', 'https://www.diakoniestiftung-sachsen.de'],
				'connect-src': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
