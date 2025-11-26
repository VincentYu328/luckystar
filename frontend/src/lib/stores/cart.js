import { writable, derived } from "svelte/store";

// (1) Load cart from localStorage on startup
function loadCart() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

// (2) Create writable store
export const cart = writable(loadCart());

// (3) Persist cart to localStorage whenever it changes
cart.subscribe(value => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(value));
  }
});

// -----------------------------------------------------------
// Cart Operations
// -----------------------------------------------------------

// Add item to cart
export function addToCart(product) {
  cart.update(items => {
    const exist = items.find(i => i.product_id === product.id);

    if (exist) {
      // increase qty
      exist.qty += 1;
    } else {
      // push new item
      items.push({
        product_id: product.id,
        name: product.name,
        price: product.base_price,  // ⭐ PRICE COMES FROM HERE
        qty: 1,
        image: product.images?.[0]?.url || null
      });
    }

    return items;
  });
}

// Remove an item completely
export function removeFromCart(id) {
  cart.update(items => items.filter(i => i.product_id !== id));
}

// Change quantity
export function updateQty(id, qty) {
  cart.update(items => {
    const item = items.find(i => i.product_id === id);
    if (item) item.qty = qty;
    return items;
  });
}

// Clear all
export function clearCart() {
  cart.set([]);
}

// -----------------------------------------------------------
// Derived values: subtotal, total items, total price
// -----------------------------------------------------------

// Total number of items
export const cartCount = derived(cart, $cart =>
  $cart.reduce((acc, item) => acc + item.qty, 0)
);

// Subtotal price
export const cartSubtotal = derived(cart, $cart =>
  $cart.reduce((acc, item) => acc + item.qty * item.price, 0)
);

// If future you want tax/shipping:
export const cartTotal = derived(cart, $cart =>
  $cart.reduce((acc, item) => acc + item.qty * item.price, 0)
);
