/**
 * Utility functions for extracting domain names and generating high-quality favicon / site icon URLs.
 */

// Comprehensive mapping of popular brand & service names to their canonical domains
const BRAND_DOMAIN_MAP: Record<string, string> = {
  facebook: 'facebook.com',
  fb: 'facebook.com',
  google: 'google.com',
  gmail: 'mail.google.com',
  'google drive': 'drive.google.com',
  drive: 'drive.google.com',
  'google cloud': 'cloud.google.com',
  'google docs': 'docs.google.com',
  'google photos': 'photos.google.com',
  'google meet': 'meet.google.com',
  youtube: 'youtube.com',
  yt: 'youtube.com',
  github: 'github.com',
  gitlab: 'gitlab.com',
  bitbucket: 'bitbucket.org',
  twitter: 'x.com',
  x: 'x.com',
  instagram: 'instagram.com',
  insta: 'instagram.com',
  linkedin: 'linkedin.com',
  whatsapp: 'whatsapp.com',
  telegram: 'telegram.org',
  tg: 'telegram.org',
  chatgpt: 'chatgpt.com',
  openai: 'openai.com',
  claude: 'claude.ai',
  anthropic: 'anthropic.com',
  gemini: 'gemini.google.com',
  deepseek: 'deepseek.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  amazon: 'amazon.com',
  aws: 'aws.amazon.com',
  prime: 'primevideo.com',
  apple: 'apple.com',
  icloud: 'icloud.com',
  microsoft: 'microsoft.com',
  outlook: 'outlook.live.com',
  hotmail: 'outlook.live.com',
  office: 'office.com',
  yahoo: 'yahoo.com',
  yahoomail: 'mail.yahoo.com',
  discord: 'discord.com',
  twitch: 'twitch.tv',
  reddit: 'reddit.com',
  pinterest: 'pinterest.com',
  quora: 'quora.com',
  medium: 'medium.com',
  tumblr: 'tumblr.com',
  dropbox: 'dropbox.com',
  onedrive: 'onedrive.live.com',
  paypal: 'paypal.com',
  stripe: 'stripe.com',
  binance: 'binance.com',
  coinbase: 'coinbase.com',
  bybit: 'bybit.com',
  trustwallet: 'trustwallet.com',
  bkash: 'bkash.com',
  nagad: 'nagad.com.bd',
  rocket: 'dutchbanglabank.com',
  upay: 'upaybd.com',
  cellfin: 'ibbl.com.bd',
  islamibank: 'islamibankbd.com',
  bracbank: 'bracbank.com',
  dbbl: 'dutchbanglabank.com',
  citybank: 'thecitybank.com',
  ebl: 'ebl.com.bd',
  daraz: 'daraz.com.bd',
  aliexpress: 'aliexpress.com',
  ebay: 'ebay.com',
  alibaba: 'alibaba.com',
  canva: 'canva.com',
  figma: 'figma.com',
  notion: 'notion.so',
  trello: 'trello.com',
  slack: 'slack.com',
  zoom: 'zoom.us',
  skype: 'skype.com',
  roblox: 'roblox.com',
  steam: 'steampowered.com',
  epicgames: 'epicgames.com',
  fiverr: 'fiverr.com',
  upwork: 'upwork.com',
  freelancer: 'freelancer.com',
  adobe: 'adobe.com',
  wordpress: 'wordpress.com',
  blogger: 'blogger.com',
  wix: 'wix.com',
  shopify: 'shopify.com',
  squarespace: 'squarespace.com',
  cloudflare: 'cloudflare.com',
  vercel: 'vercel.com',
  netlify: 'netlify.com',
  heroku: 'heroku.com',
  godaddy: 'godaddy.com',
  namecheap: 'namecheap.com',
  firebase: 'firebase.google.com',
  supabase: 'supabase.com',
  mongodb: 'mongodb.com',
  huggingface: 'huggingface.co',
  wikipedia: 'wikipedia.org',
  speedtest: 'speedtest.net',
  fast: 'fast.com',
  prothomalo: 'prothomalo.com',
  bdjobs: 'bdjobs.com',
  coursera: 'coursera.org',
  udemy: 'udemy.com',
  duolingo: 'duolingo.com',
};

function getRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname;
  const secondToLast = parts[parts.length - 2];
  if (['co', 'com', 'org', 'net', 'edu', 'gov'].includes(secondToLast) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

export function isDirectImageUrl(urlStr?: string): boolean {
  if (!urlStr) return false;
  const clean = urlStr.trim().toLowerCase();
  if (clean.startsWith('data:image/')) return true;
  if (clean.startsWith('blob:')) return true;

  // Common direct image file extensions
  if (/\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff)(\?.*)?$/i.test(clean)) return true;

  // Common image hosting CDN patterns
  if (
    clean.includes('unsplash.com') ||
    clean.includes('cloudinary.com') ||
    clean.includes('imgur.com') ||
    clean.includes('googleusercontent.com') ||
    clean.includes('s2/favicons') ||
    clean.includes('favicon') ||
    clean.includes('/assets/') ||
    clean.includes('/images/') ||
    clean.includes('/img/') ||
    clean.includes('cdn.') ||
    clean.includes('media.') ||
    clean.includes('avatar')
  ) {
    return true;
  }

  return false;
}

