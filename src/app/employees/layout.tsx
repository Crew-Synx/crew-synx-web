import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Employees | CrewSynx',
	description: 'Manage your employee directory.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
