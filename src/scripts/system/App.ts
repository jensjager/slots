import * as PIXI from "pixi.js";
import { Sprite, Application } from "pixi.js";
import { Loader } from "./Loader";
import { ScenesManager } from "./ScenesManager";
import { EventEmitter } from "events";
import { Config } from "../game/Config";
require("gsap/dist/PixiPlugin");
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

class GameApplication extends EventEmitter {
	public app!: Application;
	public config!: Config;
	private scenes!: ScenesManager;
	private loader!: Loader;
	public assets!: Record<string, PIXI.Texture>;

	async run(config: Config): Promise<void> {
		this.config = config;
		this.app = new Application();

		await this.app.init({ resizeTo: window });

		document.body.appendChild(this.app.canvas);

		this.scenes = new ScenesManager();
		this.app.stage.interactive = true;
		this.app.stage.addChild(this.scenes.container);

		this.loader = new Loader();
		this.loader.preload().then((assets) => this.start(assets));
	}

	sprite(key: string): Sprite {
		return new Sprite(this.assets[key]);
	}

	start(assets: any): void {
		this.assets = assets;
		this.scenes.start("Game");
	}
}

export const App = new GameApplication();
