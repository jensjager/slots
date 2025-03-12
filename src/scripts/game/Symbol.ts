import * as PIXI from "pixi.js";
import { App } from "../system/App";

export class Symbol {
	symbol: PIXI.Sprite;
	symbolName: string;

	constructor(symbolName: string, sizes: { width: number; height: number }) {
		this.symbolName = symbolName;
		this.symbol = App.sprite(this.symbolName);
		// this.symbol.scale.set();

		this.symbol.width = sizes.width;
		this.symbol.height = sizes.height;

		this.symbol.x = sizes.width / 2;
		this.symbol.y = sizes.height / 2;
		this.symbol.anchor.set(0.5);
		this.symbol.label = this.symbolName;
	}

	setPosition(x: number, y: number): void {
		this.symbol.x = x;
		this.symbol.y = y;
	}
}
