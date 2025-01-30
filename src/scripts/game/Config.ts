import { Game } from "./Game";
import { Tools } from "../system/Tools";

export interface Config {
	loader: any; // Replace 'any' with a more specific type if possible
	scenes: {
		[key: string]: any; // Replace 'any' with a more specific type if possible
	};
	symbols: string[];
}

export const Config: Config = {
	loader: Tools.massiveRequire(
		require["context"]("./../../sprites/", true, /\.(mp3|png|jpe?g)$/)
	),
	scenes: {
		Game: Game,
	},
	symbols: [
		"apple",
		"banana",
		"blueberry",
		"cherry",
		"grape",
		"orange",
		"raspberry",
		"watermelon",
	],
};
