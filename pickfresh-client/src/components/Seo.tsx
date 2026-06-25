import { Helmet } from "react-helmet-async";

export const Seo = ({ title, description }: { title: string; description: string }) => (
  <Helmet>
    <title>{title} | PickFresh</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} | PickFresh`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "GroceryStore",
        name: "PickFresh",
        description,
      })}
    </script>
  </Helmet>
);
