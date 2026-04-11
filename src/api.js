const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error("API server is not running. Start the backend and try again.");
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Request failed.");
  }

  return payload;
}

export function bootstrapMarketplace(profileId, forceGuest = false) {
  return request("/api/bootstrap", {
    method: "POST",
    body: JSON.stringify({ profileId, forceGuest }),
  });
}

export function loginMarketplace(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toggleWishlistItem(userId, productId) {
  return request(`/api/users/${encodeURIComponent(userId)}/wishlist/toggle`, {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export function addBagItem(userId, productId, options = {}) {
  return request(`/api/users/${encodeURIComponent(userId)}/bag`, {
    method: "POST",
    body: JSON.stringify({ productId, ...options }),
  });
}

export function removeBagItem(userId, bagItemId) {
  return request(`/api/users/${encodeURIComponent(userId)}/bag/${encodeURIComponent(bagItemId)}`, {
    method: "DELETE",
  });
}

export function placeOrder(userId, payload) {
  return request("/api/orders", {
    method: "POST",
    body: JSON.stringify({ userId, ...payload }),
  });
}

export function updateOrderStatus(orderId, status) {
  return request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateInventoryStock(inventoryId, stock) {
  return request(`/api/inventory/${encodeURIComponent(inventoryId)}`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });
}

export function createProduct(payload) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(productId, payload) {
  return request(`/api/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(productId) {
  return request(`/api/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export function createOffer(payload) {
  return request("/api/offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOffer(offerId, payload) {
  return request(`/api/offers/${encodeURIComponent(offerId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteOffer(offerId) {
  return request(`/api/offers/${encodeURIComponent(offerId)}`, {
    method: "DELETE",
  });
}

export function updateSettings(payload) {
  return request("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateReview(reviewId, payload) {
  return request(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function exportInventory(format = "json") {
  const response = await fetch(`${API_BASE}/api/inventory/export?format=${encodeURIComponent(format)}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || "Export failed.");
  }
  return format === "csv" ? response.text() : response.json();
}

export function importInventory(payload) {
  return request("/api/inventory/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function subscribeToRealtime(onMessage) {
  const eventSource = new EventSource(`${API_BASE}/api/stream`);
  eventSource.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  return () => eventSource.close();
}
