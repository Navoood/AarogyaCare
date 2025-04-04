import { HealthScheme } from './types';

/**
 * Normalizes health scheme data to ensure compatibility with the HealthScheme type.
 * This is needed because JSON data might not have exactly the same shape as our type definition.
 */
export function normalizeHealthSchemeData(data: any): HealthScheme[] {
  // Deep clone to avoid modifying the original data
  const clonedData = JSON.parse(JSON.stringify(data));
  
  // Ensure all expected properties exist on each scheme
  return clonedData.map((scheme: any) => {
    // Make sure officialLinks is fully compatible with our Record<string, string> type
    const officialLinks: Record<string, string> = {};
    
    // Convert all officialLinks entries to valid strings
    if (scheme.officialLinks) {
      Object.keys(scheme.officialLinks).forEach(key => {
        // Ensure all values are strings
        officialLinks[key] = String(scheme.officialLinks[key] || '');
      });
    }
    
    // Return a normalized HealthScheme object
    return {
      id: scheme.id || '',
      name: scheme.name || '',
      shortDescription: scheme.shortDescription || '',
      category: Array.isArray(scheme.category) ? scheme.category : [],
      coverage: scheme.coverage || '',
      eligibility: Array.isArray(scheme.eligibility) ? scheme.eligibility : [],
      benefits: Array.isArray(scheme.benefits) ? scheme.benefits : [],
      applicationProcess: Array.isArray(scheme.applicationProcess) ? scheme.applicationProcess : [],
      contactInformation: {
        website: scheme.contactInformation?.website || '',
        helpline: scheme.contactInformation?.helpline || '',
        email: scheme.contactInformation?.email || '',
      },
      officialLinks,
      languages: scheme.languages || {},
      imageUrl: scheme.imageUrl || '',
      featured: Boolean(scheme.featured),
    };
  });
}