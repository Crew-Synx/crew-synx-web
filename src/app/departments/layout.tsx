import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Departments | CrewSynx',
	description: 'Manage your organization departments.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
