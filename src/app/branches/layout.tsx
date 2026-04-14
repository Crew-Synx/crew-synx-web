import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Branches | CrewSynx',
	description: 'Manage your organization branches.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
