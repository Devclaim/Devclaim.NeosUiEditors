import React, { useEffect, useState } from 'react'
import { DateInput } from '@neos-project/react-ui-components'
import { useI18n } from '@devclaim/neos-ui-editors-neos-bridge'
import { useOccurence } from '../context/OccurenceContext'
import { DurationUnit, EventEndType } from '../types'
import { getInitialEventEndType } from '../utils/getInitialEventEndType'
import { endOf } from '../utils/schedule'
import { Segmented, Stepper } from '../ui/controls'
import { BASE } from '../utils/constants'

const MINUTES: Record<DurationUnit, number> = { minute: 1, hour: 60, day: 24 * 60 }

/** A span as a duration in its largest unit without a rest (90 minutes stay minutes, 2 hours become hours) */
const durationOf = (minutes: number): { count: number; unit: DurationUnit } => {
	const unit: DurationUnit = minutes % MINUTES.day === 0 ? 'day' : minutes % MINUTES.hour === 0 ? 'hour' : 'minute'
	return { count: Math.max(1, Math.round(minutes / MINUTES[unit])), unit }
}

/** The first date of the event: its start, and its end as an end date or as a duration */
export const EventDatesEditor = () => {
	const { occurence, setStartDate, update } = useOccurence()
	const i18n = useI18n()
	const [endType, setEndType] = useState<EventEndType>(getInitialEventEndType(occurence))

	useEffect(() => {
		setEndType(getInitialEventEndType(occurence))
	}, [occurence.endDate, occurence.durationCount, occurence.durationUnit])

	// switched, the end stays where it is: as a duration, or as the date it comes to
	const handleEndTypeChange = (type: EventEndType) => {
		const end = endOf(occurence)
		if (type === 'duration') {
			const minutes = end && occurence.startDate ? (end.getTime() - occurence.startDate.getTime()) / 60_000 : 0
			const { count, unit } = minutes > 0 ? durationOf(minutes) : { count: 1, unit: 'hour' as DurationUnit }
			update({ endDate: undefined, durationCount: count, durationUnit: unit })
		} else {
			update({ endDate: end, durationCount: undefined, durationUnit: undefined })
		}
		setEndType(type)
	}

	return (
		<>
			<DateInput
				theme={{ closeCalendarIconBtn: 'hide-date-reset-button' }}
				timeConstraints={{ minutes: { step: 1 } }}
				is24Hour
				value={occurence.startDate ?? undefined}
				labelFormat="DD. MMM YYYY, HH:mm"
				onChange={setStartDate}
				placeholder={i18n(`${BASE}:inspector.selectStartDate`)}
			/>
			<Segmented<EventEndType>
				value={endType}
				onChange={handleEndTypeChange}
				options={[
					{ value: 'endDate', label: i18n(`${BASE}:editor.end`, 'End') },
					{ value: 'duration', label: i18n(`${BASE}:editor.duration`, 'Duration') },
				]}
			/>
			{endType === 'endDate' ? (
				<DateInput
					timeConstraints={{ minutes: { step: 1 } }}
					is24Hour
					value={occurence.endDate ?? undefined}
					labelFormat="DD. MMM YYYY, HH:mm"
					onChange={(endDate: Date | null) => update({ endDate: endDate ?? undefined })}
					placeholder={i18n(`${BASE}:inspector.selectEndDate`)}
				/>
			) : (
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<Stepper
						value={occurence.durationCount ?? 1}
						onChange={(count) => update({ durationCount: count, durationUnit: occurence.durationUnit ?? 'hour' })}
					/>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Segmented<DurationUnit>
							value={occurence.durationUnit ?? 'hour'}
							onChange={(unit) => update({ durationUnit: unit, durationCount: occurence.durationCount ?? 1 })}
							options={[
								{ value: 'minute', label: i18n(`${BASE}:editor.unit.minutes`, 'Min.') },
								{ value: 'hour', label: i18n(`${BASE}:editor.unit.hours`, 'Hrs.') },
								{ value: 'day', label: i18n(`${BASE}:editor.unit.days`, 'Days') },
							]}
						/>
					</div>
				</div>
			)}
		</>
	)
}
