import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: string | undefined }) {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Human-agent system design blog',
    description: 'Blog about designing systems where humans and AI agents collaborate effectively.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/${post.slug}`,
      pubDate: post.data.publishDate,
      categories: post.data.tags,
    })),
  });
}
