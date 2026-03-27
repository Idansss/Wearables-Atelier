import { useState } from "react";
import { Instagram } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const photos = [
  {
    id: 1,
    src: "/images/collection/look-01.png",
    alt: "Elegant editorial look",
  },
  {
    id: 2,
    src: "/images/collection/look-02.png",
    alt: "Aso Oke occasion gown",
  },
  {
    id: 3,
    src: "/images/collection/look-03.png",
    alt: "Gold jewellery accessories",
  },
  {
    id: 4,
    src: "/images/collection/look-04.png",
    alt: "Turban head wrap look",
  },
  {
    id: 5,
    src: "/images/collection/look-05.png",
    alt: "African fabric textiles",
  },
  {
    id: 6,
    src: "/images/collection/look-06.png",
    alt: "Luxury Kaftan Boubou",
  },
];

function PhotoTile({ photo, instagramUrl }: { photo: (typeof photos)[number]; instagramUrl: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden block"
      style={{ aspectRatio: "1/1" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(13,13,13,0.6)",
          opacity: hovered ? 1 : 0,
        }}
      >
        <Instagram size={28} color="#C9A84C" />
      </div>
    </a>
  );
}

export function InstagramGrid() {
  const { settings } = useSiteSettings();
  const instagramUrl = settings.storefront.instagramUrl;
  const instagramHandle = (() => {
    try {
      const pathname = new URL(instagramUrl).pathname.replace(/\/+$/, "");
      const slug = pathname.split("/").filter(Boolean).pop();
      return slug ? `@${slug.replace(/^@/, "")}` : "@instagram";
    } catch {
      return "@instagram";
    }
  })();

  return (
    <section className="py-16 lg:py-24 px-6 lg:px-10" style={{ backgroundColor: "#F8F5F0" }}>
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.3em] mb-3 uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#6B6560",
            }}
          >
            Follow us for daily inspiration
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 hover:opacity-70 transition-opacity"
          >
            <Instagram size={22} color="#0D0D0D" />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(26px, 3vw, 40px)",
                color: "#0D0D0D",
              }}
            >
              {instagramHandle}
            </span>
          </a>
        </div>

        {/* 6-column photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-8">
          {photos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} instagramUrl={instagramUrl} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border text-xs tracking-[0.2em] uppercase transition-all hover:border-[#C9A84C] hover:text-[#C9A84C]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              borderColor: "#0D0D0D",
              color: "#0D0D0D",
            }}
          >
            <Instagram size={14} />
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
