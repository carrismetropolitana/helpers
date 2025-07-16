'use client';

/* * */

import { PIPWrapper } from '@/components/PIPWrapper';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import BackgroundImage from './background.png';
import styles from './styles.module.css';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const searchParams = useSearchParams();
	const pipId = searchParams.get('id') ?? 'N/A';
	const pipStatus = searchParams.get('status') ?? 'N/A';

	const qrCodeUrl = `https://storage.carrismetropolitana.pt/static/pips/qr-codes/${pipId}.png`;

	//
	// B. Render components

	return (
		<PIPWrapper backgroundImageSrc={BackgroundImage.src}>
			<Image alt="qrcode" className={styles.qrCode} height={750} src={qrCodeUrl} width={750} />
			<p className={styles.pipId}>{pipId}</p>
			<p className={styles.pipStatus}>{pipStatus}</p>
		</PIPWrapper>
	);

	//
}
