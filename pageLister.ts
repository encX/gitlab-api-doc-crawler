import { cheerio } from 'https://deno.land/x/cheerio@1.0.4/mod.ts';
import { Page } from './models.ts';

export class PagesLister {
	constructor(private docBase: string) {
	}
	
	async getPages(): Promise<Page[]> {
		const res = await fetch(`${this.docBase}/ee/api/api_resources.html`);
		const body = new Uint8Array(await res.arrayBuffer());
		const $ = cheerio.load(new TextDecoder().decode(body));
		const links = $('h2+p+table tr>td:first-child>a');
		
		const recs: Page[] = [];
		
		links.each((_, elem) => {
			const name = $(elem).text();
			const path = $(elem).attr('href') ?? '';
			
			recs.push({ name, path });
		});
		
		return recs;
	}
}
