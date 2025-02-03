import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Symbol } from "./Symbol";
import { MotionBlurFilter } from "pixi-filters";
import { gsap } from "gsap";

export class Reel {
	reelContainer: PIXI.Container;
	symbols: string[] = [];
	symbolSize: number;
	symbolsPerReel: number;
	symbolPadding: number;
	spinDistance: number;

	constructor(
		size: number,
		symbols: number[],
		symbolPadding: number,
		spinDistance: number
	) {
		this.reelContainer = new PIXI.Container();
		this.symbolSize = size;
		this.symbolsPerReel = symbols.length;
		this.symbolPadding = symbolPadding;
		this.spinDistance = spinDistance;
		this.createSymbols(symbols);
	}

	/**
	 * This method is used to create symbols in the reel with the right position
	 * @param  {number[]} ids Array of symbol IDs
	 * @param  {number} offset Used to calculate the position of the symbol taking into account the existing symbols
	 **/
	createSymbols(ids: number[], offset = 0): void {
		for (let i = offset; i < ids.length + offset; i++) {
			const symbolId = ids[i - offset];
			const symbolName = App.config.symbols.get(symbolId);

			if (!symbolName)
				throw new Error(`Symbol with ID ${symbolId} not found`);

			const symbol = new Symbol(symbolName, {
				width: this.symbolSize,
				height: this.symbolSize,
			});
			symbol.setPosition(0, this.calculateSymbolYPosition(i));
			this.reelContainer.addChild(symbol.symbol);
		}
	}

	/**
	 * This method is used to calculate the position of each symbol in the reel
	 * Symbols are positioned from bottom to top
	 * @param  {number} index Used to calculate the position of the symbol
	 * @return {number} The Y position of the symbol
	 */
	calculateSymbolYPosition(index: number): number {
		return (
			(this.symbolsPerReel - index - 1) * this.symbolSize -
			index * this.symbolPadding
		);
	}

	/**
	 * This method is used to reset the reel to its original state after the spin animation
	 * @param  {number} originalY The original Y position of the reel
	 * */
	resetReel(originalY: number): void {
		this.reelContainer.filters = [];
		this.reelContainer.y = originalY;
		this.reelContainer.removeChildren(
			0,
			this.symbolsPerReel * this.spinDistance
		);
		this.shiftSymbols();
	}

	/**
	 * This method is used to shift the symbols in the reel
	 * It is used after the spin animation to reset the positions by resetting the indexes
	 */
	shiftSymbols(): void {
		this.reelContainer.children.forEach((symbol, index) => {
			symbol.y = this.calculateSymbolYPosition(index);
		});
	}

	/**
	 * This method is used to animate the spin of the reel
	 * @param  {number} duration Duration of the spin animation
	 * @param  {number} delay Delay before the spin animation starts
	 * @param  {number} distance Distance the reel will spin
	 * @return {Promise<void>} Promise that resolves when the spin animation is completed
	 * */
	spin(duration: number, delay: number, distance: number): Promise<void> {
		let motionBlur = new MotionBlurFilter({
			kernelSize: 25,
			velocity: { x: 0, y: 1 },
		});
		this.reelContainer.filters = motionBlur;

		const A = 50 - 25 * Math.exp(-2 * (this.spinDistance - 1));
		const mu = 0.5;
		const sigma = 0.1;

		const motionBlurVelocity = (progress: number): number => {
			return A * Math.exp(-((progress - mu) ** 2) / (2 * sigma ** 2));
		};

		return new Promise((resolve) => {
			const originalY = this.reelContainer.y;
			const spinAnimation = gsap.to(this.reelContainer, {
				y: originalY + distance,
				duration: duration,
				delay: delay,
				ease: `back.inOut(${(1 / Math.sqrt(this.spinDistance)) * 1.5})`,
				onUpdate: () => {
					motionBlur.velocity.y = motionBlurVelocity(
						spinAnimation.progress()
					);
				},
				onComplete: () => {
					this.resetReel(originalY);
					resolve();
				},
			});
		});
	}
}
