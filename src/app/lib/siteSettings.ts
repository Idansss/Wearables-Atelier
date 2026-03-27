export type SiteCollection = {
  slug: string;
  label: string;
  image: string;
  showInNavbar: boolean;
  showInFooter: boolean;
  showOnHomepage: boolean;
  navAccent: "default" | "sale";
  homeLayout: "hero" | "wide" | "standard";
  homeBadge?: string;
};

export type StorefrontSettings = {
  contactEmail: string;
  contactPhone: string;
  whatsappPhone: string;
  whatsappText: string;
  locationLabel: string;
  locationMapUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  heroTrendingName: string;
  heroTrendingPrice: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
};

export type SimplePageSection = {
  heading: string;
  text: string;
};

export type SimplePageContent = {
  title: string;
  subtitle: string;
  content: SimplePageSection[];
};

export const SIMPLE_PAGE_ORDER = [
  { path: "/faq", label: "FAQ" },
  { path: "/shipping", label: "Shipping" },
  { path: "/size-guide", label: "Size Guide" },
  { path: "/returns", label: "Returns" },
  { path: "/terms", label: "Terms" },
  { path: "/privacy", label: "Privacy" },
] as const;

export type SimplePagePath = (typeof SIMPLE_PAGE_ORDER)[number]["path"];
export type SimplePagesSettings = Record<SimplePagePath, SimplePageContent>;

export const DEFAULT_COLLECTIONS: SiteCollection[] = [
  {
    slug: "new-in",
    label: "New In",
    image: "/images/collection/look-02.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "hero",
  },
  {
    slug: "ready-to-wear",
    label: "Ready to Wear",
    image: "/images/collection/look-03.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "jewellery",
    label: "Jewellery",
    image: "/images/collection/look-07.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "fabrics",
    label: "Fabrics",
    image: "/images/collection/look-05.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "turbans",
    label: "Turbans",
    image: "/images/collection/look-06.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "ashabi",
    label: "Ashabi",
    image: "/images/collection/look-04.png",
    showInNavbar: false,
    showInFooter: false,
    showOnHomepage: true,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "wholesale",
    label: "Wholesale",
    image: "/images/collection/look-08.png",
    showInNavbar: false,
    showInFooter: false,
    showOnHomepage: false,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "sale",
    label: "Sale",
    image: "/images/collection/look-01.png",
    showInNavbar: true,
    showInFooter: true,
    showOnHomepage: true,
    navAccent: "sale",
    homeLayout: "wide",
    homeBadge: "UP TO 40% OFF",
  },
  {
    slug: "exclusive",
    label: "Exclusive",
    image: "/images/collection/look-09.png",
    showInNavbar: false,
    showInFooter: false,
    showOnHomepage: false,
    navAccent: "default",
    homeLayout: "standard",
  },
  {
    slug: "limited-edition",
    label: "Limited Edition",
    image: "/images/collection/look-10.png",
    showInNavbar: false,
    showInFooter: false,
    showOnHomepage: false,
    navAccent: "default",
    homeLayout: "standard",
  },
];

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  contactEmail: "hello@wearablesatelier.com",
  contactPhone: "+234 906 729 2754",
  whatsappPhone: "2349067292754",
  whatsappText: "Hello Wearables Atelier! I'd like to place an order.",
  locationLabel: "D4 Shitta Road, Surulere, Lagos",
  locationMapUrl:
    "https://www.google.com/maps/search/?api=1&query=D4+Shitta+Road+Surulere+Lagos+Nigeria",
  instagramUrl: "https://instagram.com/wearablesbyashabi",
  tiktokUrl: "https://www.tiktok.com/@_wearablesng",
  youtubeUrl: "https://www.youtube.com/@wearablesbyashabi",
  heroTrendingName: "Embellished Lace Boubou",
  heroTrendingPrice: "₦120,000",
  heroStat1Value: "364K",
  heroStat1Label: "Followers",
  heroStat2Value: "16K+",
  heroStat2Label: "Looks",
  heroStat3Value: "40%",
  heroStat3Label: "Off Sale",
};

