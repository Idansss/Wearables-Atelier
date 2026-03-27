import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { products, categories } from "@/lib/products";
import Link from "next/link";

export const metadata = {
  title: "Shop All | Wearables Atelier",
  description: "Browse our full collection of premium Nigerian womenswear.",
};

export default function ShopPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        {/* Page header */}
        <div className="bg-charcoal py-20 px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-kicker mb-3">All Collections</p>
          <h1 className="section-title text-cream">
            Shop
          </h1>
          <p className="text-cream/40 text-sm mt-3 tracking-wide">
            {products.length} pieces available
          </p>
        </div>

        <div className="editorial-container py-14">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar filters */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-28 luxury-panel p-6">
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 font-semibold mb-5">
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link href="/shop" className="block py-2 text-sm text-charcoal font-medium border-b border-gold pb-2 mb-1">
                      All Products
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/shop/${cat.slug}`}
                        className="block py-2 text-sm text-charcoal/60 hover:text-gold transition-colors"
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-8 border-t border-charcoal/10">
                  <h3 className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 font-semibold mb-5">
                    Price Range
                  </h3>
                  <div className="space-y-2 text-sm text-charcoal/60">
                    {["Under ₦30,000", "₦30k – ₦75k", "₦75k – ₦120k", "Above ₦120k"].map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer hover:text-gold">
                        <input type="checkbox" className="accent-gold" />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-charcoal/10">
                  <h3 className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 font-semibold mb-5">
                    Availability
                  </h3>
                  <div className="space-y-2 text-sm text-charcoal/60">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gold">
                      <input type="checkbox" className="accent-gold" defaultChecked />
                      In Stock
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gold">
                      <input type="checkbox" className="accent-gold" />
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs text-charcoal/40 tracking-wide">
                  Showing {products.length} products
                </p>
                <select className="text-xs border border-charcoal/15 bg-white/50 px-3 py-2 text-charcoal/60 focus:outline-none focus:border-gold">
                  <option>Sort: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
