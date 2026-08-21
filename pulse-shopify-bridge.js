/* =========================================================
   PULSE:01 SHOPIFY VARIANT BRIDGE
   Reusable product resolver

   Product-specific variant maps live in pulse-shopify-products.js.
   This engine reads the current Webflow configurator selections,
   resolves the active product to its exact Shopify variant, and
   prepares the cart permalink.
========================================================= */

(function () {
  "use strict";

  if (window.PULSE_SHOPIFY?.engineVersion) return;

  const SHOPIFY_DOMAIN = "pulse-01.myshopify.com";
  const ENABLE_CHECKOUT = false;

  function getProductSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : "";
  }

  function getSelection(groupName) {
    const group = document.querySelector('[data-option-group="' + groupName + '"]');
    if (!group) return null;

    return (
      group.getAttribute("data-selected") ||
      group.querySelector(".is-selected")?.getAttribute("data-option-button") ||
      null
    );
  }

  function getQuantity() {
    const element = document.querySelector(".quantity-value");
    const quantity = parseInt(element?.textContent || "1", 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  function getRegistry() {
    return window.PULSE_SHOPIFY_PRODUCTS || {};
  }

  function getProductConfig(slug) {
    return getRegistry()[slug] || null;
  }

  function resolveCurrentVariant() {
    const slug = getProductSlug();
    const config = getProductConfig(slug);

    if (!config) return null;

    const values = {};
    const keyOrder = Array.isArray(config.keyOrder) ? config.keyOrder : [];
    const defaults = config.defaults || {};
    const derive = config.derive || {};

    for (const groupName of keyOrder) {
      let value;

      if (typeof derive[groupName] === "function") {
        value = derive[groupName]({
          slug,
          values,
          getSelection,
          getQuantity
        });
      } else {
        value = getSelection(groupName);
      }

      if ((value === null || value === undefined || value === "") && defaults[groupName] !== undefined) {
        value = defaults[groupName];
      }

      if (value === null || value === undefined || value === "") {
        return null;
      }

      values[groupName] = String(value);
    }

    const key = keyOrder.map((name) => values[name]).join("|");
    const variant = config.variants?.[key];

    if (!variant) {
      console.warn("PULSE:01 Shopify variant not found:", { slug, key, values });
      return null;
    }

    return {
      slug,
      productName: config.productName || slug,
      shopifyProductId: config.shopifyProductId || null,
      key,
      selections: values,
      variantId: String(variant[0]),
      sku: String(variant[1] || ""),
      quantity: getQuantity()
    };
  }

  function buildCartUrl(resolved) {
    return "https://" + SHOPIFY_DOMAIN + "/cart/" +
      resolved.variantId + ":" + resolved.quantity;
  }

  function clearButtonVariant(button) {
    delete button.dataset.shopifyVariantId;
    delete button.dataset.shopifySku;
    delete button.dataset.shopifyCartUrl;
    delete button.dataset.shopifyProductSlug;
  }

  function syncButtonVariant() {
    const button = document.querySelector(".add-to-cart-button");
    if (!button) return null;

    const resolved = resolveCurrentVariant();

    if (!resolved) {
      clearButtonVariant(button);
      return null;
    }

    const cartUrl = buildCartUrl(resolved);

    button.dataset.shopifyVariantId = resolved.variantId;
    button.dataset.shopifySku = resolved.sku;
    button.dataset.shopifyCartUrl = cartUrl;
    button.dataset.shopifyProductSlug = resolved.slug;

    return { ...resolved, cartUrl };
  }

  function registerProduct(slug, config) {
    if (!slug || !config) return false;
    window.PULSE_SHOPIFY_PRODUCTS = window.PULSE_SHOPIFY_PRODUCTS || {};
    window.PULSE_SHOPIFY_PRODUCTS[String(slug).toLowerCase()] = config;
    syncButtonVariant();
    return true;
  }

  document.addEventListener("click", function (event) {
    const option = event.target.closest("[data-option-button], .quantity-plus, .quantity-minus");
    if (option) {
      window.setTimeout(syncButtonVariant, 0);
    }

    const addToCartButton = event.target.closest(".add-to-cart-button");
    if (!addToCartButton) return;

    event.preventDefault();

    const resolved = syncButtonVariant();

    if (!resolved) {
      console.warn("PULSE:01 Shopify checkout blocked: no matching variant.");
      return;
    }

    window.dispatchEvent(new CustomEvent("pulse:shopify-variant-resolved", {
      detail: resolved
    }));

    if (!ENABLE_CHECKOUT) {
      console.info("PULSE:01 Shopify test mode — resolved variant:", resolved);
      return;
    }

    window.location.assign(resolved.cartUrl);
  });

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(syncButtonVariant, 0);
  });

  window.PULSE_SHOPIFY = {
    engineVersion: "2.0.0",
    checkoutEnabled: ENABLE_CHECKOUT,
    shopifyDomain: SHOPIFY_DOMAIN,
    getProductSlug,
    getProductConfig,
    getSelection,
    resolveCurrentVariant,
    syncButtonVariant,
    registerProduct
  };
})();
