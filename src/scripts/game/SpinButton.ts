import * as PIXI from "pixi.js";
import { App } from "../system/App";

export class SpinButton {
	button: PIXI.Sprite;
	buttonName: string;

	constructor(buttonName: string, sizes: { width: number; height: number }) {
		this.buttonName = buttonName;
		this.button = App.sprite(this.buttonName);

		this.button.width = sizes.width;
		this.button.height = sizes.height;

		this.button.x = sizes.width / 2;
		this.button.y = sizes.height / 2;
		this.button.anchor.set(0.5);
	}

	setPosition(x: number, y: number): void {
		this.button.x = x;
		this.button.y = y;
	}

	setInteractive(interactive: boolean): void {
		this.button.interactive = interactive;
	}
}
