import React from 'react'
import { OccurenceEditorOptions } from '../types'
import { useOccurence } from '../context/OccurenceContext'
import { EventDatesEditor } from './EventDatesEditor'
import { EndsEditor, RepeatEditor } from './RepeatEditor'
import { EditorContainer } from '../components/container'
import { BASE } from '../utils/constants'
import { useI18n } from '@devclaim/neos-ui-editors-neos-bridge'
import { MultiDateInput } from '@devclaim/neos-ui-editors-multi-date-input'
import { Section } from '../ui/controls'
import type { OccurenceSection } from '../utils/changes'

interface OccurenceEditorProps {
	options: OccurenceEditorOptions
	/** the sections that differ from the applied value */
	changed: Record<OccurenceSection, boolean>
	/** a section back to the applied value */
	reset(section: OccurenceSection): void
}

const count = (dates?: (Date | null)[]) => (dates ?? []).filter(Boolean).length

/** The dates of an event: the first date, the repetition and its end, exceptions and further dates */
export const OcurrenceEditor = ({ options, changed, reset }: OccurenceEditorProps) => {
	const { occurence, setRecurrencDates, setExceptionDates } = useOccurence()
	const i18n = useI18n()
	const t = (key: string, fallback: string) => i18n(`${BASE}:${key}`, fallback)
	const resetLabel = t('editor.reset', 'Reset')

	return (
		<EditorContainer disabled={options.disabled}>
			<Section title={t('editor.section.dates', 'Date')} changed={changed.dates} resetLabel={resetLabel} onReset={() => reset('dates')}>
				<EventDatesEditor />
			</Section>
			<Section title={t('editor.section.repeat', 'Repetition')} changed={changed.repeat} resetLabel={resetLabel} onReset={() => reset('repeat')}>
				<RepeatEditor />
			</Section>
			{occurence.recurrenceRule && (
				<Section title={t('editor.ends', 'Ends')} changed={changed.ends} resetLabel={resetLabel} onReset={() => reset('ends')}>
					<EndsEditor />
				</Section>
			)}
			<Section
				title={t('inspector.exceptions', 'Exceptions')}
				aside={count(occurence.exceptionDateTimes) || undefined}
				changed={changed.exceptions}
				resetLabel={resetLabel}
				onReset={() => reset('exceptions')}
			>
				<MultiDateInput
					value={occurence.exceptionDateTimes}
					onChange={setExceptionDates}
					initialDate={occurence.startDate}
					addLabel={t('editor.addException', 'Exception')}
				/>
			</Section>
			<Section
				title={t('editor.section.extra', 'Further dates')}
				aside={count(occurence.recurrenceDateTimes) || undefined}
				changed={changed.extra}
				resetLabel={resetLabel}
				onReset={() => reset('extra')}
			>
				<MultiDateInput
					value={occurence.recurrenceDateTimes}
					onChange={setRecurrencDates}
					initialDate={occurence.startDate}
					addLabel={t('editor.addDate', 'Date')}
				/>
			</Section>
		</EditorContainer>
	)
}