export function getDefaultSimplePages(contactEmail: string): SimplePagesSettings {
  return {
    "/faq": {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about shopping with Wearables Atelier",
      content: [
        {
          heading: "How do I place an order?",
          text: "Simply browse our collections, select your size, and add items to your bag. You can also order directly via WhatsApp for a more personalised experience.",
        },
        {
          heading: "Do you offer custom sizing?",
          text: "Yes! We offer custom sizing on all ready-to-wear pieces. Select 'Custom' as your size and we'll be in touch to take your measurements.",
        },
        {
          heading: "How long does delivery take?",
          text: "Lagos delivery takes 2-4 business days. International shipping takes 7-14 business days. We ship worldwide via DHL and FedEx.",
        },
        {
          heading: "What is your return policy?",
          text: "We accept returns within 14 days of delivery for unworn, unaltered items in their original packaging. Custom pieces cannot be returned.",
        },
        {
          heading: "How do I use the IDANGANGAN discount?",
          text: "Enter code IDANGANGAN at checkout to receive 40% off your order. This code can only be used once per customer.",
        },
        {
          heading: "Do you do wholesale?",
          text: "Yes! We offer wholesale pricing for boutiques and retailers. Please visit our Wholesale page or contact us via WhatsApp.",
        },
      ],
    },
    "/shipping": {
      title: "Shipping Information",
      subtitle: "We deliver your style, wherever you are in the world",
      content: [
        {
          heading: "Lagos Delivery",
          text: "Standard delivery within Lagos takes 2-4 business days. Express same-day delivery is available for orders placed before 12pm. Delivery fee: N2,500.",
        },
        {
          heading: "Nigeria (Outside Lagos)",
          text: "Delivery to other Nigerian states takes 3-7 business days via GIGL or DHL. Delivery fee: N4,000-N7,000 depending on state.",
        },
        {
          heading: "International Shipping",
          text: "We ship worldwide via DHL Express. Delivery time is 7-14 business days. Shipping cost is calculated at checkout based on destination.",
        },
        {
          heading: "Free Shipping",
          text: "Enjoy free worldwide shipping on all orders over N80,000. This discount is applied automatically at checkout.",
        },
        {
          heading: "Order Tracking",
          text: "Once your order ships, you'll receive a tracking number via email and WhatsApp. Track your order at any time on our Track Order page.",
        },
      ],
    },
    "/size-guide": {
      title: "Size Guide",
      subtitle: "Find your perfect fit with Wearables Atelier",
      content: [
        {
          heading: "How to Measure",
          text: "Use a soft measuring tape. Measure your bust at the fullest point, waist at the narrowest point, and hips at the widest point. Always measure over undergarments.",
        },
        {
          heading: "Size Chart (Women)",
          text: "XS: Bust 32\", Waist 25\", Hips 35\" | S: Bust 34\", Waist 27\", Hips 37\" | M: Bust 36\", Waist 29\", Hips 39\" | L: Bust 38\", Waist 31\", Hips 41\" | XL: Bust 40\", Waist 33\", Hips 43\" | XXL: Bust 42\", Waist 35\", Hips 45\"",
        },
        {
          heading: "Custom Sizing",
          text: "All Wearables Atelier pieces can be made to your exact measurements. Select 'Custom' when choosing your size and our team will contact you for your measurements within 24 hours.",
        },
        {
          heading: "Need Help?",
          text: "Unsure about your size? Send us a WhatsApp message with your measurements and we'll recommend the perfect size for you.",
        },
      ],
    },
    "/returns": {
      title: "Returns Policy",
      subtitle: "Your satisfaction is our priority",
      content: [
        {
          heading: "Return Eligibility",
          text: "Items may be returned within 14 days of delivery. Items must be unworn, unaltered, and in their original packaging with all tags attached.",
        },
        {
          heading: "Non-Returnable Items",
          text: "Custom-made pieces, sale items marked as 'final sale', jewellery, and turban sets cannot be returned for hygiene reasons.",
        },
        {
          heading: "How to Return",
          text: `Contact us via WhatsApp or email ${contactEmail} to initiate a return. We will provide you with a return shipping address and instructions.`,
        },
        {
          heading: "Refunds",
          text: "Refunds are processed within 5-10 business days of receiving your returned item. Refunds are issued to your original payment method.",
        },
        {
          heading: "Exchanges",
          text: "We're happy to exchange items for a different size or colour. Please contact us within 14 days of delivery to arrange an exchange.",
        },
      ],
    },
    "/terms": {
      title: "Terms & Conditions",
      subtitle: "Please read these terms carefully before using our website",
      content: [
        {
          heading: "Use of Website",
          text: "By using this website, you agree to these terms and conditions. Wearables Atelier reserves the right to modify these terms at any time.",
        },
        {
          heading: "Product Information",
          text: "We take care to ensure product information is accurate, but colours may vary slightly due to photography and screen settings.",
        },
        {
          heading: "Pricing",
          text: "All prices are displayed in Nigerian Naira (N) unless otherwise stated. Prices are subject to change without notice.",
        },
        {
          heading: "Intellectual Property",
          text: "All content on this website including images, text, and logos are the property of Wearables Atelier and may not be reproduced without written permission.",
        },
      ],
    },
    "/privacy": {
      title: "Privacy Policy",
      subtitle: "Your privacy is important to us",
      content: [
        {
          heading: "Information We Collect",
          text: "We collect information you provide when placing orders, creating an account, or contacting us - including name, email, address, and phone number.",
        },
        {
          heading: "How We Use Your Information",
          text: "We use your information to process orders, provide customer service, send order updates, and (with your consent) marketing communications.",
        },
        {
          heading: "Data Security",
          text: "We implement appropriate security measures to protect your personal information. We do not sell your data to third parties.",
        },
        {
          heading: "Cookies",
          text: "Our website uses cookies to improve your browsing experience. You can disable cookies in your browser settings, though this may affect website functionality.",
        },
      ],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function fallbackCollection(slug: string) {
  return DEFAULT_COLLECTIONS.find((collection) => collection.slug === slug);
}

export function normalizeCollections(value: unknown): SiteCollection[] {
  if (!Array.isArray(value)) {
    return DEFAULT_COLLECTIONS;
  }

  const collections = value
    .map((entry) => {
      if (!isRecord(entry)) return null;

      const rawSlug = typeof entry.slug === "string" ? entry.slug.trim() : "";
      if (!rawSlug) return null;

      const fallback = fallbackCollection(rawSlug);

      return {
        slug: rawSlug,
        label:
          typeof entry.label === "string" && entry.label.trim()
            ? entry.label.trim()
            : fallback?.label ?? rawSlug,
        image:
          typeof entry.image === "string" && entry.image.trim()
            ? entry.image.trim()
            : fallback?.image ?? "/images/collection/look-01.png",
        showInNavbar:
          typeof entry.showInNavbar === "boolean"
            ? entry.showInNavbar
            : fallback?.showInNavbar ?? false,
        showInFooter:
          typeof entry.showInFooter === "boolean"
            ? entry.showInFooter
            : fallback?.showInFooter ?? false,
        showOnHomepage:
          typeof entry.showOnHomepage === "boolean"
            ? entry.showOnHomepage
            : fallback?.showOnHomepage ?? false,
        navAccent: entry.navAccent === "sale" ? "sale" : fallback?.navAccent ?? "default",
        homeLayout:
          entry.homeLayout === "hero" || entry.homeLayout === "wide" || entry.homeLayout === "standard"
            ? entry.homeLayout
            : fallback?.homeLayout ?? "standard",
        homeBadge:
          typeof entry.homeBadge === "string" && entry.homeBadge.trim()
            ? entry.homeBadge.trim()
            : fallback?.homeBadge,
      } satisfies SiteCollection;
    })
    .filter((entry): entry is SiteCollection => entry !== null);

  return collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
}

export function normalizeStorefrontSettings(value: unknown): StorefrontSettings {
  if (!isRecord(value)) {
    return DEFAULT_STOREFRONT_SETTINGS;
  }

  return {
    contactEmail:
      typeof value.contactEmail === "string" && value.contactEmail.trim()
        ? value.contactEmail.trim()
        : DEFAULT_STOREFRONT_SETTINGS.contactEmail,
    contactPhone:
      typeof value.contactPhone === "string" && value.contactPhone.trim()
        ? value.contactPhone.trim()
        : DEFAULT_STOREFRONT_SETTINGS.contactPhone,
    whatsappPhone:
      typeof value.whatsappPhone === "string" && value.whatsappPhone.trim()
        ? value.whatsappPhone.trim()
        : DEFAULT_STOREFRONT_SETTINGS.whatsappPhone,
    whatsappText:
      typeof value.whatsappText === "string" && value.whatsappText.trim()
        ? value.whatsappText.trim()
        : DEFAULT_STOREFRONT_SETTINGS.whatsappText,
    locationLabel:
      typeof value.locationLabel === "string" && value.locationLabel.trim()
        ? value.locationLabel.trim()
        : DEFAULT_STOREFRONT_SETTINGS.locationLabel,
    locationMapUrl:
      typeof value.locationMapUrl === "string" && value.locationMapUrl.trim()
        ? value.locationMapUrl.trim()
        : DEFAULT_STOREFRONT_SETTINGS.locationMapUrl,
    instagramUrl:
      typeof value.instagramUrl === "string" && value.instagramUrl.trim()
        ? value.instagramUrl.trim()
        : DEFAULT_STOREFRONT_SETTINGS.instagramUrl,
    tiktokUrl:
      typeof value.tiktokUrl === "string" && value.tiktokUrl.trim()
        ? value.tiktokUrl.trim()
        : DEFAULT_STOREFRONT_SETTINGS.tiktokUrl,
    youtubeUrl:
      typeof value.youtubeUrl === "string" && value.youtubeUrl.trim()
        ? value.youtubeUrl.trim()
        : DEFAULT_STOREFRONT_SETTINGS.youtubeUrl,
    heroTrendingName: typeof value.heroTrendingName === "string" && value.heroTrendingName.trim() ? value.heroTrendingName.trim() : DEFAULT_STOREFRONT_SETTINGS.heroTrendingName,
    heroTrendingPrice: typeof value.heroTrendingPrice === "string" && value.heroTrendingPrice.trim() ? value.heroTrendingPrice.trim() : DEFAULT_STOREFRONT_SETTINGS.heroTrendingPrice,
    heroStat1Value: typeof value.heroStat1Value === "string" && value.heroStat1Value.trim() ? value.heroStat1Value.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat1Value,
    heroStat1Label: typeof value.heroStat1Label === "string" && value.heroStat1Label.trim() ? value.heroStat1Label.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat1Label,
    heroStat2Value: typeof value.heroStat2Value === "string" && value.heroStat2Value.trim() ? value.heroStat2Value.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat2Value,
    heroStat2Label: typeof value.heroStat2Label === "string" && value.heroStat2Label.trim() ? value.heroStat2Label.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat2Label,
    heroStat3Value: typeof value.heroStat3Value === "string" && value.heroStat3Value.trim() ? value.heroStat3Value.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat3Value,
    heroStat3Label: typeof value.heroStat3Label === "string" && value.heroStat3Label.trim() ? value.heroStat3Label.trim() : DEFAULT_STOREFRONT_SETTINGS.heroStat3Label,
  };
}

export function normalizeSimplePages(
  value: unknown,
  contactEmail: string
): SimplePagesSettings {
  const defaults = getDefaultSimplePages(contactEmail);

  if (!isRecord(value)) {
    return defaults;
  }

  const result = {} as SimplePagesSettings;

  for (const { path } of SIMPLE_PAGE_ORDER) {
    const rawPage = value[path];
    const fallback = defaults[path];

    if (!isRecord(rawPage)) {
      result[path] = fallback;
      continue;
    }

    const rawSections = Array.isArray(rawPage.content) ? rawPage.content : [];
    const sections = rawSections
      .map((entry) => {
        if (!isRecord(entry)) return null;
        const heading =
          typeof entry.heading === "string" && entry.heading.trim()
            ? entry.heading.trim()
            : "";
        const text =
          typeof entry.text === "string" && entry.text.trim() ? entry.text.trim() : "";
        if (!heading || !text) return null;
        return { heading, text } satisfies SimplePageSection;
      })
      .filter((entry): entry is SimplePageSection => entry !== null);

    result[path] = {
      title:
        typeof rawPage.title === "string" && rawPage.title.trim()
          ? rawPage.title.trim()
          : fallback.title,
      subtitle:
        typeof rawPage.subtitle === "string" && rawPage.subtitle.trim()
          ? rawPage.subtitle.trim()
          : fallback.subtitle,
      content: sections.length > 0 ? sections : fallback.content,
    };
  }

  return result;
}

export function getCollectionHref(slug: string) {
  return `/shop/${slug}`;
}

export function getCollectionLabelMap(collections: SiteCollection[]) {
  return collections.reduce<Record<string, string>>((acc, collection) => {
    acc[collection.slug] = collection.label;
    return acc;
  }, {});
}

export function buildWhatsAppHref(
  storefront: Pick<StorefrontSettings, "whatsappPhone" | "whatsappText">,
  message?: string
) {
  const phone = storefront.whatsappPhone.replace(/\D+/g, "");
  const text = (message ?? storefront.whatsappText).trim();
  if (!text) {
    return `https://wa.me/${phone}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
