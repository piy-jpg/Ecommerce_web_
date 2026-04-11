import http from "node:http";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedState } from "./seed.js";
import { buildProductMediaSet } from "../src/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUNDLED_DB_PATH = path.join(__dirname, "db.json");
const DB_PATH = process.env.VERCEL ? path.join("/tmp", "jaanu-marketplace-db.json") : BUNDLED_DB_PATH;
const PORT = Number(process.env.PORT || 3001);

const clients = new Set();
let state = await loadState();

function nextNumericCounter(items, prefix, key = "id") {
  return items.reduce((max, item) => {
    const value = String(item[key] || "");
    const match = value.match(new RegExp(`^${prefix}(\\d+)$`));
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
}

function computeDiscount(price, mrp) {
  return `${Math.max(0, Math.round(((mrp - price) / Math.max(mrp, 1)) * 100))}% OFF`;
}

function makeBarcodeValue(...parts) {
  const digits = parts
    .map((part) => String(part || ""))
    .join("")
    .replace(/\D/g, "");
  const serial = digits.slice(-7).padStart(7, "0");
  return `89023${serial}`;
}

function makeInventoryFromProduct(product, inventoryId) {
  const price = parseCurrency(product.price);
  const mrp = parseCurrency(product.oldPrice || product.price);
  const stock = 10;
  return {
    id: inventoryId,
    sku: `JNU-${inventoryId.replace("INV-", "")}`,
    barcode: makeBarcodeValue(inventoryId, product.inventoryId, product.id, product.sku),
    name: product.title,
    image: product.image,
    category: product.category || "General",
    brand: product.brand,
    price,
    mrp,
    stock,
    reserved: 0,
    available: stock,
    status: "Active",
    warehouse: "Main Warehouse",
    lastUpdated: today(),
    variants: [{ size: "Free Size", color: "Default", stock }],
    lowStockThreshold: 5,
    salesLast30Days: 0,
    lastSold: today(),
  };
}

function makeProductFromInventory(item, productId) {
  const media = buildProductMediaSet(item.category || "General", item.image);
  return {
    id: productId,
    inventoryId: item.id,
    brand: item.brand,
    title: item.name,
    price: `Rs ${Number(item.price || 0).toLocaleString()}`,
    oldPrice: `Rs ${Number(item.mrp || item.price || 0).toLocaleString()}`,
    discount: computeDiscount(Number(item.price || 0), Number(item.mrp || item.price || 0)),
    badge: item.available > 5 ? "In Stock" : "Low Stock",
    image: item.image || media.image,
    images: media.images,
    spinFrames: media.spinFrames,
    mediaTag: media.mediaTag,
    category: item.category || "General",
  };
}

function syncProductFromInventory(product, item) {
  if (!product || !item) {
    return;
  }

  product.inventoryId = item.id;
  const media = buildProductMediaSet(item.category || product.category || "General", item.image || product.image);
  product.brand = item.brand;
  product.title = item.name;
  product.image = item.image || media.image;
  product.images = Array.isArray(product.images) && product.images.length ? product.images : media.images;
  product.spinFrames = Array.isArray(product.spinFrames) && product.spinFrames.length ? product.spinFrames : media.spinFrames;
  product.mediaTag = product.mediaTag || media.mediaTag;
  product.category = item.category || product.category || "General";
  product.price = `Rs ${Number(item.price || 0).toLocaleString()}`;
  product.oldPrice = `Rs ${Number(item.mrp || item.price || 0).toLocaleString()}`;
  product.discount = computeDiscount(Number(item.price || 0), Number(item.mrp || item.price || 0));
  product.badge = item.available === 0 ? "Out of Stock" : item.available <= (item.lowStockThreshold || 5) ? "Low Stock" : "In Stock";
}

function reconcileCatalog(nextState) {
  const reconciled = {
    ...nextState,
    products: [...(nextState.products || [])],
    inventory: [...(nextState.inventory || [])],
  };

  let inventoryCounter = Math.max(
    Number(reconciled.counters?.inventory || 0),
    nextNumericCounter(reconciled.inventory, "INV-"),
  );
  let productCounter = Math.max(
    Number(reconciled.counters?.product || 0),
    nextNumericCounter(reconciled.products, "PROD-"),
  );

  for (const product of reconciled.products) {
    let inventoryItem = reconciled.inventory.find((item) => item.id === product.inventoryId);
    if (!inventoryItem) {
      inventoryCounter += 1;
      const inventoryId = `INV-${String(inventoryCounter).padStart(3, "0")}`;
      inventoryItem = makeInventoryFromProduct(product, inventoryId);
      reconciled.inventory.push(inventoryItem);
      product.inventoryId = inventoryId;
    } else {
      inventoryItem.name = product.title;
      inventoryItem.brand = product.brand;
      inventoryItem.image = product.image;
      inventoryItem.category = product.category || inventoryItem.category;
      inventoryItem.price = parseCurrency(product.price);
      inventoryItem.mrp = parseCurrency(product.oldPrice || product.price);
      inventoryItem.sku = inventoryItem.sku || `JNU-${inventoryItem.id.replace("INV-", "")}`;
      inventoryItem.barcode = inventoryItem.barcode || makeBarcodeValue(inventoryItem.id, inventoryItem.sku, product.id);
      inventoryItem.available = Math.max(0, Number(inventoryItem.stock || 0) - Number(inventoryItem.reserved || 0));
      inventoryItem.status =
        inventoryItem.available === 0 ? "Out of Stock" : inventoryItem.available <= (inventoryItem.lowStockThreshold || 5) ? "Low Stock" : "Active";
    }

    syncProductFromInventory(product, inventoryItem);
  }

  for (const item of reconciled.inventory) {
    const product = reconciled.products.find((entry) => entry.inventoryId === item.id);
    if (!product) {
      productCounter += 1;
      reconciled.products.push(makeProductFromInventory(item, `PROD-${String(productCounter).padStart(3, "0")}`));
    }
  }

  reconciled.counters = {
    ...(reconciled.counters || {}),
    inventory: inventoryCounter,
    product: productCounter,
  };

  return reconciled;
}

function mergeById(seededItems = [], rawItems = [], key = "id", preferSeededKeys = []) {
  const seededMap = new Map(seededItems.map((item) => [String(item[key]), item]));
  const rawMap = new Map(rawItems.map((item) => [String(item[key]), item]));

  const mergedSeeded = seededItems.map((item) => {
    const rawItem = rawMap.get(String(item[key])) || {};
    const merged = {
      ...item,
      ...rawItem,
    };

    for (const field of preferSeededKeys) {
      if (item[field] !== undefined) {
        merged[field] = item[field];
      }
    }

    return merged;
  });

  const customItems = rawItems.filter((item) => !seededMap.has(String(item[key])));
  return [...customItems, ...mergedSeeded];
}

function normalizeState(rawState) {
  const seeded = createSeedState();
  return reconcileCatalog({
    ...seeded,
    ...rawState,
    products: mergeById(seeded.products, rawState.products || [], "id", [
      "title",
      "brand",
      "image",
      "category",
      "color",
      "price",
      "oldPrice",
      "discount",
      "badge",
      "images",
      "spinFrames",
      "mediaTag",
    ]),
    inventory: mergeById(seeded.inventory, rawState.inventory || [], "id", [
      "name",
      "brand",
      "image",
      "category",
      "price",
      "mrp",
      "warehouse",
      "variants",
    ]),
    settings: {
      ...seeded.settings,
      ...(rawState.settings || {}),
      socialLinks: {
        ...seeded.settings.socialLinks,
        ...(rawState.settings?.socialLinks || {}),
      },
      notifications: {
        ...seeded.settings.notifications,
        ...(rawState.settings?.notifications || {}),
      },
    },
    counters: {
      ...seeded.counters,
      ...(rawState.counters || {}),
    },
    reviews: rawState.reviews || seeded.reviews,
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function sseHeaders(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
}

async function loadState() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeState(parsed);
    if (
      normalized.products.length !== (parsed.products || []).length ||
      normalized.inventory.length !== (parsed.inventory || []).length
    ) {
      await fs.writeFile(DB_PATH, JSON.stringify(normalized, null, 2));
    }
    return normalized;
  } catch {
    try {
      const raw = await fs.readFile(BUNDLED_DB_PATH, "utf8");
      const seededFromDisk = normalizeState(JSON.parse(raw));
      await fs.writeFile(DB_PATH, JSON.stringify(seededFromDisk, null, 2));
      return seededFromDisk;
    } catch {
      const seeded = createSeedState();
      await fs.writeFile(DB_PATH, JSON.stringify(seeded, null, 2));
      return seeded;
    }
  }
}

async function saveState(nextState = state) {
  state = normalizeState(nextState);
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2));
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    isGuest: Boolean(user.isGuest),
  };
}

