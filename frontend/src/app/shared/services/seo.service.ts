import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  /** Absolute canonical URL, e.g. https://brivadiena.lv/trip/14/iseo-ezers-un-bergamo-01082026 */
  canonicalUrl: string;
  image?: string;
  type?: string;
}

const JSONLD_SCRIPT_ID = 'seo-jsonld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  readonly siteUrl = 'https://brivadiena.lv';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  update(data: SeoData): void {
    this.titleService.setTitle(data.title);
    this.metaService.updateTag({ name: 'description', content: data.description });

    this.metaService.updateTag({ property: 'og:title', content: data.title });
    this.metaService.updateTag({ property: 'og:description', content: data.description });
    this.metaService.updateTag({ property: 'og:type', content: data.type || 'website' });
    this.metaService.updateTag({ property: 'og:url', content: data.canonicalUrl });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Brīva Diena' });

    this.metaService.updateTag({ name: 'twitter:card', content: data.image ? 'summary_large_image' : 'summary' });
    this.metaService.updateTag({ name: 'twitter:title', content: data.title });
    this.metaService.updateTag({ name: 'twitter:description', content: data.description });

    if (data.image) {
      this.metaService.updateTag({ property: 'og:image', content: data.image });
      this.metaService.updateTag({ name: 'twitter:image', content: data.image });
    } else {
      this.metaService.removeTag('property="og:image"');
      this.metaService.removeTag('name="twitter:image"');
    }

    this.setCanonicalUrl(data.canonicalUrl);
  }

  setCanonicalUrl(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  absoluteUrl(path: string): string {
    return `${this.siteUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  setJsonLd(data: object): void {
    this.removeJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSONLD_SCRIPT_ID;
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeJsonLd(): void {
    this.document.getElementById(JSONLD_SCRIPT_ID)?.remove();
  }
}
