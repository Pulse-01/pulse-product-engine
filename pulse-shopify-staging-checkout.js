/* PULSE:01 staging-only Shopify checkout enabler */
(function () {
  "use strict";

  const ALLOWED_HOST = "pulse-01.webflow.io";

  if (window.location.hostname !== ALLOWED_HOST) {
    return;
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest(".add-to-cart-button");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const bridge = window.PULSE_SHOPIFY;
    const resolved = bridge?.syncButtonVariant?.();

    if (!resolved || !resolved.cartUrl) {
      console.warn("PULSE:01 staging checkout blocked: no matching Shopify variant.");
      return;
    }

    window.location.assign(resolved.cartUrl);
  }, true);
})();
