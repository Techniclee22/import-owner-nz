import { getCollection } from 'astro:content';
import { isPublished } from './gating';

export { PUBLISH_TIMEZONE, aucklandDateString, isPublished } from './gating';

/** Live posts, newest first. Future-dated posts (pubDate gating) are never returned. */
export async function livePosts(now: Date = new Date()) {
	const posts = await getCollection('posts');
	return posts
		.filter((post) => isPublished(post.data.pubDate, now))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
