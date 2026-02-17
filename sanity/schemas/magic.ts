import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'magic',
  title: 'Magic',
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
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: '原理', value: 'principle' },
          { title: '法术', value: 'spell' },
        ],
        layout: 'radio',
      },
      initialValue: 'spell',
    }),
    defineField({
      name: 'school',
      title: 'School',
      type: 'string',
      description: 'e.g. Arcane, Divine, Nature',
    }),
    defineField({
      name: 'element',
      title: 'Element',
      type: 'string',
      options: {
        list: [
          { title: '火', value: 'fire' },
          { title: '风', value: 'wind' },
          { title: '土', value: 'earth' },
          { title: '水', value: 'water' },
        ],
        layout: 'radio',
      },
      hidden: ({ parent }) => parent?.kind !== 'spell',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { kind?: string } | undefined
          if (parent?.kind === 'spell' && !value) {
            return '法术必须选择元素属性'
          }
          return true
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'details',
      title: 'Details',
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
      name: 'relatedHeroes',
      title: 'Related Heroes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hero' }] }],
    }),
    defineField({
      name: 'relatedStories',
      title: 'Related Stories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'story' }] }],
    }),
  ],
})
