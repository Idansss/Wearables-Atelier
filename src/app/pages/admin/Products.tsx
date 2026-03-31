import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, Search, X, Loader2, ImageIcon, ChevronDown, Upload, Link } from "lucide-react";
import { toast } from "sonner";
import { getProducts, saveProduct, updateProduct, deleteProduct, logAdminAction, type Product, type ProductInput } from "../../lib/db";
import { uploadImageFile } from "../../lib/uploads";
import { useAdmin } from "../../context/AdminContext";

const CATEGORIES = [
  { value: "new-in", label: "New In" },
  { value: "ready-to-wear", label: "Ready to Wear" },
  { value: "jewellery", label: "Jewellery" },
  { value: "fabrics", label: "Fabrics" },
  { value: "turbans", label: "Turbans" },
  { value: "ashabi", label: "Ashabi" },
  { value: "exclusive", label: "Exclusive" },
  { value: "limited-edition", label: "Limited Edition" },
  { value: "wholesale", label: "Wholesale" },
];

const BADGES = [
  { value: "", label: "None", color: "" },
  { value: "New In", label: "New In", color: "#0D0D0D" },
  { value: "Sale", label: "Sale", color: "#e53935" },
  { value: "Exclusive", label: "Exclusive", color: "#C9A84C" },
  { value: "Limited Edition", label: "Limited Edition", color: "#C9A84C" },
];

const categoryLabel = (cat: string) =>
  CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

const emptyForm = (): ProductInput => ({
  slug: "",
  name: "",
  category: "ready-to-wear",
  price: 0,
  salePrice: undefined,
  description: "",
  sizes: [],
  details: [],
  images: [],
  badge: "",
  badgeColor: "",
  inStock: true,
  featured: false,
});

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type ModalProps = {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
  adminUser?: { id: string; email: string | null } | null;
};

