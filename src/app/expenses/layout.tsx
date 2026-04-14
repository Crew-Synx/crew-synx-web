import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Expenses | CrewSynx',
	description: 'Manage and track employee expenses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
