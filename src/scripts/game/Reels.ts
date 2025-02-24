import * as PIXI from "pixi.js";
import { Reel } from "./Reel";
import { Tools } from "../system/Tools";
import { App } from "../system/App";
import { StaticPaylines } from "./paylines/StaticPaylines";

export class Reels {
	reelsContainer: PIXI.Container = new PIXI.Container();
	reels: Reel[] = [];
	mask: PIXI.Graphics = new PIXI.Graphics();
	reelsCount: number;
	symbolSize: number;
	symbolsPerReel: number;
	totalWidth: number;
	totalHeight: number;
	spinning: boolean = false;
	symbolPadding: number;
	spinDistance: number;
	winLines: PIXI.Graphics[];
	winLineInterval: ReturnType<typeof setInterval> | null = null;
	background: PIXI.Container = new PIXI.Container();

	constructor(
		reelsCount: number,
		symbolsPerReel: number,
		symbolSize: number,
		symbolPadding: number,
		spinDistance: number
	) {
		this.reelsCount = reelsCount;
		this.symbolSize = symbolSize;
		this.symbolsPerReel = symbolsPerReel;
		this.symbolPadding = symbolPadding;
		this.spinDistance = spinDistance;

		this.totalWidth = this.calculateTotalWidth();
		this.totalHeight = this.calculateTotalHeight();

		this.createReels(reelsCount, symbolSize);
		this.createMask(this.totalHeight, this.totalWidth);
		this.createBackground();
		this.reelsContainer.addChild(this.background);

		this.winLines = this.createWinLines();
	}

	createBackground() {
		this.background.setSize({
			width: this.totalWidth,
			height: this.totalHeight,
		});
		this.background.position = {
			x: 0,
			y: this.symbolSize - this.symbolPadding,
		};
		for (let i = 0; i < this.reelsCount; i++) {
			const reelBackground = App.sprite("reelBackground");
			reelBackground.anchor = 0.5;
			reelBackground.width = this.symbolSize + this.symbolPadding;
			reelBackground.height = this.totalHeight;
			reelBackground.x =
				reelBackground.width * i + this.symbolPadding / 2;
			reelBackground.y = this.symbolPadding;
			this.background.addChild(reelBackground);
		}
		this.background.zIndex = -1;
	}

	/**
	 * Calculate the total width of the reels container
	 * @returns {number} The total width of the reels container
	 */
	calculateTotalWidth(): number {
		return (
			this.reelsCount * this.symbolSize +
			this.symbolPadding * (this.reelsCount + 1)
		);
	}

	/**
	 * Calculate the total height of the reels container
	 * @returns {number} The total height of the reels container
	 */
	calculateTotalHeight(): number {
		return (
			this.symbolSize * this.symbolsPerReel +
			this.symbolPadding * (this.symbolsPerReel + 1)
		);
	}

	/**
	 * Create reels with the specified number of columns and symbol size
	 * @param  {number} columns Number of reels
	 * @param  {number} symbolSize Size of the symbol
	 */
	createReels(columns: number, symbolSize: number): void {
		for (let i = 0; i < columns; i++) {
			const reel = new Reel(
				symbolSize,
				Tools.randomNumbers(
					1,
					App.config.symbols.size,
					this.symbolsPerReel
				),
				this.symbolPadding,
				this.spinDistance
			);
			this.reels.push(reel);
			reel.reelContainer.x =
				i * symbolSize +
				i * this.symbolPadding +
				this.symbolPadding / 2;
			reel.reelContainer.y = this.symbolPadding;
			this.reelsContainer.addChild(reel.reelContainer);
		}
	}

	/**
	 * Spin reels with the specified duration and delay
	 * @param  {number} duration Duration of the spin animation
	 * @param  {number} delay Delay between each reel spin
	 * @returns {Promise<number[][]>} The result of the spin
	 */
	async spinReels(duration: number, delay: number): Promise<number[][]> {
		if (this.spinning) return Promise.resolve([]);
		this.spinning = true;

		const totalSpinDistance =
			this.spinDistance *
			this.symbolsPerReel *
			(this.symbolSize + this.symbolPadding);

		let spinResult: number[][] = [];
		let currentDelay = 0;
		const spinPromises = this.reels.map((reel) => {
			const newSymbols = Tools.randomNumbers(
				1,
				App.config.symbols.size,
				this.symbolsPerReel * this.spinDistance
			);
			const symbolsResult = newSymbols
				.slice(-this.symbolsPerReel)
				.reverse();
			spinResult.push(symbolsResult);

			reel.createSymbols(newSymbols, this.symbolsPerReel);
			const spinPromise = reel.spin(
				duration,
				currentDelay,
				totalSpinDistance
			);

			currentDelay += delay;
			return spinPromise;
		});
		await Promise.all(spinPromises);
		this.spinning = false;
		return spinResult;
	}

	/**
	 * Create a mask for the reels container
	 * @param  {number} height Height of the mask
	 * @param  {number} width Width of the mask
	 */
	private createMask(height: number, width: number): void {
		this.mask = new PIXI.Graphics();
		this.mask.x = -(this.symbolSize * 0.5);
		this.mask.y = -(this.symbolSize / 2 + this.symbolPadding * 2);

		this.mask
			.rect(0, 0, width, height)
			.fill({ color: 0xff0000, alpha: 0.5 });
		this.reelsContainer.addChild(this.mask);
		this.reelsContainer.mask = this.mask;
	}

	/**
	 * Create win lines for the reels
	 * @returns {PIXI.Graphics[]} Array of win lines
	 */
	createWinLines(): PIXI.Graphics[] {
		const lines = new StaticPaylines(
			this.reelsContainer,
			this.symbolSize,
			this.symbolPadding,
			this.symbolsPerReel,
			this.reelsCount
		);
		this.reelsContainer.addChild(...lines.lines);
		lines.lines.forEach((line) => (line.visible = false));
		return lines.lines;
	}

	/**
	 * Show win lines for the reels
	 * @param  {number[]} indexes Indexes of the win lines to show
	 * */
	showWinLines(indexes: number[], duration: number): void {
		if (this.winLineInterval) {
			clearInterval(this.winLineInterval);
		}
		if (indexes.length === 0) return;

		let currentIndex = 0;

		const toggleVisibility = (index: number) => {
			this.winLines[index].visible = !this.winLines[index].visible;
		};

		const showNextLine = () => {
			this.winLines.forEach((line) => (line.visible = false));
			if (currentIndex < indexes.length) {
				this.winLines[indexes[currentIndex]].visible = true;
			}
			currentIndex = (currentIndex + 1) % (indexes.length + 1);
		};

		showNextLine();
		this.winLineInterval = setInterval(showNextLine, duration * 1000);
	}

	stopWinLines(): void {
		if (this.winLineInterval) {
			clearInterval(this.winLineInterval);
			this.winLineInterval = null;

			this.winLines.forEach((line) => (line.visible = false));
		}
	}
}
