import React from 'react'
import { Frequency, Options, RRule } from 'rrule'
import { DateInput } from '@neos-project/react-ui-components'
import { useI18n } from '@devclaim/neos-ui-editors-neos-bridge'
import { useOccurence } from '../context/OccurenceContext'
import { RRuleEndType } from '../types'
import { BASE, getMonthOptions, getWeekdayOptions } from '../utils/constants'
import { getInitialEndType } from '../utils/getInitialEndType'
import { MonthMode, monthModeOf, ruleOf, withMonthMode, withOptions } from '../utils/schedule'
import { Chips, Option, Segmented, Stepper } from '../ui/controls'

type Repeat = 'never' | Frequency

const UNITS: Partial<Record<Frequency, string>> = {
	[Frequency.HOURLY]: 'hours',
	[Frequency.DAILY]: 'days',
	[Frequency.WEEKLY]: 'weeks',
	[Frequency.MONTHLY]: 'months',
	[Frequency.YEARLY]: 'years',
}

const MONTH_DAYS: Option<number>[] = Array.from({ length: 31 }, (_, index) => ({ value: index + 1, label: String(index + 1) }))

/** The repetition: never or by a frequency (interval, weekdays, days or nth weekdays, months) */
export const RepeatEditor = () => {
	const { occurence, setRRule, resetRRule } = useOccurence()
	const i18n = useI18n()
	const t = (key: string, fallback: string, params?: Record<string, string>) => i18n(`${BASE}:${key}`, fallback, params)
	const rrule = occurence.recurrenceRule
	const start = occurence.startDate ?? new Date()

	const frequencies: Option<Repeat>[] = [
		{ value: 'never', label: t('editor.freq.never', 'Never') },
		{ value: Frequency.DAILY, label: t('editor.freq.daily', 'Daily'), title: t('freq.daily', 'Daily') },
		{ value: Frequency.WEEKLY, label: t('editor.freq.weekly', 'Weekly'), title: t('freq.weekly', 'Weekly') },
		{ value: Frequency.MONTHLY, label: t('editor.freq.monthly', 'Monthly'), title: t('freq.monthly', 'Monthly') },
		{ value: Frequency.YEARLY, label: t('editor.freq.yearly', 'Yearly'), title: t('freq.yearly', 'Yearly') },
	]
	// hourly only for the rules that have it already
	if (rrule?.options.freq === Frequency.HOURLY) {
		frequencies.splice(1, 0, { value: Frequency.HOURLY, label: t('editor.freq.hourly', 'Hourly'), title: t('freq.hourly', 'Hourly') })
	}

	const handleRepeatChange = (repeat: Repeat) => {
		if (repeat === 'never') {
			resetRRule()
		} else {
			setRRule(ruleOf(repeat, start, rrule))
		}
	}

	const change = (options: Partial<Options>) => rrule && setRRule(withOptions(rrule, options))

	const repeat: Repeat = rrule ? rrule.options.freq : 'never'
	const interval = rrule?.options.interval ?? 1
	const unit = rrule ? UNITS[rrule.options.freq] : undefined

	return (
		<>
			<Segmented<Repeat> value={repeat} onChange={handleRepeatChange} options={frequencies} />
			{rrule && (
				<>
					{unit && (
						<Stepper
							prefix={t('inspector.every', 'Every')}
							suffix={t(`editor.interval.${unit}.${interval === 1 ? 'one' : 'other'}`, unit)}
							value={interval}
							onChange={(value) => change({ interval: value })}
						/>
					)}
					{rrule.options.freq === Frequency.WEEKLY && <WeekdayChips rrule={rrule} onChange={change} />}
					{rrule.options.freq === Frequency.YEARLY && (
						<Chips<number>
							columns={6}
							options={getMonthOptions(i18n)}
							values={rrule.options.bymonth ?? [start.getMonth() + 1]}
							onChange={(bymonth) => change({ bymonth })}
						/>
					)}
					{(rrule.options.freq === Frequency.MONTHLY || rrule.options.freq === Frequency.YEARLY) && (
						<MonthDays rrule={rrule} start={start} onChange={change} onRule={setRRule} />
					)}
				</>
			)}
		</>
	)
}

type PartProps = { rrule: RRule; onChange(options: Partial<Options>): void }

