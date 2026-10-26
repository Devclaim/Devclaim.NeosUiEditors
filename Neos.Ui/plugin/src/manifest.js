import manifest from '@neos-project/neos-ui-extensibility'
import { registerOccurenceEditor } from '@devclaim/neos-ui-editors-occurrence-editor'
import { registerColorEditor } from './colorEditor'
import { registerNumberEditor } from './numberEditor'

manifest('@devclaim/neos-ui-editors', {}, (globalRegistry) => {
	registerOccurenceEditor(globalRegistry)
	registerColorEditor(globalRegistry)
	registerNumberEditor(globalRegistry)
})
