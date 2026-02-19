import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { getSiteUrlString } from '@/lib/site-url'

type SlugItem = { slug: string; _updatedAt: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrlString()

  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/countries`, lastModified: new Date() },
    { url: `${baseUrl}/regions`, lastModified: new Date() },
    { url: `${baseUrl}/creatures`, lastModified: new Date() },
    { url: `${baseUrl}/champions`, lastModified: new Date() },
    { url: `${baseUrl}/stories`, lastModified: new Date() },
    { url: `${baseUrl}/magics`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
  ]

  const [countries, regions, creatures, heroes, stories, magics] = await Promise.all([
    client.fetch<SlugItem[]>(`*[_type == "country"] { "slug": slug.current, _updatedAt }`),
    client.fetch<SlugItem[]>(`*[_type == "region"] { "slug": slug.current, _updatedAt }`),
    client.fetch<SlugItem[]>(`*[_type == "creature"] { "slug": slug.current, _updatedAt }`),
    client.fetch<SlugItem[]>(`*[_type == "hero"] { "slug": slug.current, _updatedAt }`),
    client.fetch<SlugItem[]>(`*[_type == "story"] { "slug": slug.current, _updatedAt }`),
    client.fetch<SlugItem[]>(`*[_type == "magic"] { "slug": slug.current, _updatedAt }`),
  ])

  const countryPages = countries.map((item) => ({
    url: `${baseUrl}/countries/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  const regionPages = regions.map((item) => ({
    url: `${baseUrl}/regions/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  const creaturePages = creatures.map((item) => ({
    url: `${baseUrl}/creatures/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  const heroPages = heroes.map((item) => ({
    url: `${baseUrl}/champions/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  const storyPages = stories.map((item) => ({
    url: `${baseUrl}/stories/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  const magicPages = magics.map((item) => ({
    url: `${baseUrl}/magics/${item.slug}`,
    lastModified: new Date(item._updatedAt),
  }))

  return [
    ...staticPages,
    ...countryPages,
    ...regionPages,
    ...creaturePages,
    ...heroPages,
    ...storyPages,
    ...magicPages,
  ]
}
