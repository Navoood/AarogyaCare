// Type for Health Scheme data
export interface HealthScheme {
  id: string;
  name: string;
  shortDescription: string;
  category: string[];
  coverage: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string[];
  contactInformation: {
    website: string;
    helpline: string;
    email: string;
  };
  officialLinks: Record<string, string>;
  languages: {
    [lang: string]: {
      name?: string;
      shortDescription?: string;
    };
  };
  imageUrl: string;
  featured: boolean;
}

// Type for bookmarked scheme
export interface BookmarkedScheme {
  id: string;
  dateBookmarked: string;
}

// View mode for health schemes display
export type ViewMode = 'grid' | 'list';

// Sort options for health schemes
export type SortOption = 'featured' | 'name';

// Language options for health schemes
export type LanguageOption = 'english' | 'hindi' | 'tamil' | 'gujarati' | 'kannada';