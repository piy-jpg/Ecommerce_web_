const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makePageLink = (pageId, label) => ({
  label,
  href: `#${pageId}-${slugify(label)}`,
});

export const navItems = [
  {
    label: "MEN",
    href: "#men",
    tagline: "Casuals, Streetwear & Basics",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Topwear",
        links: ["T-Shirts", "Shirts", "Jackets", "Sweatshirts"].map((label) =>
          makePageLink("men", label),
        ),
      },
      {
        title: "Bottomwear",
        links: ["Jeans", "Trousers", "Shorts", "Trackpants"].map((label) =>
          makePageLink("men", label),
        ),
      },
      {
        title: "Essentials",
        links: ["Footwear", "Grooming", "Accessories", "Innerwear"].map((label) =>
          makePageLink("men", label),
        ),
      },
    ],
  },
  {
    label: "WOMEN",
    href: "#women-page",
    tagline: "Ethnic, Western & Accessories",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Ethnic",
        links: ["Sarees", "Kurtas & Suits", "Lehengas", "Dupattas"].map((label) =>
          makePageLink("women-page", label),
        ),
      },
      {
        title: "Western",
        links: ["Dresses", "Co-ords", "Tops", "Jeans"].map((label) =>
          makePageLink("women-page", label),
        ),
      },
      {
        title: "Accessories",
        links: ["Bags", "Jewellery", "Footwear", "Watches"].map((label) =>
          makePageLink("women-page", label),
        ),
      },
    ],
  },
  {
    label: "KIDS",
    href: "#kids",
    tagline: "Trends for Girls & Boys",
    image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Girls",
        links: ["Dresses", "Ethnic sets", "Tops", "Footwear"].map((label) =>
          makePageLink("kids", label),
        ),
      },
      {
        title: "Boys",
        links: ["T-Shirts", "Jeans", "Sets", "Sportswear"].map((label) =>
          makePageLink("kids", label),
        ),
      },
    ],
  },
  {
    label: "HOME & LIVING",
    href: "#home",
    tagline: "Decor, Bedding & Kitchen",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Living",
        links: ["Cushions", "Curtains", "Decor", "Lighting"].map((label) =>
          makePageLink("home", label),
        ),
      },
      {
        title: "Bed & Bath",
        links: ["Bedsheets", "Blankets", "Towels", "Bath accessories"].map(
          (label) => makePageLink("home", label),
        ),
      },
    ],
  },
  {
    label: "BEAUTY",
    href: "#beauty",
    tagline: "Makeup, Skincare & Fragrance",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Makeup",
        links: ["Face", "Eyes", "Lips", "Nails"].map((label) =>
          makePageLink("beauty", label),
        ),
      },
      {
        title: "Skincare",
        links: ["Cleansers", "Moisturisers", "Serums", "Sunscreen"].map((label) =>
          makePageLink("beauty", label),
        ),
      },
    ],
  },
  {
    label: "STUDIO",
    href: "#studio",
    tagline: "Lookbooks, Reels & Perks",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1200&q=80",
    groups: [
      {
        title: "Discover",
        links: ["Lookbooks", "Reels", "Creator edits", "Stories"].map((label) =>
          makePageLink("studio", label),
        ),
      },
      {
        title: "Insider",
        links: ["Rewards", "Early access", "Member offers"].map((label) =>
          makePageLink("studio", label),
        ),
      },
    ],
  },
];

export const serviceItems = [
  {
    icon: "fa-solid fa-truck-fast",
    title: "Fast Delivery",
    text: "Metro express shipping",
  },
  {
    icon: "fa-solid fa-rotate-left",
    title: "Easy Returns",
    text: "Simple pickup support",
  },
  {
    icon: "fa-solid fa-shield-heart",
    title: "Secure Checkout",
    text: "Trusted payment flow",
  },
  {
    icon: "fa-solid fa-crown",
    title: "Top Brands",
    text: "Curated labels and edits",
  },
  {
    icon: "fa-solid fa-gift",
    title: "Offer Zone",
    text: "Coupons and cashback",
  },
];

