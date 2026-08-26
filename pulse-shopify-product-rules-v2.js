/* =========================================================
   PULSE:01 STOREFRONT PRODUCT RULES
   Option-to-SKU rules only. Shopify variant IDs, prices, and
   availability are loaded live through the commerce backend.
========================================================= */
(function () {
  "use strict";

  window.PULSE_SHOPIFY_PRODUCT_RULES = window.PULSE_SHOPIFY_PRODUCT_RULES || {};

  window.PULSE_SHOPIFY_PRODUCT_RULES["drift-pendant"] = {
    productName: "Drift Pendant",
    keyOrder: ["metal", "purity", "attachment", "length", "center-stone"],
    defaults: {
      "center-stone": "none"
    },
    derive: {
      length: function (ctx) {
        return ctx.values.attachment === "with-chain" ? ctx.getSelection("length") : "pendant";
      }
    },
    buildSku: function (values) {
      const metal = {
        "yellow-gold": "YG",
        "white-gold": "WG",
        "rose-gold": "RG"
      }[values.metal];
      const purity = String(values.purity || "").replace(/k$/i, "");
      const attachment = values.attachment === "pendant-only"
        ? "PEND"
        : values.attachment === "with-chain" && values.length
          ? "CH" + String(values.length)
          : "";
      const stone = {
        "none": "NONE",
        "clear-quartz": "CQ"
      }[values["center-stone"]];
      if (!metal || !purity || !attachment || !stone) return "";
      return ["DRIFT", metal + purity, attachment, stone].join("-");
    }
  };
})();
