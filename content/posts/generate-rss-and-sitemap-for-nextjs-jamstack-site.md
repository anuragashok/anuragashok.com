---
title: "Generate RSS and Sitemap for Next.js JAMstack site"
date: 2020-12-27
summary: "RSS and sitemap are essential for blogs today. RSS Feeds let users subscribe to your content and improves user engagement. On the other hand, a sitemap is for search engines to find and index your content. Let's see how to generate these in a Next.js JAMStack site."
tags: ["rss", "sitemap", "blogging", "jamstack", "nextjs"]
---

![Generate RSS and Sitemap for Next.js JAMstack site](./img/GENERATE_RSS_AND_SITEMAP.png)
*Image by [mohamed Hassan](https://pixabay.com/users/mohamed_hassan-5229782/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4059862) from [Pixabay](https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=4059862)*

RSS and sitemap are essential for blogs today. RSS Feeds let users subscribe to your content and improves user engagement. On the other hand, a sitemap is for search engines to find and index your content.

When using a CMS like wordpress etc.., the RSS and sitemap XML files are generated at runtime. However, for JAMStack websites, we would like to create them at the build stage. I was not able to find an OOTB solution for next.js to create these files. The XML files for RSS and sitemap are not too complex to generate. Hence, I decided not to introduce any third-party dependencies to generate these files.

There are mainly three questions to answer when generating these files. Where, When and How?

## 1. Where to place

The convention followed by many is to place rss.xml and sitemap.xml at the root of the website. Sitemaps can be split into files and referenced from the main sitemap.xml. This is needed when sitemaps grow very huge. We will stick to single sitemap.xml for now.

Next.js routing does not support files that are not content. So, what we can do is, to place these files in the `public` directory. Next's static file serving feature serves the files under this directory at the root of the website.

## 2. When to generate

We have to generate the files inside the public directory during the build. During the build, the `getStaticProps` function gets invoked for each page. We can leverage this function to create our XML files.

We can use `getStaticProps` function of any page component to create the files. However, this will add unnecessary code to the pages. So, I created a dummy.tsx page. The `getStaticProps` of this page component will contain the additional build time processing logic.

If anyone visits /dummy we should probably return 404 and ignore the page from any search engine indexing.

###### dummy.tsx [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/1b1f462a7cb697ecdcd222313d913101de176dfa/src/pages/dummy.tsx#L15-L22)

```jsx
const Dummy: React.FC = () => (
  <>
    <Head>
      <meta name="robots" content="noindex" />
    </Head>
    <DefaultErrorPage statusCode={404} />
  </>
);
```

## 3. How to generate

The creation of XML files is a matter of iterating over the content and generating the XML tags. This can be implemented in the `getStaticProps` function of `pages/dummy.tsx`. You can find the snippets of the code below. You can refer to GitHub repo for this blog for the full code sample.

###### dummy.tsx - getStaticProps() [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/1b1f462a7cb697ecdcd222313d913101de176dfa/src/pages/dummy.tsx#L24-L34)

```javascript
export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts();
  generateRss(posts);

  const pages = await getAllContent();
  generateSitemap(pages);

  return {
    props: {},
  };
};
```

###### generateRss() [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/1b1f462a7cb697ecdcd222313d913101de176dfa/src/lib/rss.ts)

```javascript
const generateRssItem = (post: Post): string => `
  <item>
    <guid>${getFullUrl(`blog/${post.slug}`)}</guid>
    <title>${post.title}</title>
    <link>${getFullUrl(`blog/${post.slug}`)}</link>
    <description>${post.description}</description>
    <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
  </item>
`;

export default (posts: Post[]): void => {
  const rss = `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${SITE_TITLE}</title>
      <link>${getFullUrl('')}</link>
      <description>${SITE_TITLE}</description>
      <language>en</language>
      <lastBuildDate>${new Date(posts[0].publishDate).toUTCString()}</lastBuildDate>
      <atom:link href="${getFullUrl('rss.xml')}" rel="self" type="application/rss+xml"/>
      ${posts.map(generateRssItem).join('')}
    </channel>
  </rss>`;
  fs.writeFileSync('./public/rss.xml', rss);
};
```

###### generateSitemap() [View on GitHub](https://github.com/anuragashok/theoverengineered.blog/blob/1b1f462a7cb697ecdcd222313d913101de176dfa/src/lib/sitemap.ts)

```javascript
export default (pages: Content[]): void => {
  const links = compose(map(mapToSitemapEntry))(pages);

  if (fs.existsSync(SITEMAP_PATH)) {
    fs.unlinkSync(SITEMAP_PATH);
  }
  const stream = fs.createWriteStream(SITEMAP_PATH, { flags: 'a' });
  stream.write(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
  links.forEach((item) => {
    stream.write(`
      <url>
        <loc>${item.url}</loc>
        <changefreq>${item.changefreq}</changefreq>
        <priority>${item.priority}</priority>
      </url>`);
  });
  stream.write('\n');
  stream.write('</urlset>');
  stream.end();
};
```

You can later validate these xml files against the specs at [W3C Feed Validator](https://validator.w3.org/feed/) and [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
