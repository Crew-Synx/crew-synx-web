import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'New Employee | CrewSynx',
	description: 'Add a new employee to your organization.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
