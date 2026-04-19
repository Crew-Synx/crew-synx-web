import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Payments | CrewSynx',
	description: 'Manage client payments and employee expense submissions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
