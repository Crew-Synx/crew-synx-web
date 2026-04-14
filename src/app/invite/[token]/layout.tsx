import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Invitation | CrewSynx',
	description: 'Accept your invitation to join an organization.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
