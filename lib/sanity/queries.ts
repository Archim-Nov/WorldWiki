import { groq } from 'next-sanity'

export const countriesQuery = groq`
  *[_type == "country"] | order(name asc) {
    _id,
    name,
    slug,
    kind,
    summary,
    "mapImage": mapImage.asset->url
  }
`

export const countryBySlugQuery = groq`
  *[_type == "country" && slug.current == $slug][0] {
    _id,
    name,
    kind,
    summary,
    themeColor,
    "mapImage": mapImage.asset->url,
    "featuredRegions": select(
      count(featuredRegions) > 0 => featuredRegions[]->{
        _id,
        name,
        slug,
        "mapImage": mapImage.asset->url
      },
      *[_type == "region" && country._ref == ^._id] | order(name asc) {
        _id,
        name,
        slug,
        "mapImage": mapImage.asset->url
      }
    )
  }
`

export const regionsQuery = groq`
  *[_type == "region"] | order(name asc) {
    _id,
    name,
    slug,
    summary,
    "mapImage": mapImage.asset->url,
    country->{
      name,
      slug
    }
  }
`

export const regionBySlugQuery = groq`
  *[_type == "region" && slug.current == $slug][0] {
    _id,
    name,
    summary,
    themeColor,
    "mapImage": mapImage.asset->url,
    country->{
      name,
      slug,
      "mapImage": mapImage.asset->url
    },
    "featuredHeroes": select(
      count(featuredHeroes) > 0 => featuredHeroes[]->{
        _id,
        name,
        title,
        slug,
        "portrait": portrait.asset->url
      },
      *[_type == "hero" && region._ref == ^._id] | order(name asc) {
        _id,
        name,
        title,
        slug,
        "portrait": portrait.asset->url
      }
    )
  }
`

export const heroesQuery = groq`
  *[_type == "hero"] | order(name asc) {
    _id,
    name,
    title,
    slug,
    faction,
    roles,
    "portrait": portrait.asset->url,
    region->{
      name,
      slug
    },
    country->{
      name,
      slug
    }
  }
`

export const heroBySlugQuery = groq`
  *[_type == "hero" && slug.current == $slug][0] {
    _id,
    name,
    title,
    slug,
    faction,
    roles,
    "portrait": portrait.asset->url,
    region->{
      name,
      slug,
      themeColor,
      "mapImage": mapImage.asset->url
    },
    country->{
      name,
      slug,
      themeColor,
      "mapImage": mapImage.asset->url
    },
    "bio": bio[]{
      ...,
      markDefs[]{
        ...,
        reference->{
          _type,
          _id,
          slug,
          title,
          name,
          "portrait": portrait.asset->url,
          "mapImage": mapImage.asset->url,
          "coverImage": coverImage.asset->url
        }
      }
    },
    "linkedRefs": bio[].markDefs[_type == "internalLink"].reference->{
      _type,
      _id,
      slug,
      title,
      name,
      "portrait": portrait.asset->url,
      "mapImage": mapImage.asset->url,
      "coverImage": coverImage.asset->url
    },
    "relatedHeroes": select(
      count(relatedHeroes) > 0 => relatedHeroes[]->{
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      },
      *[
        _type == "hero"
        && _id != ^._id
        && (
          (defined(^.faction) && faction == ^.faction)
          || (defined(^.region._ref) && region._ref == ^.region._ref)
        )
      ] | order(name asc)[0..3] {
        _id,
        name,
        slug,
        "portrait": portrait.asset->url
      }
    ),
    "relatedStories": *[_type == "story" && references(^._id)] | order(_createdAt desc) {
      _id,
      title,
      slug,
      "coverImage": coverImage.asset->url
    }
  }
`

export const creaturesQuery = groq`
  *[_type == "creature"] | order(name asc) {
    _id,
    name,
    slug,
    species,
    category,
    "portrait": portrait.asset->url,
    region->{
      name,
      slug
    }
  }
`