function ProductModal({ product, onClose, onSaved, adminUser }: ModalProps) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductInput>(product ? {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    salePrice: product.salePrice,
    description: product.description,
    sizes: product.sizes,
    details: product.details,
    images: product.images,
    badge: product.badge ?? "",
    badgeColor: product.badgeColor ?? "",
    inStock: product.inStock,
    featured: product.featured,
  } : emptyForm());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sizesInput, setSizesInput] = useState((product?.sizes ?? []).join(", "));
  const [detailsInput, setDetailsInput] = useState((product?.details ?? []).join("\n"));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(key: keyof ProductInput, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleNameChange(val: string) {
    set("name", val);
    if (!isEdit) set("slug", slugify(val));
  }

  function handleBadgeChange(val: string) {
    const badge = BADGES.find((b) => b.value === val);
    set("badge", val);
    set("badgeColor", badge?.color ?? "");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImageFile(file, "products");
      setImages((prev) => [...prev, url]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setUrlInput("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.slug) { setError("Slug is required"); return; }
    if (!form.name) { setError("Name is required"); return; }
    if (form.price <= 0) { setError("Price must be greater than 0"); return; }

    const data: ProductInput = {
      ...form,
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      details: detailsInput.split("\n").map((s) => s.trim()).filter(Boolean),
      images,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(product.slug, data);
        if (adminUser) void logAdminAction(adminUser.id, adminUser.email ?? "", "product_updated", { slug: data.slug, name: data.name });
        toast.success("Product updated");
      } else {
        await saveProduct(data);
        if (adminUser) void logAdminAction(adminUser.id, adminUser.email ?? "", "product_created", { slug: data.slug, name: data.name });
        toast.success("Product added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white";
  const inputStyle = { borderColor: "rgba(13,13,13,0.2)", color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" };
  const labelCls = "text-xs tracking-[0.12em] uppercase block mb-1.5 font-semibold";
  const labelStyle = { color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-xl h-full overflow-y-auto"
        style={{ backgroundColor: "#F8F5F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: "#F8F5F0", borderColor: "rgba(13,13,13,0.12)" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "22px", color: "#0D0D0D" }}>
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:opacity-60">
            <X size={18} style={{ color: "#6B6560" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>Product Name *</label>
            <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Embellished Lace Boubou" required />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Slug (URL) *</label>
            <input className={inputCls} style={inputStyle} value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="embellished-lace-boubou" readOnly={isEdit} required />
            <p className="mt-1 text-xs" style={{ color: "#6B6560" }}>Auto-generated from name. URL: /product/{form.slug || "..."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Category *</label>
              <div className="relative">
                <select title="Category" className={inputCls} style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B6560" }} />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Badge</label>
              <div className="relative">
                <select title="Badge" className={inputCls} style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }} value={form.badge ?? ""} onChange={(e) => handleBadgeChange(e.target.value)}>
                  {BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B6560" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Price (₦) *</label>
              <input type="number" className={inputCls} style={inputStyle} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="120000" min={0} required />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Sale Price (₦)</label>
              <input type="number" className={inputCls} style={inputStyle} value={form.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : undefined)} placeholder="Leave empty if not on sale" min={0} />
            </div>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Description</label>
            <textarea rows={4} className={inputCls + " resize-none"} style={inputStyle} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the product..." />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Sizes (comma-separated)</label>
            <input className={inputCls} style={inputStyle} value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="XS, S, M, L, XL, XXL, Custom" />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Product Details (one per line)</label>
            <textarea rows={4} className={inputCls + " resize-none"} style={inputStyle} value={detailsInput} onChange={(e) => setDetailsInput(e.target.value)} placeholder={"100% premium lace\nHand-applied embellishments\nDry clean only"} />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Images</label>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((url, i) => (
                  <div key={i} className="relative w-20 h-24 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#EDE8DF" }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] py-0.5 font-semibold tracking-wider" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      aria-label="Remove image"
                    >
                      <X size={10} style={{ color: "#fff" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload product image" title="Upload product image" onChange={handleFileUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-wider border-2 border-dashed transition-colors hover:border-[#C9A84C] disabled:opacity-50 mb-3"
              style={{ borderColor: "rgba(13,13,13,0.2)", color: "#6B6560", fontWeight: 600 }}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Uploading…" : "Upload PNG / JPG"}
            </button>

            {uploadError && <p className="text-xs mb-2" style={{ color: "#e53935" }}>{uploadError}</p>}

            {/* URL fallback */}
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
                placeholder="Or paste an image URL…"
                className={inputCls + " flex-1"}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-2 flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#0D0D0D", color: "#C9A84C" }}
              >
                <Link size={13} /> Add
              </button>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: "#6B6560" }}>First image is the primary thumbnail. Drag order not supported — add in preferred order.</p>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="accent-[#C9A84C]" />
              <span className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}>In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#C9A84C]" />
              <span className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}>Featured</span>
            </label>
          </div>

          {error && <p className="text-xs text-center" style={{ color: "#e53935" }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-xs tracking-[0.12em] uppercase border transition-opacity hover:opacity-70" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderColor: "rgba(13,13,13,0.3)", color: "#0D0D0D" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 text-xs tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-50" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { user } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleToggle(product: Product, field: "inStock" | "featured") {
    setToggling(product.id + field);
    try {
      await updateProduct(product.slug, { [field]: !product[field] });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: !p[field] } : p));
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.slug);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (user) void logAdminAction(user.id, user.email ?? "", "product_deleted", { slug: deleteTarget.slug, name: deleteTarget.name });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "32px", color: "#0D0D0D" }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B6560" }}>{products.length} product{products.length !== 1 ? "s" : ""} in catalogue</p>
        </div>
        <button
          type="button"
          onClick={() => setModalProduct("new")}
          className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.12em] uppercase transition-opacity hover:opacity-80"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B6560" }} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border outline-none focus:border-[#C9A84C] bg-white"
            style={{ borderColor: "rgba(13,13,13,0.2)", color: "#0D0D0D" }}
          />
        </div>
        <div className="relative">
          <select
            title="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-3 pr-8 py-2 text-xs border outline-none bg-white appearance-none"
            style={{ borderColor: "rgba(13,13,13,0.2)", color: "#0D0D0D" }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B6560" }} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin" style={{ color: "#C9A84C" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <ImageIcon size={40} className="mx-auto mb-4" style={{ color: "rgba(13,13,13,0.15)" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "24px", color: "#0D0D0D" }}>
            {products.length === 0 ? "No products yet" : "No products match your filters"}
          </p>
          {products.length === 0 && (
            <button type="button" onClick={() => setModalProduct("new")} className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>
              <Plus size={13} /> Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="border" style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}>
          <div className="grid text-xs tracking-[0.1em] uppercase px-4 py-3 border-b" style={{ gridTemplateColumns: "64px 1fr 130px 110px 90px 80px 90px", borderColor: "rgba(13,13,13,0.08)", color: "#6B6560" }}>
            <span>Image</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Featured</span><span>Actions</span>
          </div>

          {filtered.map((p) => (
            <div
              key={p.id}
              className="grid items-center px-4 py-3 border-b transition-colors hover:bg-[#F9F7F4]"
              style={{ gridTemplateColumns: "64px 1fr 130px 110px 90px 80px 90px", borderColor: "rgba(13,13,13,0.06)" }}
            >
              <div className="w-12 h-14 overflow-hidden flex-shrink-0" style={{ backgroundColor: "#EDE8DF" }}>
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={16} style={{ color: "#6B6560" }} />
                  </div>
                )}
              </div>

              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium truncate" style={{ color: "#0D0D0D" }}>{p.name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#6B6560" }}>/product/{p.slug}</p>
                {p.badge && (
                  <span className="inline-block mt-1 text-[9px] tracking-[0.12em] uppercase px-2 py-0.5" style={{ backgroundColor: p.badgeColor, color: p.badgeColor === "#C9A84C" ? "#0D0D0D" : "#fff" }}>
                    {p.badge}
                  </span>
                )}
              </div>

              <p className="text-xs" style={{ color: "#6B6560" }}>{categoryLabel(p.category)}</p>

              <div>
                <p className="text-sm font-semibold" style={{ color: p.salePrice ? "#e53935" : "#0D0D0D" }}>
                  ₦{(p.salePrice ?? p.price).toLocaleString()}
                </p>
                {p.salePrice && <p className="text-xs line-through" style={{ color: "#6B6560" }}>₦{p.price.toLocaleString()}</p>}
              </div>

              <button
                type="button"
                onClick={() => handleToggle(p, "inStock")}
                disabled={toggling === p.id + "inStock"}
                className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ color: p.inStock ? "#1a6e2e" : "#e53935" }}
              >
                {p.inStock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {p.inStock ? "In Stock" : "Out"}
              </button>

              <button
                type="button"
                onClick={() => handleToggle(p, "featured")}
                disabled={toggling === p.id + "featured"}
                className="flex items-center justify-center transition-opacity hover:opacity-70"
                title={p.featured ? "Remove from featured" : "Mark as featured"}
              >
                <Star size={16} fill={p.featured ? "#C9A84C" : "none"} style={{ color: p.featured ? "#C9A84C" : "#6B6560" }} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalProduct(p)}
                  className="w-7 h-7 flex items-center justify-center border transition-all hover:border-[#0D0D0D]"
                  style={{ borderColor: "rgba(13,13,13,0.2)", color: "#0D0D0D" }}
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="w-7 h-7 flex items-center justify-center border transition-all hover:border-red-400 hover:text-red-500"
                  style={{ borderColor: "rgba(13,13,13,0.2)", color: "#6B6560" }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct}
          onClose={() => setModalProduct(null)}
          onSaved={load}
          adminUser={user ? { id: user.id, email: user.email ?? null } : null}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm p-6" style={{ backgroundColor: "#F8F5F0" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "22px", color: "#0D0D0D", marginBottom: "8px" }}>Delete product?</p>
            <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
              <strong style={{ color: "#0D0D0D" }}>{deleteTarget.name}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 py-3 text-xs tracking-[0.12em] uppercase border" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderColor: "rgba(13,13,13,0.3)", color: "#0D0D0D" }}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 py-3 text-xs tracking-[0.12em] uppercase flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#e53935", color: "#fff" }}>
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
