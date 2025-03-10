import { useState } from "react";

export type DropItem = {
	text: string;
	fn: () => void;
};

export default function Dropdown(props: { text: string; items: DropItem[] }) {
	const [currentChoice, setCurrentChoice] = useState(0);

	return (
		<button
			onClick={props.items[currentChoice].fn}
			className="bordered"
			style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
		>
			<span style={{ marginRight: "5px" }}>{props.text}</span>
			{
				<select
					onChange={(e) => {
						e.stopPropagation();
						setCurrentChoice(+e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{props.items.map((item, index) => (
						<option value={index}>{item.text}</option>
					))}
				</select>
			}
		</button>
	);
}
