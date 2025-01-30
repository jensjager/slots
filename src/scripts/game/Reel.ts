import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Symbol } from "./Symbol";
import { Tools } from "../system/Tools";
import { MotionBlurFilter } from "pixi-filters";
import { gsap } from "gsap";

export class Reel {
	reelContainer: PIXI.Container = new PIXI.Container();
	symbols: string[] = [];
	symbolSize: number;
	symbolsPerReel: number;
	symbolPadding: number;

	constructor(size: number, symbolsPerReel: number, symbolPadding: number) {
		this.symbolSize = size;
		this.symbolsPerReel = symbolsPerReel;
		this.symbolPadding = symbolPadding;
		this.create();
	}

	create(): void {
		this.createSymbols(100);
	}

	createSymbols(rows: number): void {
		for (let i = 0; i < rows; i++) {
			const symbol = new Symbol(Tools.randomSymbol(App.config.symbols), {
				width: this.symbolSize,
				height: this.symbolSize,
			});
			symbol.setPosition(0, this.calculateSymbolPosition(i));
			this.symbols.push(symbol.symbolName);
			this.reelContainer.addChild(symbol.symbol);
		}
	}

	calculateSymbolPosition(index: number): number {
		return (
			-index * this.symbolSize +
			(this.symbolsPerReel - 1) * this.symbolSize -
			index * (this.symbolSize / this.symbolPadding)
		);
	}

	spin(duration: number, delay: number): Promise<void> {
		let motionBlur = new MotionBlurFilter({
			kernelSize: 25,
			velocity: { x: 0, y: 1 },
		});
		this.reelContainer.filters = motionBlur;

		function motionBlurVelocity(progress: number): number {
			const A = 50;
			const mu = 0.5;
			const sigma = 0.1;

			return A * Math.exp(-((progress - mu) ** 2) / (2 * sigma ** 2));
		}

		return new Promise((resolve) => {
			const spinAnimation = gsap.to(this.reelContainer, {
				x: this.reelContainer.x,
				y:
					this.reelContainer.y +
					this.symbolSize * this.symbolsPerReel * 4 +
					(this.symbolSize / this.symbolPadding) *
						this.symbolsPerReel *
						4,
				duration: duration,
				delay: delay,
				ease: "back.inOut(1.04)",
				onUpdate: () => {
					motionBlur.velocity.y = motionBlurVelocity(
						spinAnimation.progress()
					);
				},
				onComplete: () => {
					this.reelContainer.filters = [];
					resolve();
				},
			});
		});
	}
}
