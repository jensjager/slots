import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Symbol } from "./Symbol";
import { Tools } from "../system/Tools";
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

	spin(duration: number, delay: number): void {
		this.moveTo(this.reelContainer, duration, delay);
	}

	moveTo(
		position: PIXI.Container,
		duration: number,
		delay: number
	): Promise<void> {
		return new Promise((resolve) => {
			gsap.to(this.reelContainer, {
				x: position.x,
				y:
					position.y +
					this.symbolSize * this.symbolsPerReel +
					(this.symbolSize / this.symbolPadding) *
						this.symbolsPerReel,
				duration: duration,
				delay: delay,
				ease: "back.out(1.06)",
				onComplete: resolve,
			});
		});
	}
}
