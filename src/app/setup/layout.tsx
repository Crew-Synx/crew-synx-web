import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Setup | CrewSynx',
	description: 'Complete your organization setup.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
