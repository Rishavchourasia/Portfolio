import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))

const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })

/**
 * Absolute URLs, structured data, robots.txt and sitemap.xml for crawlers and
 * link-preview bots, which need full URLs and don't run the app's JS.
 * On Vercel the production URL is read from the build environment, so it
 * follows the custom domain once one is attached.
 */
function seo(siteUrl: string, gtmId: string | undefined): Plugin {
  const profile = readJson('./src/content/profile.json')
  const site = readJson('./src/content/site.json')
  const skills = readJson('./src/content/skills.json')
  const url = `${siteUrl}/`
  const image = `${siteUrl}/og.jpg`

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: site.meta.description,
    url,
    image,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressCountry: profile.location },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.school },
    knowsAbout: skills.marquee,
    sameAs: Object.values(profile.socials).filter(Boolean),
  }

  return {
    name: 'portfolio-seo',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
        meta({ name: 'robots', content: 'index, follow, max-image-preview:large' }),
        meta({ property: 'og:url', content: url }),
        meta({ property: 'og:site_name', content: profile.name }),
        meta({ property: 'og:locale', content: 'en_IN' }),
        meta({ property: 'og:image', content: image }),
        meta({ property: 'og:image:alt', content: `${profile.name}, ${profile.role}` }),
        meta({ name: 'twitter:image', content: image }),
        meta({ name: 'twitter:image:alt', content: `${profile.name}, ${profile.role}` }),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // `<` escaped so no string in the content can close the script tag.
          children: JSON.stringify(person).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ]

      if (gtmId) {
        tags.push(
          {
            tag: 'script',
            children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            injectTo: 'head-prepend',
          },
          {
            tag: 'noscript',
            children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            injectTo: 'body-prepend',
          },
        )
      }
      return tags
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  const productionHost = env.VERCEL_PROJECT_PRODUCTION_URL
  const siteUrl = (env.SITE_URL || (productionHost ? `https://${productionHost}` : 'http://localhost:5173')).replace(/\/+$/, '')

  const gtmId = env.GTM_ID?.trim()
  if (gtmId && !/^GTM-[A-Z0-9]+$/.test(gtmId)) {
    throw new Error(`GTM_ID must look like GTM-XXXXXXX, got "${gtmId}"`)
  }

  return {
    plugins: [react(), tailwindcss(), seo(siteUrl, gtmId || undefined)],
    resolve: {
      alias: { '@': new URL('./src', import.meta.url).pathname },
    },
  }
})
