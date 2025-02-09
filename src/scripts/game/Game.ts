import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Scene } from "../system/Scene";
import { Reels } from "./Reels";
import { SpinButton } from "./SpinButton";
import { Tools } from "../system/Tools";

export class Game extends Scene {
	bg: PIXI.Sprite = new PIXI.Sprite();
	reels!: Reels;
	spinButton!: SpinButton;
	balance: number = 1000;
	balanceText!: PIXI.Text;
	spinDuration: number = 2;
	spinReelDelay: number = 0.15;

	constructor() {
		super();
		this.create();
	}

	create(): void {
		this.createBackground();
		this.createReels();
		this.createSpinButton();
		this.createBalance();
	}

	createBackground(): void {
		this.bg = App.sprite("bg");
		this.bg.width = window.innerWidth;
		this.bg.height = window.innerHeight;
		this.container.addChild(this.bg);
	}

	createReels(): void {
		/// CHANGING THESE VALUES WILL BREAK PAYLINES AND PAYTABLES
		const reelsCount = 5;
		const symbolsPerReel = 3;
		/// -------------------------------------------------------------------------

		const symbolSize = 175;
		const symbolPadding = 20;
		const spinDistance = 10;
		this.reels = new Reels(
			reelsCount,
			symbolsPerReel,
			symbolSize,
			symbolPadding,
			spinDistance
		);

		this.reels.reelsContainer.x =
			(window.innerWidth - this.reels.totalWidth) / 2 +
			symbolPadding * (this.reels.reelsCount - 1);

		this.reels.reelsContainer.y = window.innerHeight / 2 - symbolSize - 125;
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
			this.balance -= 10;
			this.balanceText.text = `Balance: ${this.balance}`;

			this.spinReels();
		});
		this.spinButton.button.eventMode = "static";
		this.spinButton.button.cursor = "pointer";
		this.container.addChild(this.spinButton.button);
	}

	async spinReels(): Promise<void> {
		this.reels.stopWinLines();
		this.reels
			.spinReels(this.spinDuration, this.spinReelDelay)
			.then((symbolsResult: number[][]) => {
				const wins = Tools.checkWins(
					symbolsResult,
					App.config.paylines
				);
				if (wins.length > 0) {
					this.reels.showWinLines(wins.map((win) => win.payline), 2);
					this.balance += wins.reduce(
						(acc, win) => acc + win.win * 10,
						0
					);
					console.log(
						"You won! Total win: ",
						wins.reduce((acc, win) => acc + win.win * 10, 0)
					);

					this.balanceText.text = `Balance: ${this.balance}`;
				}
			});
	}

	createBalance(): void {
		this.balanceText = new PIXI.Text(`Balance: ${this.balance}`, {
			fontSize: 24,
			fill: 0x000000,
		});
		this.balanceText.anchor.set(0.5);
		this.balanceText.x = window.innerWidth / 2;
		this.balanceText.y = window.innerHeight - 50;
		this.container.addChild(this.balanceText);
	}
}
