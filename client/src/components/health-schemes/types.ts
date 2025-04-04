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
  officialLinks: {
    mainWebsite: string;
    [key: string]: string;
  };
  languages: {
    [key: string]: {
      name: string;
      shortDescription: string;
    };
  };
  imageUrl: string;
  featured: boolean;
}