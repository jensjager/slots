import * as PIXI from "pixi.js";
import { App } from "./App";

export class Scene {
	container: PIXI.Container;

	constructor() {
		this.container = new PIXI.Container();
		this.container.interactive = true;
		App.app.ticker.add(this.update, this);
	}

	create(): void {}
	update(): void {}
	destroy(): void {}

	remove(): void {
		App.app.ticker.remove(this.update, this);
		this.destroy();
	}
}
