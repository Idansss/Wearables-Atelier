export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: Category;
  images: string[];
  description: string;
  sizes?: string[];
  badge?: "New In" | "Sale" | "Limited Edition" | "Exclusive" | "Wholesale";
  inStock: boolean;
  featured?: boolean;
};

export type Category =
  | "new-in"
  | "ready-to-wear"
  | "jewellery"
  | "fabrics"
  | "turbans"
  | "wholesale"
  | "sale"
  | "ashabi"
  | "exclusive"
  | "limited-edition";

export const categories = [
  { slug: "new-in", label: "New In", description: "Fresh arrivals, just landed" },
  { slug: "ready-to-wear", label: "Ready to Wear", description: "Curated pieces ready to ship" },
  { slug: "jewellery", label: "Jewellery", description: "Hand-beaded & artisan pieces" },
  { slug: "fabrics", label: "Fabrics", description: "Premium Aso Oke, Damask & more" },
  { slug: "turbans", label: "Turbans", description: "The finest gele & turban sets" },
  { slug: "wholesale", label: "Wholesale Deals", description: "Bulk pricing for retailers" },
  { slug: "sale", label: "Sale", description: "Up to 40% off selected styles" },
];

// Mock products — replace with real data from your CMS/backend
export const products: Product[] = [
  {
    id: "1",
    name: "Embellished Lace Boubou",
    slug: "embellished-lace-boubou",
    price: 120000,
    category: "ready-to-wear",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4e7b?w=800&q=80",
    ],
    description:
      "A stunning hand-embellished lace boubou, crafted for the modern African woman who demands luxury without compromise. Every detail is intentional.",
    sizes: ["S", "M", "L", "XL", "XXL", "Custom"],
    badge: "New In",
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Cotton Dress – Size 22",
    slug: "cotton-dress-size-22",
    price: 35000,
    category: "ready-to-wear",
    images: [
      "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80",
    ],
    description:
      "Premium cotton dress, expertly tailored for comfort and elegance. Available in a range of sizes.",
    sizes: ["18", "20", "22", "24", "26"],
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Turban Array Set",
    slug: "turban-array-set",
    price: 25000,
    originalPrice: 35000,
    category: "turbans",
    images: [
      "https://images.unsplash.com/photo-1583500178690-594ce8d75e4e?w=800&q=80",
    ],
    description:
      "A curated collection of premium turbans — each piece a statement of culture and elegance.",
    badge: "Sale",
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Ashabi Aso Oke Brocade",
    slug: "ashabi-aso-oke-brocade",
    price: 135000,
    category: "ashabi",
    images: [
      "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80",
    ],
    description:
      "The signature Ashabi collection piece. Handwoven Aso Oke with gold brocade threading — a collector's fabric.",
    badge: "Exclusive",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Hand-Beaded Kaftan",
    slug: "hand-beaded-kaftan",
    price: 85000,
    category: "ready-to-wear",
    images: [
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&q=80",
    ],
    description:
      "Intricate hand-beading on flowing kaftan fabric. A show-stopping piece for any occasion.",
    sizes: ["One Size", "S/M", "L/XL"],
    badge: "Limited Edition",
    inStock: true,
  },
  {
    id: "6",
    name: "Velvet Damask Wrapper Set",
    slug: "velvet-damask-wrapper-set",
    price: 65000,
    category: "fabrics",
    images: [
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&q=80",
    ],
    description:
      "Rich velvet-finish damask in a 5-yard set. Perfect for bespoke tailoring.",
    inStock: true,
  },
  {
    id: "7",
    name: "Gold Statement Necklace",
    slug: "gold-statement-necklace",
    price: 18000,
    originalPrice: 25000,
    category: "jewellery",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    ],
    description:
      "Artisan-crafted statement necklace — the perfect complement to any traditional outfit.",
    badge: "Sale",
    inStock: true,
  },
  {
    id: "8",
    name: "Wholesale Adire Fabric Bundle",
    slug: "wholesale-adire-bundle",
    price: 150000,
    category: "wholesale",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    description:
      "Bulk adire fabric bundle — 10 yards per piece, minimum 5 pieces. Ideal for retailers and designers.",
    badge: "Wholesale",
    inStock: true,
  },
];

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
