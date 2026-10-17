export const PUBLISH_TIMEZONE = 'Pacific/Auckland';

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: PUBLISH_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export function aucklandDateString(date: Date = new Date()): string {
	return fmt.format(date);
}

/** A post is live when its pubDate (Auckland calendar day) is today or earlier. */
export function isPublished(pubDate: Date, now: Date = new Date()): boolean {
	return aucklandDateString(pubDate) <= aucklandDateString(now);
}
