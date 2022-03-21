import { Api } from './models.ts';

export class PageCrawler {
	constructor() {
	}

	async getApis(): Promise<Api[]> {
		throw Error();
	}
}
