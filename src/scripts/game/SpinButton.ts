import * as PIXI from "pixi.js";
import { App } from "../system/App";

export class SpinButton {
	button: PIXI.Sprite;
	buttonDefault: PIXI.Texture;
	buttonPressed: PIXI.Texture;
	pressed: boolean = false;

	constructor(
		buttonDefault: string,
		buttonPressed: string,
		sizes: { width: number; height: number }
	) {
		this.button = App.sprite(buttonDefault);
		this.button.label = "Spin Button";
		this.buttonDefault = App.texture(buttonDefault);
		this.buttonPressed = App.texture(buttonPressed);

		this.button.width = sizes.width;
		this.button.height = sizes.height;

		this.button.x = sizes.width / 2;
		this.button.y = sizes.height / 2;
		this.button.anchor.set(0.5);

		this.button.on("pointerdown", () => {
			this.button.texture = this.buttonPressed;
		});

		this.button.on("pointerupoutside", () => {
			this.button.texture = this.buttonDefault;
		});

		this.button.on("pointerup", () => {
			this.button.texture = this.buttonDefault;
		});
	}

	setPosition(x: number, y: number): void {
		this.button.x = x;
		this.button.y = y;
	}

	setInteractive(interactive: boolean): void {
		this.button.interactive = interactive;
	}
}
