export function toIsoDate(date: Date): string {
	const localMidnightOffset = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - localMidnightOffset)
		.toISOString()
		.slice(0, 10);
}

export function todayIso(): string {
	return toIsoDate(new Date());
}

export function maxAdvanceIso(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return toIsoDate(date);
}
