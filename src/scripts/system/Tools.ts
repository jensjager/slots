import { Config } from "../game/Config";

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
			min = 1;
		}

		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static randomNumbers(min: number, max: number, count: number): number[] {
		let numbers: number[] = [];
		for (let i = 0; i < count; i++) {
			numbers.push(Math.floor(Math.random() * (max - min + 1) + min));
		}
		return numbers;
	}

	static checkWins(symbolsResult: number[][], paylines: number[][]) {
		const wins: { payline: number; symbol: number; win: number }[] = [];
		paylines.forEach((payline) => {
			let symbol = symbolsResult[0][payline[0]];
			let count = 1;
			let i = 1;
			while (symbol === 10 && i < payline.length) {
				symbol = symbolsResult[i][payline[1]];
				i++;
				count++;
			}
			for (i; i < payline.length; i++) {
				const position = payline[i];
				if (
					symbol === symbolsResult[i][position] ||
					10 === symbolsResult[i][position]
				) {
					count++;
				} else {
					break;
				}
			}
			if (count >= 3) {
				wins.push({
					payline: paylines.indexOf(payline),
					symbol,
					win: Config.paytable.get(symbol)?.[count] ?? 0,
				});
			}
		});
		return wins;
	}
}
