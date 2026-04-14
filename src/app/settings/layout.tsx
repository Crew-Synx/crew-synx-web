import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Settings | CrewSynx',
	description: 'Manage your account and organization settings.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
