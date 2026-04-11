import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  brands,
  categories,
  footerColumns,
  getCategoryPreviewGallery,
  getCategoryPreviewGalleryForTerms,
  getCategoryPreviewImage,
  navItems,
  policyItems,
  products as seedProducts,
  serviceItems,
  inventory,
} from "./data";
import {
  addBagItem,
  bootstrapMarketplace,
  createOffer,
  createProduct,
  deleteOffer,
  deleteProduct,
  loginMarketplace,
  placeOrder,
  removeBagItem,
  subscribeToRealtime,
  toggleWishlistItem,
  updateInventoryStock,
  updateOrderStatus,
  updateOffer,
  updateProduct,
  updateReview,
  updateSettings,
  exportInventory,
  importInventory,
} from "./api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function MensPage({ products, onBack, onAddToBag, onToggleWishlist, wishlist, onQuickView }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("All");

  const menNav = navItems.find(item => item.label === "MEN");
  const categoryTabs = ["All", ...(menNav?.groups?.map((group) => group.title) || [])];

  const normalizeText = (product) => {
    const category = (product.category || "").toLowerCase();
    const title = (product.name || product.title || "").toLowerCase();
    return `${category} ${title}`;
  };

  const parsePrice = (price) => {
    if (typeof price === "number") return price;
    if (!price) return 0;
    const numeric = String(price).replace(/[^0-9\.]/g, "");
    return Number(numeric) || 0;
  };

  const keywordsByCategory = {
    Topwear: ["t-shirt", "shirt", "jacket", "sweatshirt", "hoodie", "topwear"],
    Bottomwear: ["jeans", "trouser", "pants", "short", "trackpant"],
    Essentials: ["footwear", "grooming", "accessories", "innerwear", "shoe", "bag"],
  };

  useEffect(() => {
    const isMenProduct = (product) => {
      const text = normalizeText(product);
      return [
        "men", "t-shirt", "shirt", "jeans", "trouser", "jacket", "sweatshirt", "short", "trackpant", "footwear", "grooming", "accessories", "innerwear"
      ].some((term) => text.includes(term));
    };

    const menProducts = products.filter(isMenProduct);

    if (filterCategory === "All") {
      setFilteredProducts(menProducts);
      return;
    }

    const keywords = keywordsByCategory[filterCategory] || [];
    const categoryProducts = menProducts.filter((product) => {
      const text = normalizeText(product);
      return keywords.some((keyword) => text.includes(keyword));
    });

    setFilteredProducts(categoryProducts);
  }, [products, filterCategory]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);

    switch (sortBy) {
      case "price-low": return priceA - priceB;
      case "price-high": return priceB - priceA;
      case "name": return (a.name || a.title || "").localeCompare(b.name || b.title || "");
      default: return 0;
    }
  });

  return (
    <div className="mens-page">
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
          <h1>Men's Collection</h1>
          <p>Discover our premium men's fashion collection</p>
        </div>

        <div className="filters-bar">
          <div className="category-tabs">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                className={`category-tab ${filterCategory === tab ? 'active' : ''}`}
                onClick={() => setFilterCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <div className="results-count">
            {sortedProducts.length} products found
          </div>
        </div>

        <div className="product-grid">
          {sortedProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => onQuickView(product)} role="button" tabIndex={0} onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onQuickView(product);
              }
            }}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <button className="product-media-launch" type="button" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
                  <i className="fa-solid fa-cube" /> 3D View
                </button>
                <button 
                  type="button"
                  className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                >
                  <i className={`fa-${wishlist.includes(product.id) ? 'solid' : 'regular'} fa-heart`}></i>
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-price">
                  <span className="current-price">₹{product.price}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="original-price">₹{product.mrp}</span>
                  )}
                </div>
                <button 
                  type="button"
                  className="add-to-bag-btn"
                  onClick={(e) => { e.stopPropagation(); onAddToBag(product); }}
                >
                  Add to Bag
                </button>
                <button className="product-secondary-btn" type="button" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
                  View Slides
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="no-products">
            <i className="fa-solid fa-shirt"></i>
            <h3>No men's products found</h3>
            <p>We're working on adding more items to our men's collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const categoryPageConfigs = {
  // Main categories
  MEN: {
    title: "MEN",
    subtitle: "Shirts, T-Shirts, Jeans, Ethnic Wear",
    sections: [
      { title: "Topwear", description: "T-Shirts, Shirts, Jackets, Sweatshirts", keywords: ["t-shirt", "shirt", "jacket", "sweatshirt"] },
      { title: "Bottomwear", description: "Jeans, Trousers, Shorts, Trackpants", keywords: ["jeans", "trouser", "short", "trackpant"] },
      { title: "Footwear", description: "Casual Shoes, Sports Shoes, Sandals", keywords: ["shoe", "sneaker", "sandal", "footwear"] },
      { title: "Accessories", description: "Watches, Wallets, Sunglasses", keywords: ["watch", "wallet", "sunglass", "accessory"] },
    ],
    highlights: ["T-Shirts", "Shirts", "Jeans", "Footwear"],
  },
  WOMEN: {
    title: "WOMEN",
    subtitle: "Top collections for every occasion",
    sections: [
      { title: "Indian Wear", description: "Sarees, Kurtas, Lehenga, Dupatta", keywords: ["saree", "kurta", "lehenga", "dupatta"] },
      { title: "Western Wear", description: "Dresses, Tops, Co-ords, Jeans", keywords: ["dress", "top", "co-ord", "jean"] },
      { title: "Footwear", description: "Heels, Flats, Sneakers", keywords: ["heel", "flat", "sneaker"] },
      { title: "Beauty", description: "Makeup, Skincare, Haircare", keywords: ["makeup", "skincare", "haircare"] },
    ],
    highlights: ["Sarees", "Dresses", "Kurtas", "Beauty"],
  },
  KIDS: {
    title: "KIDS",
    subtitle: "Boys & Girls, Age filters, School wear",
    sections: [
      { title: "Boys Clothing", description: "T-Shirts, Jeans, Sets, Sportswear", keywords: ["boy", "t-shirt", "jean", "set"] },
      { title: "Girls Clothing", description: "Dresses, Ethnic sets, Tops", keywords: ["girl", "dress", "ethnic", "top"] },
      { title: "Infants", description: "Baby clothes and essentials", keywords: ["infant", "baby", "newborn"] },
      { title: "School Essentials", description: "Bags, water bottles, stationery", keywords: ["school", "bag", "water bottle"] },
    ],
  },
  "HOME_&_LIVING": {
    title: "HOME & LIVING",
    subtitle: "Decor, Bedsheets, Curtains, Kitchen",
    sections: [
      { title: "Bed Sheets", description: "Cotton, Silk, and premium bedding", keywords: ["bed sheet", "bedsheet", "bedding"] },
      { title: "Curtains", description: "Window treatments and drapes", keywords: ["curtain", "drape", "window"] },
      { title: "Decor", description: "Home accents and decorative items", keywords: ["decor", "decoration", "accent"] },
      { title: "Kitchen", description: "Cookware and dining essentials", keywords: ["kitchen", "cookware", "dining"] },
    ],
  },
  BEAUTY: {
    title: "BEAUTY",
    subtitle: "Makeup, Skincare, Haircare, Fragrances",
    sections: [
      { title: "Makeup", description: "Foundation, lipstick, eyeshadow, and more", keywords: ["makeup", "foundation", "lipstick", "eyeshadow"] },
      { title: "Skincare", description: "Cleansers, moisturizers, serums", keywords: ["skincare", "cleanser", "moisturizer", "serum"] },
      { title: "Haircare", description: "Shampoos, conditioners, treatments", keywords: ["haircare", "shampoo", "conditioner", "treatment"] },
      { title: "Fragrance", description: "Perfumes and body mists", keywords: ["fragrance", "perfume", "mist"] },
    ],
    extra: ["Top Brands", "Routine Builder"],
  },
  STUDIO: {
    title: "STUDIO",
    subtitle: "Fashion blogs and influencer content",
    sections: [
      { title: "Trending Looks", description: "Latest fashion trends and styles", keywords: ["trending", "look", "style"] },
      { title: "Fashion Blogs", description: "Expert trend analysis and inspiration", keywords: ["blog", "fashion", "trend"] },
      { title: "Influencer Styles", description: "Curated outfits from top creators", keywords: ["influencer", "creator", "style"] },
      { title: "Short Videos", description: "Fashion reels and quick tips", keywords: ["video", "reel", "short"] },
    ],
  },

  // Subcategories
  "MEN/T_SHIRTS": {
    title: "T-Shirts",
    subtitle: "Casual and trendy t-shirts for men",
    sections: [
      { title: "Graphic Tees", description: "Cool prints and designs", keywords: ["graphic", "print", "design"] },
      { title: "Plain Tees", description: "Solid colors and basics", keywords: ["plain", "solid", "basic"] },
      { title: "Polo Shirts", description: "Collared casual wear", keywords: ["polo", "collar", "casual"] },
    ],
    banner: "New Arrivals: Fresh collection of trendy t-shirts",
  },
  "MEN/SHIRTS": {
    title: "Shirts",
    subtitle: "Formal and casual shirts",
    sections: [
      { title: "Formal Shirts", description: "Office and business wear", keywords: ["formal", "office", "business"] },
      { title: "Casual Shirts", description: "Relaxed weekend styles", keywords: ["casual", "relaxed", "weekend"] },
      { title: "Linen Shirts", description: "Breathable summer fabrics", keywords: ["linen", "summer", "breathable"] },
    ],
  },
  "MEN/JEANS": {
    title: "Jeans",
    subtitle: "Classic denim for every style",
    sections: [
      { title: "Skinny Fit", description: "Slim and modern cuts", keywords: ["skinny", "slim", "modern"] },
      { title: "Straight Fit", description: "Classic straight leg jeans", keywords: ["straight", "classic", "leg"] },
      { title: "Baggy Fit", description: "Relaxed and oversized styles", keywords: ["baggy", "relaxed", "oversized"] },
    ],
  },
  "WOMEN/SAREES": {
    title: "Sarees",
    subtitle: "Silk, Cotton, Party, Wedding",
    sections: [
      { title: "Silk Sarees", description: "Premium drapes with rich texture and shine", keywords: ["silk", "premium", "texture"] },
      { title: "Cotton Sarees", description: "Breathable and comfortable for daily wear", keywords: ["cotton", "breathable", "daily"] },
      { title: "Party Sarees", description: "Glamorous looks for celebrations", keywords: ["party", "glamorous", "celebration"] },
      { title: "Wedding Sarees", description: "Regal sarees crafted for your special day", keywords: ["wedding", "regal", "bridal"] },
    ],
    extra: ["Shop by Occasion", "Shop by Fabric"],
  },
  "WOMEN/DRESSES": {
    title: "Dresses",
    subtitle: "Bodycon, Maxi, Casual, Party",
    sections: [
      { title: "Bodycon", description: "Curve-hugging silhouettes", keywords: ["bodycon", "curve", "hugging"] },
      { title: "Maxi", description: "Flowy and elegant full-length styles", keywords: ["maxi", "flowy", "elegant"] },
      { title: "Casual", description: "Everyday comfort wear", keywords: ["casual", "everyday", "comfort"] },
      { title: "Party", description: "Glam and sparkle for events", keywords: ["party", "glam", "sparkle"] },
    ],
  },
  "WOMEN/KURTAS": {
    title: "Kurtas",
    subtitle: "Kurta sets and traditional ensembles",
    sections: [
      { title: "Kurta Sets", description: "Coordinated kurta & bottom sets", keywords: ["kurta set", "coordinated", "bottom"] },
      { title: "Anarkali", description: "Flowy, elegant gowns for classic appeal", keywords: ["anarkali", "flowy", "gown"] },
      { title: "Straight Fit", description: "Modern silhouettes for polished style", keywords: ["straight", "modern", "polished"] },
    ],
  },
  "WOMEN/LEHENGAS": {
    title: "Lehengas",
    subtitle: "Bridal, Party, Designer, Festive",
    sections: [
      { title: "Bridal", description: "Luxurious lehengas for your big day", keywords: ["bridal", "luxurious", "wedding"] },
      { title: "Party Wear", description: "Glittering styles for celebrations", keywords: ["party", "glittering", "celebration"] },
      { title: "Designer", description: "Unique couture looks", keywords: ["designer", "couture", "unique"] },
      { title: "Festive", description: "Rich, traditional patterns for festivals", keywords: ["festive", "traditional", "festival"] },
    ],
    banner: "Luxury Banner: Premium curation for special occasions",
  },
};

const routeKeywordOverrides = {
  MEN: ["men", "shirt", "t-shirt", "jeans", "trouser", "jacket", "sneaker", "watch"],
  WOMEN: ["women", "saree", "kurta", "dress", "lehenga", "dupatta", "heels", "jewellery"],
  KIDS: ["kids", "boy", "girl", "baby", "dress", "set", "school", "sportswear"],
  "HOME_&_LIVING": ["home", "decor", "bedsheet", "curtain", "lighting", "towel", "kitchen"],
  BEAUTY: ["beauty", "makeup", "skincare", "haircare", "perfume", "lipstick", "serum"],
  STUDIO: ["trend", "style", "creator", "look", "fashion"],
  T_SHIRTS: ["t-shirt", "tee", "tees"],
  SHIRTS: ["shirt", "formal", "casual", "linen"],
  JACKETS: ["jacket", "outerwear", "coat"],
  SWEATSHIRTS: ["sweatshirt", "hoodie"],
  JEANS: ["jeans", "denim"],
  TROUSERS: ["trouser", "pants", "bottomwear"],
  SHORTS: ["shorts"],
  TRACKPANTS: ["trackpant", "jogger"],
  FOOTWEAR: ["footwear", "shoe", "sneaker", "heel", "flat", "sandal"],
  GROOMING: ["grooming", "beard", "shampoo", "perfume"],
  ACCESSORIES: ["accessories", "watch", "wallet", "belt", "sunglass"],
  INNERWEAR: ["innerwear", "lingerie", "nightwear"],
  SAREES: ["saree", "silk saree", "cotton saree"],
  KURTAS_AND_SUITS: ["kurta", "suit", "kurta set"],
  LEHENGAS: ["lehenga", "bridal", "festive"],
  DUPATTAS: ["dupatta", "stole"],
  DRESSES: ["dress", "maxi", "bodycon", "gown"],
  CO_ORDS: ["co-ord", "coord", "set"],
  TOPS: ["top", "blouse", "tunic"],
  BAGS: ["bag", "handbag", "sling"],
  JEWELLERY: ["jewellery", "jewelry", "earring", "necklace"],
  WATCHES: ["watch", "smartwatch"],
  ETHNIC_SETS: ["ethnic set", "kurta set", "co-ord"],
  SETS: ["set", "co-ord", "combo"],
  SPORTSWEAR: ["sportswear", "track", "activewear"],
  CUSHIONS: ["cushion", "pillow"],
  CURTAINS: ["curtain", "drape"],
  DECOR: ["decor", "accent", "vase"],
  LIGHTING: ["lighting", "lamp"],
  BEDSHEETS: ["bedsheet", "bed sheet", "bedding"],
  BLANKETS: ["blanket", "quilt"],
  TOWELS: ["towel", "bath"],
  BATH_ACCESSORIES: ["bath", "bath accessory"],
  FACE: ["face", "foundation", "concealer"],
  EYES: ["eyes", "eyeliner", "mascara"],
  LIPS: ["lips", "lipstick", "lip gloss"],
  NAILS: ["nails", "nail paint"],
  CLEANSERS: ["cleanser", "face wash"],
  MOISTURISERS: ["moisturiser", "moisturizer", "cream"],
  SERUMS: ["serum"],
  SUNSCREEN: ["sunscreen", "spf"],
  LOOKBOOKS: ["lookbook", "lookbooks", "style"],
  REELS: ["reel", "reels", "video"],
  CREATOR_EDITS: ["creator", "editorial", "edit"],
  STORIES: ["story", "stories", "fashion story"],
  REWARDS: ["reward", "loyalty"],
  EARLY_ACCESS: ["new", "drop", "launch"],
  MEMBER_OFFERS: ["offer", "discount", "member"],
};

const dedupeKeywords = (values = []) => [...new Set(values.filter(Boolean))];

function getRouteKeywords(routeKey, fallbackLabel = "") {
  const normalizedRoute = String(routeKey || "")
    .split("/")
    .flatMap((part) => part.split("_"))
    .filter(Boolean)
    .map((part) => part.toUpperCase());
  const labelTokens = String(fallbackLabel || "")
    .toLowerCase()
    .replace(/&/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2);

  return dedupeKeywords([
    ...normalizedRoute.flatMap((token) => routeKeywordOverrides[token] || [token.toLowerCase()]),
    ...labelTokens,
  ]);
}

function buildGeneratedPageConfig(pageKey) {
  const [mainKey, subKey] = String(pageKey || "").split("/");
  const navItem = navItems.find((item) => buildMainPageKey(item.label) === mainKey);

  if (!navItem) {
    return categoryPageConfigs.MEN;
  }

  if (!subKey) {
    return {
      title: navItem.label,
      subtitle: navItem.tagline,
      highlights: navItem.groups.flatMap((group) => group.links.map((link) => link.label)).slice(0, 4),
      sections: navItem.groups.map((group) => ({
        title: group.title,
        description: `Shop ${group.title.toLowerCase()} edits across ${navItem.label.toLowerCase()} with realtime pricing and stock.`,
        keywords: dedupeKeywords(
          group.links.flatMap((link) =>
            getRouteKeywords(buildSubPageKey(navItem.label, link.label), link.label),
          ),
        ),
      })),
      extra: navItem.groups.flatMap((group) => group.links.map((link) => link.label)).slice(0, 6),
    };
  }

  const group = navItem.groups.find((entry) =>
    entry.links.some((link) => buildSubPageKey(navItem.label, link.label) === pageKey),
  );
  const currentLink = group?.links.find((link) => buildSubPageKey(navItem.label, link.label) === pageKey);
  const siblingLinks = group?.links.filter((link) => link.label !== currentLink?.label) || [];
  const baseKeywords = getRouteKeywords(pageKey, currentLink?.label || "");

  return {
    title: currentLink?.label || navItem.label,
    subtitle: `${navItem.label} / ${group?.title || "Collection"}: curated picks, realtime availability, and fast category discovery.`,
    banner: `${navItem.label} curated edit for ${currentLink?.label || navItem.label}`,
    sections: [
      {
        title: "Featured Picks",
        description: `Most-loved ${String(currentLink?.label || navItem.label).toLowerCase()} selections trending now.`,
        keywords: baseKeywords,
      },
      ...siblingLinks.slice(0, 2).map((link) => ({
        title: link.label,
        description: `Browse related ${link.label.toLowerCase()} options from the same ${group?.title.toLowerCase() || "collection"} edit.`,
        keywords: getRouteKeywords(buildSubPageKey(navItem.label, link.label), link.label),
      })),
    ],
    relatedPages: siblingLinks.map((link) => ({
      label: link.label,
      pageKey: buildSubPageKey(navItem.label, link.label),
    })),
    extra: navItem.groups.flatMap((entry) => entry.links.map((link) => link.label)).slice(0, 6),
  };
}

function getNavPageContent(item) {
  const generated = buildGeneratedPageConfig(buildMainPageKey(item?.label || "MEN"));

  return (
    item?.page || {
      eyebrow: `${item?.label || generated.title} edit`,
      title: generated.title,
      text: generated.text || generated.subtitle,
      highlights: generated.highlights || generated.extra || [],
    }
  );
}

function NavSubpageCard({ parentItem, groupTitle, link, description }) {
  const previewImage = getCategoryPreviewImage(link.label, parentItem?.image);

  return (
    <article className="nav-subpage-card" id={link.href.slice(1)}>
      <div className="nav-subpage-media">
        <img src={previewImage} alt={link.label} />
      </div>
      <div className="nav-subpage-body">
        <span className="nav-subpage-tag">{groupTitle}</span>
        <h4>{link.label}</h4>
        <p>{description}</p>
        <a className="nav-subpage-link" href="#products">
          Shop picks
        </a>
      </div>
    </article>
  );
}

