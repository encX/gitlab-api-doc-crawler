import { PagesLister } from './pageLister.ts';

const docVer = {
	current: 'https://docs.gitlab.com',
	14_8: 'https://docs.gitlab.com/14.8',
	13_12: 'https://docs.gitlab.com/13.12',
};

await new PagesLister(docVer.current).getPages()
