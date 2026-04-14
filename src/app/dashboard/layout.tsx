import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Dashboard | CrewSynx',
	description: 'Your workforce management dashboard.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
