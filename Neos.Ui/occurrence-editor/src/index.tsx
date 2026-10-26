import { SynchronousRegistry } from '@neos-project/neos-ui-extensibility'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { selectors } from '@neos-project/neos-ui-redux-store'
import { IGlobalRegistry, NeosContext } from '@devclaim/neos-ui-editors-neos-bridge'
import { OcurrenceEditor } from './editors/OccurenceEditor'
import { OccurenceProvider } from './context/OccurenceContext'
import { OccurenceCommitObject, OccurenceState } from './types'
import { serializeExdatesToString, serializeRdatesToString } from './utils/iCalDateHelpers'
import { formatICalDate, formatICalDuration } from './utils/iCalDateHelpers'
import { changedSections, OccurenceSection, resetSection } from './utils/changes'
import _ from 'lodash'

export function registerOccurenceEditor(globalRegistry: IGlobalRegistry): void {
	const inspectorRegistry = globalRegistry.get('inspector')
	if (!inspectorRegistry) {
		console.warn('[Devclaim.NeosUiEditors.OccurrenceEditor]: Could not find inspector registry.')
		console.warn('[Devclaim.NeosUiEditors.OccurrenceEditor]: Skipping registration of OccurenceEditor...')
		return
	}

	const editorsRegistry = inspectorRegistry.get<SynchronousRegistry<any>>('editors')
	if (!editorsRegistry) {
		console.warn('[Devclaim.NeosUiEditors.OccurrenceEditor]: Could not find inspector editors registry.')
		console.warn('[Devclaim.NeosUiEditors.OccurrenceEditor]: Skipping registration of OccurenceEditor...')
		return
	}

	editorsRegistry.set('Devclaim.NeosUiEditors/Inspector/Editors/OccurrenceEditor', {
		component: (props: any) => {
			const { value, commit, options, highlight, identifier } = props
			// the value of the focused node, before the changes in the inspector are applied (not in the creation
			// dialog: Neos highlights changed properties of the inspector only)
			const applied: OccurenceCommitObject | undefined = useSelector(
				(state: unknown) => (selectors as any).CR.Nodes.focusedSelector(state)?.properties?.[identifier]
			)
			const changed = changedSections(value, highlight ? applied : undefined)

			const handleCommit = (occurence: OccurenceState) => {
				if (!occurence.startDate) {
					commit(value)
					return
				}

				const occurenceCommit: OccurenceCommitObject = {
					startDate: formatICalDate(occurence.startDate),
					endDate: occurence.endDate ? formatICalDate(occurence.endDate) : null,
					recurrenceRule: occurence.recurrenceRule?.toString() ?? null,
					recurrenceDateTimes: serializeRdatesToString(occurence.recurrenceDateTimes),
					exceptionDateTimes: serializeExdatesToString(occurence.exceptionDateTimes),
					duration:
						occurence.durationCount && occurence.durationUnit
							? formatICalDuration(occurence.durationCount, occurence.durationUnit)
							: null,
				}

				if (!_.isEqual(value, occurenceCommit)) {
					commit(occurenceCommit)
				}
			}

			const reset = (section: OccurenceSection) => applied && commit(resetSection(value, applied, section))

			return (
				<NeosContext.Provider value={{ globalRegistry }}>
					<OccurenceProvider value={value} onCommit={handleCommit}>
						<OcurrenceEditor options={options} changed={changed} reset={reset} />
					</OccurenceProvider>
				</NeosContext.Provider>
			)
		},
	})
}
