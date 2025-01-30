export class Tools {
	static massiveRequire(
		req: __WebpackModuleApi.RequireContext
	): Array<{ key: string; data: any }> {
		const files: Array<{ key: string; data: any }> = [];

		req.keys().forEach((key: string) => {
			files.push({
				key,
				data: req(key),
			});
		});

		return files;
	}

	static randomNumber(min: number, max?: number): number {
		if (!max) {
			max = min;
			min = 0;
		}

		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static randomSymbol<T>(array: Array<T>): T {
		return array[this.randomNumber(array.length - 1)];
	}
}
