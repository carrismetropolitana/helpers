/* * */

import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface Props {
	backgroundImageSrc?: string
	children: React.ReactNode
	orientation?: 'horizontal' | 'vertical'
}

/* * */

export function A4Wrapper({ backgroundImageSrc, children, orientation = 'horizontal' }: Props) {
	return (
		<div className={`${styles.container} ${styles[orientation]}`}>
			{backgroundImageSrc && <Image alt="background" className={styles.backgroundImage} src={backgroundImageSrc} />}
			<div className={styles.content}>{children}</div>
		</div>
	);
}
