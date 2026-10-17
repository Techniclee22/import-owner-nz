export const site = {
	name: 'Import Owner NZ',
	tagline: 'Running a Japanese import in New Zealand',
	url: (import.meta.env.SITE as string | undefined) || 'https://import-owner-nz.vercel.app',
	author: 'Import Owner NZ',
	authorPath: '/about',
	locale: 'en-NZ',
} as const;

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat(site.locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Pacific/Auckland' }).format(date);
}

export function canonicalPath(pathname: string): string {
	const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
	return new URL(path, site.url).href;
}

export function assetUrl(src: string): string {
	return new URL(src, site.url).href;
}
