import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Scene } from "../system/Scene";
import { Reels } from "./Reels";
import { SpinButton } from "./SpinButton";

export class Game extends Scene {
	bg: PIXI.Sprite = new PIXI.Sprite();
	reels!: Reels;
	spinButton!: SpinButton;

	constructor() {
		super();
		this.create();
	}

	create(): void {
		this.createBackground();
		this.createReels();
		this.createSpinButton();
	}

	createBackground(): void {
		this.bg = App.sprite("bg");
		this.bg.width = window.innerWidth;
		this.bg.height = window.innerHeight;
		this.container.addChild(this.bg);
	}

	createReels(): void {
		const reelsCount = 5;
		const symbolsPerReel = 3;
		const symbolSize = 175;
		const symbolPadding = 10;
		this.reels = new Reels(reelsCount, symbolsPerReel, symbolSize, symbolPadding);
		this.container.addChild(this.reels.reelsContainer);
	}

	createSpinButton(): void {
		this.spinButton = new SpinButton("spin", {
			width: 125,
			height: 125,
		});
		this.spinButton.setPosition(
			window.innerWidth / 2,
			this.reels.totalHeight / 2 + window.innerHeight / 2
		);
		this.spinButton.button.on("click", () => {
			if (this.reels.spinning) {
				console.log("Reels are spinning");

				return;
			}
			console.log("Spin");

			this.reels.spinning = true;
			this.reels.spinReels().then(() => {
				this.reels.spinning = false;
			});
		});
		this.spinButton.button.eventMode = "static";
		this.spinButton.button.cursor = "pointer";
		this.container.addChild(this.spinButton.button);
	}
}
