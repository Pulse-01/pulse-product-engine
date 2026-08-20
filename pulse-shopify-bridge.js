/* =========================================================
   PULSE:01 SHOPIFY VARIANT BRIDGE
   Drift Pendant — Phase 1

   PURPOSE
   - Reads the current Webflow configurator selections.
   - Resolves them to the exact Shopify variant ID / SKU.
   - Prepares the Shopify cart permalink.
   - Keeps checkout disabled while the Shopify product is DRAFT.

   IMPORTANT
   When Drift is activated and made available to the intended Shopify
   sales channel, change ENABLE_CHECKOUT to true.
========================================================= */

(function () {
  "use strict";

  const SHOPIFY_DOMAIN = "pulse-01.myshopify.com";
  const ENABLE_CHECKOUT = false;

  const DRIFT_VARIANTS = {
    "yellow-gold|18k|pendant-only|pendant|none": ["56034790539556", "DRIFT-YG18-PEND-NONE"],
    "yellow-gold|18k|pendant-only|pendant|clear-quartz": ["56034790572324", "DRIFT-YG18-PEND-CQ"],
    "yellow-gold|18k|with-chain|16|none": ["56034790605092", "DRIFT-YG18-CH16-NONE"],
    "yellow-gold|18k|with-chain|16|clear-quartz": ["56034790637860", "DRIFT-YG18-CH16-CQ"],
    "yellow-gold|18k|with-chain|18|none": ["56034790670628", "DRIFT-YG18-CH18-NONE"],
    "yellow-gold|18k|with-chain|18|clear-quartz": ["56034790703396", "DRIFT-YG18-CH18-CQ"],
    "yellow-gold|18k|with-chain|20|none": ["56034790736164", "DRIFT-YG18-CH20-NONE"],
    "yellow-gold|18k|with-chain|20|clear-quartz": ["56034790768932", "DRIFT-YG18-CH20-CQ"],
    "yellow-gold|18k|with-chain|22|none": ["56034790801700", "DRIFT-YG18-CH22-NONE"],
    "yellow-gold|18k|with-chain|22|clear-quartz": ["56034790834468", "DRIFT-YG18-CH22-CQ"],
    "yellow-gold|18k|with-chain|24|none": ["56034790867236", "DRIFT-YG18-CH24-NONE"],
    "yellow-gold|18k|with-chain|24|clear-quartz": ["56034790900004", "DRIFT-YG18-CH24-CQ"],

    "yellow-gold|22k|pendant-only|pendant|none": ["56034729296164", "DRIFT-YG22-PEND-NONE"],
    "yellow-gold|22k|pendant-only|pendant|clear-quartz": ["56034791391524", "DRIFT-YG22-PEND-CQ"],
    "yellow-gold|22k|with-chain|16|none": ["56034791424292", "DRIFT-YG22-CH16-NONE"],
    "yellow-gold|22k|with-chain|16|clear-quartz": ["56034791457060", "DRIFT-YG22-CH16-CQ"],
    "yellow-gold|22k|with-chain|18|none": ["56034791489828", "DRIFT-YG22-CH18-NONE"],
    "yellow-gold|22k|with-chain|18|clear-quartz": ["56034791522596", "DRIFT-YG22-CH18-CQ"],
    "yellow-gold|22k|with-chain|20|none": ["56034791555364", "DRIFT-YG22-CH20-NONE"],
    "yellow-gold|22k|with-chain|20|clear-quartz": ["56034791588132", "DRIFT-YG22-CH20-CQ"],
    "yellow-gold|22k|with-chain|22|none": ["56034791620900", "DRIFT-YG22-CH22-NONE"],
    "yellow-gold|22k|with-chain|22|clear-quartz": ["56034791653668", "DRIFT-YG22-CH22-CQ"],
    "yellow-gold|22k|with-chain|24|none": ["56034791686436", "DRIFT-YG22-CH24-NONE"],
    "yellow-gold|22k|with-chain|24|clear-quartz": ["56034791719204", "DRIFT-YG22-CH24-CQ"],

    "yellow-gold|24k|pendant-only|pendant|none": ["56034792374564", "DRIFT-YG24-PEND-NONE"],
    "yellow-gold|24k|pendant-only|pendant|clear-quartz": ["56034792407332", "DRIFT-YG24-PEND-CQ"],
    "yellow-gold|24k|with-chain|16|none": ["56034792440100", "DRIFT-YG24-CH16-NONE"],
    "yellow-gold|24k|with-chain|16|clear-quartz": ["56034792472868", "DRIFT-YG24-CH16-CQ"],
    "yellow-gold|24k|with-chain|18|none": ["56034792505636", "DRIFT-YG24-CH18-NONE"],
    "yellow-gold|24k|with-chain|18|clear-quartz": ["56034792538404", "DRIFT-YG24-CH18-CQ"],
    "yellow-gold|24k|with-chain|20|none": ["56034792571172", "DRIFT-YG24-CH20-NONE"],
    "yellow-gold|24k|with-chain|20|clear-quartz": ["56034792603940", "DRIFT-YG24-CH20-CQ"],
    "yellow-gold|24k|with-chain|22|none": ["56034792636708", "DRIFT-YG24-CH22-NONE"],
    "yellow-gold|24k|with-chain|22|clear-quartz": ["56034792669476", "DRIFT-YG24-CH22-CQ"],
    "yellow-gold|24k|with-chain|24|none": ["56034792702244", "DRIFT-YG24-CH24-NONE"],
    "yellow-gold|24k|with-chain|24|clear-quartz": ["56034792735012", "DRIFT-YG24-CH24-CQ"],

    "white-gold|18k|pendant-only|pendant|none": ["56034793160996", "DRIFT-WG18-PEND-NONE"],
    "white-gold|18k|pendant-only|pendant|clear-quartz": ["56034793193764", "DRIFT-WG18-PEND-CQ"],
    "white-gold|18k|with-chain|16|none": ["56034793226532", "DRIFT-WG18-CH16-NONE"],
    "white-gold|18k|with-chain|16|clear-quartz": ["56034793259300", "DRIFT-WG18-CH16-CQ"],
    "white-gold|18k|with-chain|18|none": ["56034793292068", "DRIFT-WG18-CH18-NONE"],
    "white-gold|18k|with-chain|18|clear-quartz": ["56034793324836", "DRIFT-WG18-CH18-CQ"],
    "white-gold|18k|with-chain|20|none": ["56034793357604", "DRIFT-WG18-CH20-NONE"],
    "white-gold|18k|with-chain|20|clear-quartz": ["56034793390372", "DRIFT-WG18-CH20-CQ"],
    "white-gold|18k|with-chain|22|none": ["56034793423140", "DRIFT-WG18-CH22-NONE"],
    "white-gold|18k|with-chain|22|clear-quartz": ["56034793455908", "DRIFT-WG18-CH22-CQ"],
    "white-gold|18k|with-chain|24|none": ["56034793488676", "DRIFT-WG18-CH24-NONE"],
    "white-gold|18k|with-chain|24|clear-quartz": ["56034793521444", "DRIFT-WG18-CH24-CQ"],

    "rose-gold|18k|pendant-only|pendant|none": ["56034794176804", "DRIFT-RG18-PEND-NONE"],
    "rose-gold|18k|pendant-only|pendant|clear-quartz": ["56034794209572", "DRIFT-RG18-PEND-CQ"],
    "rose-gold|18k|with-chain|16|none": ["56034794242340", "DRIFT-RG18-CH16-NONE"],
    "rose-gold|18k|with-chain|16|clear-quartz": ["56034794275108", "DRIFT-RG18-CH16-CQ"],
    "rose-gold|18k|with-chain|18|none": ["56034794307876", "DRIFT-RG18-CH18-NONE"],
    "rose-gold|18k|with-chain|18|clear-quartz": ["56034794340644", "DRIFT-RG18-CH18-CQ"],
    "rose-gold|18k|with-chain|20|none": ["56034794373412", "DRIFT-RG18-CH20-NONE"],
    "rose-gold|18k|with-chain|20|clear-quartz": ["56034794406180", "DRIFT-RG18-CH20-CQ"],
    "rose-gold|18k|with-chain|22|none": ["56034794438948", "DRIFT-RG18-CH22-NONE"],
    "rose-gold|18k|with-chain|22|clear-quartz": ["56034794471716", "DRIFT-RG18-CH22-CQ"],
    "rose-gold|18k|with-chain|24|none": ["56034794504484", "DRIFT-RG18-CH24-NONE"],
    "rose-gold|18k|with-chain|24|clear-quartz": ["56034794537252", "DRIFT-RG18-CH24-CQ"]
  };

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

  function resolveDriftVariant() {
    if (getProductSlug() !== "drift-pendant") return null;

    const metal = getSelection("metal");
    const purity = getSelection("purity");
    const attachment = getSelection("attachment");
    const stone = getSelection("center-stone") || "none";

    if (!metal || !purity || !attachment) return null;

    const length = attachment === "with-chain"
      ? getSelection("length")
      : "pendant";

    if (!length) return null;

    const key = [metal, purity, attachment, length, stone].join("|");
    const variant = DRIFT_VARIANTS[key];

    if (!variant) {
      console.warn("PULSE:01 Shopify variant not found for:", key);
      return null;
    }

    return {
      key,
      variantId: variant[0],
      sku: variant[1],
      quantity: getQuantity()
    };
  }

  function buildCartUrl(resolved) {
    return "https://" + SHOPIFY_DOMAIN + "/cart/" +
      resolved.variantId + ":" + resolved.quantity;
  }

  function syncButtonVariant() {
    const button = document.querySelector(".add-to-cart-button");
    if (!button) return null;

    const resolved = resolveDriftVariant();

    if (!resolved) {
      delete button.dataset.shopifyVariantId;
      delete button.dataset.shopifySku;
      delete button.dataset.shopifyCartUrl;
      return null;
    }

    const cartUrl = buildCartUrl(resolved);

    button.dataset.shopifyVariantId = resolved.variantId;
    button.dataset.shopifySku = resolved.sku;
    button.dataset.shopifyCartUrl = cartUrl;

    return { ...resolved, cartUrl };
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
    checkoutEnabled: ENABLE_CHECKOUT,
    shopifyDomain: SHOPIFY_DOMAIN,
    resolveCurrentVariant: resolveDriftVariant,
    syncButtonVariant
  };
})();
