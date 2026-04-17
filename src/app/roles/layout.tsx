import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Roles | CrewSynx',
	description: 'Manage organization roles.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
