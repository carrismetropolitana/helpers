/* * */

import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface Props {
	backgroundImageSrc: string
	children: React.ReactNode
}

/* * */

export function PIPWrapper({ backgroundImageSrc, children }: Props) {
	return (
		<div className={styles.container}>
			<Image alt="background" className={styles.backgroundImage} height={1440} src={backgroundImageSrc} width={2560} />
			<div className={styles.content}>{children}</div>
		</div>
	);
}
