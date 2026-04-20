'use client';

import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	disabled?: boolean;
	className?: string;
}

export function OtpInput({ value, onChange, length = 6, disabled = false, className }: OtpInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const digits = Array.from({ length }, (_, i) => value[i] ?? '');

	const focusNext = (index: number) => {
		if (index < length - 1) inputRefs.current[index + 1]?.focus();
	};

	const focusPrev = (index: number) => {
		if (index > 0) inputRefs.current[index - 1]?.focus();
	};

	const handleChange = (index: number, char: string) => {
		const digit = char.replace(/\D/g, '').slice(-1);
		const newDigits = [...digits];
		newDigits[index] = digit;
		onChange(newDigits.join(''));
		if (digit) focusNext(index);
	};

	const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			if (digits[index]) {
				const newDigits = [...digits];
				newDigits[index] = '';
				onChange(newDigits.join(''));
			} else {
				focusPrev(index);
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			focusPrev(index);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			focusNext(index);
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
		if (!pasted) return;
		onChange(pasted);
		const nextIndex = Math.min(pasted.length, length - 1);
		inputRefs.current[nextIndex]?.focus();
	};

	return (
		<div className={cn('flex gap-3 justify-center', className)}>
			{Array.from({ length }, (_, i) => (
				<input
					key={i}
					ref={(el) => { inputRefs.current[i] = el; }}
					type="text"
					inputMode="numeric"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					maxLength={1}
					value={digits[i]}
					onChange={(e) => handleChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					onPaste={handlePaste}
					onFocus={(e) => e.target.select()}
					disabled={disabled}
					className={cn(
						'w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 bg-muted/50',
						'focus:border-primary focus:outline-none focus:ring-0',
						'transition-colors duration-150',
						digits[i] ? 'border-primary/60' : 'border-border',
						disabled && 'opacity-50 cursor-not-allowed',
					)}
				/>
			))}
		</div>
	);
}
