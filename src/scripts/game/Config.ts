import { Game } from "./Game";
import { Tools } from "../system/Tools";

export interface Config {
	loader: any; // Replace 'any' with a more specific type if possible
	scenes: {
		[key: string]: any; // Replace 'any' with a more specific type if possible
	};
	symbols: Map<number, string>;
	paytable: Map<number, { [key: number]: number }>;
	paylines: number[][];
	wins: { payline: number; symbol: number; win: number }[];
}

export const Config: Config = {
	loader: Tools.massiveRequire(
		require["context"]("./../../sprites/", true, /\.(mp3|png|jpe?g)$/)
	),
	scenes: {
		Game: Game,
	},
	symbols: new Map<number, string>([
		[1, "apple"],
		[2, "banana"],
		[3, "blueberry"],
		[4, "cherry"],
		[5, "grape"],
		[6, "orange"],
		[7, "raspberry"],
		[8, "watermelon"],
		[9, "gem"],
		[10, "wild"],
	]),
	paytable: new Map<number, { [key: number]: number }>([
		[1, { 3: 1.0, 4: 2.0, 5: 5.0 }], // Apple: 1x, 2x, 5x
		[2, { 3: 1.5, 4: 3.0, 5: 7.5 }], // Banana: 1.5x, 3x, 7.5x
		[3, { 3: 2.0, 4: 4.0, 5: 10.0 }], // Blueberry: 2x, 4x, 10x
		[4, { 3: 2.5, 4: 5.0, 5: 12.5 }], // Cherry: 2.5x, 5x, 12.5x
		[5, { 3: 3.0, 4: 6.0, 5: 15.0 }], // Grape: 3x, 6x, 15x
		[6, { 3: 4.0, 4: 8.0, 5: 20.0 }], // Orange: 4x, 8x, 20x
		[7, { 3: 5.0, 4: 10.0, 5: 25.0 }], // Raspberry: 5x, 10x, 25x
		[8, { 3: 10.0, 4: 20.0, 5: 50.0 }], // Watermelon: 10x, 20x, 50x
		[9, { 3: 25.0, 4: 50.0, 5: 100.0 }], // Gem: 25x, 50x, 100x
		[10, { 3: 5.0, 4: 10.0, 5: 25.0 }], // Wild: 0x, 0x, 0x
	]),
	paylines: [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0],
		[2, 2, 2, 2, 2],
		[0, 1, 2, 1, 0],
		[2, 1, 0, 1, 2],
		[0, 0, 1, 2, 2],
		[2, 2, 1, 0, 0],
		[1, 0, 0, 0, 1],
		[1, 2, 2, 2, 1],
	],
	wins: [],
};
