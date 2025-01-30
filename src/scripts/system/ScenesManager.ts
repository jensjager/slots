import * as PIXI from "pixi.js";
import { App } from "./App";

export class ScenesManager {
	container: PIXI.Container;
	scene: any; // You can specify a more precise type if known

	constructor() {
		this.container = new PIXI.Container();
		this.container.interactive = true;
		this.scene = null;
	}

	start(scene: string): void {
		if (this.scene) {
			this.scene.remove();
		}

		this.scene = new App.config.scenes[scene]();
		this.container.addChild(this.scene.container);
	}
}
