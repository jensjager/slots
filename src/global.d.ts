declare module NodeJS {
	interface Require {
		context: (path: string, deep?: boolean, filter?: RegExp) => any;
	}
}

declare namespace __WebpackModuleApi {
	interface RequireContext {
		(id: string): any;
		keys(): string[];
	}
}