function parseCurrency(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateWishlist(user) {
  return user.wishlistProductIds
    .map((productId) => state.products.find((product) => product.id === productId))
    .filter(Boolean);
}

function hydrateBag(user) {
  return user.bagItems
    .map((bagItem) => {
      const product = state.products.find((entry) => entry.id === bagItem.productId);
      return product
        ? {
            ...product,
            bagItemId: bagItem.id,
            selectedSize: bagItem.selectedSize || null,
          }
        : null;
    })
    .filter(Boolean);
}

function findUser(profileId) {
  return state.users.find((user) => user.id === profileId) ?? null;
}

async function ensureSession(profileId, options = {}) {
  const forceGuest = Boolean(options.forceGuest);
  const existing = !forceGuest ? findUser(profileId) : null;

  if (existing) {
    existing.lastActiveAt = new Date().toISOString();
    await saveState();
    return existing;
  }

  state.counters.guest += 1;
  const guestUser = {
    id: `guest-${state.counters.guest}`,
    email: `guest-${state.counters.guest}@jaanu.local`,
    password: "",
    role: "CUSTOMER",
    businessName: "",
    wishlistProductIds: [],
    bagItems: [],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isGuest: true,
  };

  state.users.push(guestUser);
  await saveState();
  return guestUser;
}

function buildSellerStats() {
  const totalRevenue = state.orders.reduce((sum, order) => sum + parseCurrency(order.amount), 0);
  const pendingOrders = state.orders.filter((order) =>
    ["Pending", "Processing", "Confirmed"].includes(order.status),
  ).length;
  const lowStockItems = state.inventory.filter((item) => item.available > 0 && item.available <= 5).length;

  return {
    totalRevenue,
    totalOrders: state.orders.length,
    pendingOrders,
    lowStockItems,
  };
}

function snapshotForUser(user) {
  return {
    sessionUser: sanitizeUser(user),
    products: state.products,
    offers: state.offers,
    inventory: state.inventory,
    reviews: state.reviews,
    settings: state.settings,
    orders: [...state.orders].sort((a, b) => b.date.localeCompare(a.date)),
    wishlist: hydrateWishlist(user),
    bag: hydrateBag(user),
    activityFeed: [...state.activityFeed].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
    sellerStats: buildSellerStats(),
    realtimeStatus: "LIVE",
  };
}

async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function appendActivity(type, message) {
  state.counters.activity += 1;
  const entry = {
    id: `activity-${String(state.counters.activity).padStart(3, "0")}`,
    type,
    message,
    createdAt: new Date().toISOString(),
  };

  state.activityFeed.unshift(entry);
  state.activityFeed = state.activityFeed.slice(0, 50);
  return entry;
}

async function commitAndBroadcast(type, message, extra = {}) {
  const activity = appendActivity(type, message);
  await saveState();
  const payload = JSON.stringify({
    type,
    message,
    activity,
    ...extra,
  });

  for (const client of clients) {
    client.write(`data: ${payload}\n\n`);
  }
}

function updateInventoryRecord(item, nextStock) {
  const safeStock = Math.max(0, Number(nextStock) || 0);
  item.stock = safeStock;
  item.available = Math.max(0, safeStock - item.reserved);
  item.lastUpdated = today();

  if (item.available === 0) {
    item.status = "Out of Stock";
  } else if (item.available <= item.lowStockThreshold) {
    item.status = "Low Stock";
  } else {
    item.status = "Active";
  }
}

function findProductByInventoryId(inventoryId) {
  return state.products.find((entry) => entry.inventoryId === inventoryId) ?? null;
}

async function handleBootstrap(req, res) {
  const body = await readBody(req);
  const user = await ensureSession(body.profileId, { forceGuest: body.forceGuest });
  json(res, 200, {
    profileId: user.id,
    snapshot: snapshotForUser(user),
  });
}

async function handleLogin(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const role = body.role === "SELLER" ? "SELLER" : "CUSTOMER";

  if (!email) {
    json(res, 400, { error: "Email is required." });
    return;
  }

  let user = state.users.find((entry) => entry.email.toLowerCase() === email);

  if (user && user.password && body.password && user.password !== body.password) {
    json(res, 401, { error: "Incorrect password." });
    return;
  }

  if (!user) {
    user = {
      id: randomUUID(),
      email,
      password: String(body.password || ""),
      role,
      businessName: role === "SELLER" ? String(body.businessName || "Jaanu Seller").trim() : "",
      wishlistProductIds: [],
      bagItems: [],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isGuest: false,
    };
    state.users.push(user);
  } else {
    user.role = role;
    if (role === "SELLER") {
      user.businessName = String(body.businessName || user.businessName || "Jaanu Seller").trim();
    }
    user.isGuest = false;
    user.lastActiveAt = new Date().toISOString();
  }

  await saveState();
  await commitAndBroadcast(
    "user.login",
    `${role === "SELLER" ? user.businessName : user.email} joined the live marketplace session.`,
    { profileId: user.id },
  );

  json(res, 200, {
    profileId: user.id,
    snapshot: snapshotForUser(user),
  });
}

async function handleToggleWishlist(req, res, userId) {
  const body = await readBody(req);
  const user = findUser(userId);
  const product = state.products.find((entry) => entry.id === body.productId);

  if (!user || !product) {
    json(res, 404, { error: "User or product not found." });
    return;
  }

  const exists = user.wishlistProductIds.includes(product.id);
  user.wishlistProductIds = exists
    ? user.wishlistProductIds.filter((productId) => productId !== product.id)
    : [...user.wishlistProductIds, product.id];
  user.lastActiveAt = new Date().toISOString();

  await commitAndBroadcast(
    "wishlist.updated",
    `${user.email} ${exists ? "removed" : "saved"} ${product.title}.`,
    { profileId: user.id },
  );

  json(res, 200, {
    snapshot: snapshotForUser(user),
  });
}

async function handleAddToBag(req, res, userId) {
  const body = await readBody(req);
  const user = findUser(userId);
  const product = state.products.find((entry) => entry.id === body.productId);

  if (!user || !product) {
    json(res, 404, { error: "User or product not found." });
    return;
  }

  state.counters.bagItem += 1;
  user.bagItems.push({
    id: `bag-${String(state.counters.bagItem).padStart(3, "0")}`,
    productId: product.id,
    selectedSize: body.selectedSize || null,
    addedAt: new Date().toISOString(),
  });
  user.lastActiveAt = new Date().toISOString();

  await commitAndBroadcast(
    "bag.updated",
    `${user.email} added ${product.title}${body.selectedSize ? ` (${body.selectedSize})` : ""} to the bag.`,
    { profileId: user.id },
  );

  json(res, 200, {
    snapshot: snapshotForUser(user),
  });
}

async function handleRemoveFromBag(res, userId, bagItemId) {
  const user = findUser(userId);

  if (!user) {
    json(res, 404, { error: "User not found." });
    return;
  }

  const bagItem = user.bagItems.find((entry) => entry.id === bagItemId);
  user.bagItems = user.bagItems.filter((entry) => entry.id !== bagItemId);
  user.lastActiveAt = new Date().toISOString();

  const product = bagItem
    ? state.products.find((entry) => entry.id === bagItem.productId)
    : null;

  await commitAndBroadcast(
    "bag.updated",
    `${user.email} removed ${product?.title ?? "an item"} from the bag.`,
    { profileId: user.id },
  );

  json(res, 200, {
    snapshot: snapshotForUser(user),
  });
}

function deriveCustomerName(user, address) {
  if (address?.name) {
    return address.name;
  }

  const [emailName = "Guest"] = user.email.split("@");
  return emailName.replace(/\b\w/g, (char) => char.toUpperCase());
}

async function handlePlaceOrder(req, res) {
  const body = await readBody(req);
  const user = findUser(body.userId);

  if (!user) {
    json(res, 404, { error: "User not found." });
    return;
  }

  const bagProducts = hydrateBag(user);

  if (bagProducts.length === 0) {
    json(res, 400, { error: "Bag is empty." });
    return;
  }

  state.counters.order += 1;
  const total = bagProducts.reduce((sum, product) => sum + parseCurrency(product.price), 0);
  const customerName = deriveCustomerName(user, body.address);
  const orderId = `#OD${state.counters.order}`;
  const customerLocation = body.address?.area
    ? `${body.address.area}, ${body.address.pincode || "India"}`
    : "India";

  for (const bagProduct of bagProducts) {
    const inventoryItem = state.inventory.find((entry) => entry.id === bagProduct.inventoryId);
    if (inventoryItem) {
      updateInventoryRecord(inventoryItem, inventoryItem.stock - 1);
      inventoryItem.lastSold = today();
    }
  }

  const customerOrders = state.orders.filter((order) => order.customerEmail === user.email);
  const historicalSpent = customerOrders.reduce((sum, order) => sum + parseCurrency(order.amount), 0);

  state.orders.unshift({
    id: orderId,
    product: bagProducts.map((product) => product.title).join(", "),
    customerId: user.id,
    customer: customerName,
    customerEmail: user.email,
    customerPhone: body.address?.mobile || "+91 00000 00000",
    customerLocation,
    status: "Pending",
    amount: `Rs ${total.toLocaleString()}`,
    date: today(),
    payment: body.paymentMethod || "UPI / Google Pay",
    items: bagProducts.length,
    totalSpent: historicalSpent + total,
    joinDate: user.createdAt.slice(0, 10),
    lastOrder: today(),
    address: body.address ?? null,
  });

  user.bagItems = [];
  user.lastActiveAt = new Date().toISOString();

  await commitAndBroadcast(
    "order.created",
    `${customerName} placed ${orderId} for ${bagProducts.length} item${bagProducts.length > 1 ? "s" : ""}.`,
    { profileId: user.id, orderId },
  );

  json(res, 200, {
    snapshot: snapshotForUser(user),
    orderId,
  });
}

async function handleUpdateOrderStatus(req, res, orderId) {
  const body = await readBody(req);
  const order = state.orders.find((entry) => entry.id === orderId);

  if (!order) {
    json(res, 404, { error: "Order not found." });
    return;
  }

  order.status = body.status || order.status;
  order.lastOrder = today();

  await commitAndBroadcast(
    "order.status_updated",
    `${order.id} moved to ${order.status}.`,
    { orderId: order.id, status: order.status },
  );

  const orderUser = findUser(order.customerId);
  json(res, 200, {
    snapshot: snapshotForUser(orderUser ?? (await ensureSession(null))),
  });
}

async function handleUpdateInventory(req, res, inventoryId) {
  const body = await readBody(req);
  const item = state.inventory.find((entry) => entry.id === inventoryId);

  if (!item) {
    json(res, 404, { error: "Inventory item not found." });
    return;
  }

  updateInventoryRecord(item, body.stock);
  syncProductFromInventory(findProductByInventoryId(item.id), item);

  await commitAndBroadcast(
    "inventory.updated",
    `${item.name} stock updated to ${item.stock}.`,
    { inventoryId: item.id, stock: item.stock },
  );

  json(res, 200, {
    inventory: state.inventory,
  });
}

async function handleCreateProduct(req, res) {
  const body = await readBody(req);
  state.counters.inventory += 1;
  state.counters.product += 1;

  const inventoryId = `INV-${String(state.counters.inventory).padStart(3, "0")}`;
  const productId = `PROD-${String(state.counters.product).padStart(3, "0")}`;
  const stock = Math.max(0, Number(body.stock) || 0);
  const price = Number(body.price) || 0;
  const mrp = Number(body.mrp) || price;
  const media = buildProductMediaSet(body.category || "General", body.image);

  const inventoryItem = {
    id: inventoryId,
    sku: body.sku || `JNU-${inventoryId.replace("INV-", "")}`,
    barcode: body.barcode || makeBarcodeValue(inventoryId, body.sku, body.title),
    name: body.title,
    image: body.image,
    category: body.category,
    brand: body.brand,
    price,
    mrp,
    stock,
    reserved: 0,
    available: stock,
    status: stock === 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "Active",
    warehouse: body.warehouse || "Main Warehouse",
    lastUpdated: today(),
    variants: body.variants || [{ size: "Free Size", color: "Default", stock }],
    lowStockThreshold: 5,
    salesLast30Days: 0,
    lastSold: today(),
  };

  const product = {
    id: productId,
    inventoryId,
    brand: body.brand,
    title: body.title,
    price: `Rs ${price.toLocaleString()}`,
    oldPrice: `Rs ${mrp.toLocaleString()}`,
    discount: body.discount || `${Math.max(0, Math.round(((mrp - price) / Math.max(mrp, 1)) * 100))}% OFF`,
    badge: body.badge || "New Drop",
    image: body.image || media.image,
    images: media.images,
    spinFrames: media.spinFrames,
    mediaTag: media.mediaTag,
    category: body.category,
  };

  state.inventory.unshift(inventoryItem);
  state.products.unshift(product);

  await commitAndBroadcast("product.created", `${product.title} is now live on the storefront.`, {
    productId: product.id,
    inventoryId,
  });

  json(res, 200, {
    products: state.products,
    inventory: state.inventory,
  });
}

async function handleUpdateProduct(req, res, productId) {
  const body = await readBody(req);
  const product = state.products.find((entry) => entry.id === productId);

  if (!product) {
    json(res, 404, { error: "Product not found." });
    return;
  }

  Object.assign(product, {
    brand: body.brand ?? product.brand,
    title: body.title ?? product.title,
    price: body.price != null ? `Rs ${Number(body.price).toLocaleString()}` : product.price,
    oldPrice: body.mrp != null ? `Rs ${Number(body.mrp).toLocaleString()}` : product.oldPrice,
    discount: body.discount ?? product.discount,
    badge: body.badge ?? product.badge,
    image: body.image ?? product.image,
    category: body.category ?? product.category,
  });
  const media = buildProductMediaSet(body.category ?? product.category ?? "General", body.image ?? product.image);
  product.image = body.image ?? product.image ?? media.image;
  product.images = media.images;
  product.spinFrames = media.spinFrames;
  product.mediaTag = media.mediaTag;

  const inventoryItem = state.inventory.find((entry) => entry.id === product.inventoryId);
  if (inventoryItem) {
    inventoryItem.name = product.title;
    inventoryItem.brand = product.brand;
    inventoryItem.image = product.image;
    inventoryItem.category = product.category;
    if (body.price != null) {
      inventoryItem.price = Number(body.price);
    }
    if (body.sku != null) {
      inventoryItem.sku = body.sku;
    }
    if (body.barcode != null) {
      inventoryItem.barcode = body.barcode;
    } else {
      inventoryItem.barcode = inventoryItem.barcode || makeBarcodeValue(inventoryItem.id, inventoryItem.sku, product.id);
    }
    if (body.mrp != null) {
      inventoryItem.mrp = Number(body.mrp);
    }
    if (body.stock != null) {
      updateInventoryRecord(inventoryItem, body.stock);
    }
    inventoryItem.lastUpdated = today();
  }

  await commitAndBroadcast("product.updated", `${product.title} was updated by the seller.`, {
    productId: product.id,
  });

  json(res, 200, {
    products: state.products,
    inventory: state.inventory,
  });
}

async function handleDeleteProduct(res, productId) {
  const product = state.products.find((entry) => entry.id === productId);

  if (!product) {
    json(res, 404, { error: "Product not found." });
    return;
  }

  state.products = state.products.filter((entry) => entry.id !== productId);
  state.inventory = state.inventory.filter((entry) => entry.id !== product.inventoryId);

  await commitAndBroadcast("product.deleted", `${product.title} was removed from the storefront.`, {
    productId,
  });

  json(res, 200, {
    products: state.products,
    inventory: state.inventory,
  });
}

async function handleCreateOffer(req, res) {
  const body = await readBody(req);
  state.counters.offer += 1;

  const offer = {
    ...body,
    id: state.counters.offer,
    createdDate: today(),
    usageCount: 0,
  };

  state.offers.unshift(offer);

  await commitAndBroadcast("offer.created", `${offer.title} is now active on the website.`, {
    offerId: offer.id,
  });

  json(res, 200, {
    offers: state.offers,
  });
}

async function handleUpdateOffer(req, res, offerId) {
  const body = await readBody(req);
  const offer = state.offers.find((entry) => String(entry.id) === String(offerId));

  if (!offer) {
    json(res, 404, { error: "Offer not found." });
    return;
  }

  Object.assign(offer, body);

  await commitAndBroadcast("offer.updated", `${offer.title} was updated in pricing and offers.`, {
    offerId: offer.id,
  });

  json(res, 200, {
    offers: state.offers,
  });
}

async function handleDeleteOffer(res, offerId) {
  const offer = state.offers.find((entry) => String(entry.id) === String(offerId));

  if (!offer) {
    json(res, 404, { error: "Offer not found." });
    return;
  }

  state.offers = state.offers.filter((entry) => String(entry.id) !== String(offerId));

  await commitAndBroadcast("offer.deleted", `${offer.title} was removed from the website.`, {
    offerId,
  });

  json(res, 200, {
    offers: state.offers,
  });
}

async function handleUpdateSettings(req, res) {
  const body = await readBody(req);
  state.settings = {
    ...state.settings,
    ...body,
    socialLinks: {
      ...state.settings.socialLinks,
      ...(body.socialLinks || {}),
    },
    notifications: {
      ...state.settings.notifications,
      ...(body.notifications || {}),
    },
  };

  await commitAndBroadcast("settings.updated", "Store settings were updated and synced live.", {});

  json(res, 200, {
    settings: state.settings,
  });
}

async function handleUpdateReview(req, res, reviewId) {
  const body = await readBody(req);
  const review = state.reviews.find((entry) => entry.id === reviewId);

  if (!review) {
    json(res, 404, { error: "Review not found." });
    return;
  }

  Object.assign(review, {
    reply: body.reply ?? review.reply,
    helpful: body.helpful ?? review.helpful,
    status: body.status ?? review.status,
  });

  await commitAndBroadcast("review.updated", `Review for ${review.product} was updated by the seller.`, {
    reviewId,
  });

  json(res, 200, {
    reviews: state.reviews,
  });
}

function inventoryToCsv(items) {
  const headers = [
    "inventoryId",
    "sku",
    "barcode",
    "name",
    "brand",
    "category",
    "price",
    "mrp",
    "stock",
    "reserved",
    "available",
    "status",
    "warehouse",
    "image",
  ];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = items.map((item) =>
    [
      item.id,
      item.sku,
      item.barcode,
      item.name,
      item.brand,
      item.category,
      item.price,
      item.mrp,
      item.stock,
      item.reserved,
      item.available,
      item.status,
      item.warehouse,
      item.image,
    ].map(escapeCsv).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function importInventoryRows(rows) {
  const normalizedRows = rows.map((row) => ({
    id: row.inventoryId || row.id,
    sku: row.sku,
    barcode: row.barcode || makeBarcodeValue(row.inventoryId || row.id, row.sku, row.name || row.title),
    name: row.name || row.title,
    brand: row.brand,
    category: row.category || "General",
    price: Number(row.price) || 0,
    mrp: Number(row.mrp) || Number(row.price) || 0,
    stock: Math.max(0, Number(row.stock) || 0),
    reserved: Math.max(0, Number(row.reserved) || 0),
    available: Math.max(0, Number(row.available) || (Number(row.stock) || 0) - (Number(row.reserved) || 0)),
    status: row.status || "Active",
    warehouse: row.warehouse || "Main Warehouse",
    image: row.image || "",
    variants: [{ size: "Free Size", color: "Default", stock: Math.max(0, Number(row.stock) || 0) }],
    lowStockThreshold: 5,
    salesLast30Days: 0,
    lastSold: today(),
    lastUpdated: today(),
  }));

  state.inventory = normalizedRows;
  state.products = [];
  state = normalizeState(state);
}

async function handleExportInventory(res, format) {
  if (format === "csv") {
    const csv = inventoryToCsv(state.inventory);
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inventory-export.csv"',
      "Access-Control-Allow-Origin": "*",
    });
    res.end(csv);
    return;
  }

  json(res, 200, {
    exportedAt: new Date().toISOString(),
    inventory: state.inventory,
    products: state.products,
  });
}

async function handleImportInventory(req, res) {
  const body = await readBody(req);
  const format = body.format || "json";
  let rows = [];

  if (format === "csv") {
    const lines = String(body.content || "")
      .split(/\r?\n/)
      .filter(Boolean);
    const headers = parseCsvLine(lines[0] || "");
    rows = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index] ?? "";
        return acc;
      }, {});
    });
  } else {
    const parsed = typeof body.content === "string" ? JSON.parse(body.content) : body.content;
    if (Array.isArray(parsed?.inventory) && Array.isArray(parsed?.products)) {
      state.inventory = parsed.inventory;
      state.products = parsed.products;
      state = normalizeState(state);
      await commitAndBroadcast("inventory.imported", `Inventory import completed with ${state.inventory.length} rows.`, {
        count: state.inventory.length,
      });
      json(res, 200, {
        inventory: state.inventory,
        products: state.products,
      });
      return;
    }
    rows = Array.isArray(parsed?.inventory) ? parsed.inventory : Array.isArray(parsed) ? parsed : [];
  }

  importInventoryRows(rows);
  await commitAndBroadcast("inventory.imported", `Inventory import completed with ${rows.length} rows.`, {
    count: rows.length,
  });

  json(res, 200, {
    inventory: state.inventory,
    products: state.products,
  });
}

