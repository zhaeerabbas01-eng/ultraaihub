import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME } from "@/lib/seo/jsonLd";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

export function SEO({ title, description, path = "/", type = "website", image, jsonLd, noindex }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