function WeekdayChips({ rrule, onChange }: PartProps) {
	const i18n = useI18n()
	return (
		<Chips<number>
			options={getWeekdayOptions(i18n)}
			values={(rrule.options.byweekday ?? []) as number[]}
			onChange={(byweekday) => onChange({ byweekday })}
		/>
	)
}

/** In a month: on days of the month, or on the 1st to 4th or last of weekdays (several at once: the 2nd and 4th) */
function MonthDays({ rrule, start, onChange, onRule }: PartProps & { start: Date; onRule(rrule: RRule): void }) {
	const i18n = useI18n()
	const t = (key: string, fallback: string) => i18n(`${BASE}:${key}`, fallback)
	const mode = monthModeOf(rrule)
	const positions: Option<number>[] = [1, 2, 3, 4].map((position) => ({
		value: position,
		label: t(`editor.position.${position}`, `${position}.`),
	}))
	positions.push({ value: -1, label: t('editor.position.last', 'Last') })

	return (
		<>
			<Segmented<MonthMode>
				value={mode}
				onChange={(next) => onRule(withMonthMode(rrule, next, start))}
				options={[
					{ value: 'day', label: t('editor.month.day', 'On day') },
					{ value: 'weekday', label: t('editor.month.weekday', 'On weekday') },
				]}
			/>
			{mode === 'day' ? (
				<Chips<number>
					columns={7}
					options={MONTH_DAYS}
					values={rrule.options.bymonthday ?? [start.getDate()]}
					onChange={(bymonthday) => onChange({ bymonthday })}
				/>
			) : (
				<>
					<Chips<number>
						options={positions}
						values={rrule.options.bysetpos ?? []}
						onChange={(bysetpos) => onChange({ bysetpos })}
					/>
					<WeekdayChips rrule={rrule} onChange={onChange} />
				</>
			)}
		</>
	)
}

/** Until when the event repeats (with a repetition only): never, until a day (to its end), after a number of dates */
export const EndsEditor = () => {
	const { occurence, setRRule } = useOccurence()
	const rrule = occurence.recurrenceRule
	return rrule ? <RepeatEnd rrule={rrule} onChange={(options) => setRRule(withOptions(rrule, options))} /> : null
}

function RepeatEnd({ rrule, onChange }: PartProps) {
	const i18n = useI18n()
	const t = (key: string, fallback: string) => i18n(`${BASE}:${key}`, fallback)
	const endType = getInitialEndType(rrule)

	const handleEndTypeChange = (type: RRuleEndType) => {
		if (type === 'never') {
			onChange({ until: null, count: null })
		} else if (type === 'until') {
			const inAMonth = new Date()
			inAMonth.setMonth(inAMonth.getMonth() + 1)
			inAMonth.setHours(23, 59, 59, 0)
			onChange({ until: inAMonth, count: null })
		} else {
			onChange({ until: null, count: 10 })
		}
	}

	return (
		<>
			<Segmented<RRuleEndType>
				value={endType}
				onChange={handleEndTypeChange}
				options={[
					{ value: 'never', label: t('end.never', 'Never') },
					{ value: 'until', label: t('editor.ends.until', 'On date') },
					{ value: 'count', label: t('editor.ends.count', 'After') },
				]}
			/>
			{endType === 'until' && (
				<DateInput
					dateOnly
					labelFormat="DD. MMM YYYY"
					value={rrule.options.until ? dayOf(rrule.options.until) : undefined}
					onChange={(date: Date | null) => date && onChange({ until: endOfDay(date) })}
					placeholder={t('inspector.selectDate', 'Select a date')}
				/>
			)}
			{endType === 'count' && (
				<Stepper
					prefix={t('inspector.after', 'After')}
					suffix={t(`editor.count.${rrule.options.count === 1 ? 'one' : 'other'}`, 'dates')}
					value={rrule.options.count ?? 1}
					onChange={(count) => onChange({ count })}
				/>
			)}
		</>
	)
}

// the DateInput picks a date only as midnight UTC: the until of the rule is the end of that day where the editor is
const endOfDay = (date: Date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59)
const dayOf = (until: Date) => new Date(Date.UTC(until.getFullYear(), until.getMonth(), until.getDate()))
