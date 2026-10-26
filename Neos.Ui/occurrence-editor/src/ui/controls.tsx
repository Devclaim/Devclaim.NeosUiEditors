import React from 'react'
import styled from 'styled-components'

/** The colours of the Neos UI (inputs #323232, focused #3f3f3f) and the selected state: a blue line on top, tinted */
export const colors = {
	field: '#323232',
	hover: '#3f3f3f',
	panel: '#141414',
	line: '#323232',
	muted: '#999',
	text: '#ccc',
	blue: '#00adee',
	/** rgba(0, 173, 238, .14) on the inspector (#222), opaque: the same tint on every background */
	selected: '#1d353f',
	orange: '#ff8700',
}

const OptionButton = styled.button<{ selected: boolean }>`
	flex: 1;
	min-width: 0;
	height: 30px;
	margin: 0;
	padding: 0 2px;
	border: 0;
	border-radius: 0 0 2px 2px;
	background: ${({ selected }) => (selected ? colors.selected : colors.field)};
	box-shadow: ${({ selected }) => (selected ? `inset 0 2px 0 ${colors.blue}` : 'none')};
	color: ${({ selected }) => (selected ? '#fff' : colors.text)};
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;

	&:hover {
		background: ${({ selected }) => (selected ? colors.selected : colors.hover)};
		color: #fff;
	}

	&:focus-visible {
		outline: 2px solid ${colors.blue};
		outline-offset: -2px;
	}
`

const Row = styled.div<{ columns?: number }>`
	display: ${({ columns }) => (columns ? 'grid' : 'flex')};
	grid-template-columns: ${({ columns }) => (columns ? `repeat(${columns}, minmax(0, 1fr))` : 'none')};
	gap: 3px;
`

export type Option<T> = { value: T; label: string; title?: string }

type SegmentedProps<T> = {
	options: Option<T>[]
	value: T
	onChange(value: T): void
	label?: string
}

/** One of a few options, all of them visible (instead of a dropdown or tabs) */
export function Segmented<T extends string | number>({ options, value, onChange, label }: SegmentedProps<T>) {
	return (
		<Row role="radiogroup" aria-label={label}>
			{options.map((option) => (
				<OptionButton
					key={option.value}
					type="button"
					role="radio"
					aria-checked={option.value === value}
					title={option.title}
					selected={option.value === value}
					onClick={() => option.value !== value && onChange(option.value)}
				>
					{option.label}
				</OptionButton>
			))}
		</Row>
	)
}

type ChipsProps<T> = {
	options: Option<T>[]
	values: T[]
	onChange(values: T[]): void
	/** a grid of this many columns (the days of a month), else one row */
	columns?: number
	label?: string
}

/** Several of the options (weekdays, positions, days, months); one stays selected, the rule needs one */
export function Chips<T extends string | number>({ options, values, onChange, columns, label }: ChipsProps<T>) {
	const toggle = (value: T) => {
		if (values.includes(value)) {
			if (values.length > 1) {
				onChange(values.filter((selected) => selected !== value))
			}
			return
		}
		// in the order of the options
		onChange(options.map((option) => option.value).filter((option) => option === value || values.includes(option)))
	}

	return (
		<Row columns={columns} role="group" aria-label={label}>
			{options.map((option) => (
				<OptionButton
					key={option.value}
					type="button"
					aria-pressed={values.includes(option.value)}
					title={option.title}
					selected={values.includes(option.value)}
					onClick={() => toggle(option.value)}
				>
					{option.label}
				</OptionButton>
			))}
		</Row>
	)
}

const StepperRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: ${colors.text};
	font-size: 13px;
`

const StepperField = styled.div`
	display: flex;
	align-items: center;
	height: 30px;
	border-radius: 2px;
	background: ${colors.field};

	button {
		width: 28px;
		height: 30px;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: ${colors.muted};
		font-size: 16px;
		cursor: pointer;
	}

	button:hover:enabled {
		background: ${colors.hover};
		color: #fff;
	}

	button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	input {
		width: 36px;
		height: 30px;
		margin: 0;
		padding: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: #fff;
		font: inherit;
		font-weight: 700;
		text-align: center;
		-moz-appearance: textfield;
	}

	input::-webkit-inner-spin-button,
	input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	&:focus-within {
		background: ${colors.hover};
	}
