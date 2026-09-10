export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/submit"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/submit"],
      },
    ],
    sitemap: "https://promptvault.vercel.app/sitemap.xml",
  };
}
