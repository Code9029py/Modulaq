import { Head } from "vite-react-ssg";
import { siteConfig } from "../constants/site";
import { useI18n } from "../i18n/I18nProvider";
import { mapPathToLanguage } from "../i18n/I18nProvider";
import type { Language } from "../i18n/types";
import { SITE_URL, toCanonicalUrl } from "./canonical";

const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

type PageHeadProps = {
  title: string;
  description: string;
  /** Path actual sin dominio (ej: "/herramientas" o "/en/tools"). */
  path: string;
  noindex?: boolean;
  bareTitle?: boolean;
};

const OG_LOCALE: Record<Language, string> = {
  es: "es_ES",
  en: "en_US",
};

const HTML_LANG: Record<Language, string> = {
  es: "es",
  en: "en",
};

export function PageHead({ title, description, path, noindex = false, bareTitle = false }: PageHeadProps) {
  const { language } = useI18n();
  const fullTitle = bareTitle ? title : `${title} · ${siteConfig.name}`;
  const canonical = toCanonicalUrl(path);

  const otherLang: Language = language === "es" ? "en" : "es";
  const altPath = mapPathToLanguage(path, otherLang);
  const altUrl = toCanonicalUrl(altPath);

  return (
    <Head>
      <html lang={HTML_LANG[language]} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang={HTML_LANG[language]} href={canonical} />
      <link rel="alternate" hrefLang={HTML_LANG[otherLang]} href={altUrl} />
      <link rel="alternate" hrefLang="x-default" href={toCanonicalUrl(mapPathToLanguage(path, "es"))} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={OG_LOCALE[language]} />
      <meta property="og:locale:alternate" content={OG_LOCALE[otherLang]} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />
    </Head>
  );
}