function CategoryPage({ page, onBack, products, wishlist, onAddToBag, onWishlistToggle, onPageChange, onQuickView }) {
  const [sortBy, setSortBy] = useState("popularity");
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [discountRange, setDiscountRange] = useState("all");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  const getConfig = (pageKey) => {
    if (categoryPageConfigs[pageKey]) {
      return categoryPageConfigs[pageKey];
    }

    if (pageKey.includes('/')) {
      const parts = pageKey.split('/');
      const mainCategory = parts[0];
      const subCategory = parts[1];
      const formattedKey = `${mainCategory}/${subCategory}`;
      if (categoryPageConfigs[formattedKey]) {
        return categoryPageConfigs[formattedKey];
      }

      return buildGeneratedPageConfig(pageKey) || categoryPageConfigs[mainCategory] || categoryPageConfigs.MEN;
    }

    return categoryPageConfigs[pageKey] || buildGeneratedPageConfig(pageKey) || categoryPageConfigs.MEN;
  };

  const config = getConfig(page);
  const isSubcategory = page.includes("/");
  const normalizedPageTitle = String(config.title || "").toLowerCase();
  const effectiveProducts = Array.isArray(products) && products.length > 0 ? products : seedProducts;

  const filterByKeywords = (keywords, limit = 12) => {
    if (!effectiveProducts || !keywords) return [];
    const loweredKeywords = keywords.map((term) => String(term).toLowerCase());
    const exactCategoryMatches = effectiveProducts.filter((product) => {
      const category = String(product.category || "").toLowerCase();
      return loweredKeywords.includes(category) || category === normalizedPageTitle;
    });

    if (exactCategoryMatches.length > 0) {
      return exactCategoryMatches.slice(0, limit);
    }

    const keywordMatches = effectiveProducts.filter((product) => {
      const text = `${product.name || product.title || ""} ${product.category || ""} ${product.brand || ""}`.toLowerCase();
      return loweredKeywords.some((term) => text.includes(term));
    });

    if (keywordMatches.length > 0) {
      return keywordMatches.slice(0, limit);
    }

    return effectiveProducts.slice(0, limit);
  };

  const getFilteredProducts = () => {
    if (!isSubcategory || !config.sections) return [];
    const allKeywords = config.sections.flatMap((section) => section.keywords || [section.title]);
    return filterByKeywords(allKeywords, 24);
  };

  const getSectionPreviewProducts = (section, limit = 4) => {
    const sectionGallery = getCategoryPreviewGalleryForTerms(
      [section?.title, ...(section?.keywords || []), config.title],
      getCategoryPreviewImage(config.title),
    );

    if (sectionGallery.length > 0) {
      return sectionGallery
        .slice(0, limit)
        .map((image, index) => ({
          id: `section-gallery-${section?.title || config.title}-${index}`,
          image,
          title: `${section?.title || config.title} ${index + 1}`,
          brand: section?.title || config.title,
        }));
    }

    const matches = filterByKeywords(section?.keywords || [section?.title]).filter(Boolean);
    if (matches.length > 0) {
      return matches.slice(0, limit);
    }

    return getCategoryPreviewGallery(config.title, getCategoryPreviewImage(config.title))
      .slice(0, limit)
      .map((image, index) => ({
        id: `section-fallback-${section?.title || config.title}-${index}`,
        image,
        title: `${section?.title || config.title} ${index + 1}`,
        brand: config.title,
      }));
  };

  const filteredProducts = getFilteredProducts();
  const relatedCategoryOptions = [
    { label: config.title, pageKey: page },
    ...((config.relatedPages || []).filter((item) => item.pageKey !== page)),
  ];
  const categoryCounts = relatedCategoryOptions.map((item) => ({
    ...item,
    count: effectiveProducts.filter((product) => String(product.category || "").toLowerCase() === String(item.label || "").toLowerCase()).length,
  }));
  const brandCounts = Object.entries(
    filteredProducts.reduce((acc, product) => {
      if (product.brand) {
        acc[product.brand] = (acc[product.brand] || 0) + 1;
      }
      return acc;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const colorCounts = Object.entries(
    filteredProducts.reduce((acc, product) => {
      const color = String(product.color || "").replace(/\s+mix$/i, "").trim();
      if (color) {
        acc[color] = (acc[color] || 0) + 1;
      }
      return acc;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const badgeCounts = Object.entries(
    filteredProducts.reduce((acc, product) => {
      const badge = String(product.badge || "").trim();
      if (badge) {
        acc[badge] = (acc[badge] || 0) + 1;
      }
      return acc;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const searchNeedle = filterSearch.trim().toLowerCase();
  const visibleBrandCounts = brandCounts.filter((brand) => brand.label.toLowerCase().includes(searchNeedle));
  const visibleColorCounts = colorCounts.filter((color) => color.label.toLowerCase().includes(searchNeedle));
  const priceValues = filteredProducts.map((product) => parseDisplayPrice(product.price)).filter(Boolean);
  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;
  const listingProducts = filteredProducts
    .filter((product) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      const normalizedColor = String(product.color || "").replace(/\s+mix$/i, "").trim();
      if (selectedColors.length > 0 && !selectedColors.includes(normalizedColor)) {
        return false;
      }
      if (selectedBadges.length > 0 && !selectedBadges.includes(product.badge)) {
        return false;
      }

      const price = parseDisplayPrice(product.price);
      const discount = Number(String(product.discount || "0").replace(/[^\d]/g, "")) || 0;
      const isInStock = !/out of stock/i.test(String(product.badge || ""));

      if (priceRange === "under-1500" && price >= 1500) return false;
      if (priceRange === "1500-3000" && (price < 1500 || price > 3000)) return false;
      if (priceRange === "above-3000" && price <= 3000) return false;
      if (discountRange !== "all" && discount < Number(discountRange)) return false;
      if (stockFilter === "in-stock" && !isInStock) return false;
      if (stockFilter === "new" && !/new/i.test(String(product.badge || ""))) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return parseDisplayPrice(a.price) - parseDisplayPrice(b.price);
      if (sortBy === "price-high") return parseDisplayPrice(b.price) - parseDisplayPrice(a.price);
      if (sortBy === "discount") {
        return (Number(String(b.discount || "0").replace(/[^\d]/g, "")) || 0) - (Number(String(a.discount || "0").replace(/[^\d]/g, "")) || 0);
      }
      return 0;
    });

  const breadcrumbParts = page.split("/");
  const breadcrumbLabel = breadcrumbParts.length > 1 ? config.title : null;
  const subcategoryHeroProducts = [
    ...(listingProducts.length > 0 ? listingProducts : filteredProducts),
  ].slice(0, 5);
  const fallbackHeroGallery = getCategoryPreviewGalleryForTerms(
    [config.title, ...((config.sections || []).flatMap((section) => [section.title, ...(section.keywords || [])]))],
    getCategoryPreviewImage(config.title),
  );
  const subcategoryVisualFallback = subcategoryHeroProducts.length > 0
    ? []
    : fallbackHeroGallery.slice(0, 5).map((image, index) => ({
        id: `fallback-${config.title}-${index}`,
        image,
        title: `${config.title} ${index + 1}`,
        brand: breadcrumbParts?.[0]?.replace(/_/g, " ") || "Catalog",
      }));
  const visibleSubcategoryVisuals = subcategoryHeroProducts.length > 0 ? subcategoryHeroProducts : subcategoryVisualFallback;
  const toggleBrand = (brand) => {
    setSelectedBrands((current) => (
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]
    ));
  };
  const toggleColor = (color) => {
    setSelectedColors((current) => (
      current.includes(color) ? current.filter((item) => item !== color) : [...current, color]
    ));
  };
  const toggleBadge = (badge) => {
    setSelectedBadges((current) => (
      current.includes(badge) ? current.filter((item) => item !== badge) : [...current, badge]
    ));
  };
  const resetFilters = () => {
    setFilterSearch("");
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedBadges([]);
    setStockFilter("all");
    setPriceRange("all");
    setDiscountRange("all");
    setShowAllBrands(false);
    setShowAllColors(false);
  };

  return (
    <section className="category-page">
      <div className="container">
        <div className="category-page-header">
          <button className="back-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          <span className="page-breadcrumb">
            Home / {breadcrumbParts[0].replace(/_/g, " ")}
            {breadcrumbLabel ? ` / ${breadcrumbLabel}` : ""}
          </span>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
          <div className="category-hero-meta">
            <span>{filteredProducts.length || 0}+ curated styles</span>
            <span>Realtime inventory</span>
            <span>Fast delivery available</span>
          </div>
          {config.banner && <div className="luxury-banner">{config.banner}</div>}
        </div>

        {isSubcategory ? (
          <div className="subcategory-view myntra-category-layout">
            <aside className="myntra-filters">
              <div className="filter-panel">
                <div className="filter-panel-head">
                  <h3>Filters</h3>
                  <button type="button" className="filter-clear-btn" onClick={resetFilters}>Clear all</button>
                </div>
                <input
                  className="filter-search-input"
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search brands or colors"
                />
              </div>
              <div className="filter-panel">
                <h4>Categories</h4>
                <div className="filter-option-list">
                  {categoryCounts.map((section) => (
                    <button key={section.label} className={`filter-line-btn ${section.pageKey === page ? "active" : ""}`} onClick={() => section.pageKey && onPageChange(section.pageKey)}>
                      <span>{section.label}</span>
                      <small>({section.count})</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-panel">
                <h4>Brand</h4>
                <div className="filter-check-list">
                  {(showAllBrands ? visibleBrandCounts : visibleBrandCounts.slice(0, 8)).map((brand) => (
                    <label key={brand.label} className="filter-check-item">
                      <input type="checkbox" checked={selectedBrands.includes(brand.label)} onChange={() => toggleBrand(brand.label)} />
                      <span>{brand.label}</span>
                      <small>({brand.count})</small>
                    </label>
                  ))}
                </div>
                {visibleBrandCounts.length > 8 && (
                  <button type="button" className="filter-more-btn" onClick={() => setShowAllBrands((current) => !current)}>
                    {showAllBrands ? "Show less" : `+ ${visibleBrandCounts.length - 8} more`}
                  </button>
                )}
              </div>
              <div className="filter-panel">
                <h4>Price</h4>
                <div className="price-range-display">Rs {minPrice.toLocaleString()} - Rs {maxPrice.toLocaleString()}+</div>
                <div className="filter-check-list">
                  {[
                    { value: "all", label: "All" },
                    { value: "under-1500", label: "Under Rs 1,500" },
                    { value: "1500-3000", label: "Rs 1,500 to Rs 3,000" },
                    { value: "above-3000", label: "Above Rs 3,000" },
                  ].map((option) => (
                    <label key={option.value} className="filter-check-item">
                      <input type="radio" name="price-range" checked={priceRange === option.value} onChange={() => setPriceRange(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-panel">
                <h4>Color</h4>
                <div className="filter-check-list">
                  {(showAllColors ? visibleColorCounts : visibleColorCounts.slice(0, 7)).map((color) => (
                    <label key={color.label} className="filter-check-item">
                      <input type="checkbox" checked={selectedColors.includes(color.label)} onChange={() => toggleColor(color.label)} />
                      <span>{color.label}</span>
                      <small>({color.count})</small>
                    </label>
                  ))}
                </div>
                {visibleColorCounts.length > 7 && (
                  <button type="button" className="filter-more-btn" onClick={() => setShowAllColors((current) => !current)}>
                    {showAllColors ? "Show less" : `+ ${visibleColorCounts.length - 7} more`}
                  </button>
                )}
              </div>
              <div className="filter-panel">
                <h4>Product Tags</h4>
                <div className="filter-check-list">
                  {badgeCounts.map((badge) => (
                    <label key={badge.label} className="filter-check-item">
                      <input type="checkbox" checked={selectedBadges.includes(badge.label)} onChange={() => toggleBadge(badge.label)} />
                      <span>{badge.label}</span>
                      <small>({badge.count})</small>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-panel">
                <h4>Availability</h4>
                <div className="filter-check-list">
                  {[
                    { value: "all", label: "All items" },
                    { value: "in-stock", label: "In stock only" },
                    { value: "new", label: "New arrivals" },
                  ].map((option) => (
                    <label key={option.value} className="filter-check-item">
                      <input type="radio" name="stock-filter" checked={stockFilter === option.value} onChange={() => setStockFilter(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-panel">
                <h4>Discount</h4>
                <div className="filter-check-list">
                  {[
                    { value: "all", label: "All" },
                    { value: "10", label: "10% and above" },
                    { value: "20", label: "20% and above" },
                    { value: "30", label: "30% and above" },
                    { value: "40", label: "40% and above" },
                    { value: "50", label: "50% and above" },
                    { value: "60", label: "60% and above" },
                    { value: "70", label: "70% and above" },
                    { value: "80", label: "80% and above" },
                  ].map((option) => (
                    <label key={option.value} className="filter-check-item">
                      <input type="radio" name="discount-range" checked={discountRange === option.value} onChange={() => setDiscountRange(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="myntra-product-section">
              {visibleSubcategoryVisuals.length > 0 && (
                <div className="subcategory-visual-rail">
                  <article className="subcategory-feature-card">
                    <img
                      src={visibleSubcategoryVisuals[0].image}
                      alt={visibleSubcategoryVisuals[0].name || visibleSubcategoryVisuals[0].title || config.title}
                    />
                    <div className="subcategory-feature-copy">
                      <span>{breadcrumbParts[0].replace(/_/g, " ")}</span>
                      <h2>{config.title}</h2>
                      <p>{config.subtitle}</p>
                    </div>
                  </article>
                  <div className="subcategory-thumb-stack">
                    {visibleSubcategoryVisuals.slice(1).map((product) => (
                      <article className="subcategory-thumb-card" key={`hero-${product.id || product.title}`}>
                        <img src={product.image} alt={product.name || product.title} />
                        <div>
                          <strong>{product.brand || config.title}</strong>
                          <span>{product.name || product.title}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="myntra-toolbar">
                <span>{listingProducts.length || filteredProducts.length} items</span>
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Better Discount</option>
                </select>
              </div>

              <div className="listing-highlight-row">
                <span className="listing-highlight">Premium edit</span>
                <span className="listing-highlight">Handpicked brands</span>
                <span className="listing-highlight">Blue cream curation</span>
              </div>

              <div className="myntra-products-grid">
                {(listingProducts.length > 0 ? listingProducts : filteredProducts).map((product) => (
                  <article className="myntra-product-card" key={product.id || product.title}>
                    <div className="myntra-product-image" onClick={() => onQuickView(product)}>
                      <img src={product.image} alt={product.name || product.title} />
                      {product.badge && <span className="myntra-badge">{product.badge}</span>}
                      <button className="myntra-media-chip" type="button" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
                        <i className="fa-solid fa-cube" /> {product.mediaTag || "3D View"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}
                        className={`wishlist-btn ${wishlist.some((p) => p.id === product.id) ? 'active' : ''}`}
                      >
                        <i className={`fa-${wishlist.some((p) => p.id === product.id) ? 'solid' : 'regular'} fa-heart`}></i>
                      </button>
                    </div>
                    <div className="myntra-product-copy">
                      <strong>{product.brand || ""}</strong>
                      <h3>{product.name || product.title}</h3>
                      <div className="myntra-price-row">
                        <span>{product.price || ""}</span>
                        {product.oldPrice && <s>{product.oldPrice}</s>}
                        {product.discount && <em>{product.discount}</em>}
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className="myntra-quick-view-btn">View Slides & 3D</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onAddToBag(product); }} className="add-to-bag-btn">Add to Bag</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {config.highlights?.length > 0 && (
              <div className="page-extra">
                {config.highlights.map((highlight) => (
                  <span className="extra-chip" key={highlight}>{highlight}</span>
                ))}
              </div>
            )}
            <div className="category-sections">
              {config.sections?.map((section) => {
                const sectionPreviewProducts = getSectionPreviewProducts(section);

                return (
                <article className="category-section" key={section.title}>
                  <div className="category-section-top">
                    <div className="category-section-copy">
                      <h3>{section.title}</h3>
                      <p>{section.description}</p>
                    </div>
                    {sectionPreviewProducts.length > 0 && (
                      <div className="category-section-visual">
                        <img
                          src={sectionPreviewProducts[0].image}
                          alt={sectionPreviewProducts[0].name || sectionPreviewProducts[0].title || section.title}
                        />
                        {sectionPreviewProducts.length > 1 && (
                          <div className="category-section-visual-stack">
                            {sectionPreviewProducts.slice(1).map((product) => (
                              <img
                                key={`${section.title}-${product.id || product.title}`}
                                src={product.image}
                                alt={product.name || product.title}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="category-section-products">
                    {(section.keywords || [section.title]).map((keyword) => (
                      <span className="category-pill" key={keyword}>{keyword}</span>
                    ))}
                  </div>
                  <div className="product-preview-grid">
                    {filterByKeywords(section.keywords || [section.title]).map((product) => (
                      <div className="product-card" key={product.id || product.title} onClick={() => onQuickView(product)}>
                        <img src={product.image} alt={product.name || product.title} />
                        <strong>{product.name || product.title}</strong>
                        <span>{product.brand || ""}</span>
                        <span>{product.price || ""}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className="product-secondary-btn">3D View</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onAddToBag(product); }} className="add-to-bag-btn">Add to Bag</button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}
                          className={`wishlist-btn ${wishlist.some((p) => p.id === product.id) ? 'active' : ''}`}
                        >
                          <i className={`fa-${wishlist.some((p) => p.id === product.id) ? 'solid' : 'regular'} fa-heart`}></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
              })}
            </div>

            {config.extra?.length > 0 && (
              <div className="page-extra">
                {config.extra.map((extra) => (
                  <span className="extra-chip" key={extra}>{extra}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function SectionTitle({ children }) {
  return <h2 className="section-title">{children}</h2>;
}

function parseAmount(amount) {
  return parseInt(String(amount).replace(/[^\d]/g, ""), 10) || 0;
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString()}`;
}

function parseDisplayPrice(price) {
  return Number(String(price || "").replace(/[^\d]/g, "")) || 0;
}

function normalizeMediaAsset(asset, fallbackLabel, index) {
  if (!asset) return null;
  if (typeof asset === "string") {
    return { url: asset, label: `${fallbackLabel} ${index + 1}` };
  }
  if (asset.url) {
    return { url: asset.url, label: asset.label || `${fallbackLabel} ${index + 1}` };
  }
  return null;
}

function getProductMediaBundle(product) {
  const slideImages = (product?.images || [])
    .map((asset, index) => normalizeMediaAsset(asset, "Slide", index))
    .filter(Boolean);
  const fallbackImage = product?.image ? [{ url: product.image, label: "Hero View" }] : [];
  const slides = slideImages.length > 0 ? slideImages : fallbackImage;
  const spinFrames = (product?.spinFrames || [])
    .map((asset, index) => normalizeMediaAsset(asset, "Spin", index))
    .filter(Boolean);

  return {
    slides,
    spinFrames: spinFrames.length > 0 ? spinFrames : slides,
    mediaTag: product?.mediaTag || "3D View",
  };
}

function buildProductInsightBundle(product, media) {
  const category = String(product?.category || "Fashion");
  const priceValue = parseDisplayPrice(product?.price);
  const slidesCount = media?.slides?.length || 0;
  const spinCount = media?.spinFrames?.length || 0;

  return {
    overview: `${category} item with ${slidesCount} styled media views and ${spinCount} guided 3D angles for faster purchase confidence.`,
    fitNote: /saree|lehenga|dupatta|kurta/i.test(category)
      ? "Best checked from drape, border, and fabric-fall views before purchase."
      : /footwear|shoe|sneaker/i.test(category)
        ? "Use side-angle and top-angle frames to judge toe shape, sole height, and overall bulk."
        : "Use posture slides to compare silhouette, drape, and front-to-side structure.",
    materialCue: /beauty/i.test(category)
      ? "Packaging finish and applicator detail are highlighted in the close-up frames."
      : /home|living|bedsheet|curtain|decor/i.test(category)
        ? "Texture cues appear strongest in the detail and folded presentation frames."
        : "Close-up slides help judge texture, finish, and overall premium quality.",
    delivery: priceValue >= 3000 ? "Premium dispatch: 1-2 days" : "Fast dispatch: 2-4 days",
    trustPoints: [
      `${product?.badge || "Curated pick"} assurance`,
      `${slidesCount} gallery views`,
      `${spinCount} spin frames`,
    ],
  };
}

function getSizeOptions(product) {
  const variantSizes = [...new Set((product?.variants || []).map((variant) => String(variant?.size || "").trim()).filter(Boolean))];
  const category = String(product?.category || "").toLowerCase();

  if (variantSizes.length > 0 && !variantSizes.every((size) => /^free size$/i.test(size))) {
    return variantSizes;
  }

  if (/footwear|shoe|sneaker|heel|flat|sandal/.test(category)) {
    return ["6", "7", "8", "9", "10"];
  }

  if (/t-shirt|shirt|jacket|sweatshirt|jeans|trouser|shorts|trackpants|dress|top|co-ord|kurta|suit|lehenga|sportswear|ethnic sets|sets/.test(category)) {
    return ["S", "M", "L", "XL"];
  }

  if (variantSizes.length > 0) {
    return variantSizes;
  }

  return ["Free Size"];
}

function requiresSizeSelection(product) {
  const sizes = getSizeOptions(product);
  return sizes.length > 1 || !/^free size$/i.test(sizes[0] || "");
}

function buildMainPageKey(label) {
  return String(label || "")
    .toUpperCase()
    .replace(/\s*&\s*/g, "_&_" )
    .replace(/\s+/g, "_");
}

function buildSubPageKey(menuLabel, linkLabel) {
  const menuKey = buildMainPageKey(menuLabel);
  const linkKey = String(linkLabel || "")
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  return `${menuKey}/${linkKey}`;
}

function normalizePageKey(pageValue) {
  if (pageValue == null || pageValue === "") {
    return null;
  }

  const incoming = String(pageValue);

  for (const item of navItems) {
    const mainKey = buildMainPageKey(item.label);
    if (incoming === mainKey || buildMainPageKey(incoming) === mainKey) {
      return mainKey;
    }

    for (const group of item.groups || []) {
      for (const link of group.links || []) {
        const subKey = buildSubPageKey(item.label, link.label);
        if (incoming === subKey) {
          return subKey;
        }

        const [incomingMain = "", incomingSub = ""] = incoming.split("/");
        if (
          buildMainPageKey(incomingMain) === mainKey &&
          buildMainPageKey(incomingSub.replace(/AND/g, "&")) === buildMainPageKey(link.label)
        ) {
          return subKey;
        }
      }
    }
  }

  return incoming;
}

function buildRouteHash(type, value) {
  if (type === "page") {
    return value ? `#/page/${encodeURIComponent(value)}` : "#/home";
  }
  if (type === "section") {
    return value ? `#/section/${encodeURIComponent(value)}` : "#/home";
  }
  return "#/home";
}

function parseRouteHash(hashValue) {
  const hash = String(hashValue || "").replace(/^#\/?/, "");
  if (!hash || hash === "home") {
    return { type: "home", value: null };
  }

  const [type, ...rest] = hash.split("/");
  const value = decodeURIComponent(rest.join("/"));

  if (type === "page" && value) {
    return { type: "page", value: normalizePageKey(value) };
  }

  if (type === "section" && value) {
    return { type: "section", value };
  }

  return { type: "home", value: null };
}

function Header({
  wishlistCount,
  bagCount,
  onBagClick,
  onWishlistClick,
  onProfileClick,
  user,
  theme,
  onThemeToggle,
  onPageChange,
  onSectionNavigate,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuCloseTimerRef = useRef(null);

  const toggleExpand = (label) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  const clearMegaMenuCloseTimer = () => {
    if (megaMenuCloseTimerRef.current) {
      window.clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
  };

  const handleMenuHover = (menuItem) => {
    clearMegaMenuCloseTimer();
    setHoveredMenu(menuItem);
    setMegaMenuOpen(true);
  };

  const handleMenuLeave = () => {
    clearMegaMenuCloseTimer();
    megaMenuCloseTimerRef.current = window.setTimeout(() => {
      setHoveredMenu(null);
      setMegaMenuOpen(false);
      megaMenuCloseTimerRef.current = null;
    }, 140);
  };

  const handleMenuClick = (menuItem) => {
    const page = buildMainPageKey(menuItem.label);
    onPageChange(page);
    setMegaMenuOpen(false);
  };

  const handleSubMenuClick = (menuItem, groupTitle, linkLabel) => {
    onPageChange(buildSubPageKey(menuItem.label, linkLabel));
    setMegaMenuOpen(false);
  };

  useEffect(() => () => clearMegaMenuCloseTimer(), []);

  const getMenuColor = (label) => {
    switch (label) {
      case 'MEN': return '#007bff'; // Blue
      case 'WOMEN': return '#ff69b4'; // Pink
      case 'BEAUTY': return '#dda0dd'; // Soft pastel
      default: return '#333';
    }
  };

  return (
    <>
      <div className="offer-bar">
        <span>FLAT 60% OFF | Free Shipping on First Order | Use Code: <strong>JAANU50</strong></span>
      </div>

      <header>
        <div className="container">
          <div className="header-main">
            <div className="header-left">
              <button
                className="burger-btn"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
              <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onPageChange(null); }}>
                <div className="logo-mark">JF</div>
                <div className="logo-text">
                  <strong>Jaanu Fashion</strong>
                  <span>Fashion Store</span>
                </div>
              </a>
            </div>

            {/* Mega Menu Navbar */}
            <nav className="main-navbar">
              <ul className="navbar-menu">
                {navItems.map((item) => (
                  <li
                    key={item.label}
                    className="navbar-item"
                    onMouseEnter={() => handleMenuHover(item)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button
                      className="navbar-link"
                      onClick={() => handleMenuClick(item)}
                      style={{ color: hoveredMenu?.label === item.label ? getMenuColor(item.label) : 'inherit' }}
                    >
                      {item.label}
                      <i className="fa-solid fa-chevron-down navbar-arrow"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={`search-container ${searchFocused ? "focused" : ""}`}>
              <div className="search">
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
              </div>
              {searchFocused && (
                <div className="search-dropdown">
                  <div className="trending-search">
                    <strong>Trending Searches</strong>
                    <ul>
                      <li><button type="button" className="search-suggestion-link" onClick={() => onPageChange("WOMEN/SAREES")}><i className="fa-solid fa-arrow-trend-up"></i> Saree</button></li>
                      <li><button type="button" className="search-suggestion-link" onClick={() => onPageChange("WOMEN/KURTAS_AND_SUITS")}><i className="fa-solid fa-arrow-trend-up"></i> Kurta Sets</button></li>
                      <li><button type="button" className="search-suggestion-link" onClick={() => onPageChange("MEN/FOOTWEAR")}><i className="fa-solid fa-arrow-trend-up"></i> Sneakers</button></li>
                      <li><button type="button" className="search-suggestion-link" onClick={() => onPageChange("WOMEN/BAGS")}><i className="fa-solid fa-arrow-trend-up"></i> Handbags</button></li>
                      <li><button type="button" className="search-suggestion-link" onClick={() => onPageChange("WOMEN/WATCHES")}><i className="fa-solid fa-arrow-trend-up"></i> Watches</button></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="header-actions">
              <div className="action" onClick={onThemeToggle}>
                <div className="action-icon-wrapper">
                  <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                </div>
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </div>
              <div className="action" onClick={onProfileClick}>
                <div className="action-icon-wrapper">
                  <i className="fa-regular fa-user" />
                  {user && <span className="user-dot"></span>}
                </div>
                <span>{user ? (user.role === 'SELLER' ? 'Seller' : 'Profile') : 'Login'}</span>
              </div>
              <div className="action" onClick={onWishlistClick}>
                <div className="action-icon-wrapper">
                  <i className="fa-regular fa-heart" />
                  {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
                </div>
                <span>Wishlist</span>
              </div>
              <div className="action" onClick={onBagClick}>
                <div className="action-icon-wrapper">
                  <i className="fa-solid fa-bag-shopping" />
                  {bagCount > 0 && <span className="action-badge">{bagCount}</span>}
                </div>
                <span>Bag</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu Dropdown */}
      {megaMenuOpen && hoveredMenu && (
        <div
          className="mega-menu-overlay"
          onMouseEnter={() => handleMenuHover(hoveredMenu)}
          onMouseLeave={handleMenuLeave}
        >
          <div className="mega-menu-container">
            <div className="mega-menu-content">
              <div className="mega-menu-header">
                <h3 style={{ color: getMenuColor(hoveredMenu.label) }}>{hoveredMenu.label}</h3>
                <p>{hoveredMenu.tagline}</p>
              </div>

              <div className="mega-menu-columns">
                {hoveredMenu.groups.map((group, groupIndex) => (
                  <div key={group.title} className="mega-menu-column">
                    <h4 className="column-title">{group.title}</h4>
                    <ul className="column-links">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <button
                            className="mega-menu-link"
                            onClick={() => handleSubMenuClick(hoveredMenu, group.title, link.label)}
                          >
                            <span className="mega-menu-link-thumb">
                              <img
                                src={getCategoryPreviewImage(link.label, hoveredMenu.image)}
                                alt={link.label}
                              />
                            </span>
                            <span className="mega-menu-link-copy">
                              <strong>{link.label}</strong>
                              <small>{group.title}</small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {groupIndex === 0 && (
                      <div className="column-image">
                        <img src={hoveredMenu.image} alt={hoveredMenu.label} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hoveredMenu.label === 'BEAUTY' && (
                <div className="mega-menu-offers">
                  <div className="offer-highlight">
                    <span className="offer-badge">Flat 50% OFF</span>
                    <p>Beauty products starting at ₹199</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer Overlay */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)}></div>

      {/* Side Drawer */}
      <div className={`side-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="user-profile-summary">
            <div className="profile-icon">
              <i className="fa-regular fa-user"></i>
            </div>
            <div className="profile-text">
              <strong>Welcome</strong>
              <span>To access account and manage orders</span>
            </div>
          </div>
          <button className="close-drawer" onClick={() => setDrawerOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-content">
          <nav className="drawer-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.label} className="drawer-item">
                  <div className="drawer-item-main" onClick={() => {
                    const page = buildMainPageKey(item.label);
                    onPageChange(page);
                    setDrawerOpen(false);
                  }}>
                    <span>{item.label}</span>
                    <i className={`fa-solid fa-chevron-${expandedItem === item.label ? 'down' : 'right'}`} />
                  </div>
                  {expandedItem === item.label && (
                    <div className="drawer-item-sub">
                      {item.groups.flatMap(g => g.links).map((link) => (
                        <button
                          key={link.label}
                          className="drawer-sub-link"
                          type="button"
                          onClick={() => {
                            onPageChange(buildSubPageKey(item.label, link.label));
                            setDrawerOpen(false);
                          }}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="drawer-divider"></div>

          <nav className="drawer-secondary-nav">
            <ul>
              <li>
                <button type="button" onClick={() => { onProfileClick(); setDrawerOpen(false); }}>
                  <i className="fa-solid fa-box"></i>
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onWishlistClick(); setDrawerOpen(false); }}>
                  <i className="fa-regular fa-heart"></i>
                  <span>Wishlist</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onSectionNavigate("offers"); setDrawerOpen(false); }}>
                  <i className="fa-solid fa-gift"></i>
                  <span>Gift Cards</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onSectionNavigate("footer"); setDrawerOpen(false); }}>
                  <i className="fa-solid fa-headset"></i>
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onSectionNavigate("footer"); setDrawerOpen(false); }}>
                  <i className="fa-solid fa-circle-info"></i>
                  <span>About Us</span>
                </button>
              </li>
            </ul>
          </nav>

        </div>
      </div>
    </>
  );
}

function Hero({ onExploreProducts }) {
  return (
    <section className="hero-editorial">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-main-visual">
            <div className="magazine-tag">JAANU / ISSUE 01</div>
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80" 
              alt="Editorial Fashion" 
            />
            <div className="hero-floating-text">
              <span className="eyebrow">SPRING SUMMER 2026</span>
              <h1>The Art of <br /><em>Modern</em> Elegance</h1>
              <p>A curated collection of timeless silhouettes and contemporary crafts.</p>
              <div className="hero-offer-pills">
                <span>Fashion from Rs 799</span>
                <span>Beauty picks from Rs 299</span>
                <span>Free shipping on first order</span>
              </div>
              <button type="button" className="luxury-cta luxury-cta-button" onClick={onExploreProducts}>Explore Collection</button>
            </div>
          </div>
          <div className="hero-side-visual">
            <div className="side-img-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
                alt="Summer Edit" 
              />
              <div className="img-caption">THE SUMMER EDIT</div>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>500+</strong>
                <span>Artisan Labels</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <strong>24H</strong>
                <span>Concierge Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoShowcase({ onPageChange, onExploreProducts }) {
  return (
    <section className="promo-showcase">
      <div className="container">
        <div className="promo-showcase-grid">
          <article className="promo-card feature">
            <div className="promo-copy">
              <span className="promo-tag">Myntra Style Deal</span>
              <h3>Massive wardrobe refresh with trend-first fashion edits</h3>
              <p>Shop ethnic, western, sneakers, bags and premium everyday looks from a single live catalog.</p>
              <button type="button" className="promo-btn" onClick={() => onPageChange("WOMEN")}>Shop Fashion</button>
            </div>
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" alt="Fashion campaign" />
          </article>
          <article className="promo-card beauty">
            <div className="promo-copy">
              <span className="promo-tag">Nykaa Beauty Edit</span>
              <h3>Skincare, glow kits, lipstick and self-care in one polished aisle</h3>
              <p>Discover beauty-first merchandising with quick picks and real-time inventory.</p>
              <button type="button" className="promo-btn secondary" onClick={() => onPageChange("BEAUTY")}>Explore Beauty</button>
            </div>
            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80" alt="Beauty campaign" />
          </article>
          <article className="flash-strip-card">
            <span className="promo-tag">Flash Offers</span>
            <strong>Extra 20% off on beauty and accessories</strong>
            <button type="button" className="promo-link-btn" onClick={onExploreProducts}>View live deals</button>
          </article>
          <article className="flash-strip-card muted">
            <span className="promo-tag">Seller synced</span>
            <strong>Everything you see here is connected with seller inventory</strong>
            <button type="button" className="promo-link-btn" onClick={() => onPageChange("HOME_&_LIVING")}>Browse more</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function CategoriesGrid({ onPageChange }) {
  return (
    <section className="categories-grid-section" id="categories">
      <div className="container">
        <div className="categories-luxury-flex">
          {categories.map((cat) => (
            <button
              type="button"
              className="category-luxury-item"
              key={cat.id}
              onClick={() => onPageChange(cat.id === "women" ? "WOMEN" : cat.id.toUpperCase().replace(/-/g, "_"))}
            >
              <div className="category-image-wrapper">
                <img src={cat.image} alt={cat.title} />
              </div>
              <div className="category-info">
                <span className="cat-title">{cat.title}</span>
                <span className="cat-subtitle">{cat.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DealsSection({ offers, onExploreProducts }) {
  return (
    <section className="deals-luxury-section">
      <div className="container">
        <div className="deals-header">
          <span className="eyebrow">LIMITED TIME</span>
          <SectionTitle>Curated Offers</SectionTitle>
        </div>
        <div className="deals-luxury-grid">
          {offers.slice(0, 2).map((offer, index) => (
            <article className={`deal-luxury-card ${index === 0 ? 'large' : ''}`} key={offer.title}>
              <img src={offer.image} alt={offer.title} />
              <div className="deal-luxury-content">
                <span className="deal-tag">{offer.tag}</span>
                <h3>{offer.title}</h3>
                <p>{offer.text}</p>
                <button type="button" className="luxury-cta luxury-cta-button" onClick={onExploreProducts}>Shop Offer</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeautySpotlight({ onPageChange }) {
  return (
    <section className="beauty-spotlight">
      <div className="container">
        <div className="beauty-spotlight-grid">
          <div className="beauty-copy">
            <span className="eyebrow">Nykaa-Inspired Beauty Wall</span>
            <h2>Glow, prep, tint, finish</h2>
            <p>Build a beauty routine with skincare, makeup, and glow-first essentials arranged like a premium beauty storefront.</p>
            <div className="beauty-chip-row">
              <button type="button" onClick={() => onPageChange("BEAUTY/FACE")}>Face</button>
              <button type="button" onClick={() => onPageChange("BEAUTY/LIPS")}>Lips</button>
              <button type="button" onClick={() => onPageChange("BEAUTY/SERUMS")}>Serums</button>
              <button type="button" onClick={() => onPageChange("BEAUTY/SUNSCREEN")}>Sunscreen</button>
            </div>
          </div>
          <div className="beauty-stack">
            <article className="beauty-stack-card tall">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80" alt="Beauty essentials" />
              <div>
                <span>Skin Ritual</span>
                <strong>Dewy prep for everyday glow</strong>
              </div>
            </article>
            <article className="beauty-stack-card">
              <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80" alt="Lip collection" />
              <div>
                <span>Lip Wardrobe</span>
                <strong>Bold matte to soft nude</strong>
              </div>
            </article>
            <article className="beauty-stack-card">
              <img src="https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80" alt="Serum collection" />
              <div>
                <span>Care Picks</span>
                <strong>Barrier support and hydration</strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <div className="service-strip">
      <div className="container">
        <div className="service-grid">
          {serviceItems.map((item) => (
            <div className="service-card" key={item.title}>
              <i className={item.icon} />
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const womenPage = navItems.find((item) => item.label === "WOMEN");
  const womenPageContent = getNavPageContent(womenPage);

  return (
    <section className="nav-page-section" id="women-page">
      <div className="container">
        <SectionTitle>{womenPage.label}</SectionTitle>

        <div className="nav-page-hero">
          <div className="nav-page-copy">
            <span className="nav-page-eyebrow">{womenPageContent.eyebrow}</span>
            <h3>{womenPageContent.title}</h3>
            <p>{womenPageContent.text}</p>
          </div>

          <div className="nav-page-summary">
            {womenPageContent.highlights.map((highlight) => (
              <div className="nav-summary-pill" key={highlight}>
                <i className="fa-solid fa-check" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="nav-page-jumps">
          {womenPage.groups.flatMap((group) => group.links).map((link) => (
            <a className="nav-jump-link" href={link.href} key={`Women-${link.label}`}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="category-head">
          <strong>Shop By Category</strong>
          <span>Top marketplaces start with fast category browsing</span>
        </div>
        <div className="category-grid">
          {categories.map((item) => (
            <article className="category-tile" key={item.title}>
              <img src={item.image} alt={item.title} />
              <div className="category-copy">
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="nav-page-group-grid">
          {womenPage.groups.map((group) => (
            <section className="nav-group-panel" key={`Women-${group.title}`}>
              <div className="nav-group-panel-head">
                <strong>{group.title}</strong>
                <span>Women subpages</span>
              </div>

              <div className="nav-subpage-grid">
                {group.links.map((link) => (
                  <NavSubpageCard
                    key={`${group.title}-${link.label}`}
                    parentItem={womenPage}
                    groupTitle={group.title}
                    link={link}
                    description={`Explore ${link.label.toLowerCase()} with fast discovery, wishlist-friendly browsing, and polished marketplace curation.`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function OffersSection() {
  return (
    <section id="offers">
      <div className="container">
        <SectionTitle>Top Picks & Big Deals</SectionTitle>
        <div className="offer-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.title}>
              <img src={offer.image} alt={offer.title} />
              <div className="offer-copy">
                <span>{offer.tag}</span>
                <h3>{offer.title}</h3>
                <p>{offer.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, isWishlisted, onWishlistToggle, onAddToBag, onQuickView }) {
  return (
    <article className="product-card-luxury">
      <div className="product-visual" onClick={() => onQuickView(product)}>
        <img src={product.image} alt={product.title} />
        {product.badge && <span className="luxury-badge">{product.badge}</span>}
        <span className="product-media-pill">{product.mediaTag || "3D View"}</span>
        <div className="product-actions-overlay">
          <button 
            type="button"
            className={`luxury-action-btn ${isWishlisted ? "active" : ""}`} 
            aria-label="Add to wishlist"
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}
          >
            <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
          </button>
          <button type="button" className="luxury-action-btn" aria-label="Quick View" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
            <i className="fa-regular fa-eye" />
          </button>
        </div>
        <button type="button" className="product-media-launch" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
          <i className="fa-solid fa-cube" /> View in 3D
        </button>
        <button type="button" className="luxury-quick-add" onClick={(e) => { e.stopPropagation(); onAddToBag(product); }}>Quick Add</button>
      </div>
      <div className="product-info">
        <span className="product-brand-tag">{product.brand}</span>
        <h3 className="product-name">{product.title}</h3>
        <div className="product-price-row">
          <span className="price-current">{product.price}</span>
          <span className="price-old">{product.oldPrice}</span>
        </div>
        <div className="product-card-actions-row">
          <button type="button" className="product-secondary-btn" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
            <i className="fa-solid fa-cube" /> View 3D
          </button>
          <button type="button" className="add-to-bag-btn" onClick={(e) => { e.stopPropagation(); onAddToBag(product); }}>
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  );
}

function TrendingProducts({ products, wishlist, onWishlistToggle, onAddToBag, onQuickView }) {
  return (
    <section className="trending-section" id="products">
      <div className="container">
        <div className="trending-section-head">
          <div>
            <span className="eyebrow">Trending Now</span>
            <SectionTitle>Most Wanted Picks</SectionTitle>
          </div>
          <p>Three standout looks and essentials from the live catalog, styled like a cleaner marketplace spotlight.</p>
        </div>
        <div className="trending-standard-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard 
              product={product} 
              key={product.title} 
              isWishlisted={wishlist.some(p => p.title === product.title)}
              onWishlistToggle={onWishlistToggle}
              onAddToBag={onAddToBag}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductExperienceModal({ product, isWishlisted, onClose, onWishlistToggle, onAddToBag }) {
  const [viewMode, setViewMode] = useState("slides");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const media = getProductMediaBundle(product);
  const insights = buildProductInsightBundle(product, media);
  const sizeOptions = getSizeOptions(product);
  const mustChooseSize = requiresSizeSelection(product);
  const activeMedia = viewMode === "spin" ? media.spinFrames : media.slides;
  const currentAsset = activeMedia[activeIndex] || media.slides[0];

  useEffect(() => {
    setViewMode("slides");
    setActiveIndex(0);
    setSelectedSize(sizeOptions.length === 1 ? sizeOptions[0] : "");
  }, [product?.id]);

  useEffect(() => {
    setActiveIndex(0);
  }, [viewMode]);

  if (!product || !currentAsset) {
    return null;
  }

  const handleMove = (direction) => {
    const maxIndex = activeMedia.length - 1;
    setActiveIndex((prev) => {
      if (direction === "next") {
        return prev >= maxIndex ? 0 : prev + 1;
      }
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  return (
    <div className="modal-overlay product-experience-overlay" onClick={onClose}>
      <div className="modal-content product-experience-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product.title || product.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="product-experience-body">
          <div className="product-experience-gallery">
            <div className="product-experience-toolbar">
              <button className={`media-mode-btn ${viewMode === "slides" ? "active" : ""}`} onClick={() => setViewMode("slides")}>
                <i className="fa-regular fa-images" /> Slides
              </button>
              <button className={`media-mode-btn ${viewMode === "spin" ? "active" : ""}`} onClick={() => setViewMode("spin")}>
                <i className="fa-solid fa-cube" /> 3D View
              </button>
            </div>
            <div className="product-stage">
              <button className="stage-nav prev" onClick={() => handleMove("prev")} aria-label="Previous view">
                <i className="fa-solid fa-chevron-left" />
              </button>
              <img src={currentAsset.url} alt={currentAsset.label} className={`stage-image ${viewMode === "spin" ? "spin-mode" : ""}`} />
              <button className="stage-nav next" onClick={() => handleMove("next")} aria-label="Next view">
                <i className="fa-solid fa-chevron-right" />
              </button>
              <div className="stage-caption">
                <strong>{currentAsset.label}</strong>
                <span>{viewMode === "spin" ? "Tap through angles for a 360-style preview" : "Browse posture slides like a marketplace gallery"}</span>
              </div>
            </div>
            <div className="media-thumb-strip">
              {activeMedia.map((asset, index) => (
                <button
                  key={`${viewMode}-${asset.url}-${index}`}
                  className={`media-thumb ${index === activeIndex ? "active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img src={asset.url} alt={asset.label} />
                  <span>{asset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="product-experience-summary">
            <span className="media-summary-tag">{media.mediaTag}</span>
            <strong>{product.brand}</strong>
            <h4>{product.title || product.name}</h4>
            <div className="product-experience-price">
              <span>{product.price}</span>
              {product.oldPrice && <s>{product.oldPrice}</s>}
              {product.discount && <em>{product.discount}</em>}
            </div>
            <p>
              Explore multiple poses, detail shots, and a guided 3D-style spin before adding this product to bag.
            </p>
            <div className="product-analysis-card">
              <div className="product-analysis-head">
                <i className="fa-solid fa-magnifying-glass-chart" />
                <strong>3D View Analysis</strong>
              </div>
              <p>{insights.overview}</p>
              <div className="analysis-points">
                <span><i className="fa-solid fa-ruler-combined" /> {insights.fitNote}</span>
                <span><i className="fa-solid fa-layer-group" /> {insights.materialCue}</span>
                <span><i className="fa-solid fa-truck-fast" /> {insights.delivery}</span>
              </div>
            </div>
            <div className="product-experience-highlights">
              <span><i className="fa-solid fa-check" /> {media.slides.length} posture slides</span>
              <span><i className="fa-solid fa-cube" /> {media.spinFrames.length} angle frames</span>
              <span><i className="fa-solid fa-badge-check" /> {product.badge || "Curated pick"}</span>
            </div>
            <div className="product-size-panel">
              <strong>Select Size</strong>
              <div className="product-size-chip-row">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-chip ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {mustChooseSize && !selectedSize && <span className="size-help-text">Choose a size before adding this item to bag.</span>}
            </div>
            <div className="product-trust-strip">
              {insights.trustPoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <div className="product-experience-actions">
              <button className="btn-primary-luxury" disabled={mustChooseSize && !selectedSize} onClick={() => onAddToBag(product, { selectedSize: selectedSize || null })}>
                Add to Bag
              </button>
              <button className={`btn-outline-luxury ${isWishlisted ? "active" : ""}`} onClick={() => onWishlistToggle(product)}>
                <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"} /> Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float-btn"
      href="https://wa.me/919876543210?text=Hi%20Jaanu%2C%20I%20need%20help%20with%20shopping."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <i className="fa-brands fa-whatsapp"></i>
    </a>
  );
}

function AIHelpFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQueryId, setActiveQueryId] = useState("delivery");

  const presetQueries = [
    {
      id: "delivery",
      label: "Delivery help",
      question: "How fast can I get my order delivered?",
      answer:
        "Most ready-to-ship items can be dispatched quickly based on live inventory. You can browse products, add to bag, and if you want exact delivery help for a product, message us on WhatsApp or call 7300212948.",
    },
    {
      id: "size",
      label: "Size help",
      question: "How do I choose the right size or fit?",
      answer:
        "Use the category filters and product details first. For ethnic wear, free-size and fit notes matter most; for fashion and footwear, compare price and product category pages, then contact support for manual help if needed.",
    },
    {
      id: "returns",
      label: "Returns",
      question: "Can I return or exchange an item?",
      answer:
        "Return and exchange support depends on the product type and store policy saved in the seller settings. If you want quick help before placing an order, connect with support at 7300212948 and we can guide you directly.",
    },
    {
      id: "offers",
      label: "Offers",
      question: "How do I find the best deals and offers?",
      answer:
        "Check the homepage campaign sections, curated offers, and listing filters like discount range. Live offers are synced with the backend, so what you see in the storefront is the current active promotion set.",
    },
  ];

  const activeQuery = presetQueries.find((item) => item.id === activeQueryId) || presetQueries[0];

  return (
    <div className={`ai-help-shell ${isOpen ? "open" : ""}`}>
      {isOpen && (
        <div className="ai-help-panel">
          <div className="ai-help-head">
            <div>
              <strong>Jaanu AI Help</strong>
              <span>Instant shopping guidance</span>
            </div>
            <button type="button" className="ai-help-close" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="ai-help-body">
            <p className="ai-help-intro">Pick a common question and get a quick answer.</p>
            <div className="ai-help-query-list">
              {presetQueries.map((query) => (
                <button
                  key={query.id}
                  type="button"
                  className={`ai-query-chip ${activeQueryId === query.id ? "active" : ""}`}
                  onClick={() => setActiveQueryId(query.id)}
                >
                  {query.label}
                </button>
              ))}
            </div>
            <div className="ai-help-answer">
              <span className="ai-role">AI Assistant</span>
              <strong>{activeQuery.question}</strong>
              <p>{activeQuery.answer}</p>
            </div>
            <div className="ai-help-contact">
              <a href="tel:7300212948">Call: 7300212948</a>
              <a href="https://wa.me/917300212948?text=Hi%20Jaanu%2C%20I%20need%20help%20with%20my%20shopping." target="_blank" rel="noreferrer">
                WhatsApp support
              </a>
            </div>
          </div>
        </div>
      )}
      <button type="button" className="ai-help-trigger" onClick={() => setIsOpen((current) => !current)} aria-label="Open AI help">
        <i className="fa-solid fa-robot"></i>
      </button>
    </div>
  );
}

function InsiderSection() {
  const studioPage = navItems.find((item) => item.label === "STUDIO");
  const studioPageContent = getNavPageContent(studioPage);

  return (
    <section id="studio">
      <div className="container">
        <div className="studio-head">
          <SectionTitle>{studioPage.label}</SectionTitle>
          <div className="nav-page-hero studio-hero">
            <div className="nav-page-copy">
              <span className="nav-page-eyebrow">{studioPageContent.eyebrow}</span>
              <h3>{studioPageContent.title}</h3>
              <p>{studioPageContent.text}</p>
            </div>
            <div className="nav-page-summary">
              {studioPageContent.highlights.map((highlight) => (
                <div className="nav-summary-pill" key={highlight}>
                  <i className="fa-solid fa-check" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="nav-page-jumps">
            {studioPage.groups.flatMap((group) => group.links).map((link) => (
              <a className="nav-jump-link" href={link.href} key={`Studio-${link.label}`}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="split-banner">
          <article className="insider-card">
            <h3>Jaanu Insider</h3>
            <p>
              Inspired by the kind of loyalty program shoppers already
              understand, but branded for your own store. Offer early access,
              reward milestones, and exclusive prices.
            </p>
            <ul className="insider-list">
              <li>
                <i className="fa-solid fa-check" />
                Early access to launches and sale events
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Insider-only coupons and cashback drops
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Priority dispatch and premium support
              </li>
              <li>
                <i className="fa-solid fa-check" />
                Style-based recommendations
              </li>
            </ul>
            <a className="btn" href="#join">
              Join now
            </a>
          </article>

          <article className="studio-card">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
              alt="Studio experience"
            />
            <div className="studio-overlay">
              <span>Jaanu Studio</span>
              <h3>Shop stories, reels, and curated looks.</h3>
              <p>
                Bring social-style discovery into your storefront with
                lookbooks, edits, and creator-inspired product storytelling.
              </p>
            </div>
          </article>
        </div>

        <div className="nav-page-group-grid studio-groups">
          {studioPage.groups.map((group) => (
            <section className="nav-group-panel" key={`Studio-${group.title}`}>
              <div className="nav-group-panel-head">
                <strong>{group.title}</strong>
                <span>Studio subpages</span>
              </div>

              <div className="nav-subpage-grid">
                {group.links.map((link) => (
                  <NavSubpageCard
                    key={`${group.title}-${link.label}`}
                    parentItem={studioPage}
                    groupTitle={group.title}
                    link={link}
                    description={`Browse ${link.label.toLowerCase()} in Studio with story-first discovery and quick-access shopping that feels familiar and premium.`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ onPageChange }) {
  return (
    <section className="category-showcase">
      <div className="container">
        {navItems.map((item, index) => (
          <div className={`showcase-section ${index % 2 === 1 ? 'reverse' : ''}`} key={item.label} id={item.href.slice(1)}>
            <div className="showcase-content">
              <span className="showcase-eyebrow">COLLECTION {index + 1}</span>
              <h2 className="showcase-title">{item.label}</h2>
              <p className="showcase-description">
                Explore our curated selection of {item.label.toLowerCase()} essentials. 
                From timeless classics to modern trends, discover the perfect pieces for your wardrobe.
              </p>
              <div className="showcase-groups-list">
                {item.groups.map(group => (
                  <div className="showcase-group-item" key={group.title}>
                    <h4>{group.title}</h4>
                    <div className="showcase-links-inline">
                      {group.links.map(link => (
                        <button type="button" key={link.label} onClick={() => onPageChange(buildSubPageKey(item.label, link.label))}>
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="luxury-cta luxury-cta-button" onClick={() => onPageChange(buildMainPageKey(item.label))}>View All {item.label}</button>
            </div>
            <div className="showcase-visual-stack">
              <div className="main-image">
                <img src={item.image} alt={item.label} />
              </div>
              <div className="accent-image">
                <img
                  src={getCategoryPreviewImage(item.groups[0]?.links[0]?.label, item.image)}
                  alt={`${item.groups[0]?.links[0]?.label || item.label} preview`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandsSection() {
  const brandLogos = [
    { name: "Aurelia", img: "https://constant.myntassets.com/web/assets/img/aurelia.png" },
    { name: "Roadster", img: "https://constant.myntassets.com/web/assets/img/roadster.png" },
    { name: "Puma", img: "https://constant.myntassets.com/web/assets/img/puma.png" },
    { name: "Rare", img: "https://constant.myntassets.com/web/assets/img/rare.png" },
    { name: "Anouk", img: "https://constant.myntassets.com/web/assets/img/anouk.png" },
    { name: "H&M", img: "https://constant.myntassets.com/web/assets/img/h&m.png" }
  ];

  return (
    <section className="brands-luxury-section">
      <div className="container">
        <SectionTitle>Artisan Labels</SectionTitle>
        <div className="brands-luxury-grid">
          {brandLogos.map((brand) => (
            <div className="brand-luxury-card" key={brand.name}>
              <div className="brand-luxury-inner">
                <span className="brand-name-luxury">{brand.name}</span>
                <span className="brand-explore-luxury">Explore Collection</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NavPagesSection() {
  const navPages = navItems.filter(
    (item) => item.label !== "WOMEN" && item.label !== "STUDIO",
  );

  return (
    <section className="nav-pages-shell">
      <div className="container">
        <SectionTitle>Complete Navbar Pages</SectionTitle>
        <div className="nav-page-stack">
          {navPages.map((item) => {
            const pageContent = getNavPageContent(item);

            return (
            <article className="nav-page-section" id={item.href.slice(1)} key={item.label}>
              <div className="nav-page-hero">
                <div className="nav-page-copy">
                  <span className="nav-page-eyebrow">{pageContent.eyebrow}</span>
                  <h3>{pageContent.title}</h3>
                  <p>{pageContent.text}</p>
                </div>

                <div className="nav-page-summary">
                  {pageContent.highlights.map((highlight) => (
                    <div className="nav-summary-pill" key={highlight}>
                      <i className="fa-solid fa-check" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nav-page-jumps">
                {item.groups.flatMap((group) => group.links).map((link) => (
                  <a className="nav-jump-link" href={link.href} key={`${item.label}-${link.label}`}>
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="nav-page-group-grid">
                {item.groups.map((group) => (
                  <section className="nav-group-panel" key={`${item.label}-${group.title}`}>
                    <div className="nav-group-panel-head">
                      <strong>{group.title}</strong>
                      <span>{item.label} navigation</span>
                    </div>

                    <div className="nav-subpage-grid">
                      {group.links.map((link) => (
                        <NavSubpageCard
                          key={`${group.title}-${link.label}`}
                          parentItem={item}
                          groupTitle={group.title}
                          link={link}
                          description={`Explore ${link.label.toLowerCase()} under ${item.label.toLowerCase()} with marketplace-style discovery, polished curation, and quick-access shopping flow.`}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          );
          })}
        </div>
      </div>
    </section>
  );
}


function Footer({ onPageChange, onSectionNavigate }) {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Online Shopping</h4>
            <ul>
              {navItems.map(item => (
                <li key={item.label}><button type="button" className="footer-link-btn" onClick={() => onPageChange(buildMainPageKey(item.label))}>{item.label}</button></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Policies</h4>
            <ul>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>Contact Us</button></li>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>FAQ</button></li>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>T&C</button></li>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>Shipping</button></li>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>Returns</button></li>
              <li><button type="button" className="footer-link-btn" onClick={() => onSectionNavigate("footer")}>Privacy Policy</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-links">
              <button type="button" className="footer-link-btn social-icon-btn" onClick={() => onSectionNavigate("footer")}><i className="fa-brands fa-facebook"></i></button>
              <button type="button" className="footer-link-btn social-icon-btn" onClick={() => onSectionNavigate("footer")}><i className="fa-brands fa-twitter"></i></button>
              <button type="button" className="footer-link-btn social-icon-btn" onClick={() => onSectionNavigate("footer")}><i className="fa-brands fa-youtube"></i></button>
              <button type="button" className="footer-link-btn social-icon-btn" onClick={() => onSectionNavigate("footer")}><i className="fa-brands fa-instagram"></i></button>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-promise">
              <div className="promise-item">
                <i className="fa-solid fa-certificate"></i>
                <div>
                  <strong>100% ORIGINAL</strong>
                  <span>guarantee for all products</span>
                </div>
              </div>
              <div className="promise-item">
                <i className="fa-solid fa-rotate-left"></i>
                <div>
                  <strong>Return within 14days</strong>
                  <span>of receiving your order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Jaanu Fashion. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function MobileBottomNav({ onWishlistClick, onProfileClick, onSectionNavigate }) {
  return (
    <nav className="mobile-bottom-nav">
      <button type="button" className="active" onClick={() => onSectionNavigate("top")}>
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </button>
      <button type="button" onClick={() => onSectionNavigate("categories")}>
        <i className="fa-solid fa-layer-group"></i>
        <span>Categories</span>
      </button>
      <button type="button" onClick={() => onSectionNavigate("studio")}>
        <i className="fa-solid fa-clapperboard"></i>
        <span>Studio</span>
      </button>
      <button type="button" onClick={onWishlistClick}>
        <i className="fa-regular fa-heart"></i>
        <span>Wishlist</span>
      </button>
      <button type="button" onClick={onProfileClick}>
        <i className="fa-regular fa-user"></i>
        <span>Profile</span>
      </button>
    </nav>
  );
}

function UserGreeting({ user }) {
  return (
    <div className="user-greeting-wrapper">
      <div className="container">
        <div className="user-greeting">
          <div className="greeting-content">
            <span className="greeting-eyebrow">ESTABLISHED 2026</span>
            <p>Welcome back, <strong>{user ? (user.role === 'SELLER' ? user.businessName : user.email.split('@')[0]) : 'Saree Enthusiast'}</strong></p>
          </div>
          <div className="greeting-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthDrawer({ isOpen, onClose, onLogin, user, onSwitchToSeller }) {
  const [mode, setMode] = useState("LOGIN"); // LOGIN, SIGNUP
  const [role, setRole] = useState("CUSTOMER"); // CUSTOMER, SELLER
  const [formData, setFormData] = useState({ email: "", password: "", businessName: "" });

  useEffect(() => {
    if (role === "CUSTOMER" || mode === "LOGIN") {
      setFormData((prev) => ({ ...prev, businessName: "" }));
    }
  }, [role, mode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const didLogin = await onLogin({ ...formData, role });
    if (didLogin) {
      onClose();
    }
  };

  const fillSellerDemo = () => {
    setRole("SELLER");
    setMode("LOGIN");
    setFormData({
      email: "seller@jaanu.com",
      password: "seller123",
      businessName: "",
    });
  };

  if (user) {
    return (
      <>
        <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
        <div className={`side-drawer right auth-drawer ${isOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <h3>My Account</h3>
            <button type="button" className="close-drawer" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="drawer-content profile-view">
            <div className="profile-header-luxury">
              <div className="profile-avatar-luxury">
                {user.email[0].toUpperCase()}
              </div>
              <div className="profile-info-luxury">
                <h4>{user.role === 'SELLER' ? user.businessName : 'Luxury Customer'}</h4>
                <p>{user.email}</p>
                <span className="role-tag-luxury">{user.role}</span>
              </div>
            </div>
            <div className="profile-menu-luxury">
              <button className="menu-item-luxury"><i className="fa-solid fa-box"></i> Orders</button>
              <button className="menu-item-luxury"><i className="fa-solid fa-heart"></i> Wishlist</button>
              {user.role === 'SELLER' && (
                <button 
                  type="button"
                  className="menu-item-luxury seller-accent"
                  onClick={() => {
                    onSwitchToSeller();
                    onClose();
                  }}
                >
                  <i className="fa-solid fa-store"></i> Seller Dashboard
                </button>
              )}
              <button type="button" className="menu-item-luxury"><i className="fa-solid fa-gear"></i> Settings</button>
              <button type="button" className="menu-item-luxury logout-btn" onClick={() => onLogin(null)}><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`side-drawer right auth-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>{mode === "LOGIN" ? "Welcome Back" : "Create Account"}</h3>
          <button type="button" className="close-drawer" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="drawer-content">
          <div className="auth-container-luxury">
            <div className="role-selector-luxury">
              <button 
                type="button"
                className={`role-btn ${role === "CUSTOMER" ? "active" : ""}`}
                onClick={() => setRole("CUSTOMER")}
              >
                Customer
              </button>
              <button 
                type="button"
                className={`role-btn ${role === "SELLER" ? "active" : ""}`}
                onClick={() => setRole("SELLER")}
              >
                Seller
              </button>
            </div>

            <form className="auth-form-luxury" onSubmit={handleAuth}>
              <span className="form-eyebrow">{role} {mode}</span>
              <p className="auth-helper-copy">
                {role === "SELLER"
                  ? mode === "LOGIN"
                    ? "Use your seller email and password to open the seller dashboard."
                    : "Create a seller account to start managing your store."
                  : mode === "LOGIN"
                    ? "Sign in to track orders, wishlist items, and bag updates."
                    : "Create a customer account for a faster checkout experience."}
              </p>
              {role === "SELLER" && mode === "SIGNUP" && (
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Business Name*" 
                    required 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
              )}
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email Address*" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password*" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <button type="submit" className="auth-submit-btn">
                {mode === "LOGIN" ? (role === "SELLER" ? "Seller Login" : "Sign In") : (role === "SELLER" ? "Seller Signup" : "Register Now")}
              </button>
              {mode === "LOGIN" && (
                <button
                  type="button"
                  className="auth-secondary-btn"
                  onClick={() => setMode("SIGNUP")}
                >
                  Create New Account
                </button>
              )}
            </form>

            {role === "SELLER" && mode === "LOGIN" && (
              <div className="auth-demo-card">
                <p>Demo seller login</p>
                <span>`seller@jaanu.com` / `seller123`</span>
                <button type="button" onClick={fillSellerDemo}>Use Demo Seller Account</button>
              </div>
            )}

            <div className="auth-switch-luxury">
              <p>
                {mode === "LOGIN" ? "Don't have an account?" : "Already have an account?"}
                <button type="button" onClick={() => setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN")}>
                  {mode === "LOGIN" ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BagDrawer({ isOpen, onClose, bag, onRemove, onOrderPlaced, user, onQuickView }) {
  const [step, setStep] = useState("BAG"); // BAG, ADDRESS, PAYMENT, SUCCESS
  const [address, setAddress] = useState({ name: "", mobile: "", pincode: "", house: "", area: "" });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isVerifying, setIsVerifying] = useState(false);

  const total = bag.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, ""));
    return sum + price;
  }, 0);

  const handleNext = () => {
    if (step === "BAG") setStep("ADDRESS");
    else if (step === "ADDRESS") setStep("PAYMENT");
  };

  const handleBack = () => {
    if (step === "ADDRESS") setStep("BAG");
    else if (step === "PAYMENT") setStep("ADDRESS");
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "Cash on Delivery") {
      setIsVerifying(true);
      setTimeout(async () => {
        setIsVerifying(false);
        const orderPlaced = await onOrderPlaced({
          address,
          paymentMethod,
        });
        if (orderPlaced) {
          setStep("SUCCESS");
        }
      }, 2000);
      return;
    }

    setIsVerifying(true);

    // Razorpay Integration
    const options = {
      key: "rzp_test_YOUR_KEY_HERE",
      amount: total * 100,
      currency: "INR",
      name: "Jaanu Fashion",
      description: "Order Payment",
      image: "https://example.com/your_logo",
      handler: function (response) {
        void onOrderPlaced({
          address,
          paymentMethod,
          gatewayReference: response.razorpay_payment_id,
        }).then((orderPlaced) => {
          setIsVerifying(false);
          if (orderPlaced) {
            setStep("SUCCESS");
          }
        });
      },
      prefill: {
        name: address.name,
        email: user ? user.email : "customer@example.com",
        contact: address.mobile
      },
      notes: {
        address: `${address.house}, ${address.area}, ${address.pincode}`
      },
      theme: {
        color: "#c5a059"
      },
      modal: {
        ondismiss: function() {
          setIsVerifying(false);
        }
      }
    };

    try {
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
        setIsVerifying(false);
      });
      rzp1.open();
    } catch (error) {
      console.error("Razorpay failed to load:", error);
      setIsVerifying(false);
      alert("Payment gateway failed to load. Please try again later.");
    }
  };

  const handleClose = () => {
    setStep("BAG");
    onClose();
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={handleClose}></div>
      <div className={`side-drawer right checkout-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="header-with-back">
            {step !== "BAG" && step !== "SUCCESS" && (
              <button className="back-btn" onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
            )}
            <h3>
              {step === "BAG" && `Shopping Bag (${bag.length})`}
              {step === "ADDRESS" && "Delivery Address"}
              {step === "PAYMENT" && "Payment Method"}
              {step === "SUCCESS" && "Order Placed"}
            </h3>
          </div>
          <button className="close-drawer" onClick={handleClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-content">
          {step === "BAG" && (
            bag.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-bag-shopping"></i>
                <p>Your bag is empty</p>
                <button className="luxury-cta" onClick={handleClose}>Start Shopping</button>
              </div>
            ) : (
                <div className="bag-items">
                  {bag.map((item, index) => (
                  <div className="bag-item" key={item.bagItemId ?? `${item.title}-${index}`}>
                    <img src={item.image} alt={item.title} />
                    <div className="bag-item-info">
                      <strong>{item.brand}</strong>
                      <p>{item.title}</p>
                      {item.selectedSize && <small>Size: {item.selectedSize}</small>}
                      <div className="bag-item-price">{item.price}</div>
                      <button className="drawer-quick-view" type="button" onClick={() => onQuickView(item)}>View Product</button>
                    </div>
                    <button className="remove-item" onClick={() => onRemove(item.bagItemId)}>
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {step === "ADDRESS" && (
            <div className="address-form">
              <div className="form-group">
                <label>Contact Details</label>
                <input type="text" placeholder="Full Name*" value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} />
                <input type="text" placeholder="Mobile No*" value={address.mobile} onChange={(e) => setAddress({...address, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="Pin Code*" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} />
                <input type="text" placeholder="House No. / Building Name*" value={address.house} onChange={(e) => setAddress({...address, house: e.target.value})} />
                <input type="text" placeholder="Locality / Area / Street*" value={address.area} onChange={(e) => setAddress({...address, area: e.target.value})} />
              </div>
            </div>
          )}

          {step === "PAYMENT" && (
            <div className="payment-options">
              <div className="payment-method-list">
                {["UPI / Google Pay", "Credit / Debit Card", "Net Banking", "Cash on Delivery"].map(m => (
                  <div key={m} className={`payment-option-card ${paymentMethod === m ? 'selected' : ''}`} onClick={() => setPaymentMethod(m)}>
                    <div className="radio-circle"></div>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <div className="payment-details">
                {paymentMethod.includes("Card") && (
                  <div className="form-group">
                    <input type="text" placeholder="Card Number" />
                    <div className="row">
                      <input type="text" placeholder="MM/YY" />
                      <input type="password" placeholder="CVV" />
                    </div>
                  </div>
                )}
                {paymentMethod.includes("UPI") && (
                  <div className="form-group">
                    <input type="text" placeholder="Enter UPI ID (e.g. user@okaxis)" />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "SUCCESS" && (
            <div className="success-state">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2>Order Confirmed!</h2>
              <p>Your fashion treasures are being prepared for delivery.</p>
              <div className="order-details-mini">
                <span>Estimated Delivery:</span>
                <strong>{new Date(Date.now() + 432000000).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</strong>
              </div>
              <button className="luxury-cta" onClick={handleClose}>Continue Shopping</button>
            </div>
          )}
        </div>

        {step !== "SUCCESS" && bag.length > 0 && (
          <div className="drawer-footer checkout-footer">
            <div className="price-summary">
              <div className="summary-row">
                <span>Total Amount</span>
                <strong>Rs {total.toLocaleString()}</strong>
              </div>
            </div>
            <button className="checkout-btn" onClick={step === "PAYMENT" ? handlePlaceOrder : handleNext} disabled={isVerifying}>
              {isVerifying ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</>
              ) : (
                step === "BAG" ? "Place Order" : (step === "ADDRESS" ? "Continue to Payment" : "Complete Payment")
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function WishlistDrawer({ isOpen, onClose, wishlist, onRemove, onAddToBag, onQuickView }) {
  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`side-drawer right ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>My Wishlist ({wishlist.length})</h3>
          <button className="close-drawer" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="drawer-content">
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <i className="fa-regular fa-heart"></i>
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map((item) => (
                <div className="wishlist-item" key={item.title}>
                  <img src={item.image} alt={item.title} />
                  <div className="wishlist-item-info">
                    <strong>{item.brand}</strong>
                    <p>{item.title}</p>
                    <div className="wishlist-item-price">{item.price}</div>
                    <button className="drawer-quick-view" type="button" onClick={() => onQuickView(item)}>
                      View Product
                    </button>
                    <button className="wishlist-add-to-bag" onClick={() => onAddToBag(item)}>
                      Move to Bag
                    </button>
                  </div>
                  <button className="remove-item" onClick={() => onRemove(item)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProductsManagement({ products, inventory, onSaveProduct, onDeleteProduct, onOpenPricing }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    title: "",
    category: "Sarees",
    price: "",
    mrp: "",
    stock: "",
    badge: "New Drop",
    image: "",
  });

  const mergedProducts = products.map((product) => {
    const inventoryItem = inventory.find((item) => item.id === product.inventoryId);
    return {
      ...product,
      stock: inventoryItem?.available ?? 0,
      category: product.category ?? inventoryItem?.category ?? "General",
      sku: inventoryItem?.sku ?? "Not linked",
      barcode: inventoryItem?.barcode ?? "Not assigned",
      status: inventoryItem?.status ?? "Active",
    };
  });

  const filteredProducts = mergedProducts.filter((product) => {
    const needle = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(needle) ||
      product.brand.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle) ||
      String(product.sku).toLowerCase().includes(needle) ||
      String(product.barcode).toLowerCase().includes(needle)
    );
  });

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      brand: "",
      title: "",
      category: "Sarees",
      price: "",
      mrp: "",
      stock: "",
      badge: "New Drop",
      image: "",
    });
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      brand: product.brand,
      title: product.title,
      category: product.category,
      price: String(parseInt(String(product.price).replace(/[^\d]/g, ""), 10) || 0),
      mrp: String(parseInt(String(product.oldPrice).replace(/[^\d]/g, ""), 10) || 0),
      stock: String(product.stock ?? 0),
      badge: product.badge || "New Drop",
      image: product.image,
    });
    setShowProductModal(true);
  };

  const handleSubmit = async () => {
    await onSaveProduct(editingProduct?.id, {
      ...formData,
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      stock: Number(formData.stock),
    });
    setShowProductModal(false);
    resetForm();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: typeof reader.result === "string" ? reader.result : prev.image,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="product-management">
      <div className="action-bar-luxury">
        <div className="search-mini">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Filter products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="action-btns">
          <button className="btn-outline-luxury" onClick={onOpenPricing}><i className="fa-solid fa-tags"></i> Manage Offers</button>
          <button className="btn-primary-luxury" onClick={() => { resetForm(); setShowProductModal(true); }}>
            <i className="fa-solid fa-plus"></i> Add Product
          </button>
        </div>
      </div>
      <table className="luxury-data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Details</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td><img src={product.image} className="table-thumb" alt={product.title} /></td>
              <td>
                <div className="p-cell">
                  <strong>{product.brand}</strong>
                  <span>{product.title}</span>
                  <small>SKU: {product.sku}</small>
                  <small>Barcode: {product.barcode}</small>
                </div>
              </td>
              <td>{product.category}</td>
              <td>{product.price}</td>
              <td><span className="stock-count">{product.stock}</span></td>
              <td><span className={`status-tag ${String(product.status).toLowerCase().replace(/\s+/g, "-")}`}>{product.status}</span></td>
              <td>
                <div className="table-actions">
                  <button className="icon-btn" onClick={() => openEdit(product)}><i className="fa-solid fa-pen"></i></button>
                  <button className="icon-btn delete" onClick={() => onDeleteProduct(product.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showProductModal && (
        <div className="modal-overlay" onClick={() => { setShowProductModal(false); resetForm(); }}>
          <div className="modal-content offer-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product" : "Create Product"}</h3>
              <button className="close-btn" onClick={() => { setShowProductModal(false); resetForm(); }}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="offer-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input value={formData.brand} onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Selling Price</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>MRP</label>
                    <input type="number" value={formData.mrp} onChange={(e) => setFormData((prev) => ({ ...prev, mrp: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Badge</label>
                    <input value={formData.badge} onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={formData.image} onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Upload Product Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                {formData.image && (
                  <div className="product-image-preview">
                    <span>Preview</span>
                    <img src={formData.image} alt={formData.title || "Product preview"} />
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-luxury" onClick={() => { setShowProductModal(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary-luxury" onClick={handleSubmit}>{editingProduct ? "Update Product" : "Create Product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryManagement({
  inventory: inventoryData = [],
  onUpdateInventory = async () => {},
  onExportInventory = () => {},
  onImportInventory = () => {},
  onOpenProducts = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  const normalizedInventory = (inventoryData || []).map((item, index) => ({
    id: item?.id || `INV-TEMP-${index + 1}`,
    sku: item?.sku || "NO-SKU",
    barcode: item?.barcode || `89023${String(index + 1).padStart(7, "0")}`,
    name: item?.name || item?.title || "Untitled Product",
    image: item?.image || "https://via.placeholder.com/120x120?text=No+Image",
    category: item?.category || "General",
    brand: item?.brand || "Unknown Brand",
    price: Number(item?.price || 0),
    mrp: Number(item?.mrp || item?.price || 0),
    stock: Number(item?.stock || 0),
    reserved: Number(item?.reserved || 0),
    available: Number(item?.available ?? Math.max(0, Number(item?.stock || 0) - Number(item?.reserved || 0))),
    status: item?.status || "Active",
    warehouse: item?.warehouse || "Main Warehouse",
    lastUpdated: item?.lastUpdated || new Date().toISOString().slice(0, 10),
    lowStockThreshold: Number(item?.lowStockThreshold || 5),
  }));

  const categories = ["All", ...new Set(normalizedInventory.map((item) => item.category).filter(Boolean))];

  // Enhanced filtering and sorting
  const filteredInventory = normalizedInventory
    .filter(item => {
      const matchesSearch = String(item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(item.sku).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(item.barcode).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStock = stockFilter === "All" ||
                          (stockFilter === "In Stock" && item.available > 5) ||
                          (stockFilter === "Low Stock" && item.available > 0 && item.available <= 5) ||
                          (stockFilter === "Out of Stock" && item.available === 0);
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesStock && matchesPrice;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name": aValue = a.name; bValue = b.name; break;
        case "price": aValue = a.price; bValue = b.price; break;
        case "stock": aValue = a.available; bValue = b.available; break;
        case "updated": aValue = new Date(a.lastUpdated); bValue = new Date(b.lastUpdated); break;
        default: return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate summary stats
  const stats = {
    totalProducts: normalizedInventory.length,
    inStock: normalizedInventory.filter(item => item.available > 5).length,
    lowStock: normalizedInventory.filter(item => item.available > 0 && item.available <= 5).length,
    outOfStock: normalizedInventory.filter(item => item.available === 0).length,
    totalValue: normalizedInventory.reduce((sum, item) => sum + (item.price * item.available), 0)
  };

  const getStockStatus = (item) => {
    if (item.available === 0) return { status: "Out of Stock", color: "red" };
    if (item.available <= 5) return { status: "Low Stock", color: "yellow" };
    return { status: "In Stock", color: "green" };
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === paginatedInventory.length
        ? []
        : paginatedInventory.map(item => item.id)
    );
  };

  const handleBulkAction = async (action) => {
    if (action === "delete") {
      setSelectedItems([]);
      return;
    }

    await Promise.all(
      selectedItems.map(async (itemId) => {
        const item = normalizedInventory.find((entry) => entry.id === itemId);
        if (!item) return;
        const nextStock = action === "activate" ? Math.max(item.stock, item.lowStockThreshold + 1) : 0;
        if (typeof onUpdateInventory === "function") {
          await onUpdateInventory(itemId, nextStock);
        }
      }),
    );
    setSelectedItems([]);
  };

  const handleStockUpdate = async (productId, newStock) => {
    if (typeof onUpdateInventory === "function") {
      await onUpdateInventory(productId, newStock);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const format = file.name.toLowerCase().endsWith(".csv") ? "csv" : "json";
    await onImportInventory({
      format,
      content,
      fileName: file.name,
    });
    event.target.value = "";
  };

  return (
    <div className="inventory-management">
      {/* Header Section */}
      <div className="inventory-header">
        <div className="header-left">
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your product inventory and stock levels</p>
        </div>
        <div className="header-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
          <button className="btn-outline-luxury" onClick={() => fileInputRef.current?.click()}>
            <i className="fa-solid fa-upload"></i> Import File
          </button>
          <button className="btn-outline-luxury" onClick={() => onExportInventory("json")}>
            <i className="fa-solid fa-download"></i> Export JSON
          </button>
          <button className="btn-outline-luxury" onClick={() => onExportInventory("csv")}>
            <i className="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button className="btn-primary-luxury" onClick={onOpenProducts}>
            <i className="fa-solid fa-plus"></i> Add Product
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="inventory-stats-grid">
        <div className="stat-card-premium">
          <div className="stat-icon-box"><i className="fa-solid fa-boxes-stacked"></i></div>
          <div className="stat-card-body">
            <h3>{stats.totalProducts}</h3>
            <span>Total Products</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{background: '#d4edda', color: '#155724'}}>
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div className="stat-card-body">
            <h3>{stats.inStock}</h3>
            <span>In Stock</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{background: '#fff3cd', color: '#856404'}}>
            <i className="fa-solid fa-exclamation-triangle"></i>
          </div>
          <div className="stat-card-body">
            <h3>{stats.lowStock}</h3>
            <span>Low Stock</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{background: '#f8d7da', color: '#721c24'}}>
            <i className="fa-solid fa-times-circle"></i>
          </div>
          <div className="stat-card-body">
            <h3>{stats.outOfStock}</h3>
            <span>Out of Stock</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box"><i className="fa-solid fa-rupee-sign"></i></div>
          <div className="stat-card-body">
            <h3>₹{stats.totalValue.toLocaleString()}</h3>
            <span>Inventory Value</span>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="inventory-alerts">
        {stats.lowStock > 0 && (
          <div className="alert-card low_stock">
            <i className="fa-solid fa-exclamation-triangle"></i>
            <span>{stats.lowStock} products are running low on stock</span>
            <button className="alert-close"><i className="fa-solid fa-times"></i></button>
          </div>
        )}
        {stats.outOfStock > 0 && (
          <div className="alert-card out_of_stock">
            <i className="fa-solid fa-times-circle"></i>
            <span>{stats.outOfStock} products are out of stock</span>
            <button className="alert-close"><i className="fa-solid fa-times"></i></button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="inventory-filters">
        <div className="filter-row">
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="All">All Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <div className="price-range">
            <span>₹{priceRange[0]} - ₹{priceRange[1]}</span>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="inventory-actions">
        <div className="bulk-actions">
          <button className="btn-outline-luxury" onClick={() => setShowBulkActions(!showBulkActions)}>
            <i className="fa-solid fa-tasks"></i> Bulk Actions ({selectedItems.length})
          </button>
          {showBulkActions && selectedItems.length > 0 && (
            <div className="bulk-actions-menu">
              <button onClick={() => handleBulkAction("activate")}>
                <i className="fa-solid fa-play"></i> Activate Selected
              </button>
              <button onClick={() => handleBulkAction("deactivate")}>
                <i className="fa-solid fa-pause"></i> Deactivate Selected
              </button>
              <button className="danger" onClick={() => handleBulkAction("delete")}>
                <i className="fa-solid fa-trash"></i> Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="sort-controls">
          <span>Sort by:</span>
          <select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="updated">Last Updated</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.length === paginatedInventory.length && paginatedInventory.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort("name")} className="sortable">
                Product {sortBy === "name" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>SKU</th>
              <th>Barcode</th>
              <th>Category</th>
              <th onClick={() => handleSort("price")} className="sortable">
                Price {sortBy === "price" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th onClick={() => handleSort("stock")} className="sortable">
                Stock {sortBy === "stock" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>Status</th>
              <th onClick={() => handleSort("updated")} className="sortable">
                Last Updated {sortBy === "updated" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map(item => {
              const stockInfo = getStockStatus(item);
              return (
                <tr key={item.id} className={`stock-${stockInfo.color}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <img src={item.image} alt={item.name} className="product-thumb" />
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{item.sku}</td>
                  <td>{item.barcode}</td>
                  <td>{item.category}</td>
                  <td>
                    <div className="price-cell">
                      <span className="selling-price">₹{item.price.toLocaleString()}</span>
                      <small className="mrp">₹{item.mrp.toLocaleString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <span className="available-stock">{item.available}</span>
                      <small>Total: {item.stock} | Reserved: {item.reserved}</small>
                      <button
                        className="stock-update-btn"
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowStockModal(true);
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${stockInfo.color}`}>
                      {stockInfo.status}
                    </span>
                  </td>
                  <td>{item.lastUpdated}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" title="Edit">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="icon-btn" title="View">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className="icon-btn danger" title="Delete">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length} products</span>
        <div className="pagination-controls">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Stock - {selectedProduct.name}</h3>
              <button className="modal-close" onClick={() => setShowStockModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Stock: {selectedProduct.stock}</label>
                <input
                  type="number"
                  min="0"
                  defaultValue={selectedProduct.stock}
                  onChange={(e) => {
                    const newStock = parseInt(e.target.value) || 0;
                    handleStockUpdate(selectedProduct.id, newStock);
                  }}
                />
              </div>
              <div className="stock-info">
                <p>Available: {selectedProduct.available}</p>
                <p>Reserved: {selectedProduct.reserved}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-luxury" onClick={() => setShowStockModal(false)}>Cancel</button>
              <button className="btn-primary-luxury" onClick={() => setShowStockModal(false)}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerManagement({ orders, onUpdateOrderStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const itemsPerPage = 10;

  // Extract unique customers from orders
  const customers = orders.reduce((acc, order) => {
    const existingCustomer = acc.find(c => c.email === order.customerEmail);
    if (existingCustomer) {
      existingCustomer.orders.push(order);
      existingCustomer.totalSpent = Math.max(existingCustomer.totalSpent, order.totalSpent);
      existingCustomer.lastOrder = order.lastOrder > existingCustomer.lastOrder ? order.lastOrder : existingCustomer.lastOrder;
    } else {
      acc.push({
        id: `CUST${String(acc.length + 1).padStart(3, '0')}`,
        name: order.customer,
        email: order.customerEmail,
        phone: order.customerPhone,
        location: order.customerLocation,
        joinDate: order.joinDate,
        lastOrder: order.lastOrder,
        totalSpent: order.totalSpent,
        totalOrders: 1,
        orders: [order],
        status: order.status === "Cancelled" ? "Inactive" : "Active"
      });
    }
    return acc;
  }, []);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name": aValue = a.name; bValue = b.name; break;
        case "email": aValue = a.email; bValue = b.email; break;
        case "spent": aValue = a.totalSpent; bValue = b.totalSpent; break;
        case "orders": aValue = a.totalOrders; bValue = b.totalOrders; break;
        case "lastOrder": aValue = new Date(a.lastOrder); bValue = new Date(b.lastOrder); break;
        case "joinDate": aValue = new Date(a.joinDate); bValue = new Date(b.joinDate); break;
        default: return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Customer stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === "Active").length,
    inactiveCustomers: customers.filter(c => c.status === "Inactive").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getCustomerTier = (spent) => {
    if (spent >= 10000) return { tier: "VIP", color: "gold" };
    if (spent >= 5000) return { tier: "Premium", color: "silver" };
    return { tier: "Regular", color: "bronze" };
  };

  return (
    <div className="customer-management">
      {/* Header Section */}
      <div className="inventory-header">
        <div className="header-left">
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer relationships and order history</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline-luxury">
            <i className="fa-solid fa-envelope"></i> Send Newsletter
          </button>
          <button className="btn-outline-luxury">
            <i className="fa-solid fa-download"></i> Export Customers
          </button>
          <button className="btn-primary-luxury">
            <i className="fa-solid fa-plus"></i> Add Customer
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="inventory-stats-grid">
        <div className="stat-card-premium">
          <div className="stat-icon-box"><i className="fa-solid fa-users"></i></div>
          <div className="stat-card-body">
            <h3>{stats.totalCustomers}</h3>
            <span>Total Customers</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{background: '#d4edda', color: '#155724'}}>
            <i className="fa-solid fa-user-check"></i>
          </div>
          <div className="stat-card-body">
            <h3>{stats.activeCustomers}</h3>
            <span>Active Customers</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box" style={{background: '#f8d7da', color: '#721c24'}}>
            <i className="fa-solid fa-user-times"></i>
          </div>
          <div className="stat-card-body">
            <h3>{stats.inactiveCustomers}</h3>
            <span>Inactive Customers</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box"><i className="fa-solid fa-rupee-sign"></i></div>
          <div className="stat-card-body">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <span>Total Revenue</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-box"><i className="fa-solid fa-calculator"></i></div>
          <div className="stat-card-body">
            <h3>₹{stats.avgOrderValue.toLocaleString()}</h3>
            <span>Avg Order Value</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="inventory-filters">
        <div className="filter-row">
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Customers</option>
            <option value="Active">Active Customers</option>
            <option value="Inactive">Inactive Customers</option>
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="inventory-actions">
        <div className="sort-controls">
          <span>Sort by:</span>
          <select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="spent">Total Spent</option>
            <option value="orders">Total Orders</option>
            <option value="lastOrder">Last Order</option>
            <option value="joinDate">Join Date</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")} className="sortable">
                Customer {sortBy === "name" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th onClick={() => handleSort("email")} className="sortable">
                Contact {sortBy === "email" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>Location</th>
              <th onClick={() => handleSort("spent")} className="sortable">
                Total Spent {sortBy === "spent" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th onClick={() => handleSort("orders")} className="sortable">
                Orders {sortBy === "orders" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>Tier</th>
              <th onClick={() => handleSort("lastOrder")} className="sortable">
                Last Order {sortBy === "lastOrder" && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"}`}></i>}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map(customer => {
              const tier = getCustomerTier(customer.totalSpent);
              return (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <strong>{customer.name}</strong>
                        <small>Joined {customer.joinDate}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{customer.email}</div>
                      <small>{customer.phone}</small>
                    </div>
                  </td>
                  <td>{customer.location}</td>
                  <td>
                    <strong>₹{customer.totalSpent.toLocaleString()}</strong>
                  </td>
                  <td>{customer.totalOrders}</td>
                  <td>
                    <span className={`tier-badge ${tier.color}`}>
                      {tier.tier}
                    </span>
                  </td>
                  <td>{customer.lastOrder}</td>
                  <td>
                    <span className={`status-badge ${customer.status === "Active" ? "green" : "red"}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        title="View Details"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerModal(true);
                        }}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className="icon-btn" title="Send Message">
                        <i className="fa-solid fa-envelope"></i>
                      </button>
                      <button className="icon-btn danger" title="Block Customer">
                        <i className="fa-solid fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers</span>
        <div className="pagination-controls">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="customer-header-info">
                <div className="customer-avatar-large">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3>{selectedCustomer.name}</h3>
                  <p>{selectedCustomer.email}</p>
                  <span className={`tier-badge ${getCustomerTier(selectedCustomer.totalSpent).color}`}>
                    {getCustomerTier(selectedCustomer.totalSpent).tier} Customer
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowCustomerModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="customer-details-grid">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedCustomer.phone}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {selectedCustomer.location}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${selectedCustomer.status === "Active" ? "green" : "red"}`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Customer Stats</h4>
                  <div className="detail-item">
                    <strong>Total Orders:</strong> {selectedCustomer.totalOrders}
                  </div>
                  <div className="detail-item">
                    <strong>Total Spent:</strong> ₹{selectedCustomer.totalSpent.toLocaleString()}
                  </div>
                  <div className="detail-item">
                    <strong>Average Order:</strong> ₹{Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString()}
                  </div>
                  <div className="detail-item">
                    <strong>Join Date:</strong> {selectedCustomer.joinDate}
                  </div>
                  <div className="detail-item">
                    <strong>Last Order:</strong> {selectedCustomer.lastOrder}
                  </div>
                </div>
              </div>

              <div className="order-history-section">
                <h4>Order History</h4>
                <div className="order-history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.product}</td>
                          <td>{order.date}</td>
                          <td>{order.amount}</td>
                          <td>
                            <span className={`status-tag ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline-luxury" onClick={() => setShowCustomerModal(false)}>Close</button>
              <button className="btn-primary-luxury">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingOffers({ offers, onUpdateOffers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    tag: "",
    title: "",
    text: "",
    discount: "",
    discountType: "percentage",
    minPurchase: "",
    categories: [],
    status: "active",
    expiryDate: "",
    maxUsage: "",
    code: "",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Sort offers by creation date (latest first)
  const sortedOffers = [...offers].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  const filteredOffers = sortedOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "expired": return "error";
      case "draft": return "warning";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const latestOffer = sortedOffers.find(offer => offer.status === "active");

  const resetForm = () => {
    setFormData({
      tag: "",
      title: "",
      text: "",
      discount: "",
      discountType: "percentage",
      minPurchase: "",
      categories: [],
      status: "active",
      expiryDate: "",
      maxUsage: "",
      code: "",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.discount && formData.discount !== 0) errors.discount = "Discount is required";
    else if (formData.discountType === "percentage" && (parseFloat(formData.discount) <= 0 || parseFloat(formData.discount) > 100)) {
      errors.discount = "Percentage must be between 1 and 100";
    } else if (formData.discountType === "fixed" && parseFloat(formData.discount) <= 0) {
      errors.discount = "Fixed amount must be greater than 0";
    }
    if (!formData.minPurchase || !formData.minPurchase.trim()) errors.minPurchase = "Minimum purchase is required";
    if (!formData.code.trim()) errors.code = "Coupon code is required";
    if (!formData.expiryDate) errors.expiryDate = "Expiry date is required";
    else if (new Date(formData.expiryDate) <= new Date()) {
      errors.expiryDate = "Expiry date must be in the future";
    }
    if (!formData.maxUsage || formData.maxUsage <= 0) errors.maxUsage = "Maximum usage must be greater than 0";
    if (formData.categories.length === 0) errors.categories = "At least one category is required";

    // Check if code is unique (for new offers)
    if (!selectedOffer && offers.some(offer => offer.code.toLowerCase() === formData.code.toLowerCase())) {
      errors.code = "Coupon code already exists";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOffer = () => {
    resetForm();
    setSelectedOffer(null);
    setShowCreateModal(true);
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      tag: offer.tag,
      title: offer.title,
      text: offer.text,
      discount: offer.discount,
      discountType: offer.discountType,
      minPurchase: offer.minPurchase,
      categories: [...offer.categories],
      status: offer.status,
      expiryDate: offer.expiryDate,
      maxUsage: offer.maxUsage,
      code: offer.code,
      image: offer.image
    });
    setShowEditModal(true);
  };

  const handleSaveOffer = async () => {
    if (!validateForm()) return;

    const offerData = {
      ...formData,
      id: selectedOffer ? selectedOffer.id : Date.now(),
      createdDate: selectedOffer ? selectedOffer.createdDate : new Date().toISOString().split('T')[0],
      usageCount: selectedOffer ? selectedOffer.usageCount : 0
    };

    if (selectedOffer) {
      await onUpdateOffers("update", offerData);
      setSuccessMessage("Offer updated successfully!");
    } else {
      await onUpdateOffers("create", offerData);
      setSuccessMessage("New offer created successfully!");
    }

    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteOffer = (offer) => {
    if (window.confirm(`Are you sure you want to delete the offer "${offer.title}"?\n\nThis action cannot be undone.`)) {
      void onUpdateOffers("delete", offer).then(() => {
        setSuccessMessage("Offer deleted successfully!");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    if (formErrors.categories) {
      setFormErrors(prev => ({ ...prev, categories: "" }));
    }
  };

  const availableCategories = [
    "Sarees", "Kurtas", "Lehengas", "Dupattas", "Western Wear",
    "Footwear", "Accessories", "Beauty", "Skincare", "Fragrance",
    "Premium", "Luxury", "Designer", "Traditional", "Ethnic Wear"
  ];

  return (
    <div className="pricing-offers">
      {/* Header Section */}
      <div className="offers-header">
        <div className="header-content">
          <h2>Pricing & Offers Management</h2>
          <p>Manage your promotional campaigns and discount offers</p>
        </div>
        <button className="btn-primary-luxury" onClick={handleCreateOffer}>
          <i className="fa-solid fa-plus"></i> Create New Offer
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <i className="fa-solid fa-check-circle"></i>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Latest Offer Highlight */}
      {latestOffer && (
        <div className="latest-offer-card">
          <div className="latest-offer-header">
            <h3>🎉 Latest Active Offer</h3>
            <span className="offer-code">{latestOffer.code}</span>
          </div>
          <div className="latest-offer-content">
            <div className="offer-image">
              <img src={latestOffer.image} alt={latestOffer.title} />
            </div>
            <div className="offer-details">
              <h4>{latestOffer.title}</h4>
              <p>{latestOffer.text}</p>
              <div className="offer-meta">
                <span className="discount">{latestOffer.discount} OFF</span>
                <span className="min-purchase">Min. {latestOffer.minPurchase}</span>
                <span className="expiry">Expires: {formatDate(latestOffer.expiryDate)}</span>
              </div>
              <div className="usage-stats">
                <span>Used: {latestOffer.usageCount}/{latestOffer.maxUsage}</span>
                <div className="usage-bar">
                  <div
                    className="usage-fill"
                    style={{ width: `${(latestOffer.usageCount / latestOffer.maxUsage) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="offers-controls">
        <div className="search-bar">
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="Search offers by title, code, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({offers.length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({offers.filter(o => o.status === 'active').length})
          </button>
          <button
            className={`filter-tab ${statusFilter === 'expired' ? 'active' : ''}`}
            onClick={() => setStatusFilter('expired')}
          >
            Expired ({offers.filter(o => o.status === 'expired').length})
          </button>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="offers-grid">
        {filteredOffers.map(offer => (
          <div key={offer.id} className="offer-card" onClick={() => setSelectedOffer(offer)}>
            <div className="offer-image">
              <img src={offer.image} alt={offer.title} />
              <div className={`status-badge ${getStatusColor(offer.status)}`}>
                {offer.status}
              </div>
            </div>
            <div className="offer-content">
              <div className="offer-tag">{offer.tag}</div>
              <h4>{offer.title}</h4>
              <p>{offer.text}</p>
              <div className="offer-meta">
                <span className="discount">{offer.discount} OFF</span>
                <span className="code">Code: {offer.code}</span>
              </div>
              <div className="offer-dates">
                <small>Created: {formatDate(offer.createdDate)}</small>
                <small>Expires: {formatDate(offer.expiryDate)}</small>
              </div>
              <div className="usage-info">
                <span>Usage: {offer.usageCount}/{offer.maxUsage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="modal-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="modal-content offer-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedOffer.title}</h3>
              <button className="close-btn" onClick={() => setSelectedOffer(null)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="offer-detail-grid">
                <div className="offer-image-large">
                  <img src={selectedOffer.image} alt={selectedOffer.title} />
                </div>
                <div className="offer-details-full">
                  <div className="detail-section">
                    <h4>Offer Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Tag:</strong> {selectedOffer.tag}
                      </div>
                      <div className="detail-item">
                        <strong>Discount:</strong> {selectedOffer.discount} {selectedOffer.discountType === 'percentage' ? 'OFF' : 'Fixed Amount'}
                      </div>
                      <div className="detail-item">
                        <strong>Minimum Purchase:</strong> {selectedOffer.minPurchase}
                      </div>
                      <div className="detail-item">
                        <strong>Coupon Code:</strong> {selectedOffer.code}
                      </div>
                      <div className="detail-item">
                        <strong>Status:</strong>
                        <span className={`status-tag ${getStatusColor(selectedOffer.status)}`}>
                          {selectedOffer.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Created:</strong> {formatDate(selectedOffer.createdDate)}
                      </div>
                      <div className="detail-item">
                        <strong>Expires:</strong> {formatDate(selectedOffer.expiryDate)}
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Categories</h4>
                    <div className="categories-list">
                      {selectedOffer.categories.map(category => (
                        <span key={category} className="category-tag">{category}</span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Usage Statistics</h4>
                    <div className="usage-stats-detailed">
                      <div className="usage-metric">
                        <span className="metric-label">Times Used:</span>
                        <span className="metric-value">{selectedOffer.usageCount}</span>
                      </div>
                      <div className="usage-metric">
                        <span className="metric-label">Maximum Usage:</span>
                        <span className="metric-value">{selectedOffer.maxUsage}</span>
                      </div>
                      <div className="usage-metric">
                        <span className="metric-label">Remaining:</span>
                        <span className="metric-value">{selectedOffer.maxUsage - selectedOffer.usageCount}</span>
                      </div>
                      <div className="usage-bar-container">
                        <div className="usage-bar">
                          <div
                            className="usage-fill"
                            style={{ width: `${(selectedOffer.usageCount / selectedOffer.maxUsage) * 100}%` }}
                          ></div>
                        </div>
                        <span className="usage-percentage">
                          {Math.round((selectedOffer.usageCount / selectedOffer.maxUsage) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline-luxury" onClick={() => setSelectedOffer(null)}>Close</button>
              <button className="btn-danger" onClick={() => handleDeleteOffer(selectedOffer)}>Delete Offer</button>
              <button className="btn-primary-luxury" onClick={() => handleEditOffer(selectedOffer)}>Edit Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Offer Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}>
          <div className="modal-content offer-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showCreateModal ? "Create New Offer" : "Edit Offer"}</h3>
              <button className="close-btn" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <form className="offer-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Offer Tag *</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => handleInputChange("tag", e.target.value)}
                      placeholder="e.g., Festive drop, Flash Sale"
                      className={formErrors.tag ? "error" : ""}
                    />
                    {formErrors.tag && <span className="error-text">{formErrors.tag}</span>}
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Offer Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Min 50% off on sarees"
                    className={formErrors.title ? "error" : ""}
                  />
                  {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => handleInputChange("text", e.target.value)}
                    placeholder="Describe your offer..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => handleInputChange("discountType", e.target.value)}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input
                      type="text"
                      value={formData.discount}
                      onChange={(e) => handleInputChange("discount", e.target.value)}
                      placeholder={formData.discountType === "percentage" ? "e.g., 50" : "e.g., 500"}
                      className={formErrors.discount ? "error" : ""}
                    />
                    {formErrors.discount && <span className="error-text">{formErrors.discount}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Purchase *</label>
                    <input
                      type="text"
                      value={formData.minPurchase}
                      onChange={(e) => handleInputChange("minPurchase", e.target.value)}
                      placeholder="e.g., Rs 2,999"
                      className={formErrors.minPurchase ? "error" : ""}
                    />
                    {formErrors.minPurchase && <span className="error-text">{formErrors.minPurchase}</span>}
                  </div>

                  <div className="form-group">
                    <label>Coupon Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                      placeholder="e.g., FESTIVE50"
                      className={formErrors.code ? "error" : ""}
                    />
                    {formErrors.code && <span className="error-text">{formErrors.code}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={formErrors.expiryDate ? "error" : ""}
                    />
                    {formErrors.expiryDate && <span className="error-text">{formErrors.expiryDate}</span>}
                  </div>

                  <div className="form-group">
                    <label>Maximum Usage *</label>
                    <input
                      type="number"
                      value={formData.maxUsage}
                      onChange={(e) => handleInputChange("maxUsage", e.target.value)}
                      placeholder="e.g., 1000"
                      min="1"
                      className={formErrors.maxUsage ? "error" : ""}
                    />
                    {formErrors.maxUsage && <span className="error-text">{formErrors.maxUsage}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Applicable Categories *</label>
                  <div className="categories-grid">
                    {availableCategories.map(category => (
                      <label key={category} className="category-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.categories && <span className="error-text">{formErrors.categories}</span>}
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                className="btn-outline-luxury"
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
              >
                Cancel
              </button>
              <button className="btn-primary-luxury" onClick={handleSaveOffer}>
                {showCreateModal ? "Create Offer" : "Update Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Analytics({ orders }) {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("sales");

  const totalRevenue = orders.reduce((sum, order) => sum + parseAmount(order.amount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const uniqueCustomers = new Set(orders.map((order) => order.customerEmail)).size;
  const sortedOrders = [...orders].sort((a, b) => a.date.localeCompare(b.date));
  const salesData = sortedOrders.reduce((acc, order) => {
    const existing = acc.find((item) => item.date === order.date);
    if (existing) {
      existing.sales += parseAmount(order.amount);
      existing.orders += 1;
    } else {
      acc.push({ date: order.date, sales: parseAmount(order.amount), orders: 1 });
    }
    return acc;
  }, []);

  // Chart data
  const chartData = {
    labels: salesData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: selectedMetric === 'sales' ? 'Sales (₹)' : 'Orders',
        data: selectedMetric === 'sales'
          ? salesData.map(item => item.sales)
          : salesData.map(item => item.orders),
        borderColor: 'rgb(197, 160, 89)',
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedMetric === 'sales' ? 'Sales Performance' : 'Order Volume',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return selectedMetric === 'sales' ? '₹' + value.toLocaleString() : value;
          }
        }
      }
    }
  };

  const revenueByKeyword = orders.reduce((acc, order) => {
    const key = order.product.split(",")[0].split(" ").slice(-1)[0] || "Other";
    acc[key] = (acc[key] || 0) + parseAmount(order.amount);
    return acc;
  }, {});
  const revenueBreakdownLabels = Object.keys(revenueByKeyword);
  const revenueBreakdownValues = Object.values(revenueByKeyword);
  const revenueBreakdownData = {
    labels: revenueBreakdownLabels,
    datasets: [{
      data: revenueBreakdownValues,
      backgroundColor: [
        'rgba(197, 160, 89, 0.8)',
        'rgba(197, 160, 89, 0.6)',
        'rgba(197, 160, 89, 0.4)',
        'rgba(197, 160, 89, 0.3)',
        'rgba(197, 160, 89, 0.2)',
      ],
      borderColor: [
        'rgb(197, 160, 89)',
        'rgb(197, 160, 89)',
        'rgb(197, 160, 89)',
        'rgb(197, 160, 89)',
        'rgb(197, 160, 89)',
      ],
      borderWidth: 1,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Revenue by Category',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  const topProducts = Object.values(orders.reduce((acc, order) => {
    const key = order.product;
    if (!acc[key]) {
      acc[key] = { name: key, sales: 0, orders: 0 };
    }
    acc[key].sales += parseAmount(order.amount);
    acc[key].orders += 1;
    return acc;
  }, {})).sort((a, b) => b.sales - a.sales).slice(0, 5);

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>Analytics & Insights</h2>
          <p>Track your store performance and customer behavior</p>
        </div>
        <div className="header-controls">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="metric-change positive">+12.5%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fa-solid fa-shopping-cart"></i>
          </div>
          <div className="metric-content">
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
            <span className="metric-change positive">+8.2%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fa-solid fa-calculator"></i>
          </div>
          <div className="metric-content">
            <h3>{formatCurrency(avgOrderValue)}</h3>
            <p>Avg Order Value</p>
            <span className="metric-change positive">+5.1%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="metric-content">
            <h3>{uniqueCustomers}</h3>
            <p>Unique Customers</p>
            <span className="metric-change positive">Live</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-controls">
          <h3>Sales Performance</h3>
          <div className="metric-tabs">
            <button
              className={`metric-tab ${selectedMetric === 'sales' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('sales')}
            >
              Sales
            </button>
            <button
              className={`metric-tab ${selectedMetric === 'orders' ? 'active' : ''}`}
              onClick={() => setSelectedMetric('orders')}
            >
              Orders
            </button>
          </div>
        </div>

        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Products & Insights */}
      <div className="insights-grid">
        <div className="insight-card">
          <h4>Revenue Breakdown</h4>
          <div className="chart-container-small">
            <Doughnut data={revenueBreakdownData} options={doughnutOptions} />
          </div>
        </div>

        <div className="insight-card">
          <h4>Top Performing Products</h4>
          <div className="products-list">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-orders">{product.orders} orders</span>
                </div>
                <span className="product-sales">{formatCurrency(product.sales)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h4>Customer Insights</h4>
          <div className="insights-list">
            <div className="insight-item">
              <i className="fa-solid fa-clock"></i>
              <div>
                <strong>Latest Order:</strong> {orders[0]?.date || "No orders yet"}
              </div>
            </div>
            <div className="insight-item">
              <i className="fa-solid fa-mobile-alt"></i>
              <div>
                <strong>Order Status Mix:</strong> {orders.filter((order) => order.status === "Delivered").length} delivered
              </div>
            </div>
            <div className="insight-item">
              <i className="fa-solid fa-star"></i>
              <div>
                <strong>Avg Order Value:</strong> {formatCurrency(avgOrderValue)}
              </div>
            </div>
            <div className="insight-item">
              <i className="fa-solid fa-repeat"></i>
              <div>
                <strong>Repeat Customers:</strong> {Math.max(0, uniqueCustomers ? Math.round(((totalOrders - uniqueCustomers) / uniqueCustomers) * 100) : 0)}% repeat rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Payments({ orders, settingsData }) {
  const [paymentFilter, setPaymentFilter] = useState("all");
  const payments = orders.map((order, index) => ({
    id: `PAY${String(index + 1).padStart(3, "0")}`,
    date: order.date,
    amount: Math.round(parseAmount(order.amount) * 0.8),
    method: "Bank Transfer",
    status: order.status === "Delivered" ? "completed" : "pending",
    description: `Payout for ${order.product}`,
    reference: order.id.replace("#", "REF"),
    paymentMode: order.payment,
  }));

  const filteredPayments = paymentFilter === "all" ? payments : payments.filter(p => p.status === paymentFilter);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "pending": return "warning";
      case "failed": return "error";
      default: return "default";
    }
  };

  const totalPaid = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  // Payment methods chart data
  const paymentMethodsData = {
    labels: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'],
    datasets: [{
      data: [
        orders.filter((order) => order.payment.includes("UPI")).length,
        orders.filter((order) => order.payment.includes("Card") || order.payment.includes("Credit")).length,
        orders.filter((order) => order.payment.includes("Debit")).length,
        orders.filter((order) => order.payment.includes("Net")).length,
        orders.filter((order) => order.payment.includes("COD") || order.payment.includes("Cash")).length,
      ],
      backgroundColor: [
        'rgba(197, 160, 89, 0.8)',
        'rgba(197, 160, 89, 0.6)',
        'rgba(197, 160, 89, 0.4)',
        'rgba(197, 160, 89, 0.3)',
        'rgba(197, 160, 89, 0.2)',
      ],
      borderColor: 'rgb(197, 160, 89)',
      borderWidth: 1,
    }],
  };

  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Payment Methods Distribution',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className="payments">
      <div className="payments-header">
        <div className="header-content">
          <h2>Payments & Payouts</h2>
          <p>Manage your earnings and payment history</p>
        </div>
        <button className="btn-primary-luxury">
          <i className="fa-solid fa-download"></i> Export Report
        </button>
      </div>

      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(totalPaid)}</h3>
            <p>Total Paid</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon pending">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(pendingAmount)}</h3>
            <p>Pending Payout</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fa-solid fa-calendar"></i>
          </div>
          <div className="summary-content">
            <h3>Realtime</h3>
            <p>Payout Schedule</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="fa-solid fa-bank"></i>
          </div>
          <div className="summary-content">
            <h3>{settingsData.storeName || "Store Account"}</h3>
            <p>Primary Account</p>
          </div>
        </div>
      </div>

      {/* Payment Methods Chart */}
      <div className="payment-chart-section">
        <div className="chart-container-small">
          <Doughnut data={paymentMethodsData} options={paymentChartOptions} />
        </div>
      </div>

      {/* Payment Filters */}
      <div className="payment-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${paymentFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPaymentFilter('all')}
          >
            All Payments ({payments.length})
          </button>
          <button
            className={`filter-tab ${paymentFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setPaymentFilter('completed')}
          >
            Completed ({payments.filter(p => p.status === 'completed').length})
          </button>
          <button
            className={`filter-tab ${paymentFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setPaymentFilter('pending')}
          >
            Pending ({payments.filter(p => p.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Description</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id}>
                <td>
                  <span className="payment-id">{payment.id}</span>
                </td>
                <td>{formatDate(payment.date)}</td>
                <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                <td>{payment.method}</td>
                <td>
                  <span className={`status-tag ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.description}</td>
                <td>
                  <span className="reference">{payment.reference}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bank Account Info */}
      <div className="bank-info-card">
        <h4>Bank Account Details</h4>
        <div className="bank-details">
          <div className="detail-row">
            <span className="label">Account Holder:</span>
            <span className="value">{settingsData.storeName || "Jaanu Fashion Store"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Account Number:</span>
            <span className="value">**** **** **** 4567</span>
          </div>
          <div className="detail-row">
            <span className="label">IFSC Code:</span>
            <span className="value">HDFC0001234</span>
          </div>
          <div className="detail-row">
            <span className="label">Bank Name:</span>
            <span className="value">HDFC Bank</span>
          </div>
        </div>
        <button className="btn-outline-luxury">Update Bank Details</button>
      </div>
    </div>
  );
}

function Reviews({ reviews, onReplyToReview }) {
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = reviewFilter === "all" ? reviews : reviews.filter(r => r.rating === parseInt(reviewFilter));

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
  }));

  // Rating chart data
  const ratingChartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [{
      label: 'Number of Reviews',
      data: ratingDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(197, 160, 89, 0.8)',
        'rgba(197, 160, 89, 0.6)',
        'rgba(197, 160, 89, 0.4)',
        'rgba(197, 160, 89, 0.3)',
        'rgba(197, 160, 89, 0.2)',
      ],
      borderColor: 'rgb(197, 160, 89)',
      borderWidth: 1,
    }],
  };

  const ratingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Rating Distribution',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fa-solid fa-star ${i < rating ? 'filled' : ''}`}></i>
    ));
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!selectedReview) return;
    await onReplyToReview(selectedReview.id, replyText);
    setShowReplyModal(false);
    setSelectedReview(null);
    setReplyText("");
  };

  return (
    <div className="reviews">
      <div className="reviews-header">
        <div className="header-content">
          <h2>Customer Reviews</h2>
          <p>Manage and respond to customer feedback</p>
        </div>
        <div className="header-stats">
          <div className="rating-overview">
            <div className="rating-score">
              <span className="score">{averageRating.toFixed(1)}</span>
              <div className="stars">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="total-reviews">{reviews.length} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rating-distribution">
        <div className="rating-chart-grid">
          <div className="rating-bars">
            <h4>Rating Breakdown</h4>
            <div className="distribution-bars">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="rating-bar">
                  <div className="rating-label">
                    <span>{rating} star</span>
                    <span>{count}</span>
                  </div>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="percentage">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rating-chart">
            <div className="chart-container-small">
              <Bar data={ratingChartData} options={ratingChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Review Filters */}
      <div className="review-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${reviewFilter === 'all' ? 'active' : ''}`}
            onClick={() => setReviewFilter('all')}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            className={`filter-tab ${reviewFilter === '5' ? 'active' : ''}`}
            onClick={() => setReviewFilter('5')}
          >
            5 Stars ({reviews.filter(r => r.rating === 5).length})
          </button>
          <button
            className={`filter-tab ${reviewFilter === '4' ? 'active' : ''}`}
            onClick={() => setReviewFilter('4')}
          >
            4 Stars ({reviews.filter(r => r.rating === 4).length})
          </button>
          <button
            className={`filter-tab ${reviewFilter === '3' ? 'active' : ''}`}
            onClick={() => setReviewFilter('3')}
          >
            3 Stars ({reviews.filter(r => r.rating === 3).length})
          </button>
          <button
            className={`filter-tab ${reviewFilter === '2' ? 'active' : ''}`}
            onClick={() => setReviewFilter('2')}
          >
            2 Stars ({reviews.filter(r => r.rating === 2).length})
          </button>
          <button
            className={`filter-tab ${reviewFilter === '1' ? 'active' : ''}`}
            onClick={() => setReviewFilter('1')}
          >
            1 Star ({reviews.filter(r => r.rating === 1).length})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="customer-info">
                <img src={review.customerAvatar} alt={review.customerName} className="customer-avatar" />
                <div className="customer-details">
                  <h5>{review.customerName}</h5>
                  <div className="review-meta">
                    <div className="stars">
                      {renderStars(review.rating)}
                    </div>
                    <span className="date">{new Date(review.date).toLocaleDateString('en-IN')}</span>
                    {review.verified && <span className="verified-badge">Verified Purchase</span>}
                  </div>
                </div>
              </div>
              <div className="review-actions">
                <button className="icon-btn" onClick={() => handleReply(review)}>
                  <i className="fa-solid fa-reply"></i>
                </button>
                <button className="icon-btn">
                  <i className="fa-solid fa-flag"></i>
                </button>
              </div>
            </div>

            <div className="review-content">
              <p>{review.review}</p>
              {review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((image, index) => (
                    <img key={index} src={image} alt="Review" className="review-image" />
                  ))}
                </div>
              )}
            </div>

            <div className="review-footer">
              <div className="helpful-count">
                <button className="helpful-btn">
                  <i className="fa-solid fa-thumbs-up"></i>
                  Helpful ({review.helpful})
                </button>
              </div>
              <div className="product-info">
                <span>For: {review.product}</span>
              </div>
            </div>
            {review.reply && (
              <div className="review-reply">
                <strong>Seller Reply:</strong> {review.reply}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content reply-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply to Review</h3>
              <button className="close-btn" onClick={() => setShowReplyModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="original-review">
                <div className="review-header">
                  <div className="customer-info">
                    <img src={selectedReview.customerAvatar} alt={selectedReview.customerName} className="customer-avatar" />
                    <div className="customer-details">
                      <h5>{selectedReview.customerName}</h5>
                      <div className="stars">
                        {renderStars(selectedReview.rating)}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="review-text">{selectedReview.review}</p>
              </div>

              <div className="reply-form">
                <label>Your Reply</label>
                <textarea
                  placeholder="Write your response to this review..."
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline-luxury" onClick={() => setShowReplyModal(false)}>Cancel</button>
              <button className="btn-primary-luxury" onClick={submitReply}>Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings({ user, settingsData, onSaveSettings }) {
  const [activeSettingTab, setActiveSettingTab] = useState("store");
  const [settings, setSettings] = useState(settingsData);

  useEffect(() => {
    setSettings(settingsData);
  }, [settingsData]);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const handleSaveSettings = async () => {
    await onSaveSettings(settings);
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <div className="header-content">
          <h2>Settings</h2>
          <p>Manage your store preferences and account settings</p>
        </div>
        <button className="btn-primary-luxury" onClick={handleSaveSettings}>
          <i className="fa-solid fa-save"></i> Save Changes
        </button>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <div className="settings-sidebar">
          <button
            className={`setting-tab ${activeSettingTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('store')}
          >
            <i className="fa-solid fa-store"></i>
            Store Information
          </button>
          <button
            className={`setting-tab ${activeSettingTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('policies')}
          >
            <i className="fa-solid fa-file-contract"></i>
            Policies
          </button>
          <button
            className={`setting-tab ${activeSettingTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('payments')}
          >
            <i className="fa-solid fa-credit-card"></i>
            Payment Methods
          </button>
          <button
            className={`setting-tab ${activeSettingTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('social')}
          >
            <i className="fa-solid fa-share-alt"></i>
            Social Media
          </button>
          <button
            className={`setting-tab ${activeSettingTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('notifications')}
          >
            <i className="fa-solid fa-bell"></i>
            Notifications
          </button>
          <button
            className={`setting-tab ${activeSettingTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSettingTab('account')}
          >
            <i className="fa-solid fa-user"></i>
            Account
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeSettingTab === 'store' && (
            <div className="setting-section">
              <h3>Store Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => handleSettingChange('storeName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Business Hours</label>
                  <input
                    type="text"
                    value={settings.businessHours}
                    onChange={(e) => handleSettingChange('businessHours', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Store Description</label>
                  <textarea
                    value={settings.storeDescription}
                    onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Store Address</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => handleSettingChange('address', e.target.value)}
                    rows="2"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSettingTab === 'policies' && (
            <div className="setting-section">
              <h3>Store Policies</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Return Policy</label>
                  <textarea
                    value={settings.returnPolicy}
                    onChange={(e) => handleSettingChange('returnPolicy', e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Shipping Policy</label>
                  <textarea
                    value={settings.shippingPolicy}
                    onChange={(e) => handleSettingChange('shippingPolicy', e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSettingTab === 'payments' && (
            <div className="setting-section">
              <h3>Payment Methods</h3>
              <div className="payment-methods">
                {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery', 'PayPal'].map(method => (
                  <label key={method} className="payment-method">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.includes(method)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...settings.paymentMethods, method]
                          : settings.paymentMethods.filter(m => m !== method);
                        handleSettingChange('paymentMethods', newMethods);
                      }}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSettingTab === 'social' && (
            <div className="setting-section">
              <h3>Social Media Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={(e) => handleSettingChange('socialLinks', { ...settings.socialLinks, instagram: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="url"
                    value={settings.socialLinks.facebook}
                    onChange={(e) => handleSettingChange('socialLinks', { ...settings.socialLinks, facebook: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="url"
                    value={settings.socialLinks.twitter}
                    onChange={(e) => handleSettingChange('socialLinks', { ...settings.socialLinks, twitter: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSettingTab === 'notifications' && (
            <div className="setting-section">
              <h3>Notification Preferences</h3>
              <div className="notification-settings">
                <div className="notification-group">
                  <h4>Email Notifications</h4>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailOrders}
                      onChange={(e) => handleNotificationChange('emailOrders', e.target.checked)}
                    />
                    <span>New orders</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailReviews}
                      onChange={(e) => handleNotificationChange('emailReviews', e.target.checked)}
                    />
                    <span>New reviews</span>
                  </label>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailMarketing}
                      onChange={(e) => handleNotificationChange('emailMarketing', e.target.checked)}
                    />
                    <span>Marketing emails</span>
                  </label>
                </div>

                <div className="notification-group">
                  <h4>SMS Notifications</h4>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsOrders}
                      onChange={(e) => handleNotificationChange('smsOrders', e.target.checked)}
                    />
                    <span>Order updates</span>
                  </label>
                </div>

                <div className="notification-group">
                  <h4>Push Notifications</h4>
                  <label className="notification-item">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                    />
                    <span>Browser notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSettingTab === 'account' && (
            <div className="setting-section">
              <h3>Account Settings</h3>
              <div className="account-info">
                <div className="account-avatar">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="Account" />
                  <button className="change-avatar-btn">Change Photo</button>
                </div>
                <div className="account-details">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" defaultValue="Rajesh Kumar" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" defaultValue="rajesh@jaanufashion.com" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" defaultValue="+91 98765 43210" />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" defaultValue="Store Owner" disabled />
                    </div>
                  </div>
                  <div className="account-actions">
                    <button className="btn-outline-luxury">Change Password</button>
                    <button className="btn-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SellerDashboard({
  user,
  onBack,
  orders,
  onUpdateStatus,
  inventoryData,
  onUpdateInventory,
  onExportInventory,
  onImportInventory,
  productsData,
  offersData,
  settingsData,
  reviews,
  activityFeed,
  realtimeStatus,
  syncPending,
  onSaveProduct,
  onDeleteProduct,
  onSaveOffer,
  onSaveSettings,
  onReplyToReview,
}) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orderFilter, setOrderFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orderFilter === "All" ? orders : orders.filter(o => o.status === orderFilter);

  const menuItems = [
    { id: "Dashboard", icon: "fa-solid fa-house" },
    { id: "Products", icon: "fa-solid fa-shirt" },
    { id: "Inventory", icon: "fa-solid fa-warehouse" },
    { id: "Orders", icon: "fa-solid fa-truck-fast" },
    { id: "Pricing & Offers", icon: "fa-solid fa-tags" },
    { id: "Customers", icon: "fa-solid fa-users" },
    { id: "Analytics", icon: "fa-solid fa-chart-pie" },
    { id: "Payments", icon: "fa-solid fa-wallet" },
    { id: "Reviews", icon: "fa-solid fa-star" },
    { id: "Settings", icon: "fa-solid fa-gear" }
  ];

  const totalSales = orders.reduce((sum, o) => sum + parseInt(o.amount.replace(/[^\d]/g, "")), 0);
  
  const stats = [
    { label: "Total Sales", value: `Rs ${totalSales.toLocaleString()}`, trend: "+12.5%", icon: "fa-solid fa-chart-line" },
    { label: "Orders Total", value: orders.length.toString(), trend: "+2", icon: "fa-solid fa-bag-shopping" },
    { label: "Active Products", value: inventoryData.filter((item) => item.status === "Active").length.toString(), trend: "LIVE", icon: "fa-solid fa-shirt" },
    { label: "Net Revenue", value: `Rs ${(totalSales * 0.8).toLocaleString()}`, trend: "+8.2%", icon: "fa-solid fa-wallet" }
  ];

  // Dashboard revenue chart data
  const dashboardChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
      borderColor: 'rgb(197, 160, 89)',
      backgroundColor: 'rgba(197, 160, 89, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };

  const dashboardChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  return (
    <div className="seller-dashboard-layout">
      <aside className="seller-sidebar">
        <div className="sidebar-brand">
          <div className="logo-mark">JF</div>
          <span>Jaanu Fashion</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.id}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="back-to-store-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Store</span>
          </button>
        </div>
      </aside>

      <main className="seller-main-content">
        <header className="seller-top-bar">
          <div className="page-title">
            <h1>{activeTab}</h1>
            <p>Welcome back, {user.businessName}</p>
          </div>
          <div className="top-bar-actions">
            <div className={`realtime-pill ${realtimeStatus === "LIVE" ? "live" : ""}`}>
              <span className="pulse-dot"></span>
              <span>{syncPending ? "Syncing..." : "Realtime Live"}</span>
            </div>
            <div className="search-mini">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search orders, products..." />
            </div>
            <button className="notif-btn"><i className="fa-regular fa-bell"></i><span className="dot"></span></button>
            <div className="seller-avatar-mini">{user.businessName[0]}</div>
          </div>
        </header>

        <div className="dashboard-scroll-area">
          {activeTab === "Dashboard" && (
            <div className="dashboard-overview">
              <div className="stats-grid-luxury">
                {stats.map(stat => (
                  <div className="stat-card-premium" key={stat.label}>
                    <div className="stat-card-head">
                      <div className="stat-icon-box"><i className={stat.icon}></i></div>
                      <span className="stat-trend">{stat.trend}</span>
                    </div>
                    <div className="stat-card-body">
                      <h3>{stat.value}</h3>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dashboard-row">
                <div className="revenue-chart-card">
                  <div className="card-header-luxury">
                    <h3>Revenue Trends</h3>
                    <select className="luxury-select">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                    </select>
                  </div>
                  <div className="chart-container-dashboard">
                    <Line data={dashboardChartData} options={dashboardChartOptions} />
                  </div>
                </div>
                <div className="quick-actions-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <button className="qa-btn" onClick={() => setActiveTab("Products")}><i className="fa-solid fa-plus"></i> Add Product</button>
                    <button className="qa-btn" onClick={() => setActiveTab("Orders")}><i className="fa-solid fa-box"></i> View Orders</button>
                    <button className="qa-btn" onClick={() => setActiveTab("Pricing & Offers")}><i className="fa-solid fa-tags"></i> Update Prices</button>
                    <button className="qa-btn" onClick={() => setActiveTab("Pricing & Offers")}><i className="fa-solid fa-bullhorn"></i> Create Sale</button>
                  </div>
                </div>
              </div>

              <div className="recent-orders-card">
                <div className="card-header-luxury">
                  <h3>Live Activity</h3>
                  <span className="live-caption">Shared seller/customer events update automatically.</span>
                </div>
                <div className="activity-feed">
                  {activityFeed.slice(0, 5).map((activity) => (
                    <div className="activity-item" key={activity.id}>
                      <span className="activity-message">{activity.message}</span>
                      <small>{new Date(activity.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recent-orders-card">
                <div className="card-header-luxury">
                  <h3>Recent Orders</h3>
                  <button className="link-btn" onClick={() => setActiveTab("Orders")}>View All Orders</button>
                </div>
                <table className="luxury-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 3).map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.product}</td>
                        <td>{order.customer}</td>
                        <td><span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span></td>
                        <td>{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="order-management">
              <div className="action-bar-luxury">
                <div className="filter-group">
                  {["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(f => (
                    <button 
                      key={f} 
                      className={`filter-pill ${orderFilter === f ? 'active' : ''}`}
                      onClick={() => setOrderFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="action-btns">
                  <button className="btn-outline-luxury"><i className="fa-solid fa-file-invoice"></i> Export Report</button>
                </div>
              </div>
              <div className="orders-table-wrapper">
                <table className="luxury-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Details</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No orders found</td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>{order.id}</strong></td>
                          <td>
                            <div className="p-cell">
                              <strong>{order.product}</strong>
                              <span>{order.date}</span>
                            </div>
                          </td>
                          <td>{order.customer}</td>
                          <td><span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span></td>
                          <td><span className="payment-tag">{order.payment}</span></td>
                          <td>
                            <div className="order-actions-luxury">
                              {order.status === "Pending" && (
                                <>
                                  <button className="icon-btn accept" onClick={() => onUpdateStatus(order.id, "Confirmed")} title="Accept Order">
                                    <i className="fa-solid fa-check"></i>
                                  </button>
                                  <button className="icon-btn reject" onClick={() => onUpdateStatus(order.id, "Cancelled")} title="Reject Order">
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </>
                              )}
                              {order.status === "Confirmed" && (
                                <button className="btn-primary-luxury mini" onClick={() => onUpdateStatus(order.id, "Shipped")}>
                                  Mark as Shipped
                                </button>
                              )}
                              {order.status === "Shipped" && (
                                <button className="btn-primary-luxury mini" onClick={() => onUpdateStatus(order.id, "Delivered")}>
                                  Mark as Delivered
                                </button>
                              )}
                              <button className="icon-btn" title="View Details" onClick={() => setSelectedOrder(order)}>
                                <i className="fa-solid fa-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Products" && (
            <ProductsManagement
              products={productsData}
              inventory={inventoryData}
              onSaveProduct={onSaveProduct}
              onDeleteProduct={onDeleteProduct}
              onOpenPricing={() => setActiveTab("Pricing & Offers")}
            />
          )}

          {activeTab === "Inventory" && (
            <InventoryManagement
              inventory={inventoryData}
              onUpdateInventory={onUpdateInventory}
              onExportInventory={onExportInventory}
              onImportInventory={onImportInventory}
              onOpenProducts={() => setActiveTab("Products")}
            />
          )}

          {activeTab === "Customers" && (
            <CustomerManagement
              orders={orders}
              onUpdateOrderStatus={onUpdateStatus}
            />
          )}

          {activeTab === "Pricing & Offers" && (
            <PricingOffers offers={offersData} onUpdateOffers={onSaveOffer} />
          )}

          {activeTab === "Analytics" && (
            <Analytics orders={orders} />
          )}

          {activeTab === "Payments" && (
            <Payments orders={orders} settingsData={settingsData} />
          )}

          {activeTab === "Reviews" && (
            <Reviews reviews={reviews} onReplyToReview={onReplyToReview} />
          )}

          {activeTab === "Settings" && (
            <Settings user={user} settingsData={settingsData} onSaveSettings={onSaveSettings} />
          )}

          {activeTab !== "Dashboard" && activeTab !== "Products" && activeTab !== "Inventory" && activeTab !== "Customers" && activeTab !== "Pricing & Offers" && activeTab !== "Analytics" && activeTab !== "Payments" && activeTab !== "Reviews" && activeTab !== "Settings" && (
            <div className="placeholder-view">
              <i className="fa-solid fa-hammer"></i>
              <h2>{activeTab} Module</h2>
              <p>This section is being curated for your luxury boutique experience.</p>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details {selectedOrder.id}</h3>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="customer-details-grid">
                  <div><strong>Customer</strong><p>{selectedOrder.customer}</p></div>
                  <div><strong>Email</strong><p>{selectedOrder.customerEmail}</p></div>
                  <div><strong>Phone</strong><p>{selectedOrder.customerPhone}</p></div>
                  <div><strong>Location</strong><p>{selectedOrder.customerLocation}</p></div>
                  <div><strong>Products</strong><p>{selectedOrder.product}</p></div>
                  <div><strong>Payment</strong><p>{selectedOrder.payment}</p></div>
                  <div><strong>Status</strong><p>{selectedOrder.status}</p></div>
                  <div><strong>Amount</strong><p>{selectedOrder.amount}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [wishlist, setWishlist] = useState([]);
  const [bag, setBag] = useState([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("jaanu-view") || "CUSTOMER";
    }
    return "CUSTOMER";
  }); // CUSTOMER, SELLER
  const [currentPage, setCurrentPage] = useState(null); // null for home, "men" for men page
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });
  const [orders, setOrders] = useState([]);
  const [inventoryData, setInventoryData] = useState(inventory);
  const [productsData, setProductsData] = useState(seedProducts);
  const [offersData, setOffersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [settingsData, setSettingsData] = useState({
    storeName: "",
    storeDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    businessHours: "",
    returnPolicy: "",
    shippingPolicy: "",
    paymentMethods: [],
    socialLinks: { instagram: "", facebook: "", twitter: "" },
    notifications: {
      emailOrders: false,
      emailReviews: false,
      emailMarketing: false,
      smsOrders: false,
      pushNotifications: false,
    },
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING");
  const [syncPending, setSyncPending] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);
  const profileIdRef = useRef(
    typeof window !== "undefined" ? window.localStorage.getItem("jaanu-profile-id") : null,
  );
  const hashRoutingRef = useRef(false);

  const applySnapshot = (response) => {
    profileIdRef.current = response.profileId;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jaanu-profile-id", response.profileId);
    }
    setSessionUser(response.snapshot.sessionUser);
    setProductsData(response.snapshot.products);
    setOffersData(response.snapshot.offers);
    setReviewsData(response.snapshot.reviews || []);
    setSettingsData(response.snapshot.settings);
    setInventoryData(response.snapshot.inventory);
    setOrders(response.snapshot.orders);
    setWishlist(response.snapshot.wishlist);
    setBag(response.snapshot.bag);
    setActivityFeed(response.snapshot.activityFeed);
    setRealtimeStatus(response.snapshot.realtimeStatus || "LIVE");
    setErrorMessage("");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jaanu-view", view);
    }
  }, [view]);

  const refreshMarketplace = async (options = {}) => {
    setSyncPending(true);
    try {
      const response = await bootstrapMarketplace(
        options.profileId ?? profileIdRef.current,
        options.forceGuest ?? false,
      );
      applySnapshot(response);
      return response;
    } catch (error) {
      setErrorMessage(error.message);
      setRealtimeStatus("OFFLINE");
      return null;
    } finally {
      setSyncPending(false);
    }
  };

  useEffect(() => {
    void refreshMarketplace();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtime((event) => {
      if (event.type === "connected" || event.type === "user.login") {
        return;
      }

      void refreshMarketplace();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = theme;
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const applyHashRoute = () => {
      const route = parseRouteHash(window.location.hash);

      if (route.type === "page") {
        setCurrentPage(route.value);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      if (route.type === "section") {
        setCurrentPage(null);
        window.setTimeout(() => {
          const target = document.getElementById(route.value);
          if (target) {
            target.scrollIntoView({ behavior: "auto", block: "start" });
          } else if (route.value === "top") {
            window.scrollTo({ top: 0, behavior: "auto" });
          }
        }, 60);
        return;
      }

      setCurrentPage(null);
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    applyHashRoute();
    const handleHashChange = () => {
      hashRoutingRef.current = true;
      applyHashRoute();
      window.setTimeout(() => {
        hashRoutingRef.current = false;
      }, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToPage = (page) => {
    setCurrentPage(page);

    if (typeof window !== "undefined" && !hashRoutingRef.current) {
      window.location.hash = buildRouteHash("page", page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navigateToSection = (sectionId) => {
    const performScroll = () => {
      if (sectionId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (typeof window !== "undefined" && !hashRoutingRef.current) {
      window.location.hash = buildRouteHash("section", sectionId);
    }

    if (currentPage) {
      setCurrentPage(null);
      window.setTimeout(performScroll, 60);
      return;
    }

    performScroll();
  };

  const user = sessionUser && !sessionUser.isGuest ? sessionUser : null;

  useEffect(() => {
    if (view === "SELLER" && user?.role !== "SELLER") {
      setView("CUSTOMER");
    }
  }, [view, user]);

  useEffect(() => {
    if (user?.role === "SELLER" && view !== "SELLER" && typeof window !== "undefined") {
      const savedView = window.localStorage.getItem("jaanu-view");
      if (savedView === "SELLER") {
        setView("SELLER");
      }
    }
  }, [user, view]);

  const resolveProductRecord = (product) => {
    if (!product) {
      return null;
    }

    return productsData.find((item) => item.id === product.id)
      || productsData.find((item) => item.inventoryId && item.inventoryId === product.inventoryId)
      || productsData.find((item) => item.title === product.title)
      || product;
  };

  const openProductExperience = (product) => {
    const resolved = resolveProductRecord(product);
    if (!resolved) {
      return;
    }
    setPreviewProduct(resolved);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleWishlist = async (product) => {
    if (!sessionUser?.id) {
      return;
    }

    try {
      const response = await toggleWishlistItem(sessionUser.id, product.id);
      setWishlist(response.snapshot.wishlist);
      setActivityFeed(response.snapshot.activityFeed);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const addToBag = async (product) => {
    if (!sessionUser?.id) {
      return;
    }

    try {
      const canonicalProduct = resolveProductRecord(product);
      if (requiresSizeSelection(canonicalProduct)) {
        openProductExperience(canonicalProduct);
        setErrorMessage("Please select a size before adding this item to the bag.");
        return;
      }
      const response = await addBagItem(sessionUser.id, canonicalProduct.id);
      setBag(response.snapshot.bag);
      setActivityFeed(response.snapshot.activityFeed);
      setIsBagOpen(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const addToBagWithOptions = async (product, options = {}) => {
    if (!sessionUser?.id) {
      return;
    }

    try {
      const canonicalProduct = resolveProductRecord(product);
      const response = await addBagItem(sessionUser.id, canonicalProduct.id, options);
      setBag(response.snapshot.bag);
      setActivityFeed(response.snapshot.activityFeed);
      setErrorMessage("");
      setIsBagOpen(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const removeFromBag = async (bagItemId) => {
    if (!sessionUser?.id) {
      return;
    }

    try {
      const response = await removeBagItem(sessionUser.id, bagItemId);
      setBag(response.snapshot.bag);
      setActivityFeed(response.snapshot.activityFeed);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleOrderPlaced = async (payload) => {
    if (!sessionUser?.id) {
      setErrorMessage("Please sign in before placing an order.");
      setIsAuthOpen(true);
      return false;
    }

    try {
      const response = await placeOrder(sessionUser.id, payload);
      applySnapshot({
        profileId: profileIdRef.current,
        snapshot: response.snapshot,
      });
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleUpdateInventory = async (productId, newStock) => {
    try {
      const response = await updateInventoryStock(productId, newStock);
      setInventoryData(response.inventory);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSaveProduct = async (productId, payload) => {
    try {
      const response = productId
        ? await updateProduct(productId, payload)
        : await createProduct(payload);
      setProductsData(response.products);
      setInventoryData(response.inventory);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await deleteProduct(productId);
      setProductsData(response.products);
      setInventoryData(response.inventory);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSaveOffer = async (action, payload) => {
    try {
      let response;
      if (action === "create") {
        response = await createOffer(payload);
      } else if (action === "update") {
        response = await updateOffer(payload.id, payload);
      } else if (action === "delete") {
        response = await deleteOffer(payload.id);
      }
      if (response?.offers) {
        setOffersData(response.offers);
      }
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSaveSettings = async (payload) => {
    try {
      const response = await updateSettings(payload);
      setSettingsData(response.settings);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleReplyToReview = async (reviewId, reply) => {
    try {
      const response = await updateReview(reviewId, { reply });
      setReviewsData(response.reviews);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const downloadTextFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportInventory = async (format) => {
    try {
      if (format === "csv") {
        const csv = await exportInventory("csv");
        downloadTextFile(`inventory-export-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
      } else {
        const payload = await exportInventory("json");
        downloadTextFile(
          `inventory-export-${new Date().toISOString().slice(0, 10)}.json`,
          JSON.stringify(payload, null, 2),
          "application/json;charset=utf-8",
        );
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleImportInventory = async (payload) => {
    try {
      const response = await importInventory(payload);
      setInventoryData(response.inventory);
      setProductsData(response.products);
      await refreshMarketplace();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLogin = async (userData) => {
    if (!userData) {
      const guestSession = await refreshMarketplace({ forceGuest: true, profileId: null });
      if (guestSession) {
        setView("CUSTOMER");
        return true;
      }
      return false;
    }

    try {
      const response = await loginMarketplace(userData);
      applySnapshot(response);
      setView(response.snapshot.sessionUser?.role === "SELLER" ? "SELLER" : "CUSTOMER");
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  };

  if (view === "SELLER" && user?.role === "SELLER") {
    return (
      <>
        <SellerDashboard 
          user={user} 
          onBack={() => setView("CUSTOMER")} 
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
          inventoryData={inventoryData}
          onUpdateInventory={handleUpdateInventory}
          onExportInventory={handleExportInventory}
          onImportInventory={handleImportInventory}
          productsData={productsData}
          offersData={offersData}
          settingsData={settingsData}
          reviews={reviewsData}
          activityFeed={activityFeed}
          realtimeStatus={realtimeStatus}
          syncPending={syncPending}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onSaveOffer={handleSaveOffer}
          onSaveSettings={handleSaveSettings}
          onReplyToReview={handleReplyToReview}
        />
        <AIHelpFloat />
        <WhatsAppFloat />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Header 
        wishlistCount={wishlist.length} 
        bagCount={bag.length} 
        onBagClick={() => setIsBagOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onProfileClick={() => setIsAuthOpen(true)}
        user={user}
        theme={theme}
        onThemeToggle={toggleTheme}
        onPageChange={navigateToPage}
        onSectionNavigate={navigateToSection}
      />

      {currentPage ? (
        <CategoryPage 
          page={currentPage}
          onBack={() => navigateToPage(null)}
          products={productsData}
          wishlist={wishlist}
          onAddToBag={addToBag}
          onWishlistToggle={toggleWishlist}
          onPageChange={navigateToPage}
          onQuickView={openProductExperience}
        />
      ) : (
        <>
          <main>
            {errorMessage && (
              <div className="status-banner error">
                <div className="container">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
            <div className="status-banner">
              <div className="container">
                <span>{syncPending ? "Syncing live marketplace data..." : `Realtime backend: ${realtimeStatus}`}</span>
              </div>
            </div>
            <UserGreeting user={user} />
            <Hero onExploreProducts={() => navigateToSection("products")} />
            <PromoShowcase onPageChange={navigateToPage} onExploreProducts={() => navigateToSection("offers")} />
            <CategoriesGrid onPageChange={(page) => navigateToPage(page === "FOOTWEAR" ? "MEN/FOOTWEAR" : page)} />
            <DealsSection offers={offersData} onExploreProducts={() => navigateToSection("products")} />
            <BeautySpotlight onPageChange={navigateToPage} />
            <TrendingProducts 
              products={productsData}
              wishlist={wishlist} 
              onWishlistToggle={toggleWishlist} 
              onAddToBag={addToBag} 
              onQuickView={openProductExperience}
            />
            <CategoryShowcase onPageChange={navigateToPage} />
            <section className="recommended-section container">
              <SectionTitle>Recommended for You</SectionTitle>
              <div className="product-grid">
                {productsData.slice(0, 3).map((product) => (
                  <ProductCard 
                    product={product} 
                    key={`rec-${product.id}`} 
                    isWishlisted={wishlist.some(p => p.id === product.id)}
                    onWishlistToggle={toggleWishlist}
                    onAddToBag={addToBag}
                    onQuickView={openProductExperience}
                  />
                ))}
              </div>
            </section>
            <BrandsSection />
          </main>
          <Footer onPageChange={navigateToPage} onSectionNavigate={navigateToSection} />
        </>
      )}
      <MobileBottomNav 
        onWishlistClick={() => setIsWishlistOpen(true)} 
        onProfileClick={() => setIsAuthOpen(true)}
        onSectionNavigate={navigateToSection}
      />
      <button className="sticky-cart-btn" aria-label="Go to cart" onClick={() => setIsBagOpen(true)}>
        <i className="fa-solid fa-bag-shopping"></i>
        <span className="cart-count">{bag.length}</span>
      </button>

      <BagDrawer 
        isOpen={isBagOpen} 
        onClose={() => setIsBagOpen(false)} 
        bag={bag}
        onRemove={removeFromBag}
        onOrderPlaced={handleOrderPlaced}
        user={user}
        onQuickView={openProductExperience}
      />
      <WishlistDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
        wishlist={wishlist}
        onRemove={toggleWishlist}
        onQuickView={openProductExperience}
        onAddToBag={(p) => {
          addToBag(p);
          toggleWishlist(p);
        }}
      />
      <AuthDrawer 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin} 
        user={user}
        onSwitchToSeller={() => setView("SELLER")}
      />
      {previewProduct && (
        <ProductExperienceModal
          product={previewProduct}
          isWishlisted={wishlist.some((item) => item.id === previewProduct.id)}
          onClose={() => setPreviewProduct(null)}
          onWishlistToggle={toggleWishlist}
          onAddToBag={async (product, options) => {
            await addToBagWithOptions(product, options);
            setPreviewProduct(null);
          }}
        />
      )}
      <AIHelpFloat />
      <WhatsAppFloat />
    </div>
  );
}
