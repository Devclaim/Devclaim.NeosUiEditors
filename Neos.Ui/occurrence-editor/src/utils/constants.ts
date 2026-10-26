export type I18nFn = (key: string) => string;

export const ICAL_DATE_FORMAT = "yyyyMMdd'T'HHmmss";

export const BASE = 'Devclaim.NeosUiEditors:OccurrenceEditor';

export const getWeekdayOptions = (i18n: I18nFn) => [
	{ label: i18n(`${BASE}:weekday.mo`), value: 0 },
	{ label: i18n(`${BASE}:weekday.tu`), value: 1 },
	{ label: i18n(`${BASE}:weekday.we`), value: 2 },
	{ label: i18n(`${BASE}:weekday.th`), value: 3 },
	{ label: i18n(`${BASE}:weekday.fr`), value: 4 },
	{ label: i18n(`${BASE}:weekday.sa`), value: 5 },
	{ label: i18n(`${BASE}:weekday.su`), value: 6 },
];

export const getMonthOptions = (i18n: I18nFn) => [
	{ label: i18n(`${BASE}:month.jan`), value: 1 },
	{ label: i18n(`${BASE}:month.feb`), value: 2 },
	{ label: i18n(`${BASE}:month.mar`), value: 3 },
	{ label: i18n(`${BASE}:month.apr`), value: 4 },
	{ label: i18n(`${BASE}:month.may`), value: 5 },
	{ label: i18n(`${BASE}:month.jun`), value: 6 },
	{ label: i18n(`${BASE}:month.jul`), value: 7 },
	{ label: i18n(`${BASE}:month.aug`), value: 8 },
	{ label: i18n(`${BASE}:month.sep`), value: 9 },
	{ label: i18n(`${BASE}:month.oct`), value: 10 },
	{ label: i18n(`${BASE}:month.nov`), value: 11 },
	{ label: i18n(`${BASE}:month.dec`), value: 12 },
];
