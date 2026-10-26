import styled from 'styled-components'

/** "+ Exception", "+ Date": a link under the dates, quiet as the buttons of the date picker */
export const AddButton = styled.button`
	align-self: flex-start;
	height: 28px;
	margin: 0 0 0 -8px;
	padding: 0 8px;
	border: 0;
	border-radius: 2px;
	background: transparent;
	color: #00adee;
	font-size: 13px;
	cursor: pointer;

	&:hover {
		background: #323232;
		color: #35c3f8;
	}
`
