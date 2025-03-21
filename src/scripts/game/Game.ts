import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Scene } from "../system/Scene";
import { Reels } from "./Reels";
import { SpinButton } from "./SpinButton";
import { Tools } from "../system/Tools";
import { Config } from "./Config";

export class Game extends Scene {
	bg: PIXI.Sprite = new PIXI.Sprite();
	reels!: Reels;
	spinButton!: SpinButton;
	balance: number = 5000;
	balanceText!: PIXI.Text;
	spinDuration: number = 2;
	spinReelDelay: number = 0.15;
	betSize: number = Config.betAmounts[0];
	betSizeText!: PIXI.Text;

	spinDistance = 10;
	borderSize = 10;
	reelsHeight = window.innerHeight * (3 / 4);
	symbolPaddingPercentage = 10;
	baseFontSize = 48;
	fontSize =
		this.baseFontSize *
		Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
	mobileFontSize = this.fontSize * 2;

	constructor() {
		super();
		this.create();
	}

	create(): void {
		this.createBackground();
		this.createReels();
		this.createControls();
	}

	createBackground(): void {
		this.bg = App.sprite("bg");

		this.bg.anchor.set(0.5);
		this.bg.y = window.innerHeight / 2;
		this.bg.x = window.innerWidth / 2;
		this.bg.scale.set(window.innerHeight / this.bg.texture.height);
		this.bg.label = "Background";
		this.container.addChild(this.bg);
	}

	createReels(): void {
		/// CHANGING THESE VALUES WILL BREAK PAYLINES AND PAYTABLES
		const reelsCount = 5;
		const symbolsPerReel = 3;
		/// -------------------------------------------------------------------------
		// const spinDistance = 10;
		// const borderSize = 10;
		// const reelsHeight = window.innerHeight * (3 / 4);
		// const symbolPaddingPercentage = 10;
		if (App.isMobile) {
			var symbolSizeVar = window.innerWidth / (reelsCount + 1);
		} else {
			var symbolSizeVar =
				(this.symbolPaddingPercentage * this.reelsHeight) /
				((this.symbolPaddingPercentage + 1) * symbolsPerReel - 1);
		}
		const symbolSize = symbolSizeVar;
		const symbolPadding = symbolSize / this.symbolPaddingPercentage;

		this.reels = new Reels(
			reelsCount,
			symbolsPerReel,
			symbolSize,
			symbolPadding,
			this.spinDistance
		);

		this.reels.reelsContainer.x =
			(window.innerWidth + symbolSize + 5 - this.reels.totalWidth) / 2;

		this.reels.reelsContainer.y = App.isMobile
			? (window.innerHeight - this.reels.totalHeight) / 2
			: symbolSize / 2 + symbolPadding * 2 + this.borderSize;

		const border = new PIXI.Graphics();
		border.label = "Reels Border";
		let bounds = this.reels.reelsContainer.getBounds();
		border.rect(
			bounds.minX - this.borderSize,
			bounds.minY - this.borderSize,
			bounds.maxX - bounds.minX + 2 * this.borderSize,
			bounds.maxY - bounds.minY + 2 * this.borderSize
		);
		border.fill({ color: "#79166f" });

		this.container.addChild(border);
		this.container.addChild(this.reels.reelsContainer);
	}

	createControls(): void {
		let bounds = this.reels.reelsContainer.getBounds();
		const controlsBackground = new PIXI.Graphics();
		controlsBackground.label = "Controls Background";
		controlsBackground
			.rect(
				bounds.minX - 10,
				bounds.maxY,
				bounds.width + 20,
				window.innerHeight / 10
			)
			.fill("#79166f");
		const controlsContainer = new PIXI.Container();
		controlsContainer.addChild(controlsBackground);

		this.container.addChild(controlsContainer);
		this.createSpinButton(bounds, this.container);
		this.createBalance(
			controlsContainer.getLocalBounds(),
			controlsContainer
		);
		this.createBetSelector(
			controlsContainer.getLocalBounds(),
			controlsContainer
		);
	}

