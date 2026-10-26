import * as React from 'react'
import { Icon } from '@neos-project/react-ui-components'

/**
 * A whole number: minus and plus around the value, which can also be typed; the arrow keys count up and down (with
 * Shift by ten). Options: min, max, step (of the buttons and keys, default 1), unit (shown after the value) and
 * placeholder. A number beyond the range becomes the nearest limit: above max at once, below min when the field is
 * left or Enter is pressed (it may still be typed on); a decimal is rounded. At a limit its button fades out. Below
 * the field the range ("1–24", "≥ 0", "≤ 24"), if min or max is set.
 */
const CSS = `
.devclaim-number__field {
	display: flex; height: 40px; background: var(--colors-ContrastDarkest, #141414); border-radius: 2px;
	overflow: hidden;
}
.devclaim-number__button {
	flex: none; width: 40px; display: flex; align-items: center; justify-content: center; padding: 0; border: 0;
	color: var(--colors-ContrastBrightest, #fff); background: var(--colors-ContrastDark, #323232); cursor: pointer;
}
.devclaim-number__button:hover:not(:disabled) { background: var(--colors-PrimaryBlue, #00adee); }
.devclaim-number__button:disabled { opacity: 0.35; cursor: default; }
.devclaim-number__value {
	flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.devclaim-number__input {
	width: 100%; min-width: 0; padding: 0; border: 0; outline: 0; background: none; text-align: center;
	font: inherit; font-size: 14px; font-variant-numeric: tabular-nums; color: var(--colors-ContrastBrightest, #fff);
}
.devclaim-number__input::placeholder { color: var(--colors-ContrastBright, #999); }
.devclaim-number__unit { flex: none; padding-right: 8px; font-size: 12px; color: var(--colors-ContrastBright, #999); }
.devclaim-number__range { margin-top: 6px; font-size: 12px; color: var(--colors-ContrastBright, #999); }
`

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

/** the number in a typed text ("12", "-3", "2,5"); null: none */
const parse = (text) => {
	const trimmed = text.trim().replace(',', '.')
	if (trimmed === '' || trimmed === '-') {
		return null
	}
	const number = Number(trimmed)
	return Number.isFinite(number) ? number : null
}

export function createNumberEditor(translate) {
	const t = (id, fallback) => translate(id, fallback, {}, 'Devclaim.NeosUiEditors', 'NumberEditor')

	return function NumberEditor({ value, commit, id, options = {} }) {
		const { min, max, step = 1, unit, placeholder, disabled = false } = options
		const lowest = isNumber(min) ? min : -Infinity
		const highest = isNumber(max) ? max : Infinity
		const saved = isNumber(value) ? value : null
		const [text, setText] = React.useState(saved === null ? '' : String(saved))
		React.useEffect(() => setText(saved === null ? '' : String(saved)), [saved])

		const clamp = (number) => Math.min(highest, Math.max(lowest, Math.round(number)))
		const save = (number) => {
			setText(String(number))
			if (number !== saved) {
				commit(number)
			}
		}
		// what may stand in the field while typing: digits, a leading minus (if negative numbers are allowed), a comma
		const type = (event) => {
			const next = event.target.value.replace(lowest >= 0 ? /[^\d.,]/g : /[^\d.,-]/g, '')
			const number = parse(next)
			if (number !== null && number > highest) {
				save(highest)
			} else {
				setText(next)
				if (number !== null && Number.isInteger(number) && number >= lowest) {
					save(number)
				}
			}
		}
		// leaving the field (or Enter): the nearest valid number, or the saved one if nothing is typed
		const settle = () => {
			const number = parse(text)
			if (number === null) {
				setText(saved === null ? '' : String(saved))
			} else {
				save(clamp(number))
			}
		}
		const current = parse(text) ?? saved
		const count = (direction, factor = 1) => {
			const from = current ?? (isNumber(min) ? min : 0)
			save(clamp(from + direction * step * factor))
		}
		const keyDown = (event) => {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				event.preventDefault()
				count(event.key === 'ArrowUp' ? 1 : -1, event.shiftKey ? 10 : 1)
			} else if (event.key === 'Enter') {
				settle()
			}
		}
		const range = isNumber(min) && isNumber(max) ? `${min}–${max}`
			: isNumber(min) ? `≥ ${min}`
			: isNumber(max) ? `≤ ${max}`
			: null

		return (
			<div className="devclaim-number">
				<style>{CSS}</style>
				<div className="devclaim-number__field">
					<button
						type="button"
						className="devclaim-number__button"
						aria-label={t('decrease', 'Decrease')}
						title={t('decrease', 'Decrease')}
						disabled={disabled || (current !== null && current <= lowest)}
						onClick={() => count(-1)}
					>
						<Icon icon="minus" />
					</button>
					<span className="devclaim-number__value">
						<input
							id={id}
							className="devclaim-number__input"
							type="text"
							inputMode="numeric"
							value={text}
							placeholder={placeholder}
							disabled={disabled}
							onChange={type}
							onKeyDown={keyDown}
							onBlur={settle}
						/>
						{unit && <span className="devclaim-number__unit">{unit}</span>}
					</span>
					<button
						type="button"
						className="devclaim-number__button"
						aria-label={t('increase', 'Increase')}
						title={t('increase', 'Increase')}
						disabled={disabled || (current !== null && current >= highest)}
						onClick={() => count(1)}
					>
						<Icon icon="plus" />
					</button>
				</div>
				{range && <div className="devclaim-number__range">{range}</div>}
			</div>
		)
	}
}

export function registerNumberEditor(globalRegistry) {
	const editors = globalRegistry.get('inspector')?.get('editors')
	if (!editors) {
		console.warn('[Devclaim.NeosUiEditors.NumberEditor]: Could not find the inspector editors registry.')
		return
	}
	const i18n = globalRegistry.get('i18n')
	const translate = (id, fallback, params, packageKey, sourceName) =>
		i18n ? i18n.translate(id, fallback, params, packageKey, sourceName) : fallback
	editors.set('Devclaim.NeosUiEditors/Inspector/Editors/NumberEditor', { component: createNumberEditor(translate) })
}
