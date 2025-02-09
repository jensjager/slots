import * as PIXI from "pixi.js";
import { Reel } from "./Reel";
import { Tools } from "../system/Tools";
import { App } from "../system/App";
import { GlowFilter } from "pixi-filters";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

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

		this.winLines = this.createWinLines();
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
			reel.reelContainer.x = i * symbolSize + i * this.symbolPadding;
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
			const symbolsResult = newSymbols.slice(-this.symbolsPerReel);
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
		this.mask.x = -(this.symbolSize * 0.5 + this.symbolPadding);
		this.mask.y = -(
			this.symbolSize * 0.5 +
			this.symbolPadding * this.symbolsPerReel
		);
		this.mask.rect(0, 0, width, height).fill(0xffffff);
		// this.reelsContainer.addChild(this.mask);
		// this.reelsContainer.mask = this.mask;
	}

	/**
	 * Create win lines for the reels
	 * @returns {PIXI.Graphics[]} Array of win lines
	 */
	createWinLines(): PIXI.Graphics[] {
		const lines: PIXI.Graphics[] = [];
		const paylines = App.config.paylines;
		const { minX, minY } = this.reelsContainer.getLocalBounds();

		const upperLine = minY + (this.symbolSize + this.symbolPadding) / 2;

		const middleLine =
			minY + ((this.symbolSize + this.symbolPadding) * 3) / 2;

		const lowerLine =
			minY + ((this.symbolSize + this.symbolPadding) * 5) / 2;

		const lineHeights: number[] = [lowerLine, middleLine, upperLine];

		const stepLength = (this.symbolSize + this.symbolPadding) * 0.5;

		paylines.forEach((payline) => {
			// const line = new PIXI.Graphics();
			const gradient = new PIXI.FillGradient(0, 0, 1000, 0);
			const glowFilter = new GlowFilter({
				color: 0x800080,
				distance: 10,
				outerStrength: 3,
				innerStrength: 2,
			});

			gradient.addColorStop(0, "#0000FF"); // Blue
			gradient.addColorStop(1, "#800080"); // Purple

			gradient.buildLinearGradient();

			let xPos = minX;
			const path: { x: number; y: number }[] = [];

			function addPoint(x: number, y: number) {
				path.push({ x, y });
				// line.lineTo(x, y);
			}
			// line.moveTo(xPos, lineHeights[payline[0]]);
			addPoint((xPos += stepLength), lineHeights[payline[0]]);
			addPoint((xPos += stepLength * 2), lineHeights[payline[1]]);
			addPoint((xPos += stepLength * 2), lineHeights[payline[2]]);
			addPoint((xPos += stepLength * 2), lineHeights[payline[3]]);
			addPoint((xPos += stepLength * 2), lineHeights[payline[4]]);
			addPoint(
				(xPos += stepLength - this.symbolPadding),
				lineHeights[payline[4]]
			);
			// line.stroke({ width: 10, color: "#4e004e" });
			// line.filters = [glowFilter];

			// Progress object for GSAP animation
			// const animatedLine = new PIXI.Graphics();
			// animatedLine.label = "winLine" + payline;
			// this.reelsContainer.addChild(animatedLine);

			// gsap.to(animatedLine, {
			// 	duration: 5,  // Total animation duration
			// 	motionPath: {
			// 		path: path,  // The array of points to animate the line along
			// 		autoRotate: true,  // Optional: rotate the line to match the path direction
			// 	},
			// 	onUpdate: function () {
			// 		animatedLine.clear();  // Clear previous lines
			// 		animatedLine.stroke({width:5, color: 0xff0000}); // Red stroke

			// 		animatedLine.moveTo(path[0].x, path[0].y);

			// 		for (let i = 1; i <= path.length; i++) {
			// 			if (i < path.length) {
			// 				animatedLine.lineTo(path[i].x, path[i].y);
			// 			}
			// 		}
			// 	},
			// 	repeat: -1,
			// 	yoyo: true,
			// });

			// const light = App.sprite("spin");
			// light.width = 50;
			// light.height = 50;
			// light.anchor.set(0.5, 0.5);
			// light.x = path[0].x;
			// light.y = path[0].y;

			// ---- ANIMATE ALONG THE PATH ---- //
			// gsap.to(light, {
			// 	motionPath: {
			// 		path: path, // Moves the sprite along the line
			// 		curviness: 0, // Smooth motion
			// 	},
			// 	duration: 3, // Time in seconds
			// 	repeat: -1, // Infinite loop
			// 	ease: "power1.inOut", // Smooth animation
			// });

			let frames: PIXI.GraphicsContext[] = [];
			let frameIndex = 0;
			for (let i = 0; i < path.length; i++) {
				frames.push(
					new PIXI.GraphicsContext()
						.moveTo(path[i].x, path[i].y)
						.lineTo(path[i].x, path[i].y)
						.stroke({width: 5, color: "#4e004e"})
				);
			}
			const line = new PIXI.Graphics(frames[frameIndex]);

			const progress = { value: 0 };
			let lastCheckedStep = 0;

			gsap.to(progress, {
				value: 1,
				duration: 3, // Animation speed
				ease: "none",
				repeat: -1, // Infinite loop
				onUpdate: () => {
					if (progress.value >= lastCheckedStep + 0.05) {						
						line.context = frames[frameIndex++%frames.length];
						lastCheckedStep += 0.05;
						// render();
					}
				},
				onRepeat: () => {
					// line.clear();
					lastCheckedStep = 0; // Reset when animation restarts
				},
			});

			function render() {
				line.clear();
				console.log("cleared");

				line.stroke({ width: 5, color: 0xff0000 });
				line.moveTo(path[0].x, path[0].y);

				const maxIndex = Math.floor(progress.value * (path.length - 1));

				// Draw the line up to the current progress
				for (let i = 1; i <= maxIndex; i++) {
					line.lineTo(path[i].x, path[i].y);
				}

				// Smooth interpolation between points (optional)
				if (maxIndex < path.length - 1) {
					const nextPoint = path[maxIndex + 1];
					const prevPoint = path[maxIndex];
					const partialProgress =
						(progress.value * (path.length - 1)) % 1;

					// Interpolate position between prevPoint and nextPoint
					const x =
						prevPoint.x +
						(nextPoint.x - prevPoint.x) * partialProgress;
					const y =
						prevPoint.y +
						(nextPoint.y - prevPoint.y) * partialProgress;

					line.lineTo(x, y);
				}
				console.log("drawn");
			}

			lines.push(line);
		});
		this.reelsContainer.addChild(...lines);
		// lines.forEach((line) => (line.visible = false));
		return lines;
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

		this.winLines.forEach((line) => (line.visible = false));

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
