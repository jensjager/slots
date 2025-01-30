import * as PIXI from "pixi.js";
import { App } from "../system/App";

export class Symbol {
	symbol: PIXI.Sprite;
	symbolName: string;

	constructor(symbolName: string, sizes: { width: number; height: number }) {
		this.symbolName = symbolName;
		this.symbol = App.sprite(this.symbolName);

		this.symbol.width = sizes.width;
		this.symbol.height = sizes.height;

		// const scaleFactor = 1;

		// this.symbol.scale.set(
		// 	scaleFactor * (sizes.width / this.symbol.width),
		// 	scaleFactor * (sizes.height / this.symbol.height)
		// );

		this.symbol.x = sizes.width / 2;
		this.symbol.y = sizes.height / 2;
		this.symbol.anchor.set(0.5);
	}

	setPosition(x: number, y: number): void {
		this.symbol.x = x;
		this.symbol.y = y;
	}
}
