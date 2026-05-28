import { Head } from "vite-react-ssg";
import { siteConfig } from "../constants/site";

const SITE_URL = `https://${siteConfig.domain}`;
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

type PageHeadProps = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  bareTitle?: boolean;
};

function buildCanonical(path: string) {
  if (path === "/") {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}${path}`;
}

export function PageHead({ title, description, path, noindex = false, bareTitle = false }: PageHeadProps) {
  const fullTitle = bareTitle ? title : `${title} · ${siteConfig.name}`;
  const canonical = buildCanonical(path);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_ES" />
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
