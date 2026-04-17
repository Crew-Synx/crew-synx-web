import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Designations | CrewSynx',
	description: 'Manage employee designations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
