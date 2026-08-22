import { AppSettings, Campaign } from '../types';

/**
 * Updates DOM Open Graph (og:image, og:title, og:description, og:url) and Twitter Card meta tags
 * dynamically so when a user shares a specific campaign URL, WhatsApp, Facebook, Telegram, Twitter,
 * and LinkedIn crawlers/scrapers extract the exact photo and details of that campaign.
 */
export const updateSocialShareMetaTags = (
  campaign: Campaign | null,
  settings: AppSettings,
  targetUrl?: string
) => {
  if (typeof document === 'undefined') return;

  const appName = settings.appName || 'Sahabat Jariyah';
  const siteUrl = targetUrl || window.location.href;

  const title = campaign
    ? `${campaign.title} - ${appName}`
    : `${appName} - Platform Donasi & Transparansi Penyaluran Dana`;

  const description = campaign
    ? campaign.shortDesc || campaign.storyHtml?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Salurkan donasi terbaik Anda untuk program ${campaign.title}.`
    : settings.appTagline || 'Platform donasi dan crowdfunding syariah dengan transparansi penyaluran dana real-time.';


  const imageUrl = campaign?.imageUrl 
    ? campaign.imageUrl 
    : (settings.logoUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&h=630&q=80');

  // 1. Update Title tag
  document.title = title;

  // Helper to update or create meta tag
  const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
    let element = document.querySelector(`meta[${attributeName}='${attributeValue}']`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Standard Description
  setMetaTag('name', 'description', description);

  // Open Graph (WhatsApp, Facebook, Telegram, LinkedIn, Discord)
  setMetaTag('property', 'og:site_name', appName);
  setMetaTag('property', 'og:type', campaign ? 'article' : 'website');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:image:secure_url', imageUrl);
  setMetaTag('property', 'og:image:type', imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg');
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:image:alt', campaign ? campaign.title : appName);
  setMetaTag('property', 'og:url', siteUrl);

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);
  setMetaTag('name', 'twitter:image:alt', campaign ? campaign.title : appName);
  setMetaTag('name', 'twitter:url', siteUrl);
};