export async function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      json(res, 200, { ok: true, startedAt: state.activityFeed[0]?.createdAt ?? today() });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/stream") {
      sseHeaders(res);
      res.write(`data: ${JSON.stringify({ type: "connected", message: "Realtime stream connected." })}\n\n`);
      clients.add(res);

      const keepAlive = setInterval(() => {
        res.write(": keep-alive\n\n");
      }, 15000);

      req.on("close", () => {
        clearInterval(keepAlive);
        clients.delete(res);
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/bootstrap") {
      await handleBootstrap(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      await handleLogin(req, res);
      return;
    }

    const wishlistMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/wishlist\/toggle$/);
    if (req.method === "POST" && wishlistMatch) {
      await handleToggleWishlist(req, res, decodeURIComponent(wishlistMatch[1]));
      return;
    }

    const bagAddMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/bag$/);
    if (req.method === "POST" && bagAddMatch) {
      await handleAddToBag(req, res, decodeURIComponent(bagAddMatch[1]));
      return;
    }

    const bagDeleteMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/bag\/([^/]+)$/);
    if (req.method === "DELETE" && bagDeleteMatch) {
      await handleRemoveFromBag(
        res,
        decodeURIComponent(bagDeleteMatch[1]),
        decodeURIComponent(bagDeleteMatch[2]),
      );
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/orders") {
      await handlePlaceOrder(req, res);
      return;
    }

    const orderStatusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (req.method === "PATCH" && orderStatusMatch) {
      await handleUpdateOrderStatus(req, res, decodeURIComponent(orderStatusMatch[1]));
      return;
    }

    const inventoryMatch = url.pathname.match(/^\/api\/inventory\/([^/]+)$/);
    if (req.method === "PATCH" && inventoryMatch) {
      await handleUpdateInventory(req, res, decodeURIComponent(inventoryMatch[1]));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/inventory/export") {
      await handleExportInventory(res, url.searchParams.get("format") || "json");
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/inventory/import") {
      await handleImportInventory(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/products") {
      await handleCreateProduct(req, res);
      return;
    }

    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (req.method === "PATCH" && productMatch) {
      await handleUpdateProduct(req, res, decodeURIComponent(productMatch[1]));
      return;
    }
    if (req.method === "DELETE" && productMatch) {
      await handleDeleteProduct(res, decodeURIComponent(productMatch[1]));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/offers") {
      await handleCreateOffer(req, res);
      return;
    }

    const offerMatch = url.pathname.match(/^\/api\/offers\/([^/]+)$/);
    if (req.method === "PATCH" && offerMatch) {
      await handleUpdateOffer(req, res, decodeURIComponent(offerMatch[1]));
      return;
    }
    if (req.method === "DELETE" && offerMatch) {
      await handleDeleteOffer(res, decodeURIComponent(offerMatch[1]));
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/settings") {
      await handleUpdateSettings(req, res);
      return;
    }

    const reviewMatch = url.pathname.match(/^\/api\/reviews\/([^/]+)$/);
    if (req.method === "PATCH" && reviewMatch) {
      await handleUpdateReview(req, res, decodeURIComponent(reviewMatch[1]));
      return;
    }

    json(res, 404, { error: "Route not found." });
  } catch (error) {
    json(res, 500, {
      error: "Internal server error.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export default requestHandler;

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const server = http.createServer(requestHandler);

  server.listen(PORT, () => {
    console.log(`Realtime marketplace API running on http://localhost:${PORT}`);
  });
}
