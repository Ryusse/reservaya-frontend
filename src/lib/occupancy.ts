import { toIsoDate } from "#/lib/dates";
import type {
	OccupancyClassification,
	OccupancySearch,
} from "#/models/occupancy";

export const MAX_PERIOD_DAYS = 92;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export function currentMonthRange(today: Date = new Date()): {
	from: string;
	to: string;
} {
	const first = new Date(today.getFullYear(), today.getMonth(), 1);
	const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	return { from: toIsoDate(first), to: toIsoDate(last) };
}

export function periodDays(from: string, to: string): number {
	const start = parseIsoAsUtc(from);
	const end = parseIsoAsUtc(to);
	return Math.round((end - start) / MS_PER_DAY) + 1;
}

export function periodError(from: string, to: string): string | null {
	if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) {
		return "Fecha inválida. Usa el formato AAAA-MM-DD";
	}
	if (from > to) {
		return "La fecha inicial no puede ser posterior a la final";
	}
	if (periodDays(from, to) > MAX_PERIOD_DAYS) {
		return `El periodo no puede superar ${MAX_PERIOD_DAYS} días`;
	}
	return null;
}

export function parseOccupancySearch(
	search: Record<string, unknown>,
): OccupancySearch {
	const from =
		typeof search.from === "string" && ISO_DATE.test(search.from)
			? search.from
			: undefined;
	const to =
		typeof search.to === "string" && ISO_DATE.test(search.to)
			? search.to
			: undefined;
	const spaceId = Number(search.spaceId);

	return {
		from,
		to,
		spaceId: Number.isInteger(spaceId) && spaceId > 0 ? spaceId : undefined,
	};
}

export type HeatLevel = 0 | 1 | 2 | 3;

const blueShades = ["subtle", "emphasized", "solid"] as const;

export function heatBackground(level: HeatLevel): string {
	if (level === 0) return "bg.muted";
	return `colorPalette.${blueShades[level - 1]}`;
}

export function heatLevel(rate: number): HeatLevel {
	if (rate <= 0) return 0;
	if (rate < 0.25) return 1;
	if (rate < 0.75) return 2;
	return 3;
}

export const heatLegend = [
	{ level: 0 as HeatLevel, label: "0 %" },
	{ level: 1 as HeatLevel, label: "1–24 %" },
	{ level: 2 as HeatLevel, label: "25–74 %" },
	{ level: 3 as HeatLevel, label: "75–100 %" },
];

export function formatPercent(rate: number): string {
	return `${Math.round(rate * 100)} %`;
}

export function classificationLabel(value: OccupancyClassification): string {
	if (value === "underused") return "Subutilizado";
	if (value === "high_demand") return "Alta demanda";
	return "Normal";
}

export function classificationPalette(value: OccupancyClassification): string {
	if (value === "underused") return "orange";
	if (value === "high_demand") return "red";
	return "green";
}

function parseIsoAsUtc(value: string): number {
	const [year, month, day] = value.split("-").map(Number);
	return Date.UTC(year, month - 1, day);
}
