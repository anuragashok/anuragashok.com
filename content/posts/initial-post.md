---
title: "Initial Post"
date: 2020-12-19
summary: "Jamstack is very popular these days. I decided to build this site using Jamstack practices. This post summarizes the various layers of the Jamstack eco-system used on this site."
tags: ["nextjs", "jamstack", "github", "github-pages", "react"]
---

![Initial Post](https://images.ctfassets.net/lybfa03y94yw/6I30Ej62DPAl0qK3HVt38B/8e0334362cb4a2c30ffc1bb1471606d9/intial-post.jpg)
*Photo by [Pixabay](https://www.pexels.com/@samuel-wolfl-628277?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels) from [Pexels](https://www.pexels.com/photo/intermodal-container-stacked-on-port-1427541/?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels)*

Taking a cue from [Initial Commit](https://initialcommit.com/blog/What-Is-An-Initial-Commit-In-Git), I decided to name this first post as Initial Post.

I created this blog from scratch as I wanted it to also be a learning experience. This has become my hobby project where I experiment with new tools and technologies.

[Jamstack](https://medium.com/@gianfranconuschese/the-jamstack-return-of-the-server-side-rendering-5a1313dafc92) is very popular these days. So decided to build this site using Jamstack practices. This post summarizes the various parts of the Jamstack eco-system used on the site.

- **Presentation Layer:** ReactJS has been on my learning list. The most popular starting points for ReactJS are create-react-app and Next.js. I eventually decided to use Next.js as it provides server-side rendering, static-site generation and serverless functions out of the box. The features can help to get the site up quickly.
- **API:** The site does not need an API at the moment. However, Next.js provides a [straightforward solution](https://nextjs.org/docs/api-routes/introduction) to create APIs too.
- **VCS:** Github.
- **Hosting / CDN:** The site runs on Github pages. It's free and fast. It provides all the features needed for now. However, I would also like to try out services like Netlify.
- **Backend:** At the moment, the site can compile to static HTML. So I am deferring this decision until the time I need a backend.

The overall architecture of the site looks like this.

![Intial Architecture](/diagrams/initial-post.svg)

### References:

- [https://medium.com/@gianfranconuschese/the-jamstack-return-of-the-server-side-rendering-5a1313dafc92](https://medium.com/@gianfranconuschese/the-jamstack-return-of-the-server-side-rendering-5a1313dafc92)
- [https://nextjs.org/docs/api-routes/introduction](https://nextjs.org/docs/api-routes/introduction)
- [https://dev.to/eroberts/why-you-should-use-netlify-instead-of-github-pages-3on1](https://dev.to/eroberts/why-you-should-use-netlify-instead-of-github-pages-3on1)