	createSpinButton(
		bounds: PIXI.Bounds,
		controlsContainer: PIXI.Container
	): void {
		this.spinButton = new SpinButton("spin_default", "spin_pressed", {
			width: this.reels.symbolSize,
			height: this.reels.symbolSize,
		});
		this.spinButton.setPosition(
			bounds.maxX + (App.isMobile ? -25 : 10),
			bounds.maxY + (App.isMobile ? 40 : 20)
		);
		this.spinButton.button.on("pointertap", () => {
			if (this.reels.spinning) {
				console.log("Reels are spinning");
				return;
			}
			console.log("Spin");
			this.balance =
				Math.round(
					(this.balance - this.betSize + Number.EPSILON) * 100
				) / 100;
			this.balanceText.text = `Balance: ${this.balance}`;

			this.spinReels();
		});
		this.spinButton.button.eventMode = "static";
		this.spinButton.button.cursor = "pointer";
		controlsContainer.addChild(this.spinButton.button);
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
					this.reels.showWinLines(
						wins.map((win) => win.payline),
						2
					);
					this.balance += Math.round(
						((wins.reduce(
							(acc, win) => acc + win.win * this.betSize,
							0
						) +
							Number.EPSILON) *
							100) /
							100
					);
					console.log(
						"You won! Total win: ",
						Math.round(
							((wins.reduce(
								(acc, win) => acc + win.win * this.betSize,
								0
							) +
								Number.EPSILON) *
								100) /
								100
						)
					);
					this.balanceText.text = `Balance: ${this.balance}`;
				}
			});
	}

	createBalance(
		bounds: PIXI.Bounds,
		controlsContainer: PIXI.Container
	): void {
		this.balanceText = new PIXI.Text({
			text: `Balance: ${this.balance}`,
			style: {
				fontSize: App.isMobile ? this.mobileFontSize : this.fontSize,
				fill: 0x000000,
			},
		});
		this.balanceText.label = "Balance";
		this.balanceText.anchor.set(0.5);
		this.balanceText.x = bounds.minX + this.balanceText.width / 2 + 20;
		this.balanceText.y = bounds.minY + bounds.height / 2;

		controlsContainer.addChild(this.balanceText);
	}

	createBetSelector(
		bounds: PIXI.Bounds,
		controlsContainer: PIXI.Container
	): void {
		const padding = App.isMobile
			? this.mobileFontSize * 2
			: this.fontSize * 2;
		const decrease = App.sprite("minus");
		decrease.label = "Increase Bet";
		decrease.anchor.set(0.5);
		decrease.setSize(App.isMobile ? this.mobileFontSize : this.fontSize);
		decrease.x = window.innerWidth / 2 + this.reels.symbolSize / 2;
		decrease.y = bounds.minY + bounds.height / 2;
		decrease.cursor = "pointer";
		decrease.eventMode = "static";
		decrease.on("pointertap", () => {
			this.changeBetAmount("decrease");
		});

		const increase = App.sprite("plus");
		increase.label = "Increase Bet";
		increase.anchor.set(0.5);
		increase.setSize(App.isMobile ? this.mobileFontSize : this.fontSize);
		increase.x =
			window.innerWidth / 2 + this.reels.symbolSize / 2 + padding * 2;
		increase.y = bounds.minY + bounds.height / 2;
		increase.cursor = "pointer";
		increase.eventMode = "static";
		increase.on("pointertap", () => {
			this.changeBetAmount("increase");
		});

		this.betSizeText = new PIXI.Text({
			text: this.betSize,
			style: {
				fontSize: App.isMobile ? this.mobileFontSize : this.fontSize,
				fill: 0x000000,
			},
		});
		this.betSizeText.label = "Bet Amount";
		this.betSizeText.anchor.set(0.5);
		this.betSizeText.x =
			window.innerWidth / 2 + this.reels.symbolSize / 2 + padding;
		this.betSizeText.y = bounds.minY + bounds.height / 2;

		controlsContainer.addChild(decrease);
		controlsContainer.addChild(this.betSizeText);
		controlsContainer.addChild(increase);
	}

	changeBetAmount(direction: string): void {
		const maxIndex = Config.betAmounts.length - 1;
		const minIndex = 0;

		if (direction === "decrease") {
			let currentBetIndex = Config.betAmounts.indexOf(this.betSize);
			if (currentBetIndex <= minIndex) return;
			this.betSize = Config.betAmounts[currentBetIndex - 1];
			this.betSizeText.text = this.betSize;
		} else if (direction === "increase") {
			let currentBetIndex = Config.betAmounts.indexOf(this.betSize);
			if (currentBetIndex >= maxIndex) return;
			this.betSize = Config.betAmounts[currentBetIndex + 1];
			this.betSizeText.text = this.betSize;
		}
	}
}