export const creatureBySlugQuery = groq`
  *[_type == "creature" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    species,
    category,
    "portrait": portrait.asset->url,
    region->{
      name,
      slug,
      themeColor,
      "mapImage": mapImage.asset->url
    },
    country->{
      name,
      slug,
      themeColor,
      "mapImage": mapImage.asset->url
    },
    "bio": bio[]{
      ...,
      markDefs[]{
        ...,
        reference->{
          _type,
          _id,
          slug,
          title,
          name,
          "portrait": portrait.asset->url,
          "mapImage": mapImage.asset->url,
          "coverImage": coverImage.asset->url
        }
      }
    },
    "linkedRefs": bio[].markDefs[_type == "internalLink"].reference->{
      _type,
      _id,
      slug,
      title,
      name,
      "portrait": portrait.asset->url,
      "mapImage": mapImage.asset->url,
      "coverImage": coverImage.asset->url
    },
    "relatedStories": select(
      count(relatedStories) > 0 => relatedStories[]->{
        _id,
        title,
        slug,
        "coverImage": coverImage.asset->url
      },
      *[_type == "story" && references(^._id)] | order(_createdAt desc) {
        _id,
        title,
        slug,
        "coverImage": coverImage.asset->url
      }
    )
  }
`

export const storiesQuery = groq`
  *[_type == "story"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    "coverImage": coverImage.asset->url
  }
`

export const magicsQuery = groq`
  *[_type == "magic"] | order(name asc) {
    _id,
    name,
    slug,
    kind,
    element,
    school,
    summary,
    "coverImage": coverImage.asset->url
  }
`

export const magicBySlugQuery = groq`
  *[_type == "magic" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    kind,
    element,
    school,
    summary,
    "coverImage": coverImage.asset->url,
    "details": details[]{
      ...,
      markDefs[]{
        ...,
        reference->{
          _type,
          _id,
          slug,
          title,
          name,
          "portrait": portrait.asset->url,
          "mapImage": mapImage.asset->url,
          "coverImage": coverImage.asset->url
        }
      }
    },
    "linkedRefs": details[].markDefs[_type == "internalLink"].reference->{
      _type,
      _id,
      slug,
      title,
      name,
      "portrait": portrait.asset->url,
      "mapImage": mapImage.asset->url,
      "coverImage": coverImage.asset->url
    },
    relatedHeroes[]->{
      _id,
      name,
      slug,
      "portrait": portrait.asset->url
    },
    relatedStories[]->{
      _id,
      title,
      slug,
      "coverImage": coverImage.asset->url
    }
  }
`

export const storyBySlugQuery = groq`
  *[_type == "story" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "coverImage": coverImage.asset->url,
    "content": content[]{
      ...,
      markDefs[]{
        ...,
        reference->{
          _type,
          _id,
          slug,
          title,
          name,
          "portrait": portrait.asset->url,
          "mapImage": mapImage.asset->url,
          "coverImage": coverImage.asset->url
        }
      }
    },
    "linkedRefs": content[].markDefs[_type == "internalLink"].reference->{
      _type,
      _id,
      slug,
      title,
      name,
      "portrait": portrait.asset->url,
      "mapImage": mapImage.asset->url,
      "coverImage": coverImage.asset->url
    },
    relatedHeroes[]->{
      _id,
      name,
      slug,
      "portrait": portrait.asset->url
    },
    relatedRegions[]->{
      _id,
      name,
      slug,
      "mapImage": mapImage.asset->url
    },
    relatedCreatures[]->{
      _id,
      name,
      slug,
      "portrait": portrait.asset->url
    }
  }
`

export const globalSearchQuery = groq`
  *[
    _type in ["hero", "region", "country", "creature", "story", "magic"]
    && defined(slug.current)
    && (
      name match $term
      || title match $term
      || summary match $term
      || species match $term
      || category match $term
      || school match $term
      || kind match $term
      || element match $term
    )
  ] | order(_updatedAt desc) [0...$limit] {
    _id,
    _type,
    slug,
    name,
    title,
    summary,
    species,
    category,
    kind,
    element,
    school,
    "portrait": portrait.asset->url,
    "mapImage": mapImage.asset->url,
    "coverImage": coverImage.asset->url
  }
`
