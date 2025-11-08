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
  font?: 'Sora' | 'Inter' | 'Poppins' | 'Roboto' | 'Lato';
}

export interface CampaignAssets {
  landingPageHtml: string;
  /*instagramAdImage: string; // base64
  copyVariants: string; // plain text
  videoStatus: string; // "building" */
}




