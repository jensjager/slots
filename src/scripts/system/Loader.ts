import { Assets } from "pixi.js";

export class Loader {
	getAssetsFromFolder(): Array<{ alias: string; src: string }> {
		const assets: Array<{ alias: string; src: string }> = [];
		const req = require["context"](
			"./../../sprites",
			true,
			/\.(png|jpe?g)$/
		);

		req.keys().forEach((name: string) => {
			assets.push({
				alias: name.split("/").reverse()[0].replace(".png", ""),
				src: req(name).default,
			});
		});

		return assets;
	}

	preload(): Promise<void> {
		return Assets.load(this.getAssetsFromFolder());
	}
}
