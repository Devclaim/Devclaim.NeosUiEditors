import * as React from 'react'
import { createPortal } from 'react-dom'
import { HexColorPicker } from 'react-colorful'
import { IconButton, TextInput } from '@neos-project/react-ui-components'

/**
 * A color of its own (the color of an event type): in the inspector a swatch, the hex value and a button that removes
 * the color (neutral); the swatch opens a picker (react-colorful) with suggested colors, floating at the field (in the
 * body: the inspector and the dialogs around it scroll and clip), below it or above where there is no room. In the
 * colors and components of the Neos UI. Value: "#rrggbb", or null.
 */
const HEX = /^#[0-9a-f]{6}$/i

/** strong tones, readable as text on light backgrounds (the calendar lightens them for dark mode) */
const SUGGESTIONS = [
	['Blau', '#0369a1'],
	['Türkis', '#0e7490'],
	['Grün', '#047857'],
	['Bernstein', '#b45309'],
	['Orange', '#c2410c'],
	['Rot', '#be123c'],
	['Violett', '#6d28d9'],
	['Grau', '#4b5563'],
]

const CSS = `
.devclaim-color { display: flex; flex-direction: column; gap: 8px; }
.devclaim-color__field { display: flex; gap: 2px; }
.devclaim-color__field > div { flex: 1; min-width: 0; }
.devclaim-color__swatch {
	flex: none; width: 40px; height: 40px; padding: 8px; border: 0; border-radius: 2px; cursor: pointer;
	background: var(--colors-ContrastNeutral, #323232);
}
.devclaim-color__swatch:hover, .devclaim-color__swatch[aria-expanded="true"] {
	background: var(--colors-ContrastDark, #3f3f3f);
}
.devclaim-color__swatch:focus-visible { outline: 2px solid var(--colors-PrimaryBlue, #00adee); }
.devclaim-color__chip { display: block; width: 100%; height: 100%; border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25); }
.devclaim-color__chip--none {
	background: repeating-linear-gradient(45deg, #5a5a5a 0 4px, #3f3f3f 4px 8px);
}
.devclaim-color__invalid input { box-shadow: inset 0 0 0 2px var(--colors-Error, #ff460d); }
.devclaim-color__panel {
	position: fixed; z-index: 100000; box-sizing: border-box;
	display: flex; flex-direction: column; gap: 12px; padding: 12px;
	font-family: 'Noto Sans', sans-serif; color: var(--colors-ContrastBrightest, #fff);
	background: var(--colors-ContrastDarkest, #141414); border: 1px solid var(--colors-ContrastDark, #3f3f3f);
	box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
}
.devclaim-color__panel .react-colorful { width: 100%; height: 160px; gap: 10px; }
.devclaim-color__panel .react-colorful__saturation { border-radius: 2px; border-bottom: 0; }
.devclaim-color__panel .react-colorful__hue { height: 12px; border-radius: 2px; }
.devclaim-color__panel .react-colorful__pointer { width: 20px; height: 20px; border-width: 3px; }
.devclaim-color__label { font-size: 12px; color: var(--colors-ContrastBright, #999); }
.devclaim-color__suggestions { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 6px; }
.devclaim-color__suggestion {
	aspect-ratio: 1; padding: 0; border: 0; border-radius: 50%; cursor: pointer;
	box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.2);
}
.devclaim-color__suggestion:hover { transform: scale(1.12); }
.devclaim-color__suggestion[aria-pressed="true"] {
	box-shadow: 0 0 0 2px var(--colors-ContrastDarkest, #141414), 0 0 0 4px var(--colors-PrimaryBlue, #00adee);
}
.devclaim-color__suggestion:focus-visible { outline: 2px solid var(--colors-PrimaryBlue, #00adee); outline-offset: 2px; }
`

/** the height of the panel, to decide whether it fits below the field */
const PANEL_HEIGHT = 280