export const categories = [
  {
    id: "women",
    title: "Ethnic Wear",
    subtitle: "Sarees, kurtas, lehengas",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "men",
    title: "Western Wear",
    subtitle: "Dresses, co-ords, blazers",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "kids",
    title: "Kids",
    subtitle: "Mini trend edits",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beauty",
    title: "Beauty",
    subtitle: "Skin, makeup, fragrance",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "home",
    title: "Home Living",
    subtitle: "Decor and bedding",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "footwear",
    title: "Footwear",
    subtitle: "Sneakers, heels, flats",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
];

export const offers = [
  {
    id: 1,
    tag: "Festive drop",
    title: "Min 50% off",
    text: "Occasion-ready looks, embroidered styles, and statement silhouettes.",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    discount: "50%",
    discountType: "percentage",
    minPurchase: "Rs 2,999",
    categories: ["Sarees", "Kurtas", "Lehengas"],
    status: "active",
    createdDate: "2024-03-15",
    expiryDate: "2024-04-15",
    usageCount: 245,
    maxUsage: 1000,
    code: "FESTIVE50"
  },
  {
    id: 2,
    tag: "Beauty steals",
    title: "Combo buys",
    text: "Skincare kits, fragrance edits, and makeup upgrades for every budget.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    discount: "Rs 500",
    discountType: "fixed",
    minPurchase: "Rs 1,999",
    categories: ["Beauty", "Skincare", "Fragrance"],
    status: "active",
    createdDate: "2024-03-10",
    expiryDate: "2024-03-31",
    usageCount: 89,
    maxUsage: 500,
    code: "BEAUTY500"
  },
  {
    id: 3,
    tag: "Street edit",
    title: "Fresh arrivals",
    text: "Oversized fits, denim, sneakers, and wearable daily fashion pieces.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    discount: "30%",
    discountType: "percentage",
    minPurchase: "Rs 1,499",
    categories: ["Western Wear", "Footwear", "Accessories"],
    status: "active",
    createdDate: "2024-03-12",
    expiryDate: "2024-04-12",
    usageCount: 156,
    maxUsage: 800,
    code: "STREET30"
  },
  {
    id: 4,
    tag: "Premium style",
    title: "Luxury lane",
    text: "High-value curation that gives your storefront a richer feel.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    discount: "40%",
    discountType: "percentage",
    minPurchase: "Rs 4,999",
    categories: ["Premium", "Luxury", "Designer"],
    status: "expired",
    createdDate: "2024-02-20",
    expiryDate: "2024-03-20",
    usageCount: 67,
    maxUsage: 200,
    code: "LUXURY40"
  },
  {
    id: 5,
    tag: "Flash Sale",
    title: "Limited Time: 60% OFF",
    text: "Massive discount on selected sarees and ethnic wear. Don't miss out!",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    discount: "60%",
    discountType: "percentage",
    minPurchase: "Rs 1,999",
    categories: ["Sarees", "Ethnic Wear", "Traditional"],
    status: "active",
    createdDate: "2024-03-20",
    expiryDate: "2024-03-25",
    usageCount: 423,
    maxUsage: 1000,
    code: "FLASH60"
  }
];

const catalogFamilyConfig = {
  MEN: {
    brands: ["Roadster", "Urban Pace", "Northline", "Axis Denim", "Mode Craft"],
    images: [
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["for everyday comfort", "with clean street styling", "in premium cotton blend", "with modern smart fit", "for all-day movement"],
    colors: ["Navy", "Olive", "Black", "Grey", "White"],
    warehouses: ["Delhi Warehouse", "Mumbai Warehouse"],
    basePrice: 899,
    priceStep: 140,
  },
  WOMEN: {
    brands: ["Jaanu Label", "Studio Muse", "Aurelia", "Rare Edit", "Velora"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["with festive detailing", "for statement occasions", "in fluid premium drape", "with handcrafted accents", "for elevated everyday wear"],
    colors: ["Rose", "Ivory", "Maroon", "Teal", "Gold"],
    warehouses: ["Delhi Warehouse", "Jaipur Warehouse", "Mumbai Warehouse"],
    basePrice: 1499,
    priceStep: 220,
  },
  KIDS: {
    brands: ["Mini Muse", "PlayPatch", "Little Joy", "Tiny Trail", "Sprout Story"],
    images: [
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["for playful weekends", "with easy everyday fit", "for festive family moments", "with soft-touch comfort", "for active school days"],
    colors: ["Sky", "Peach", "Mint", "Yellow", "Lilac"],
    warehouses: ["Delhi Warehouse", "Bengaluru Warehouse"],
    basePrice: 599,
    priceStep: 110,
  },
  "HOME & LIVING": {
    brands: ["Casa Loom", "Hearth & Hue", "Soft Nest", "Daily Dwelling", "Modern Nook"],
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["for calm modern spaces", "with artisan-crafted finish", "for premium home refresh", "with soft layered texture", "for functional everyday living"],
    colors: ["Cream", "Sand", "Blue", "Olive", "Charcoal"],
    warehouses: ["Jaipur Warehouse", "Mumbai Warehouse"],
    basePrice: 799,
    priceStep: 160,
  },
  BEAUTY: {
    brands: ["Glow Ritual", "Pure Dew", "Skin Verse", "Lustre Lab", "Bloom Theory"],
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["for daily glow support", "with dermatologist-loved blend", "for hydration-focused routines", "with travel-friendly essentials", "for makeup-meets-skincare use"],
    colors: ["Rose", "Amber", "Ivory", "Berry", "Nude"],
    warehouses: ["Delhi Warehouse", "Hyderabad Warehouse"],
    basePrice: 499,
    priceStep: 120,
  },
  STUDIO: {
    brands: ["Studio Muse", "Creator Collective", "Trend Cast", "Runway Notes", "Edit House"],
    images: [
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    moods: ["for creator-led inspiration", "with editorial-first curation", "for member-only moodboards", "with trend-reel storytelling", "for early-access discovery"],
    colors: ["Blue", "Cream", "Blush", "Slate", "Gold"],
    warehouses: ["Mumbai Warehouse", "Delhi Warehouse"],
    basePrice: 699,
    priceStep: 135,
  },
};

const catalogAdjectives = ["Signature", "Premium", "Contemporary", "Crafted", "Refined", "Modern", "Essential", "Limited", "Curated", "Iconic"];
const badgeCycle = ["Best Seller", "New Drop", "Trending", "Top Rated", "Hot Pick", "Loved"];
const fixedToday = "2026-04-03";

const categoryPriceAdjustments = {
  Sarees: 900,
  "Kurtas & Suits": 700,
  Lehengas: 2000,
  Dresses: 500,
  Bags: 600,
  Jewellery: 700,
  Watches: 900,
  Footwear: 350,
  "Bath accessories": 150,
  Serums: 250,
  Sunscreen: 220,
  Reels: 180,
  Rewards: 120,
};

const categoryImageCatalog = {
  "T-Shirts": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
  ],
  Shirts: [
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
  ],
  Jackets: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
  ],
  Sweatshirts: [
    "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  ],
  Jeans: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
  ],
  Trousers: [
    "https://images.unsplash.com/photo-1506629905607-d9d63dd6f0c6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
  ],
  Shorts: [
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  ],
  Trackpants: [
    "https://images.unsplash.com/photo-1519238368427-8be71d36343f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  ],
  Grooming: [
    "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
  ],
  Innerwear: [
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80",
  ],
  Sarees: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1583391733981-849840bf2b57?auto=format&fit=crop&w=900&q=80",
  ],
  "Kurtas & Suits": [
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=900&q=80",
  ],
  Lehengas: [
    "https://images.unsplash.com/photo-1610030469668-8e9f5f6b1b19?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1610189003059-5ee6d8f3ff76?auto=format&fit=crop&w=900&q=80",
  ],
  Dupattas: [
    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=900&q=80",
  ],
  Dresses: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  ],
  "Co-ords": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  ],
  Tops: [
    "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  ],
  Bags: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  ],
  Jewellery: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
  ],
  Watches: [
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
  ],
  "Ethnic sets": [
    "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=900&q=80",
  ],
  Sets: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  ],
  Sportswear: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1506629905607-d9d63dd6f0c6?auto=format&fit=crop&w=900&q=80",
  ],
  Cushions: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
  ],
  Curtains: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
  ],
  Decor: [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80",
  ],
  Lighting: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
  ],
  Bedsheets: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  ],
  Blankets: [
    "https://images.unsplash.com/photo-1616627981459-a19f7ec21c79?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  ],
  Towels: [
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1584622781564-1d987baac86a?auto=format&fit=crop&w=900&q=80",
  ],
  "Bath accessories": [
    "https://images.unsplash.com/photo-1584622781564-1d987baac86a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
  ],
  Face: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  ],
  Eyes: [
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1583241801142-0e723e98fb92?auto=format&fit=crop&w=900&q=80",
  ],
  Lips: [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  ],
  Nails: [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80",
  ],
  Cleansers: [
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80",
  ],
  Moisturisers: [
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80",
  ],
  Serums: [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  ],
  Sunscreen: [
    "https://images.unsplash.com/photo-1556228578-dd5c0ed6f0b8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
  ],
  Lookbooks: [
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  ],
  Reels: [
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
  ],
  "Creator edits": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  ],
  Stories: [
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  ],
  Rewards: [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
  ],
  "Early access": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  ],
  "Member offers": [
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
  ],
};

