import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Employee Details | CrewSynx',
	description: 'View and manage employee details.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
