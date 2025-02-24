import * as PIXI from "pixi.js";
import { App } from "../../system/App";
import gsap from "gsap";
import { ColorOverlayFilter } from "pixi-filters";

// DIFFERENT PAYLINE DESIGNS
export class Paylines {
	lines: PIXI.Graphics[] = [];
	paylines = App.config.paylines;
	reels: PIXI.Container;
	symbolSize: number;
	symbolPadding: number;

	constructor(
		reels: PIXI.Container,
		symbolSize: number,
		symbolPadding: number
	) {
		this.reels = reels;
		this.symbolSize = symbolSize;
		this.symbolPadding = symbolPadding;
		this.createWinLines();
		// this.trail();
	}

	trail() {
		const texture = App.assets["particle"];
		const paths = this.createPaths();
		paths.forEach((path) => {
			// Trail settings
			const trailLength = 100; // Number of trail sprites
			const trailSprites: PIXI.Sprite[] = [];

			// Create trail sprites
			for (let i = 0; i < trailLength; i++) {
				let sprite = new PIXI.Sprite(texture);
				sprite.anchor.set(0.5);
				sprite.alpha = 0; // Initially invisible
				sprite.scale.set(0.5);
				this.reels.addChild(sprite);
				trailSprites.push(sprite);
			}

			const mainSprite = new PIXI.Sprite(texture);
			mainSprite.filters = new ColorOverlayFilter({
				color: "0xdd00ff",
				alpha: 0.5,
			});
			mainSprite.anchor.set(0.5);
			mainSprite.scale.set(0.5);
			mainSprite.x = path[0].x;
			mainSprite.y = path[0].y;

			this.reels.addChild(mainSprite);

			gsap.to(mainSprite, {
				motionPath: {
					path: path,
					curviness: 0,
				},
				duration: 2,
				repeat: -1,
				ease: "power1.inOut",
				onUpdate: () => this.createGhostTrail(mainSprite),
				// onUpdate: updateTrail,
			});

			// Update Trail Effect
			function updateTrail() {
				for (let i = trailLength - 1; i > 0; i--) {
					// Move older sprites to previous sprite's position
					trailSprites[i].x = trailSprites[i - 1].x;
					trailSprites[i].y = trailSprites[i - 1].y;
					trailSprites[i].alpha = trailSprites[i - 1].alpha * 0.9; // Reduce opacity
					trailSprites[i].scale.set(
						trailSprites[i - 1].scale.x * 0.95
					); // Reduce size
				}

				// Set first trail sprite to main sprite position
				trailSprites[0].x = mainSprite.x;
				trailSprites[0].y = mainSprite.y;
				trailSprites[0].alpha = 1; // Full opacity
				trailSprites[0].scale.set(0.5); // Full scale
			}
		});
	}

	// **Dynamically Create Ghost Sprites for Overlapping Trail**
	createGhostTrail(mainSprite: PIXI.Sprite) {
		let spreadX = 50;
		let spreadY = 25;
		for (let i = 0; i < 10; i++) {
			let ghost = App.sprite("particle");
			ghost.anchor.set(0.5);
			ghost.x = mainSprite.x;
			ghost.y = mainSprite.y;
			ghost.alpha = 1; // Full opacity
			ghost.scale.set(0.2); // Full scale
			this.reels.addChild(ghost);
	
			// Animate the ghost to fade & shrink
			gsap.to(ghost, {
				// scale: 0.5,
				alpha: 0,
				x: `random(${mainSprite.x - spreadX}, ${mainSprite.x}, 1)`,
				y: `random(${mainSprite.y - spreadY}, ${mainSprite.y + spreadY}, 1)`,
				duration: 0.6, // Faster fade-out
				ease: "power1.out",
				onComplete: () => {
					this.reels.removeChild(ghost);
				},
			});
		}
	}

	createPaths(): {
		x: number;
		y: number;
	}[][] {
		const { minX, minY } = this.reels.getLocalBounds();

		const upperLine = minY + (this.symbolSize + this.symbolPadding) / 2;

		const middleLine =
			minY + ((this.symbolSize + this.symbolPadding) * 3) / 2;

		const lowerLine =
			minY + ((this.symbolSize + this.symbolPadding) * 5) / 2;

		const lineHeights: number[] = [lowerLine, middleLine, upperLine];

		const stepLength = (this.symbolSize + this.symbolPadding) * 0.5;

		const paths: {
			x: number;
			y: number;
		}[][] = [];

		this.paylines.forEach((payline) => {
			let xPos = minX;
			const path: { x: number; y: number }[] = [];

			path.push({ x: xPos, y: lineHeights[payline[0]] });
			path.push({ x: (xPos += stepLength), y: lineHeights[payline[0]] });
			path.push({
				x: (xPos += stepLength * 2),
				y: lineHeights[payline[1]],
			});
			path.push({
				x: (xPos += stepLength * 2),
				y: lineHeights[payline[2]],
			});
			path.push({
				x: (xPos += stepLength * 2),
				y: lineHeights[payline[3]],
			});
			path.push({
				x: (xPos += stepLength * 2),
				y: lineHeights[payline[4]],
			});
			path.push({
				x: (xPos += stepLength - this.symbolPadding),
				y: lineHeights[payline[4]],
			});

			paths.push(path);
		});

		return paths;
	}

	createWinLines() {
		const paths = this.createPaths();
		this.paylines.forEach((_, index) => {
			const path: { x: number; y: number }[] = paths[index];

			let frames: PIXI.GraphicsContext[] = [];
			let frameIndex = 0;
			for (let i = 0; i < path.length - 1; i++) {
				frames.push(
					new PIXI.GraphicsContext()
						.moveTo(path[i].x, path[i].y)
						.lineTo(path[i + 1].x, path[i + 1].y)
						.stroke({ width: 5, color: "#4e004e" })
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
						line.context = frames[frameIndex++ % frames.length];
						lastCheckedStep += 0.05;
					}
				},
				onRepeat: () => {
					lastCheckedStep = 0; // Reset when animation restarts
				},
			});
			this.lines.push(line);
		});
		this.reels.addChild(...this.lines);
		this.lines.forEach((line) => (line.visible = false));
		return this.lines;
	}
}
