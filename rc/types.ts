export enum AppState {
  INPUT,
  LOADING,
  PREVIEW,
  DEPLOYED,
}

export interface BrandKit {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  font?: 'Sora' | 'Inter' | 'Poppins' | 'Roboto' | 'Lato';
}

export interface CampaignAssets {
  landingPageHtml?: string;
  landingPageBHtml?: string; // A/B test variant HTML
  instagramAdImage?: string; // base64
  copyVariants?: string[]; // plain text
  videoUrl?: string; // URL to the generated video
  brand?: BrandKit; // brand information
  landingPage?: LandingPageContent; // structured landing page content
  landingPageB?: LandingPageContent; // A/B test variant content
  seo?: SEOContent; // SEO metadata
  tracking?: TrackingContent; // tracking codes
  heroImageUrl?: string; // hero image URL
  font?: string; // font name
  logo?: string; // logo URL
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  ctaButton: string;
  sections: Array<{
    icon: string;
    title: string;
    content: string;
  }>;
}

export interface SEOContent {
  title: string;
  description: string;
  keywords: string;
}

export interface TrackingContent {
  googleTagManagerId: string;
  facebookPixelId: string;
}

export interface AssetSelection {
  landingPage: boolean;
  ad: boolean;
  copies: boolean;
  video: boolean;
}
