import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'region',
  title: 'Region',
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
      name: 'mapImage',
      title: 'Map Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'climate',
      title: 'Climate',
      type: 'string',
    }),
    defineField({
      name: 'terrain',
      title: 'Terrain',
      type: 'string',
    }),
    defineField({
      name: 'dangerLevel',
      title: 'Danger Level',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'landmarks',
      title: 'Landmarks',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'travelAdvice',
      title: 'Travel Advice',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'themeColor',
      title: 'Theme Color',
      type: 'string',
      description: 'HSL hue value (0-360) for the region visual identity, e.g. "220" for blue, "0" for red, "140" for green',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
    }),
    defineField({
      name: 'featuredHeroes',
      title: 'Featured Heroes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hero' }] }],
    }),
  ],
})
