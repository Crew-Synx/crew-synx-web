import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Get Started | CrewSynx',
	description: 'Set up your organization.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