const categoryImageAliases = {
  topwear: ["T-Shirts", "Shirts", "Jackets", "Sweatshirts"],
  bottomwear: ["Jeans", "Trousers", "Shorts", "Trackpants"],
  essentials: ["Footwear", "Grooming", "Accessories", "Innerwear"],
  "graphic tees": ["T-Shirts"],
  "plain tees": ["T-Shirts"],
  "polo shirts": ["T-Shirts", "Shirts"],
  "formal shirts": ["Shirts"],
  "casual shirts": ["Shirts"],
  "linen shirts": ["Shirts"],
  "skinny fit": ["Jeans"],
  "straight fit": ["Jeans", "Kurtas & Suits"],
  "baggy fit": ["Jeans"],
  "indian wear": ["Sarees", "Kurtas & Suits", "Lehengas", "Dupattas"],
  "western wear": ["Dresses", "Co-ords", "Tops", "Jeans"],
  "boys clothing": ["T-Shirts", "Jeans", "Sets", "Sportswear"],
  "girls clothing": ["Dresses", "Ethnic sets", "Tops", "Footwear"],
  infants: ["Sets"],
  "school essentials": ["Bags"],
  makeup: ["Face", "Eyes", "Lips", "Nails"],
  skincare: ["Cleansers", "Moisturisers", "Serums", "Sunscreen"],
  haircare: ["Grooming"],
  fragrance: ["Grooming"],
  bridal: ["Lehengas", "Sarees"],
  "party wear": ["Lehengas", "Dresses", "Sarees"],
  designer: ["Lehengas", "Dresses"],
  festive: ["Lehengas", "Sarees", "Kurtas & Suits"],
  bodycon: ["Dresses"],
  maxi: ["Dresses"],
  casual: ["Dresses", "T-Shirts", "Shirts"],
  party: ["Dresses", "Lehengas", "Sarees"],
  "kurta sets": ["Kurtas & Suits"],
  anarkali: ["Kurtas & Suits"],
  sarees: ["Sarees"],
  dresses: ["Dresses"],
  kurtas: ["Kurtas & Suits"],
  lehengas: ["Lehengas"],
  dupattas: ["Dupattas"],
  shirts: ["Shirts"],
  "t-shirts": ["T-Shirts"],
  jeans: ["Jeans"],
  footwear: ["Footwear"],
  grooming: ["Grooming"],
  accessories: ["Accessories"],
  innerwear: ["Innerwear"],
  face: ["Face"],
  lips: ["Lips"],
  eyes: ["Eyes"],
  nails: ["Nails"],
  cleansers: ["Cleansers"],
  moisturisers: ["Moisturisers"],
  serums: ["Serums"],
  sunscreen: ["Sunscreen"],
};

