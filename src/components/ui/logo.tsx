import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
	size?: number;
	showName?: boolean;
	href?: string;
	className?: string;
	nameClassName?: string;
}

export function Logo({
	size = 32,
	showName = true,
	href = '/',
	className,
	nameClassName,
}: LogoProps) {
	const content = (
		<span className={cn('flex items-center gap-2', className)}>
			<Image
				src="/cs_logo.svg"
				alt="CrewSynx logo"
				width={size}
				height={size}
				priority
				style={{ borderRadius: size * 0.27 }}
			/>
			{showName && (
				<span
					className={cn(
						'font-bold tracking-tight text-foreground',
						nameClassName,
					)}
					style={{ fontSize: size * 0.69 }}
				>
					CrewSynx
				</span>
			)}
		</span>
	);

	if (!href) return content;

	return (
		<Link href={href} aria-label="CrewSynx home">
			{content}
		</Link>
	);
}

/** Standalone logo mark only (no text, no link) */
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
	return (
		<Image
			src="/cs_logo.svg"
			alt="CrewSynx"
			width={size}
			height={size}
			priority
			className={className}
			style={{ borderRadius: size * 0.27 }}
		/>
	);
}
