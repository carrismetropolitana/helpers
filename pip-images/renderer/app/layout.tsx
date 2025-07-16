/* * */

import '@/styles/reset.css';
import '@/styles/defaults.css';

/* * */

export default function RootLayout({ children }) {
	return (
		<html>
			<head>
				<link href="https://use.typekit.net/xgs1heq.css" rel="stylesheet" />
			</head>
			<body>
				{children}
			</body>
		</html>
	);
}
