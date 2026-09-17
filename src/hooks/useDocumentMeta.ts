import { useEffect } from 'react'

const setMeta = (selector: string, content: string) => {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

/**
 * Keeps the document title and social metadata in sync with `site.json`, so
 * the JSON stays the single place these strings are written.
 * index.html carries the same values for crawlers that don't run scripts.
 */
export function useDocumentMeta({
  title,
  description,
  themeColor,
}: {
  title: string
  description: string
  themeColor: string
}) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[name="twitter:title"]', title)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[name="twitter:description"]', description)
    setMeta('meta[name="theme-color"]', themeColor)
  }, [title, description, themeColor])
}