function uniqueMediaUrls(items = []) {
  return items.filter((item, index) => item && items.indexOf(item) === index);
}

function normalizeImageLookupTerm(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getAliasedCategories(terms = []) {
  const normalizedTerms = terms.map((term) => normalizeImageLookupTerm(term)).filter(Boolean);
  const directMatches = normalizedTerms.flatMap((term) => categoryImageAliases[term] || []);

  return uniqueMediaUrls(directMatches);
}

function getFamilyImagePoolForCategory(category) {
  const matchedNavItem = navItems.find((navItem) =>
    navItem.groups.some((group) => group.links.some((link) => link.label === category)),
  );

  if (!matchedNavItem) {
    return [];
  }

  return catalogFamilyConfig[matchedNavItem.label]?.images || [];
}

function resolveCategoryImagePool(category, fallbackImage = "") {
  return uniqueMediaUrls([
    fallbackImage,
    ...(categoryImageCatalog[category] || []),
  ]).filter(Boolean);
}

export function getCategoryPreviewGalleryForTerms(terms = [], fallbackImage = "") {
  const aliasedCategories = getAliasedCategories(Array.isArray(terms) ? terms : [terms]);
  const aliasedGallery = uniqueMediaUrls(
    aliasedCategories.flatMap((category) => resolveCategoryImagePool(category)),
  );

  if (aliasedGallery.length > 0) {
    return uniqueMediaUrls([fallbackImage, ...aliasedGallery]).filter(Boolean);
  }

  const firstKnownTerm = (Array.isArray(terms) ? terms : [terms]).find((term) => resolveCategoryImagePool(term).length > 0);
  if (firstKnownTerm) {
    return resolveCategoryImagePool(firstKnownTerm, fallbackImage);
  }

  return fallbackImage ? [fallbackImage] : [];
}

export function buildProductMediaSet(category, fallbackImage) {
  const orderedUrls = resolveCategoryImagePool(category, fallbackImage);
  const postureLabels = ["Front View", "Side Pose", "Back Drape", "Detail Close-Up"];
  const galleryUrls = orderedUrls.slice(0, 4);
  const filledGallery = galleryUrls.length > 0 ? galleryUrls : [fallbackImage].filter(Boolean);
  while (filledGallery.length < 4 && filledGallery[0]) {
    filledGallery.push(filledGallery[filledGallery.length % Math.max(filledGallery.length, 1)]);
  }

  const images = filledGallery.map((url, index) => ({
    url,
    label: postureLabels[index] || `View ${index + 1}`,
  }));

  const spinSource = uniqueMediaUrls([...filledGallery, ...orderedUrls]).slice(0, 8);
  const spinFrames = (spinSource.length > 0 ? spinSource : filledGallery).map((url, index) => ({
    url,
    label: `${index * 45}deg`,
  }));

  return {
    image: images[0]?.url || fallbackImage || "",
    images,
    spinFrames,
    mediaTag: "3D View",
  };
}

export function getCategoryPreviewImage(category, fallbackImage = "") {
  return resolveCategoryImagePool(category, fallbackImage)[0] || "";
}

export function getCategoryPreviewGallery(category, fallbackImage = "") {
  return resolveCategoryImagePool(category, fallbackImage);
}

function discountLabel(price, mrp) {
  return `${Math.max(0, Math.round(((mrp - price) / Math.max(mrp, 1)) * 100))}% OFF`;
}

function makeSkuFragment(label) {
  return label
    .toUpperCase()
    .replace(/&/g, "")
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 2))
    .join("")
    .slice(0, 6);
}

