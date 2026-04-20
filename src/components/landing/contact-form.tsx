'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { PUBLIC_API_URL } from '@/lib/api';

const TEAM_SIZES = [
	'1–10',
	'11–50',
	'51–200',
	'201–500',
	'500+',
];

const PURPOSE_OPTIONS = [
	{ value: 'download', label: 'Download CrewSynx' },
	{ value: 'upgrade', label: 'Upgrade my version' },
	{ value: 'issue', label: 'Issue with my version' },
	{ value: 'new_license', label: 'Get a new license' },
];

interface FormFields {
	name: string;
	email: string;
	company: string;
	team_size: string;
	purpose: string;
	message: string;
}

interface FieldErrors {
	name?: string;
	email?: string;
	company?: string;
	purpose?: string;
	message?: string;
}

export function ContactForm() {
	const [fields, setFields] = useState<FormFields>({
		name: '',
		email: '',
		company: '',
		team_size: '',
		purpose: '',
		message: '',
	});
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) {
		const { name, value } = e.target;
		setFields((prev) => ({ ...prev, [name]: value }));
		if (fieldErrors[name as keyof FieldErrors]) {
			setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setServerError(null);
		setFieldErrors({});

		// Client-side validation for select fields not captured by HTML required
		const clientErrors: FieldErrors = {};
		if (!fields.purpose) clientErrors.purpose = 'Please select a purpose.';
		if (Object.keys(clientErrors).length > 0) {
			setFieldErrors(clientErrors);
			return;
		}

		setSubmitting(true);

		try {
			const res = await fetch(`${PUBLIC_API_URL}/api/v1/contact/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(fields),
			});

			const data = await res.json().catch(() => ({}));

			if (res.ok) {
				setSubmitted(true);
				return;
			}

			if (res.status === 400 && data.errors) {
				setFieldErrors(data.errors as FieldErrors);
			} else {
				setServerError(
					data.error ?? 'Something went wrong. Please try again.',
				);
			}
		} catch {
			setServerError('Could not reach the server. Please check your connection and try again.');
		} finally {
			setSubmitting(false);
		}
	}

	if (submitted) {
		return (
			<div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-sm">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
					<CheckCircle2 className="h-7 w-7 text-primary" />
				</div>
				<h3 className="mt-5 text-xl font-semibold">Inquiry received!</h3>
				<p className="mt-2 text-muted-foreground">
					Thanks for reaching out. We&apos;ll get back to you within one business day.
				</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 rounded-2xl border border-border/50 bg-card p-8 shadow-sm"
			noValidate
		>
			{/* Name + Email */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">
						Full Name <span className="text-destructive">*</span>
					</Label>
					<Input
						id="name"
						name="name"
						autoComplete="name"
						placeholder="Jane Smith"
						value={fields.name}
						onChange={handleChange}
						disabled={submitting}
						aria-invalid={!!fieldErrors.name}
					/>
					{fieldErrors.name && (
						<p className="text-sm text-destructive">{fieldErrors.name}</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">
						Work Email <span className="text-destructive">*</span>
					</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="jane@company.com"
						value={fields.email}
						onChange={handleChange}
						disabled={submitting}
						aria-invalid={!!fieldErrors.email}
					/>
					{fieldErrors.email && (
						<p className="text-sm text-destructive">{fieldErrors.email}</p>
					)}
				</div>
			</div>

			{/* Company + Team size */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="company">Company / Organisation</Label>
					<Input
						id="company"
						name="company"
						autoComplete="organization"
						placeholder="Acme Corp"
						value={fields.company}
						onChange={handleChange}
						disabled={submitting}
						aria-invalid={!!fieldErrors.company}
					/>
					{fieldErrors.company && (
						<p className="text-sm text-destructive">{fieldErrors.company}</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="team_size">Team Size</Label>
					<Select
						value={fields.team_size}
						onValueChange={(val) =>
							setFields((prev) => ({ ...prev, team_size: val }))
						}
						disabled={submitting}
					>
						<SelectTrigger id="team_size">
							<SelectValue placeholder="Select a range" />
						</SelectTrigger>
						<SelectContent>
							{TEAM_SIZES.map((size) => (
								<SelectItem key={size} value={size}>
									{size} people
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Purpose */}
			<div className="space-y-2">
				<Label htmlFor="purpose">
					Purpose <span className="text-destructive">*</span>
				</Label>
				<Select
					value={fields.purpose}
					onValueChange={(val) => {
						setFields((prev) => ({ ...prev, purpose: val }));
						if (fieldErrors.purpose) {
							setFieldErrors((prev) => ({ ...prev, purpose: undefined }));
						}
					}}
					disabled={submitting}
				>
					<SelectTrigger id="purpose" aria-invalid={!!fieldErrors.purpose}>
						<SelectValue placeholder="What can we help you with?" />
					</SelectTrigger>
					<SelectContent>
						{PURPOSE_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{fieldErrors.purpose && (
					<p className="text-sm text-destructive">{fieldErrors.purpose}</p>
				)}
			</div>

			{/* Message */}
			<div className="space-y-2">
				<Label htmlFor="message">
					Message <span className="text-destructive">*</span>
				</Label>
				<Textarea
					id="message"
					name="message"
					rows={6}
					placeholder={
						fields.purpose === 'download'
							? 'Let us know your platform (macOS, Windows, Android, iOS) and any other details.'
							: fields.purpose === 'upgrade'
								? 'Tell us your current version and what you would like to upgrade to.'
								: fields.purpose === 'issue'
									? 'Describe the issue you are experiencing, including your version and steps to reproduce.'
									: fields.purpose === 'new_license'
										? 'Tell us about your team size, deployment needs, and any custom feature requirements.'
										: 'Tell us about your requirements, deployment needs, or anything else you would like to discuss.'
					}
					value={fields.message}
					onChange={handleChange}
					disabled={submitting}
					aria-invalid={!!fieldErrors.message}
				/>
				{fieldErrors.message && (
					<p className="text-sm text-destructive">{fieldErrors.message}</p>
				)}
			</div>

			{serverError && (
				<div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
					<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
					{serverError}
				</div>
			)}

			<Button type="submit" className="h-11 w-full text-base" disabled={submitting}>
				{submitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Sending…
					</>
				) : fields.purpose === 'download' ? (
					'Request Download'
				) : fields.purpose === 'upgrade' ? (
					'Request Upgrade'
				) : fields.purpose === 'issue' ? (
					'Report Issue'
				) : (
					'Send Inquiry'
				)}
			</Button>

			<p className="text-center text-xs text-muted-foreground">
				We typically respond within one business day. Your information is used solely to respond to
				your inquiry.
			</p>
		</form>
	);
}
