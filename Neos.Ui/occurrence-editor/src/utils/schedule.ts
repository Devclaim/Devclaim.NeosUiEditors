import { Frequency, Options, RRule } from 'rrule'
import { OccurenceState } from '../types'

/** The weekday of a date as rrule counts it (0 = Monday) */
export const weekdayOf = (date: Date) => (date.getDay() + 6) % 7

/** Which of its weekday a date is in its month: 1 to 4, or -1 (the last, a fifth) */
export const positionInMonth = (date: Date) => {
	const position = Math.ceil(date.getDate() / 7)
	return position > 4 ? -1 : position
}

/** How a month (or the months of a year) repeats: on days of the month, or on the nth weekdays */
export type MonthMode = 'day' | 'weekday'

export const monthModeOf = (rrule: RRule): MonthMode =>
	rrule.options.bysetpos?.length || (rrule.options.byweekday?.length && !rrule.options.bymonthday?.length)
		? 'weekday'
		: 'day'

/** The parts of a rule that only the editor sets: the time and the start come from the start date of the event */
const withoutTime = (options: Partial<Options>) =>
	new RRule({ ...options, dtstart: null, wkst: null, byhour: null, byminute: null, bysecond: null })

/** A new rule of a frequency, on the day of the start (its weekday, its day or position in the month, its month) */
export function ruleOf(freq: Frequency, start: Date, previous?: RRule): RRule {
	const end = previous ? { until: previous.options.until, count: previous.options.count } : {}
	const base = { freq, interval: 1, ...end }
	switch (freq) {
		case Frequency.WEEKLY:
			return withoutTime({ ...base, byweekday: [weekdayOf(start)] })
		case Frequency.MONTHLY:
			return withoutTime({ ...base, bymonthday: [start.getDate()] })
		case Frequency.YEARLY:
			return withoutTime({ ...base, bymonth: [start.getMonth() + 1], bymonthday: [start.getDate()] })
		default:
			return withoutTime(base)
	}
}

/** The rule on days of the month, or on the nth weekday (both as on the start date) */
export function withMonthMode(rrule: RRule, mode: MonthMode, start: Date): RRule {
	return withoutTime({
		...rrule.options,
		bymonthday: mode === 'day' ? [start.getDate()] : null,
		bysetpos: mode === 'weekday' ? [positionInMonth(start)] : null,
		byweekday: mode === 'weekday' ? [weekdayOf(start)] : null,
	})
}

export const withOptions = (rrule: RRule, options: Partial<Options>) =>
	withoutTime({ ...rrule.options, ...options })

/** The end of the event on its first date: its end date or start plus duration */
export function endOf(occurence: OccurenceState): Date | undefined {
	const { startDate, endDate, durationCount, durationUnit } = occurence
	if (endDate || !startDate || !durationCount || !durationUnit) {
		return endDate
	}
	const minutes = { minute: 1, hour: 60, day: 24 * 60 }[durationUnit] * durationCount
	return new Date(startDate.getTime() + minutes * 60_000)
}
