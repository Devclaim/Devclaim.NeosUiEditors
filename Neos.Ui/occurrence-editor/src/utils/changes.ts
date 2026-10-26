import { OccurenceCommitObject } from '../types'

export type OccurenceSection = 'dates' | 'repeat' | 'ends' | 'exceptions' | 'extra'

type Value = Partial<OccurenceCommitObject> | null | undefined

/** The parts of the rule that "Endet" edits; the rest of it is the repetition */
const END_PARTS = ['UNTIL', 'COUNT']

/** A rule as its parts (`FREQ=MONTHLY`, …), with or without the parts of its end */
const ruleParts = (rule: string | null | undefined, ofEnd: boolean) =>
	(rule ?? '')
		.replace(/^RRULE:/, '')
		.split(';')
		.filter((part) => part && END_PARTS.includes(part.split('=')[0]) === ofEnd)

/** What a section edits in the value, comparable as a string */
const sectionValue: Record<OccurenceSection, (value: Value) => string> = {
	dates: (value) => [value?.startDate, value?.endDate, value?.duration].map((part) => part || '').join('|'),
	repeat: (value) => ruleParts(value?.recurrenceRule, false).join(';'),
	ends: (value) => ruleParts(value?.recurrenceRule, true).join(';'),
	exceptions: (value) => value?.exceptionDateTimes || '',
	extra: (value) => value?.recurrenceDateTimes || '',
}

const SECTIONS = Object.keys(sectionValue) as OccurenceSection[]

/**
 * The sections whose part of the value differs from the applied value; none without one (the creation dialog, a
 * new node): then nothing is applied to compare with
 */
export function changedSections(value: Value, applied: Value): Record<OccurenceSection, boolean> {
	return Object.fromEntries(
		SECTIONS.map((section) => [section, Boolean(applied) && sectionValue[section](value) !== sectionValue[section](applied)])
	) as Record<OccurenceSection, boolean>
}

/** The rule of one value with the end (or everything but the end) of another */
function mergeRule(rule: string | null | undefined, from: string | null | undefined, takeEnd: boolean) {
	if (!rule) {
		return takeEnd ? null : from ?? null
	}
	if (!from) {
		// the end of no rule: none; the repetition of no rule: none
		return takeEnd ? `RRULE:${ruleParts(rule, false).join(';')}` : null
	}
	const parts = [...ruleParts(rule, !takeEnd), ...ruleParts(from, takeEnd)]
	return `RRULE:${parts.join(';')}`
}

/** The value with the part of a section as applied */
export function resetSection(value: OccurenceCommitObject, applied: OccurenceCommitObject, section: OccurenceSection) {
	switch (section) {
		case 'dates':
			return { ...value, startDate: applied.startDate, endDate: applied.endDate ?? null, duration: applied.duration ?? null }
		case 'repeat':
			return { ...value, recurrenceRule: mergeRule(value.recurrenceRule, applied.recurrenceRule, false) }
		case 'ends':
			return { ...value, recurrenceRule: mergeRule(value.recurrenceRule, applied.recurrenceRule, true) }
		case 'exceptions':
			return { ...value, exceptionDateTimes: applied.exceptionDateTimes ?? null }
		case 'extra':
			return { ...value, recurrenceDateTimes: applied.recurrenceDateTimes ?? null }
	}
}
