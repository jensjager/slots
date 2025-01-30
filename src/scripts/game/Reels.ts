import * as PIXI from "pixi.js";
import { Reel } from "./Reel";

export class Reels {
	reelsContainer: PIXI.Container = new PIXI.Container();
	reels: Reel[] = [];
	mask: PIXI.Graphics = new PIXI.Graphics();
	reelsCount: number;
	symbolSize: number;
	symbolsPerReel: number;
	verticalPadding: number = 0;
	totalWidth: number;
	totalHeight: number;
	spinning: boolean = false;
	symbolPadding: number;

	constructor(
		reelsCount: number,
		symbolsPerReel: number,
		symbolSize: number,
		symbolPadding: number
	) {
		this.reelsCount = reelsCount;
		this.symbolSize = symbolSize;
		this.symbolsPerReel = symbolsPerReel;
		this.symbolPadding = symbolPadding;

		this.totalWidth = this.calculateTotalWidth();
		this.totalHeight = this.calculateTotalHeight();

		this.create(this.reelsCount, this.symbolSize);
		this.createMask(this.totalHeight);
		this.reelsContainer.mask = this.mask;
	}

	calculateTotalWidth(): number {
		return (
			this.reelsCount * this.symbolSize +
			(this.symbolSize / this.symbolPadding) * (this.reelsCount + 1)
		);
	}

	calculateTotalHeight(): number {
		return (
			this.symbolSize * this.symbolsPerReel +
			this.verticalPadding +
			(this.symbolSize / this.symbolPadding) * (this.symbolsPerReel + 1)
		);
	}

	create(reelsCount: number, symbolSize: number): void {
		this.createReels(reelsCount, symbolSize);
		this.reelsContainer.height += this.verticalPadding;
	}

	createReels(columns: number, symbolSize: number): void {
		for (let i = 0; i < columns; i++) {
			const reel = new Reel(
				symbolSize,
				this.symbolsPerReel,
				this.symbolPadding
			);
			this.reels.push(reel);
			reel.reelContainer.x =
				i * symbolSize + (i * symbolSize) / this.symbolPadding;
			this.reelsContainer.addChild(reel.reelContainer);
		}

		this.reelsContainer.x =
			(window.innerWidth - this.totalWidth) / 2 + symbolSize / 2;

		this.reelsContainer.y = window.innerHeight / 2 - this.totalHeight / 2;
	}

	spinReels(): Promise<void> {
		return new Promise((resolve) => {
			let delay = 0;
			this.reels.forEach((reel) => {
				reel.spin(1, delay);
				delay += 0.15;
			});

			setTimeout(resolve, delay * 2000);
		});
	}

	private createMask(height: number): void {
		this.mask = new PIXI.Graphics();
		this.mask.x =
			-(this.symbolSize * 0.5) - this.symbolSize / this.symbolPadding;
		this.mask.y =
			-(this.symbolSize * 0.5) -
			this.verticalPadding / 2 -
			(this.symbolSize / this.symbolPadding) * this.symbolsPerReel;
		this.mask.rect(0, 0, this.totalWidth, height).fill(0xffffff);
		this.reelsContainer.addChild(this.mask);
	}
}
