Brand Identity
Brand Name: Wearables Atelier
Sub-brand: Wearables by Ashabi (Instagram: @wearablesbyashabi)
Tagline: CULTURE · LUXURY · ELEGANCE
Location: Lagos, Nigeria · Ships Worldwide
Social proof: 364K Instagram followers

Color Palette
Name	Hex	Usage
Charcoal Black	#0D0D0D	Primary background, navbar
Rich Gold	#C9A84C	Accents, CTAs, highlights
Gold Light	#E8C96A	Hover states
Cream	#F8F5F0	Light section backgrounds
Sand	#EDE8DF	Cards, secondary backgrounds
Muted	#6B6560	Body text, subtitles
Typography
Role	Font	Weight	Style
Display / Headlines	Cormorant Garamond	300–400	Italic
Sub-headings	Cormorant Garamond	500	Normal
Navigation	DM Sans	500	Uppercase, tracked
Body	DM Sans	400	Normal
Labels / Badges	DM Sans	600	Uppercase, wide tracking
Site Structure & Pages

/ → Homepage
/shop → All products (grid + sidebar filters)
/shop/[category] → new-in · ready-to-wear · jewellery · fabrics · turbans · wholesale · sale · ashabi · exclusive · limited-edition
/product/[slug] → Product detail
/about → Brand story
/contact → Contact form + WhatsApp
/account → Sign in / Sign up / Forgot password
/cart → Cart + checkout
/faq → FAQs
/shipping → Shipping info
/track → Order tracking
/size-guide → Size chart
/returns → Returns policy
/terms · /privacy → Legal pages
Homepage Sections (top to bottom)
1. Announcement Bar
Dark background #0D0D0D, gold text
Rotating messages: shipping offer, coupon code IDANGANGAN (40% off), new drops
2. Navbar (transparent → frosted on scroll)
Left: Logo (gold cursive "Wba" wordmark)
Center: NEW IN · WHOLESALE · READY TO WEAR · JEWELLERY · FABRICS · TURBANS · SALE (red)
Right: Search icon · Account icon · Cart bag icon
3. Hero — Full-screen split layout
Left 50%: Dark background
Tag: "Lagos · Nigeria" with gold dash
Headline: massive italic serif — "Wear" (line 1) / "ables" (line 2, indented) / "ATELIER" (gold, smaller, uppercase tracked)
Divider: thin gold line with "CULTURE · LUXURY · ELEGANCE"
Subtext: "Premium Nigerian womenswear — Iro & Buba, Aso Oke, Kaftan, Boubou…"
CTA buttons: gold filled "SHOP NOW" + ghost "ASHABI COLLECTION ↗"
Bottom stats row: 364K Followers · 16K+ Looks · 40% Off Sale
Right 50%: Full-bleed editorial photo of model in Nigerian occasion wear
Gradient blends left edge into dark panel
Floating card bottom-right: "Now Trending / Embellished Lace Boubou / ₦120,000"
4. Marquee Ticker
Scrolling text on sand background: CULTURE · LUXURY · ELEGANCE · ASO OKE · IRO & BUBA · KAFTAN · BOUBOU · CUSTOM FABRICS · JEWELLERY · TURBANS · SHIPS WORLDWIDE
5. Category Grid (Bento layout)
Title: "Every Occasion, Every Style"
Grid: 4 columns, 2 rows
Large tile (2×2): New In — full photo, overlaid text
Single tiles: Ready to Wear · Ashabi · Fabrics · Turbans · Jewellery
Wide tile (2×1): Sale — red "Up to 40% off" badge
Each tile: hover reveals arrow icon + "Shop Now", image zooms slightly
6. Featured Products — Horizontal scroll
Title: "Featured Pieces"
Cards scrollable left-right (overflow-x)
Each card: 3:4 aspect image · category label · product name · price · "Quick Shop" bar slides up on hover
Last card: "View All →" bordered card
7. Promo Banner
Gold background #C9A84C
Giant ghost text "IDANGANGAN" behind content
Headline: "Up to 40% Off" · Subtext: "Use code IDANGANGAN at checkout"
Dark CTA: "SHOP THE SALE"
8. Brand Story — Dark cinematic
Full-bleed dark section
Top: editorial image with "Ashabi" giant ghost text overlay
Centre text: "Born in Lagos, Worn Worldwide"
Three columns below: THE CRAFT · THE CULTURE · THE COMMUNITY
Specialty tags: Custom Fabrics · Iro & Buba · Aso Oke · Velvet & Suede · Damask · Kaftan & Boubou
"OUR STORY →" ghost button
Stats bar: 364K+ · 16K+ Posts · ₦25k–₦135k · Worldwide
9. Instagram Strip
Title: "@wearablesbyashabi" (clickable, with Instagram icon)
6-column photo grid, square crops
Hover: dark overlay + Instagram icon fades in
CTA: "Follow us on Instagram"
10. Footer
Newsletter signup: email field + "Subscribe" gold button
5-column links: Brand · Explore · About Us · Legal · Client Services
Brand column: Wba logo · tagline · social icons (Instagram, WhatsApp, Email)
Bottom bar: address, phone, email
Copyright + "CULTURE · LUXURY · ELEGANCE"
Floating WhatsApp bubble (green, bottom-right, always visible)
Product Card Spec
3:4 portrait image
Top-left badge: "New In" (dark) · "Sale" (red) · "Limited Edition" / "Exclusive" (gold)
Top-right: large ghost number (01, 02…)
Hover: image zooms, "Quick Shop" bar slides up from bottom
Below image: category label (tiny, tracked) · Product name · Price (+ strikethrough if on sale)
Key Components Needed
AnnouncementBar — rotating messages, dismissible
Navbar — transparent hero / glass on scroll, mobile drawer
Hero — split screen, animated headline
Marquee — infinite scroll ticker
CategoryGrid — bento/masonry
ProductCard — with hover states
HorizontalScroll — product strip
PromoBanner — gold
BrandStory — cinematic dark
InstagramGrid — photo grid
Footer — 5-col + newsletter
WhatsAppFAB — floating action button
AccountPage — tabbed sign in / sign up / forgot
CartPage — empty state + item list + summary
ProductDetail — image · info · size picker · add to cart · WhatsApp order · related
v0 Prompt (copy-paste ready)
Create a modern luxury Nigerian fashion e-commerce website homepage for "Wearables Atelier" — tagline: CULTURE · LUXURY · ELEGANCE. Color palette: charcoal black #0D0D0D, rich gold #C9A84C, cream #F8F5F0, sand #EDE8DF. Fonts: Cormorant Garamond (italic, light weight) for all headings, DM Sans for body. Include: (1) a full-screen split hero — left panel has staggered huge serif "Wear / ables / ATELIER" in gold with CTAs and stat row, right panel is full-bleed editorial fashion photo with floating product card; (2) scrolling marquee ticker with brand keywords; (3) a bento-grid category section with 4-column layout including a large 2×2 "New In" tile; (4) horizontal-scroll featured products strip with hover quick-shop; (5) gold promo banner; (6) dark cinematic brand story section; (7) Instagram photo grid. Overall aesthetic: think Jacquemus, Bottega Veneta — editorial, minimal luxury.

Figma Notes
Use Auto Layout for all components
Set up Variants for ProductCard (default, hover, sold out, badged)
Frame sizes: Desktop 1440px · Tablet 768px · Mobile 390px
All images: use real Nigerian fashion photography — editorial, not catalogue
Navbar should be a sticky component with two states: transparent (on hero) and frosted glass (scrolled)