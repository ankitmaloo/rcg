export enum AppState {
  INPUT,
  LOADING,
  PREVIEW,
  DEPLOYED,
}

export interface BrandKit {
  logo?: string; // base64 string
  primaryColor?: string; // hex
  secondaryColor?: string; // hex
  font?: 'Sora' | 'Inter' | 'Poppins' | 'Roboto' | 'Lato';
}

export interface LandingPageSection {
  title: string;
  content: string;
  icon: string;
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  ctaButton: string;
  sections: LandingPageSection[];
}

export interface CampaignAssets {
  brand: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
  };
  landingPage: LandingPageContent;
  landingPageB?: LandingPageContent; // For A/B testing
  adCopy: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  assetPrompts: {
    platform: string;
    prompt: string;
  }[];
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  tracking: {
    googleTagManagerId: string;
    facebookPixelId: string;
  };
  heroImageUrl?: string; // base64 string
  font?: BrandKit['font'];
  logo?: string;
}