function buildCatalogEntries(itemsPerNavbar = 50) {
  return navItems.flatMap((navItem, navIndex) => {
    const family = catalogFamilyConfig[navItem.label];
    const subLinks = navItem.groups.flatMap((group) =>
      group.links.map((link) => ({ group: group.title, label: link.label })),
    );

    return Array.from({ length: itemsPerNavbar }, (_, index) => {
      const subLink = subLinks[index % subLinks.length];
      const adjective = catalogAdjectives[(index + navIndex) % catalogAdjectives.length];
      const brand = family.brands[index % family.brands.length];
      const imagePool = categoryImageCatalog[subLink.label] || family.images;
      const image = imagePool[index % imagePool.length];
      const media = buildProductMediaSet(subLink.label, image);
      const mood = family.moods[index % family.moods.length];
      const color = family.colors[index % family.colors.length];
      const price =
        family.basePrice +
        (index % 10) * family.priceStep +
        Math.floor(index / subLinks.length) * 90 +
        (categoryPriceAdjustments[subLink.label] || 0);
      const mrp = Math.round(price * (1.35 + ((index + navIndex) % 5) * 0.08));
      const lowStockThreshold = 5;
      const stockBase = 6 + ((index * 3 + navIndex) % 18);
      const stock = index % 17 === 0 ? 0 : stockBase;
      const reserved = stock === 0 ? 0 : Math.min(stock - 1, index % 4);
      const available = Math.max(0, stock - reserved);
      const status = available === 0 ? "Out of Stock" : available <= lowStockThreshold ? "Low Stock" : "Active";
      const warehouse = family.warehouses[index % family.warehouses.length];
      const title = `${adjective} ${subLink.label} ${mood}`;

      return {
        brand,
        title,
        price,
        mrp,
        discount: discountLabel(price, mrp),
        badge: badgeCycle[(index + navIndex) % badgeCycle.length],
        image: media.image,
        images: media.images,
        spinFrames: media.spinFrames,
        mediaTag: media.mediaTag,
        category: subLink.label,
        warehouse,
        stock,
        reserved,
        available,
        status,
        lowStockThreshold,
        salesLast30Days: 3 + ((index + navIndex) % 22),
        lastSold: `2026-03-${String(10 + ((index + navIndex) % 20)).padStart(2, "0")}`,
        variants: [
          { size: "Free Size", color, stock: Math.max(0, Math.ceil(stock / 2)) },
          { size: "Free Size", color: `${color} Mix`, stock: Math.max(0, stock - Math.ceil(stock / 2)) },
        ],
        sku: `JNU-${navItem.label.replace(/[^A-Z]/g, "").slice(0, 2)}-${makeSkuFragment(subLink.label)}-${String(index + 1).padStart(3, "0")}`,
      };
    });
  });
}

