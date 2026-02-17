import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'creature',
  title: 'Creature',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'species',
      title: 'Species',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Animal', value: 'animal' },
          { title: 'Plant', value: 'plant' },
          { title: 'Element', value: 'element' },
        ],
      },
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'reference',
      to: [{ type: 'region' }],
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'internalLink',
                title: 'Internal Link',
                type: 'object',
                fields: [
                  {
                    name: 'reference',
                    title: 'Reference',
                    type: 'reference',
                    to: [
                      { type: 'country' },
                      { type: 'region' },
                      { type: 'creature' },
                      { type: 'hero' },
                      { type: 'story' },
                      { type: 'magic' },
                    ],
                  },
                ],
              },
              {
                name: 'externalLink',
                title: 'External Link',
                type: 'object',
                fields: [
                  {
                    name: 'url',
                    title: 'URL',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'relatedStories',
      title: 'Related Stories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'story' }] }],
    }),
  ],
})
