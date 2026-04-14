import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Profile | CrewSynx',
	description: 'View and update your profile.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