const catalogEntries = buildCatalogEntries(80);

export const products = catalogEntries.map((item) => ({
  brand: item.brand,
  title: item.title,
  price: `Rs ${item.price.toLocaleString()}`,
  oldPrice: `Rs ${item.mrp.toLocaleString()}`,
  discount: item.discount,
  badge: item.badge,
  image: item.image,
  images: item.images,
  spinFrames: item.spinFrames,
  mediaTag: item.mediaTag,
  category: item.category,
  color: item.variants?.[0]?.color || "",
}));

export const brands = ["Aurelia", "Roadster", "Puma", "Rare", "Anouk", "H&M"];

export const footerColumns = [
  {
    title: "Online Shopping",
    links: ["Women", "Men", "Kids", "Home Living", "Beauty"],
  },
  {
    title: "Customer Policies",
    links: ["Contact Us", "FAQ", "T&C", "Shipping", "Returns"],
  },
  {
    title: "Popular Searches",
    links: ["Saree", "Kurta Sets", "Sneakers", "Handbags", "Skincare"],
  },
];

export const policyItems = [
  {
    icon: "fa-solid fa-certificate",
    title: "100% Original",
    text: "Verified products and labels",
  },
  {
    icon: "fa-solid fa-rotate-left",
    title: "Easy Returns",
    text: "Simple exchange support",
  },
  {
    icon: "fa-solid fa-lock",
    title: "Secure Payments",
    text: "Trusted checkout flow",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Help Center",
    text: "Responsive customer care",
  },
];

export const inventory = catalogEntries.map((item, index) => ({
  id: `INV-${String(index + 1).padStart(3, "0")}`,
  sku: item.sku,
  barcode: `89023${String(index + 1).padStart(7, "0")}`,
  name: item.title,
  image: item.image,
  category: item.category,
  brand: item.brand,
  price: item.price,
  mrp: item.mrp,
  stock: item.stock,
  reserved: item.reserved,
  available: item.available,
  status: item.status,
  warehouse: item.warehouse,
  lastUpdated: fixedToday,
  variants: item.variants,
  lowStockThreshold: item.lowStockThreshold,
  salesLast30Days: item.salesLast30Days,
  lastSold: item.lastSold,
}));

export const inventoryStats = {
  totalProducts: inventory.length,
  activeListings: inventory.filter((item) => item.status === "Active").length,
  outOfStock: inventory.filter((item) => item.available === 0).length,
  lowStock: inventory.filter((item) => item.available > 0 && item.available <= item.lowStockThreshold).length,
  totalValue: inventory.reduce((sum, item) => sum + item.price * item.available, 0),
  topSelling: [...inventory].sort((a, b) => b.salesLast30Days - a.salesLast30Days)[0]?.name || "N/A",
  deadStock: inventory.filter((item) => item.salesLast30Days === 0).length,
};

export const inventoryAlerts = [
  ...inventory
    .filter((item) => item.available > 0 && item.available <= item.lowStockThreshold)
    .slice(0, 2)
    .map((item) => ({
      type: "low_stock",
      message: `${item.name} is running low (${item.available} items left)`,
      productId: item.id,
    })),
  ...inventory
    .filter((item) => item.available === 0)
    .slice(0, 1)
    .map((item) => ({
      type: "out_of_stock",
      message: `${item.name} is out of stock`,
      productId: item.id,
    })),
];