/** the place of the panel at the field: below, or above where the window ends; null while closed */
function usePlace(field, open) {
	const [place, setPlace] = React.useState(null)
	React.useLayoutEffect(() => {
		if (!open || !field.current) {
			setPlace(null)
			return
		}
		const update = () => {
			const rect = field.current.getBoundingClientRect()
			const below = window.innerHeight - rect.bottom >= PANEL_HEIGHT + 8 || rect.top < PANEL_HEIGHT + 8
			setPlace({
				left: rect.left,
				width: rect.width,
				...(below ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
			})
		}
		update()
		// the inspector and the dialog scroll in their own boxes: any scroll moves the field
		window.addEventListener('scroll', update, true)
		window.addEventListener('resize', update)
		return () => {
			window.removeEventListener('scroll', update, true)
			window.removeEventListener('resize', update)
		}
	}, [open])
	return place
}

function ColorEditor({ value, commit, id }) {
	const current = HEX.test(value || '') ? value.toLowerCase() : null
	const [text, setText] = React.useState(current || '')
	const [open, setOpen] = React.useState(false)
	const field = React.useRef(null)
	const panel = React.useRef(null)
	const place = usePlace(field, open)
	React.useEffect(() => setText(current || ''), [current])

	// closes on a click outside of field and panel, and on Escape
	React.useEffect(() => {
		if (!open) {
			return
		}
		const outside = (event) => {
			if (!field.current?.contains(event.target) && !panel.current?.contains(event.target)) {
				setOpen(false)
			}
		}
		const escape = (event) => event.key === 'Escape' && setOpen(false)
		document.addEventListener('pointerdown', outside, true)
		document.addEventListener('keydown', escape)
		return () => {
			document.removeEventListener('pointerdown', outside, true)
			document.removeEventListener('keydown', escape)
		}
	}, [open])

	const choose = (next) => {
		setText(next || '')
		commit(next ? next.toLowerCase() : null)
	}
	const type = (next) => {
		const trimmed = next.trim()
		const withHash = trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed
		setText(trimmed)
		if (withHash === '') {
			commit(null)
		} else if (HEX.test(withHash)) {
			commit(withHash.toLowerCase())
		}
	}
	const invalid = text !== '' && !HEX.test(text.startsWith('#') ? text : `#${text}`)

	return (
		<div className="devclaim-color">
			<style>{CSS}</style>
			<div ref={field} className={`devclaim-color__field${invalid ? ' devclaim-color__invalid' : ''}`}>
				<button
					type="button"
					className="devclaim-color__swatch"
					aria-expanded={open}
					aria-label={open ? 'Farbauswahl schließen' : 'Farbe auswählen'}
					title={open ? 'Farbauswahl schließen' : 'Farbe auswählen'}
					onClick={() => setOpen(!open)}
				>
					<span
						className={`devclaim-color__chip${current ? '' : ' devclaim-color__chip--none'}`}
						style={current ? { background: current } : undefined}
					/>
				</button>
				<TextInput id={id} value={text} placeholder="Keine Farbe (neutral)" onChange={type} />
				<IconButton icon="times" title="Keine Farbe (neutral)" disabled={!current} onClick={() => choose(null)} />
			</div>
			{open && place && createPortal(
				<div ref={panel} className="devclaim-color__panel" style={place} role="dialog" aria-label="Farbauswahl">
					<style>{CSS}</style>
					<HexColorPicker color={current || '#0369a1'} onChange={choose} />
					<span className="devclaim-color__label">Vorschläge</span>
					<div className="devclaim-color__suggestions">
						{SUGGESTIONS.map(([label, color]) => (
							<button
								key={color}
								type="button"
								className="devclaim-color__suggestion"
								style={{ background: color }}
								title={label}
								aria-label={label}
								aria-pressed={current === color}
								onClick={() => choose(color)}
							/>
						))}
					</div>
				</div>,
				document.body
			)}
		</div>
	)
}

export function registerColorEditor(globalRegistry) {
	const editors = globalRegistry.get('inspector')?.get('editors')
	if (!editors) {
		console.warn('[Devclaim.NeosUiEditors.ColorEditor]: Could not find the inspector editors registry.')
		return
	}
	editors.set('Devclaim.NeosUiEditors/Inspector/Editors/ColorEditor', { component: ColorEditor })
}
