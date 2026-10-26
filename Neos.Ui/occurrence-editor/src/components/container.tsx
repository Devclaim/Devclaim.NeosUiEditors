import styled from 'styled-components'

/** The editor; changes are marked on its sections (src/ui/controls.tsx), not around all of it */
export const EditorContainer = styled.div<{ disabled?: boolean }>`
	width: 100%;
	max-width: 550px;
	justify-self: center;
	display: flex;
	flex-direction: column;
	margin-top: 8px;

	/* the clear button of the start date: an event has one */
	.hide-date-reset-button {
		display: none;
	}

	${({ disabled }) =>
		disabled &&
		`
			cursor: not-allowed;
			opacity: .5;
			> * {
				pointer-events: none;
			}
		`
	}
`;

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export const RowContainer = styled.div`
	width: 100%;
	display: flex;
	gap: 8px;
`
