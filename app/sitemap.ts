import { MetadataRoute } from 'next';
import { seoPages } from './data/seo_pages';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://packingslipgenerator.com';

    const LandingPages = seoPages.map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...LandingPages,
    ];
}
