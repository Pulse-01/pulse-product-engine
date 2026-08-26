/* =========================================================
   PULSE:01 LIVE SHOPIFY VARIANT BRIDGE
   Resolves Webflow selections to live Shopify variant data.
========================================================= */
(function () {
  "use strict";

  if (window.PULSE_SHOPIFY?.engineVersion === "3.0.0") return;

  const API = "https://pulse-commerce-engine.vercel.app";
  const SHOPIFY_DOMAIN = "pulse-01.myshopify.com";
  const productCache = new Map();
  let readyPromise = null;

  function getProductSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : "";
  }

  function getSelection(groupName) {
    const group = document.querySelector('[data-option-group="' + groupName + '"]');
    if (!group) return null;
    return group.getAttribute("data-selected") ||
      group.querySelector(".is-selected")?.getAttribute("data-option-button") ||
      null;
  }

  function getQuantity() {
    const element = document.querySelector(".quantity-value");
    const quantity = parseInt(element?.textContent || "1", 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  function getRules(slug) {
    return window.PULSE_SHOPIFY_PRODUCT_RULES?.[slug] || null;
  }

  function availabilityNode() {
    let node = document.querySelector("[data-p01-availability]");
    if (node) return node;
    const button = document.querySelector(".add-to-cart-button");
    if (!button?.parentNode) return null;
    node = document.createElement("div");
    node.setAttribute("data-p01-availability", "");
    node.setAttribute("aria-live", "polite");
    node.style.cssText = "margin-top:8px;font-size:11px;line-height:1.45;color:#746d64";
    button.parentNode.insertBefore(node, button.nextSibling);
    return node;
  }

  function setStatus(message, state) {
    const button = document.querySelector(".add-to-cart-button");
    const node = availabilityNode();
    if (node) {
      node.textContent = message || "";
      node.style.color = state === "error" ? "#7d281b" : "#746d64";
    }
    if (!button) return;
    button.dataset.shopifyState = state || "";
    button.setAttribute("aria-disabled", String(state === "loading" || state === "error" || state === "unavailable"));
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function updateDisplayedPrice(price) {
    const node = document.querySelector(".product-price");
    if (node && Number.isFinite(Number(price))) node.textContent = money(price);
  }

  async function refreshProduct(slug) {
    const activeSlug = String(slug || getProductSlug()).toLowerCase();
    const rules = getRules(activeSlug);
    if (!rules) throw new Error("product_rules_missing");
    setStatus("Checking current price and availability…", "loading");

    const response = await fetch(API + "/api/storefront/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: activeSlug })
    });
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "product_load_failed");

    const variantsBySku = {};
    (data.variants || []).forEach(function (variant) {
      variantsBySku[String(variant.sku || "").toUpperCase()] = variant;
    });
    const live = { ...data.product, variantsBySku, loadedAt: Date.now() };
    productCache.set(activeSlug, live);
    setStatus("", "ready");
    syncButtonVariant();
    return live;
  }

  function selectionValues(slug, rules) {
    const values = {};
    const keyOrder = Array.isArray(rules.keyOrder) ? rules.keyOrder : [];
    const defaults = rules.defaults || {};
    const derive = rules.derive || {};

    for (const groupName of keyOrder) {
      let value;
      if (typeof derive[groupName] === "function") {
        value = derive[groupName]({ slug, values, getSelection, getQuantity });
      } else {
        value = getSelection(groupName);
      }
      if ((value === null || value === undefined || value === "") && defaults[groupName] !== undefined) value = defaults[groupName];
      if (value === null || value === undefined || value === "") return null;
      values[groupName] = String(value).toLowerCase();
    }
    return values;
  }

  function resolveCurrentVariant() {
    const slug = getProductSlug();
    const rules = getRules(slug);
    const live = productCache.get(slug);
    if (!rules || !live) return null;

    const values = selectionValues(slug, rules);
    if (!values) return null;
    const sku = String(rules.buildSku?.(values) || "").toUpperCase();
    const variant = live.variantsBySku?.[sku];
    if (!variant) {
      console.warn("PULSE:01 live Shopify variant not found:", { slug, sku, values });
      return null;
    }

    return {
      slug,
      productName: live.name || rules.productName || slug,
      shopifyProductId: live.id || null,
      selections: values,
      variantId: String(variant.id),
      variantGid: variant.gid || null,
      sku,
      quantity: getQuantity(),
      price: Number(variant.price),
      available: Boolean(variant.available),
      verifiedAt: live.loadedAt
    };
  }

  function buildCartUrl(resolved) {
    return "https://" + SHOPIFY_DOMAIN + "/cart/" + resolved.variantId + ":" + resolved.quantity;
  }

  function clearButtonVariant(button) {
    ["shopifyVariantId", "shopifySku", "shopifyCartUrl", "shopifyProductSlug", "shopifyPrice", "shopifyAvailable"].forEach(function (key) {
      delete button.dataset[key];
    });
  }

  function syncButtonVariant() {
    const button = document.querySelector(".add-to-cart-button");
    if (!button) return null;
    const resolved = resolveCurrentVariant();
    if (!resolved) {
      clearButtonVariant(button);
      if (productCache.has(getProductSlug())) setStatus("This option combination is not available.", "error");
      return null;
    }

    const cartUrl = buildCartUrl(resolved);
    button.dataset.shopifyVariantId = resolved.variantId;
    button.dataset.shopifySku = resolved.sku;
    button.dataset.shopifyCartUrl = cartUrl;
    button.dataset.shopifyProductSlug = resolved.slug;
    button.dataset.shopifyPrice = String(resolved.price);
    button.dataset.shopifyAvailable = String(resolved.available);
    updateDisplayedPrice(resolved.price);

    if (!resolved.available) setStatus("This configuration is currently unavailable.", "unavailable");
    else setStatus("", "ready");
    return { ...resolved, cartUrl };
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-option-button], .quantity-plus, .quantity-minus")) {
      window.setTimeout(syncButtonVariant, 0);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    readyPromise = refreshProduct().catch(function (error) {
      console.error("PULSE:01 live Shopify product load failed:", error);
      setStatus("Current price and availability could not be verified. Please try again.", "error");
      return null;
    });
  });

  window.PULSE_SHOPIFY = {
    engineVersion: "3.0.0",
    checkoutEnabled: false,
    shopifyDomain: SHOPIFY_DOMAIN,
    getProductSlug,
    getSelection,
    resolveCurrentVariant,
    syncButtonVariant,
    refreshProduct,
    ready: function () { return readyPromise || Promise.resolve(productCache.get(getProductSlug()) || null); }
  };
})();
