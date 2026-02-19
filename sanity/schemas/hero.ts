import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'alias',
      title: 'Alias',
      type: 'string',
    }),
    defineField({
      name: 'age',
      title: 'Age',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Missing', value: 'missing' },
          { title: 'Deceased', value: 'deceased' },
        ],
        layout: 'radio',
      },
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
      name: 'roles',
      title: 'Roles',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'faction',
      title: 'Faction',
      type: 'string',
    }),
    defineField({
      name: 'signatureWeapon',
      title: 'Signature Weapon',
      type: 'string',
    }),
    defineField({
      name: 'motto',
      title: 'Motto',
      type: 'string',
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
      name: 'relatedHeroes',
      title: 'Related Heroes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hero' }] }],
    }),
  ],
})
