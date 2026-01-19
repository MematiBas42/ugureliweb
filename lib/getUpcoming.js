import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export async function getUpcoming() {
  try {
    const response = await client.getEntries({
      content_type: 'upcoming', // Content Type ID in Contentful (usually lowercase)
      order: '-fields.date',
    });

    return response.items.map((item) => {
      let imageUrl = item.fields.cover?.fields?.file?.url || '/main.webp';
      if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;

      let previewUrl = item.fields.demo?.fields?.file?.url || null;
      if (previewUrl && previewUrl.startsWith('//')) previewUrl = `https:${previewUrl}`;

      return {
        id: item.sys.id,
        title: item.fields.title,
        image: imageUrl,
        previewUrl: previewUrl,
        date: item.fields.date,
        tag: 'Yakında!',
        isUpcoming: true
      };
    });
  } catch (error) {
    console.error('Error fetching upcoming releases from Contentful:', error);
    return [];
  }
}
