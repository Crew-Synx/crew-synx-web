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

interface FormFields {
	name: string;
	email: string;
	company: string;
	team_size: string;
	message: string;
}

interface FieldErrors {
	name?: string;
	email?: string;
	company?: string;
	message?: string;
}

export function ContactForm() {
	const [fields, setFields] = useState<FormFields>({
		name: '',
		email: '',
		company: '',
		team_size: '',
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

			{/* Message */}
			<div className="space-y-2">
				<Label htmlFor="message">
					Message / Custom Requests <span className="text-destructive">*</span>
				</Label>
				<Textarea
					id="message"
					name="message"
					rows={6}
					placeholder="Tell us about your deployment needs, custom feature requests, questions about licensing, or anything else you'd like to discuss."
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
