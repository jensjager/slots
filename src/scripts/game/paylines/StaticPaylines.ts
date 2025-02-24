import * as PIXI from "pixi.js";
import { App } from "../../system/App";
import gsap from "gsap";

export class StaticPaylines {
	lines: PIXI.Graphics[] = [];
	paylines = App.config.paylines;
	reels: PIXI.Container;
	symbolSize: number;
	symbolPadding: number;
	symbolsPerReel: number;
	reelsCount: number;

	constructor(
		reels: PIXI.Container,
		symbolSize: number,
		symbolPadding: number,
		symbolsPerReel: number,
		reelsCount: number
	) {
		this.reels = reels;
		this.symbolSize = symbolSize;
		this.symbolPadding = symbolPadding;
		this.symbolsPerReel = symbolsPerReel;
		this.reelsCount = reelsCount;
		this.createWinLines();
	}

	createPaths(): {
		x: number;
		y: number;
	}[][] {
		const { minX, minY } = this.reels.getLocalBounds();
        console.log(this.reels.getLocalBounds());
        

		const lineHeights: number[] = [];

		for (
			let symbolIndex = 0;
			symbolIndex < this.symbolsPerReel;
			symbolIndex++
		) {
			lineHeights.push(
				minY +
					((this.symbolSize + this.symbolPadding) *
						(1 + symbolIndex * 2)) /
						2
			);
		}

		const stepLength = (this.symbolSize + this.symbolPadding) * 0.5;
		const paths: {
			x: number;
			y: number;
		}[][] = [];

		this.paylines.forEach((payline) => {
			let xPos = minX;
			const path: { x: number; y: number }[] = [];

			path.push({ x: xPos, y: lineHeights[payline[0]] });
			path.push({
				x: (xPos += stepLength),
				y: lineHeights[payline[0]],
			});
			for (let i = 1; i < this.reelsCount; i++) {
				path.push({
					x: (xPos += stepLength * 2),
					y: lineHeights[payline[i]],
				});
			}
			path.push({
				x: (xPos += stepLength),
				y: lineHeights[payline[this.reelsCount - 1]],
			});
			paths.push(path);
		});

		return paths;
	}

	createWinLines() {
		const paths = this.createPaths();
		this.paylines.forEach((_, index) => {
			const path: { x: number; y: number }[] = paths[index];
			const line = new PIXI.Graphics();

			line.moveTo(path[0].x, path[0].y);
			for (let i = 1; i < path.length; i++) {
				line.lineTo(path[i].x, path[i].y);
			}
			line.stroke({
				width: 15,
				color: "#FFD700",
			});

			this.lines.push(line);
		});

		return this.lines;
	}
}