`

type StepperProps = {
	value: number
	onChange(value: number): void
	prefix?: string
	suffix?: string
	min?: number
}

/** A number in a sentence: "Alle [−] 2 [+] Wochen" */
export function Stepper({ value, onChange, prefix, suffix, min = 1 }: StepperProps) {
	const set = (next: number) => onChange(Math.max(min, Number.isFinite(next) ? Math.round(next) : min))

	return (
		<StepperRow>
			{prefix && <span>{prefix}</span>}
			<StepperField>
				<button type="button" aria-label="−" disabled={value <= min} onClick={() => set(value - 1)}>
					−
				</button>
				<input type="number" min={min} value={value} onChange={(event) => set(Number(event.target.value))} />
				<button type="button" aria-label="+" onClick={() => set(value + 1)}>
					+
				</button>
			</StepperField>
			{suffix && <span>{suffix}</span>}
		</StepperRow>
	)
}

const SectionElement = styled.section<{ changed: boolean }>`
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 14px 0;
	border-top: 1px solid ${colors.line};

	/* the first one right below the label of the property */
	&:first-child {
		padding-top: 4px;
		border-top: 0;
	}

	&:first-child::before {
		top: 4px;
	}

	/* changed: an orange bar in the gutter of the inspector, as for the nodes with changes in the trees */
	&::before {
		content: '';
		display: ${({ changed }) => (changed ? 'block' : 'none')};
		position: absolute;
		top: 14px;
		bottom: 14px;
		left: -10px;
		width: 3px;
		border-radius: 2px;
		background: ${colors.orange};
	}
`

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	min-height: 18px;
`

/** The title: opens and closes the section (the whole row, with the chevron before the title) */
const SectionToggle = styled.button<{ open: boolean }>`
	display: flex;
	flex: 1;
	align-items: center;
	gap: 6px;
	min-width: 0;
	margin: -4px 0 -4px -4px;
	padding: 4px;
	border: 0;
	border-radius: 2px;
	background: transparent;
	color: ${colors.muted};
	font-size: 11px;
	font-weight: 400;
	letter-spacing: 0.06em;
	text-align: left;
	text-transform: uppercase;
	cursor: pointer;

	&:hover {
		color: #fff;
	}

	&:focus-visible {
		outline: 2px solid ${colors.blue};
		outline-offset: -2px;
	}

	/* a chevron of borders: right when closed, down when open */
	&::before {
		content: '';
		flex: none;
		width: 5px;
		height: 5px;
		margin: 0 2px;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: ${({ open }) => (open ? 'translateY(-1px) rotate(45deg)' : 'rotate(-45deg)')};
	}
`

const SectionAside = styled.span`
	color: ${colors.muted};
	font-size: 11px;
`

const ResetButton = styled.button`
	margin: 0 -6px 0 0;
	padding: 2px 6px;
	border: 0;
	border-radius: 2px;
	background: transparent;
	color: ${colors.orange};
	font-size: 11px;
	cursor: pointer;

	&:hover {
		background: ${colors.field};
	}
`

type SectionProps = {
	title: string
	/** shown on the right, without changes (e.g. a count) */
	aside?: string | number
	changed?: boolean
	resetLabel?: string
	onReset?(): void
	children: JSX.Element | JSX.Element[]
}

/**
 * A part of the editor, open at first and closed by its title; with changes, an orange bar and the button to reset
 * them to the applied value (both also while it is closed)
 */
export function Section({ title, aside, changed = false, resetLabel, onReset, children }: SectionProps) {
	const [isOpen, setOpen] = React.useState(true)

	return (
		<SectionElement changed={changed}>
			<SectionHeader>
				<SectionToggle type="button" open={isOpen} aria-expanded={isOpen} onClick={() => setOpen(!isOpen)}>
					{title}
				</SectionToggle>
				{changed && onReset ? (
					<ResetButton type="button" onClick={onReset}>
						{resetLabel}
					</ResetButton>
				) : (
					aside !== undefined && <SectionAside>{aside}</SectionAside>
				)}
			</SectionHeader>
			{isOpen && children}
		</SectionElement>
	)
}
