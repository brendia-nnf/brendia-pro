import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brendia Pro®",
    short_name: "Brendia Pro®",
    description:
      "Premium weft extensions education and certification courses by Nikolina Kljaić",
    start_url: "/",
    display: "standalone",
    background_color: "#FEFEFE",
    theme_color: "#1A1A1A",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
