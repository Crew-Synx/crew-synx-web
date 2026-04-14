import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Attendance | CrewSynx',
	description: 'Track and manage employee attendance.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
