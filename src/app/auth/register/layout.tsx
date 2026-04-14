import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Create Account | CrewSynx',
	description: 'Create your CrewSynx account and set up your organization.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