export function extractDomainsFromInputs(posterUrl?: string, siteUrl?: string, title?: string): string[] {
  const domains: string[] = [];

  const addDomainStr = (raw: string) => {
    if (!raw) return;
    let clean = raw.trim().toLowerCase();
    if (!clean) return;

    // Email format e.g. admin@company.com or user@gmail.com
    if (clean.includes('@') && !clean.includes('://')) {
      const parts = clean.split('@');
      clean = parts[parts.length - 1].trim();
    }

    // Strip http(s)://, //, www.
    clean = clean.replace(/^https?:\/\//i, '').replace(/^\/\//, '').replace(/^www\./i, '');

    // Strip path, query params, hashes, port numbers
    clean = clean.split('/')[0].split('?')[0].split('#')[0].split(':')[0].trim();

    // Check if clean matches known brand dictionary key
    if (BRAND_DOMAIN_MAP[clean]) {
      clean = BRAND_DOMAIN_MAP[clean];
    }

    // If single word like "google", "facebook", "github", "twitter"
    if (clean && !clean.includes('.') && /^[a-z0-9-]+$/i.test(clean)) {
      clean = `${clean}.com`;
    }

    if (clean && clean.includes('.') && clean.length >= 3) {
      if (!domains.includes(clean)) {
        domains.push(clean);
      }
      // Also extract root domain if it's a subdomain (e.g. accounts.google.com -> google.com)
      const root = getRootDomain(clean);
      if (root && root !== clean && !domains.includes(root)) {
        domains.push(root);
      }
    }
  };

  // 1. Check posterUrl (in case user pasted website link into posterUrl input)
  if (posterUrl) addDomainStr(posterUrl);

  // 2. Check siteUrl
  if (siteUrl) addDomainStr(siteUrl);

  // 3. Check title (e.g. "Google", "Facebook Admin", "GitHub", "Gmail", "https://example.com")
  if (title) {
    const titleClean = title.trim();
    // Look for embedded domain like example.com
    const domainInTitle = titleClean.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,10})/i);
    if (domainInTitle && domainInTitle[1]) {
      addDomainStr(domainInTitle[1]);
    } else {
      // Check full title in BRAND_DOMAIN_MAP
      const normalizedTitleKey = titleClean.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (BRAND_DOMAIN_MAP[normalizedTitleKey]) {
        addDomainStr(BRAND_DOMAIN_MAP[normalizedTitleKey]);
      } else {
        // Check first word
        const firstWord = titleClean.split(/\s+/)[0];
        if (firstWord) addDomainStr(firstWord);
      }
    }
  }

  return domains;
}

export function getFaviconUrl(siteUrl?: string): string | null {
  if (!siteUrl) return null;
  const domains = extractDomainsFromInputs(undefined, siteUrl, undefined);
  if (domains.length === 0) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domains[0])}&sz=128`;
}

/**
 * Gets candidate icon URLs in priority order across multiple CDNs:
 * 1. Direct posterUrl (if provided and is an image)
 * 2. Multi-CDN favicons derived from posterUrl, siteUrl, title domains
 * 3. Raw posterUrl (as last resort if not direct image)
 */
export function getIconCandidates(posterUrl?: string, siteUrl?: string, title?: string): string[] {
  const candidates: string[] = [];

  // 1. If posterUrl is a direct image or data URI
  if (posterUrl && posterUrl.trim()) {
    const trimmed = posterUrl.trim();
    if (isDirectImageUrl(trimmed) || /\.(png|jpg|jpeg|svg|webp|ico)(\?.*)?$/i.test(trimmed)) {
      candidates.push(trimmed);
    }
  }

  // 2. Extract domains from all inputs
  const domains = extractDomainsFromInputs(posterUrl, siteUrl, title);

  // For each domain, add multi-CDN icon services
  for (const domain of domains) {
    // 1. Google Favicons (128px high res - fast, indexed across entire web)
    const googleFav = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    if (!candidates.includes(googleFav)) candidates.push(googleFav);

    // 2. Clearbit Logo API (High resolution vector/brand logo)
    const clearbitLogo = `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
    if (!candidates.includes(clearbitLogo)) candidates.push(clearbitLogo);

    // 3. DuckDuckGo Icons
    const ddgFav = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
    if (!candidates.includes(ddgFav)) candidates.push(ddgFav);

    // 4. Yandex Favicons (128px high res)
    const yandexFav = `https://favicon.yandex.net/favicon/${encodeURIComponent(domain)}?size=128`;
    if (!candidates.includes(yandexFav)) candidates.push(yandexFav);

    // 5. Favicone CDN
    const favicone = `https://favicone.com/${encodeURIComponent(domain)}?s=128`;
    if (!candidates.includes(favicone)) candidates.push(favicone);

    // 6. Unavatar
    const unavatar = `https://unavatar.io/${encodeURIComponent(domain)}`;
    if (!candidates.includes(unavatar)) candidates.push(unavatar);

    // 7. Direct site favicon.ico fallback
    const directFav = `https://${domain}/favicon.ico`;
    if (!candidates.includes(directFav)) candidates.push(directFav);
  }

  // 3. Fallback to raw posterUrl if it was provided and not direct image
  if (posterUrl && posterUrl.trim() && !isDirectImageUrl(posterUrl.trim())) {
    const trimmed = posterUrl.trim();
    if (!candidates.includes(trimmed)) {
      candidates.push(trimmed);
    }
  }

  return candidates;
}

export function getItemIconUrl(posterUrl?: string, siteUrl?: string, title?: string): string | null {
  const candidates = getIconCandidates(posterUrl, siteUrl, title);
  return candidates.length > 0 ? candidates[0] : null;
}
