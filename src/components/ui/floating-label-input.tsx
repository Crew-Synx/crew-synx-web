'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── FloatingLabelInput ────────────────────────────────────────────────────

export interface FloatingLabelInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
	label: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
	({ label, className, id: idProp, type = 'text', ...props }, ref) => {
		const generatedId = React.useId();
		const id = idProp ?? generatedId;

		// For these types the browser renders its own UI so the label must always float.
		const alwaysFloat = ['date', 'datetime-local', 'time', 'month', 'week', 'file'].includes(type);

		return (
			<div className="relative">
				<input
					ref={ref}
					id={id}
					type={type}
					// A single space keeps :placeholder-shown in the "shown" state when
					// the field is empty so the floating animation works with pure CSS.
					placeholder=" "
					data-slot="floating-input"
					className={cn(
						'peer h-12 w-full min-w-0 rounded-md border border-input bg-transparent',
						'pt-5 pb-1 px-3 text-base shadow-xs outline-none',
						'transition-[color,box-shadow]',
						'selection:bg-primary selection:text-primary-foreground',
						// hide the invisible placeholder
						'placeholder:text-transparent',
						'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
						'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
						'md:text-sm dark:bg-input/30',
						'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
						'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
						className,
					)}
					{...props}
				/>
				<label
					htmlFor={id}
					className={cn(
						'pointer-events-none absolute left-3 select-none',
						'transition-all duration-200 text-muted-foreground',
						alwaysFloat
							// Always show as a small floated label for special input types
							? 'top-2 text-xs font-medium'
							: cn(
								// Default: sit in the middle of the field like a placeholder
								'top-1/2 -translate-y-1/2 text-sm',
								// Float up when the input is focused
								'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary',
								// Stay floated while the field has a value
								'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0',
								'peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium',
								// Reflect error state on the floated label
								'peer-[aria-invalid=true]:peer-focus:text-destructive',
							),
					)}
				>
					{label}
				</label>
			</div>
		);
	},
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

// ─── FloatingLabelTextarea ─────────────────────────────────────────────────

export interface FloatingLabelTextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
	label: string;
}

const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
	({ label, className, id: idProp, ...props }, ref) => {
		const generatedId = React.useId();
		const id = idProp ?? generatedId;

		return (
			<div className="relative">
				<textarea
					ref={ref}
					id={id}
					placeholder=" "
					data-slot="floating-textarea"
					className={cn(
						'peer w-full min-w-0 rounded-md border border-input bg-transparent',
						'field-sizing-content min-h-20 pt-6 pb-2 px-3 text-base shadow-xs outline-none',
						'transition-[color,box-shadow]',
						'placeholder:text-transparent',
						'disabled:cursor-not-allowed disabled:opacity-50',
						'md:text-sm dark:bg-input/30',
						'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
						'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
						className,
					)}
					{...props}
				/>
				<label
					htmlFor={id}
					className={cn(
						'pointer-events-none absolute left-3 select-none',
						'transition-all duration-200 text-muted-foreground',
						'top-4 text-sm',
						'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary',
						'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium',
						'peer-[aria-invalid=true]:peer-focus:text-destructive',
					)}
				>
					{label}
				</label>
			</div>
		);
	},
);
FloatingLabelTextarea.displayName = 'FloatingLabelTextarea';

export { FloatingLabelInput, FloatingLabelTextarea };
