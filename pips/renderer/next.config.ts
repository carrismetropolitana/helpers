/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {

	images: {
		domains: [
			'storage.carrismetropolitana.pt',
		],
	},

	output: 'standalone',

	reactStrictMode: true,
};

export default nextConfig;
