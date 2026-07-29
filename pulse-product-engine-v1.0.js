<!-- =========================================================
     PULSE:01 PRODUCT PAGE ENGINE
     Version: 1.0 Stable + Documented
     Date documented: July 2026

     STATUS
     - Known-good working baseline
     - Center Stone dropdown generated from Variant Pricing Data
     - No functional logic intentionally changed in this documented copy

     IMPORTANT
     Keep the original uploaded file as the untouched recovery version.
     Make future feature changes in a new versioned copy.

     FILE MAP
     1. CSS
        - Gallery image transition
        - Cost debug table
        - Config dropdown system
        - Center Stone template hiding
     2. JavaScript
        - Global helpers
        - Product gallery
        - Metal image switching
        - Purity logic
        - Attachment/length logic
        - Global pricing loader
        - Pricing and configuration engines
        - Dynamic Center Stone options
        - Debug panel
        - Product-type visibility
        - Dropdown and option-button engines
        - Quantity, favorites, and add-to-cart controls
        - Initialization
========================================================= -->

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* =========================================================
     PULSE:01 PRODUCT PAGE ENGINE — JAVASCRIPT
     Version: 1.0 Stable + Documented

     VERIFIED WORKING
     - Product gallery and metal image switching
     - Purity availability and purity-based pricing
     - Attachment and length behavior
     - Ring, bracelet, cuff, and bangle sizing
     - Dynamic Center Stone dropdown
     - Variant Pricing Data parsing and adjustments
     - Calculated, manual, and price-upon-request modes
     - Dropdown controls and product-type visibility

     MAINTENANCE RULE
     Preserve this version as a known-good baseline.
  ========================================================= */

  /* =========================
     GLOBAL HELPERS
  ========================= */

  function isVisible(element) {
    return !!(
      element &&
      (element.offsetWidth ||
       element.offsetHeight ||
       element.getClientRects().length)
    );
  }

  function cleanNumber(value) {
    return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price || 0);
  }

  function formatWeight(value) {
    const number = Number(value) || 0;

    return number.toFixed(2) + "g";
  }

  function formatSignedWeight(value) {
    const number = Number(value) || 0;
    const sign = number > 0 ? "+" : "";

    return sign + number.toFixed(2) + "g";
  }

  function formatSignedPrice(value) {
    const number = Number(value) || 0;

    if (number > 0) {
      return "+" + formatPrice(number);
    }

    if (number < 0) {
      return "-" + formatPrice(Math.abs(number));
    }

    return formatPrice(0);
  }
  
  function roundRetailPrice(price, increment) {
    const safePrice = Number(price) || 0;
    const safeIncrement = Number(increment) || 0;

    if (safeIncrement <= 0) {
      return safePrice;
    }

    return Math.ceil(safePrice / safeIncrement) * safeIncrement;
  }
  
  function getGroup(name) {
    return document.querySelector('[data-option-group="' + name + '"]');
  }

  function getSelectedValue(group) {
    const selected = group?.querySelector(".is-selected");
    return selected ? selected.getAttribute("data-option-button") : null;
  }

  function getVisibleButtons(group) {
    if (!group || group.classList.contains("option-group-hidden")) return [];
    return Array.from(group.querySelectorAll("[data-option-button]")).filter(isVisible);
  }

  function selectButton(group, button) {
    if (!group || !button) return;

    group.querySelectorAll("[data-option-button]").forEach((item) => {
      item.classList.remove("is-selected");
    });

    button.classList.add("is-selected");
    group.setAttribute("data-selected", button.getAttribute("data-option-button"));
  }

  function selectFirstVisibleButton(group) {
    const buttons = getVisibleButtons(group);
    if (!buttons.length) return null;

    selectButton(group, buttons[0]);
    return buttons[0].getAttribute("data-option-button");
  }


  /* =========================
     PRODUCT GALLERY
  ========================= */

  const mainImage = document.querySelector('[data-main-image="true"]');
  const thumbs = document.querySelectorAll('[data-thumb-trigger="true"]');

  function swapMainImage(newSrc, newSrcset) {
    if (!mainImage || !newSrc) return;

    mainImage.classList.add("is-fading");

    setTimeout(() => {
      mainImage.src = newSrc;
      mainImage.srcset = newSrcset || "";
      mainImage.classList.remove("is-fading");
    }, 250);
  }

  function initGallery() {
    if (!mainImage || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", function () {
        const thumbImage = thumb.querySelector('[data-thumb-image="true"]');
        if (!thumbImage) return;

        swapMainImage(thumbImage.src, thumbImage.srcset);

        thumbs.forEach((item) => item.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
    });
  }


  /* =========================
     METAL IMAGE SWITCHING
  ========================= */

  function getMetalImage(key) {
    return document.querySelector('[data-metal-image="' + key + '"]');
  }

  function setThumbImage(slot, sourceImage) {
    if (!sourceImage) return;

    const thumb = document.querySelector('[data-metal-thumb="' + slot + '"]');
    if (!thumb) return;

    const thumbImage = thumb.querySelector('[data-thumb-image="true"]');
    if (!thumbImage) return;

    thumbImage.src = sourceImage.src;
    thumbImage.srcset = sourceImage.srcset || "";
  }

  function switchMetalImages(metal) {
    const heroSource = getMetalImage(metal + "-hero");
    const frontSource = getMetalImage(metal + "-front");

    if (!heroSource || !frontSource) return;

    setThumbImage("hero", heroSource);
    setThumbImage("front", frontSource);

    swapMainImage(heroSource.src, heroSource.srcset);

    thumbs.forEach((item) => item.classList.remove("is-active"));

    const heroThumb = document.querySelector('[data-metal-thumb="hero"]');
    if (heroThumb) heroThumb.classList.add("is-active");
  }


  /* =========================
     PURITY LOGIC
  ========================= */

  function purityIsAvailable(metal, purity) {
    return !!document.querySelector(
      '[data-purity-available="' + metal + "-" + purity + '"]'
    );
  }

  function updatePurityForMetal(metal) {
    const purityGroup = getGroup("purity");
    if (!purityGroup) return;

    if (metal === "silver" || metal === "sterling-silver") {
      purityGroup.classList.add("option-group-hidden");
      return;
    }

    purityGroup.classList.remove("option-group-hidden");

    const purityItems = Array.from(
      purityGroup.querySelectorAll("[data-purity-wrap]")
    );

    purityItems.forEach((item) => {
      const purity = item.getAttribute("data-purity-wrap");
      const available = purityIsAvailable(metal, purity);

      item.classList.toggle("option-group-hidden", !available);

      if (!available) {
        item.classList.remove("is-selected");
      }
    });

   const visiblePurityItems = purityItems.filter((item) => {
  return !item.classList.contains("option-group-hidden");
});
    const dropdown = purityGroup.querySelector("[data-config-dropdown='true']");
    const toggle = dropdown?.querySelector(
      "[data-config-dropdown-toggle='true']"
    );
    const iconWrap = dropdown?.querySelector(
      ".config-dropdown-icon-wrap"
    );

    if (!visiblePurityItems.length) {
      purityGroup.classList.add("option-group-hidden");
      return;
    }

    let selectedItem = visiblePurityItems.find((item) =>
      item.classList.contains("is-selected")
    );

    if (!selectedItem) {
      selectedItem = visiblePurityItems[0];
      selectButton(purityGroup, selectedItem);
    }

    updateDropdownDisplay(purityGroup, selectedItem);

    const hasMultipleChoices = visiblePurityItems.length > 1;

    dropdown?.classList.toggle("is-single-option", !hasMultipleChoices);

    if (iconWrap) {
      iconWrap.style.display = hasMultipleChoices ? "" : "none";
    }

    if (toggle) {
      toggle.style.cursor = hasMultipleChoices ? "pointer" : "default";
    }
  }
  
/* =========================
   ATTACHMENT / LENGTH LOGIC
========================= */

function updateSizeVisibility(attachment) {
  const lengthGroup = getGroup("length");

  const includesChain =
    attachment === "with-chain";

  /*
   * Pendant Length appears only when
   * With Chain is selected.
   */
  setGroupVisibility(
    lengthGroup,
    includesChain
  );

  /*
   * Update dependent groups such as
   * Chain Style and Clasp Style.
   */
  applyConfigurationDependencies();

  if (!includesChain) {
    return;
  }

  /*
   * Preserve a previously selected length.
   * Default to 16 inches only the first time.
   */
  const selectedLength =
    getSelectedValue(lengthGroup);

  if (!selectedLength) {
    const defaultLength =
      selectOptionByValue(
        lengthGroup,
        "16"
      );

    if (!defaultLength) {
      initializeVisibleDropdownGroup(
        lengthGroup
      );
    }
  } else {
    initializeVisibleDropdownGroup(
      lengthGroup
    );
  }
}
  /* =========================
     GLOBAL PRICING
  ========================= */

  let globalPricing = {};

  async function loadGlobalPricing() {
    const debug = document.querySelector(".pricing-debug");

    try {
      const response = await fetch("/business-settings/current-settings/");

      if (!response.ok) {
        if (debug) debug.textContent = "Pricing page not found";
        return;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const priceItems = doc.querySelectorAll("[data-global]");

      if (!priceItems.length) {
        if (debug) debug.textContent = "No global price items found";
        return;
      }

      priceItems.forEach((item) => {
        const key = item.getAttribute("data-global");
        const rawValue = item.textContent.trim();

        globalPricing[key] = {
          raw: rawValue,
          number: cleanNumber(rawValue),
          text: rawValue.toLowerCase()
        };
      });

    } catch (error) {
      if (debug) debug.textContent = "Global pricing error";
      console.warn("Global pricing could not be loaded:", error);
    }
  }

  function getGlobalPrice(key) {
    return globalPricing[key]?.number || 0;
  }

  function getGlobalText(key) {
    return globalPricing[key]?.text || "";
  }


  /* =========================
     PRICE ENGINE
  ========================= */

  function getCostValue(key) {
    const costBank = document.querySelector(".product-cost-bank");
    if (!costBank) return "";

    const costElement = costBank.querySelector('[data-cost="' + key + '"]');
    if (!costElement) return "";

    return costElement.textContent.trim().toLowerCase();
  }

  function getCostNumber(key) {
    return cleanNumber(getCostValue(key));
  }

  /* =========================
     CONFIGURATION ENGINE
  ========================= */

  const CONFIGURATION_GROUPS = [
    "attachment",
    "length",
    "ring-size",
    "bracelet-size",
    "cuff-size",
    "bangle-size",
    "center-stone",
    "finish",
    "accent-stone",
    "texture",
    "birthstone",
    "chain-style",
    "clasp-style",
    "bead-size"
  ];

   const CONFIGURATION_DEPENDENCIES = {

    "chain-style": {
      group: "attachment",
      value: "with-chain"
    },

    "clasp-style": {
      group: "attachment",
      value: "with-chain"
    }

  };  

  function parseVariantPricingData() {
    const raw = getCostValue("variant-pricing-data");

    if (!raw) {
      return [];
    }

    return raw
      .split(/;|\r?\n/)
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const parts = rule
          .split("|")
          .map((part) => part.trim().toLowerCase());

        if (parts.length < 4) {
          return null;
        }

        return {
          group: parts[0],
          option: parts[1],
          metalWeightAdjustment: cleanNumber(parts[2]),
          materialCostAdjustment: cleanNumber(parts[3])
        };
      })
      .filter(Boolean);
  }

/* =========================
   GENERIC DYNAMIC DROPDOWN BUILDER

   PURPOSE
   - Reads options from Variant Pricing Data
   - Builds options from a hidden Webflow template
   - Applies no pricing calculations itself
   - Existing variant pricing engine handles adjustments
========================= */

function buildDynamicDropdown(config) {
  const {
    groupName,
    templateAttribute,
    generatedAttribute,
    hideIfEmpty = true
  } = config;

  const group = getGroup(groupName);

  if (!group) {
    return;
  }

  const templateSelector =
    "[" + templateAttribute + '="true"]';

  const generatedSelector =
    "[" + generatedAttribute + '="true"]';

  const template =
    group.querySelector(templateSelector);

  if (!template) {
    console.warn(
      formatConfigurationLabel(groupName) +
      " template not found."
    );

    return;
  }

  /*
   * Remove previously generated options.
   * This prevents duplicates if initialization
   * runs more than once.
   */
  group
    .querySelectorAll(generatedSelector)
    .forEach((item) => item.remove());

  /*
   * Read only rules belonging to this group.
   */
  const matchingRules =
    parseVariantPricingData().filter(
      (rule) => rule.group === groupName
    );

  /*
   * Keep one option for each unique CMS value.
   */
  const uniqueOptions = [
    ...new Set(
      matchingRules.map(
        (rule) => rule.option
      )
    )
  ];

  /*
   * Hide the full group when no matching
   * Variant Pricing Data exists.
   */
  if (!uniqueOptions.length) {
    if (hideIfEmpty) {
      group.classList.add(
        "option-group-hidden"
      );

      group.style.display = "none";
    }

    return;
  }

  group.classList.remove(
    "option-group-hidden"
  );

  group.style.display = "";

  /*
   * Keep the Webflow template hidden and
   * prevent it from becoming selectable.
   */
  template.style.display = "none";
  template.classList.remove(
    "is-selected"
  );

  template.removeAttribute(
    "data-option-button"
  );

  uniqueOptions.forEach(
    (optionValue) => {
      const option =
        template.cloneNode(true);

      option.removeAttribute(
        templateAttribute
      );

      option.setAttribute(
        generatedAttribute,
        "true"
      );

      option.setAttribute(
        "data-option-button",
        optionValue
      );

      option.style.display = "";

      option.classList.remove(
        "option-group-hidden",
        "is-selected"
      );

      const title =
        option.querySelector(
          ".config-dropdown-title"
        );

      const formattedLabel =
        formatConfigurationLabel(
          optionValue
        );

      if (title) {
        title.textContent =
          formattedLabel;
      } else {
        option.textContent =
          formattedLabel;
      }

      template.parentElement.insertBefore(
        option,
        template
      );
    }
  );

  console.log(
    formatConfigurationLabel(groupName) +
    " options built:",
    uniqueOptions
  );
}


/* =========================
   DYNAMIC OPTION REGISTRY
========================= */

function buildDynamicConfigurationOptions() {
  buildDynamicDropdown({
    groupName: "center-stone",
    templateAttribute:
      "data-center-stone-template",
    generatedAttribute:
      "data-center-stone-generated",
    hideIfEmpty: false
  });

  buildDynamicDropdown({
    groupName: "finish",
    templateAttribute:
      "data-finish-template",
    generatedAttribute:
      "data-finish-generated",
    hideIfEmpty: true
  });

  buildDynamicDropdown({
    groupName: "accent-stone",
    templateAttribute:
        "data-accent-stone-template",
    generatedAttribute:
        "data-accent-stone-generated",
    hideIfEmpty: true
  });

  buildDynamicDropdown({
  groupName: "texture",
  templateAttribute:
    "data-texture-template",
  generatedAttribute:
    "data-texture-generated",
  hideIfEmpty: true
  });

  buildDynamicDropdown({
    groupName: "birthstone",
    templateAttribute:
      "data-birthstone-template",
    generatedAttribute:
      "data-birthstone-generated",
     hideIfEmpty: true
  });

buildDynamicDropdown({
  groupName: "chain-style",
  templateAttribute:
    "data-chain-style-template",
  generatedAttribute:
    "data-chain-style-generated",
  hideIfEmpty: true
});  

buildDynamicDropdown({
  groupName: "bead-size",
  templateAttribute:
    "data-bead-size-template",
  generatedAttribute:
    "data-bead-size-generated",
  hideIfEmpty: true
});
  

buildDynamicDropdown({
  groupName: "clasp-style",
  templateAttribute:
    "data-clasp-style-template",
  generatedAttribute:
    "data-clasp-style-generated",
  hideIfEmpty: true
});


  
}
  
  function getSelectedConfigurationValues() {
    const selections = {};

    CONFIGURATION_GROUPS.forEach((groupName) => {
      const group = getGroup(groupName);

      if (!group || !isVisible(group)) {
        return;
      }

      const selectedValue = getSelectedValue(group);

      if (selectedValue) {
        selections[groupName] = selectedValue.toLowerCase();
      }
    });

    return selections;
  }

  function getVariantAdjustments() {
    const rules = parseVariantPricingData();
    const selections = getSelectedConfigurationValues();

    let metalWeightAdjustment = 0;
    let materialCostAdjustment = 0;

    const matchedRules = [];

    rules.forEach((rule) => {
      const selectedValue = selections[rule.group];

      if (selectedValue && selectedValue === rule.option) {
        metalWeightAdjustment += rule.metalWeightAdjustment;
        materialCostAdjustment += rule.materialCostAdjustment;
        matchedRules.push(rule);
      }
    });

    return {
      selections,
      matchedRules,
      metalWeightAdjustment,
      materialCostAdjustment
    };
  }

  
  function getPurityFactor(purity) {
    const purityKeyMap = {
      "18k": "gold-purity-18k",
      "22k": "gold-purity-22k",
      "24k": "gold-purity-24k"
    };

    const globalKey = purityKeyMap[purity];

    if (!globalKey) {
      return 1;
    }

  const cmsFactor = getGlobalPrice(globalKey);

  if (cmsFactor > 0) {
    return cmsFactor;
  }

    const fallbackFactors = {
      "18k": 18 / 24,
      "22k": 22 / 24,
      "24k": 1
    };

    return fallbackFactors[purity] || 1;
  }

  function getPrimaryMetalCost(primaryMetal, primaryMetalWeight, selectedPurity) {
    if (primaryMetal === "gold") {
      return primaryMetalWeight *
        getGlobalPrice("gold-per-gram") *
        getPurityFactor(selectedPurity);
    }

    if (primaryMetal === "sterling silver" || primaryMetal === "silver") {
      return primaryMetalWeight *
        getGlobalPrice("silver-per-gram");
    }

    if (primaryMetal === "platinum") {
      return primaryMetalWeight *
        getGlobalPrice("platinum-per-gram");
    }

    return 0;
  }

  function getPricingBreakdown() {
    const pricingMode = getCostValue("pricing-mode");
    const manualPrice = getCostNumber("manual-price");

    const primaryMetal = getCostValue("primary-metal");
    const primaryMetalWeight = getCostNumber("primary-metal-weight");

    const variantAdjustments =
      getVariantAdjustments();

    const adjustedMetalWeight =
      Math.max(
        0,
        primaryMetalWeight +
        variantAdjustments.metalWeightAdjustment
      );
    
    const laborLevel = getCostValue("labor-level");
    const packagingLevel = getCostValue("packaging-level");

    const purityGroup = getGroup("purity");
    const selectedPurity = getSelectedValue(purityGroup)?.toLowerCase() || "22k";

    const metalCost = getPrimaryMetalCost(
      primaryMetal,
      adjustedMetalWeight,
      selectedPurity
    );
    const gemstoneActive =
      getCostValue("gemstone-active") === "yes";

    console.log(
      "Gemstone CMS value:",
      getCostValue("gemstone-active"),
      "Active:",
      gemstoneActive
    );    
    
    const additionalMaterialActive =
      getCostValue("additional-material-active") === "yes";

    const baseAdditionalMaterialCost =
      additionalMaterialActive
        ? getCostNumber("additional-material-cost")
        : 0;

    const additionalMaterialCost =
      Math.max(
        0,
        baseAdditionalMaterialCost +
        variantAdjustments.materialCostAdjustment
      );

    const campaignActive = getGlobalText("campaign-active") === "yes";
    const campaignName = getGlobalText("campaign-name");

    const retailMarkup = campaignActive
      ? getGlobalPrice("campaign-multiplier")
      : getGlobalPrice("retail-multiplier");

    const laborCost = getGlobalPrice("labor-" + laborLevel);
    const packagingCost = getGlobalPrice("packaging-" + packagingLevel);
    const shippingAllowance = getGlobalPrice("shipping-allowance");

    const totalCost =
      metalCost +
      additionalMaterialCost +
      laborCost +
      packagingCost +
      shippingAllowance;

    const unroundedRetailPrice =
      totalCost * retailMarkup;

    const roundingIncrement =
      getGlobalPrice("retail-rounding-increment") || 50;

    const retailPrice = roundRetailPrice(
      unroundedRetailPrice,
      roundingIncrement
    );

    return {
      pricingMode,
      manualPrice,

      primaryMetal,
      primaryMetalWeight,

      selectedConfiguration:
        variantAdjustments.selections,

      matchedVariantRules:
        variantAdjustments.matchedRules,
      
      variantMetalWeightAdjustment:
        variantAdjustments.metalWeightAdjustment,

      adjustedMetalWeight,
      selectedPurity,
      metalCost,

      gemstoneActive,
      
      additionalMaterialActive,
      baseAdditionalMaterialCost,

      variantMaterialCostAdjustment:
        variantAdjustments.materialCostAdjustment,

      additionalMaterialCost,

      campaignActive,
      campaignName,
      retailMarkup,

      laborLevel,
      laborCost,

      packagingLevel,
      packagingCost,

      shippingAllowance,

      totalCost,
      unroundedRetailPrice,
      roundingIncrement,
      retailPrice
    };    
  }

  function calculateCostEnginePrice() {
    const b = getPricingBreakdown();

    if (b.pricingMode === "manual") return b.manualPrice;
    if (b.pricingMode === "request") return "request";

    return b.retailPrice;
  }

  function updateDisplayedPrice() {
    const priceElement = document.querySelector(".product-price");
    if (!priceElement) return;

    const calculatedPrice = calculateCostEnginePrice();

    if (calculatedPrice === "request") {
      priceElement.textContent = "Price upon request";
      return;
    }

    priceElement.textContent = formatPrice(calculatedPrice);
  }

  function refreshPricingUI() {
    updateDisplayedPrice();
    updateCostDebugPanel();
  }
  
  function debugRow(label, value) {
    return "<tr><td>" + label + "</td><td>" + value + "</td></tr>";
  }

  function debugSection(label) {
    return "<tr class='debug-section'><td colspan='2'>" + label + "</td></tr>";
  }

 function formatConfigurationLabel(value) {
  if (!value) return "None";

  const specialLabels = {
    mm: "mm",
    cm: "cm",
    g: "g",
    kg: "kg",
    oz: "oz",
    ct: "ct",
    k: "K"
  };

  return String(value)
    .toLowerCase()
    .split("-")
    .map((word) => {
      /*
       * Preserve lowercase measurement units.
       */
      if (specialLabels[word]) {
        return specialLabels[word];
      }

      /*
       * Format karat values:
       * 18k → 18K
       * 22k → 22K
       * 24k → 24K
       */
      if (/^\d+k$/.test(word)) {
        return word.slice(0, -1) + "K";
      }

      /*
       * Preserve common PULSE:01 abbreviations.
       */
      if (word === "ekg") {
        return "EKG";
      }

      if (word === "lvad") {
        return "LVAD";
      }

      /*
       * Standard title-case formatting.
       */
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

  function buildMatchedRulesDebugRows(rules) {
  if (!rules || !rules.length) {
    return debugRow(
      "Applied Rules",
      "None"
    );
  }

  return rules
    .map((rule, index) => {
      const ruleName =
        formatConfigurationLabel(rule.group) +
        ": " +
        formatConfigurationLabel(rule.option);

      const adjustments = [];

      if (rule.metalWeightAdjustment !== 0) {
        adjustments.push(
          formatSignedWeight(
            rule.metalWeightAdjustment
          )
        );
      }

      if (rule.materialCostAdjustment !== 0) {
        adjustments.push(
          formatSignedPrice(
            rule.materialCostAdjustment
          )
        );
      }

      const adjustmentText =
        adjustments.length
          ? adjustments.join(" / ")
          : "No adjustment";

      return debugRow(
        "Rule " + (index + 1),
        ruleName + " — " + adjustmentText
      );
    })
      .join("");
  }

  function updateCostDebugPanel() {
  const output = document.querySelector(".cost-debug-output");
  if (!output) return;

  const b = getPricingBreakdown();

  if (b.pricingMode === "manual") {
    output.innerHTML =
      "<table class='cost-debug-table'>" +
      debugSection("Pricing Mode") +
      debugRow("Mode", "Manual Override") +
      debugRow("Manual Price", formatPrice(b.manualPrice)) +
      "</table>";

    return;
  }

  if (b.pricingMode === "request") {
    output.innerHTML =
      "<table class='cost-debug-table'>" +
      debugSection("Pricing Mode") +
      debugRow("Mode", "Price Upon Request") +
      debugRow("Displayed Price", "Price upon request") +
      "</table>";

    return;
  }

  output.innerHTML =
    "<table class='cost-debug-table'>" +

    debugSection("Pricing") +
    debugRow("Mode", "Calculated") +
    debugRow(
      "Campaign Active",
      b.campaignActive ? "Yes" : "No"
    ) +
    debugRow(
      "Campaign Name",
      b.campaignName || "None"
    ) +
    debugRow(
      "Markup",
      "×" + b.retailMarkup
    ) +

debugSection("Configuration") +

debugRow(
  "Attachment",
  formatConfigurationLabel(
    b.selectedConfiguration?.attachment
  )
) +

debugRow(
  "Length",
  formatConfigurationLabel(
    b.selectedConfiguration?.length
  )
) +

debugRow(
  "Ring Size",
  formatConfigurationLabel(
    b.selectedConfiguration?.["ring-size"]
  )
) +

debugRow(
  "Bracelet Size",
  formatConfigurationLabel(
    b.selectedConfiguration?.["bracelet-size"]
  )
) +

debugRow(
  "Cuff Size",
  formatConfigurationLabel(
    b.selectedConfiguration?.["cuff-size"]
  )
) +

debugRow(
  "Bangle Size",
  formatConfigurationLabel(
    b.selectedConfiguration?.["bangle-size"]
  )
) +
    
debugRow(
  "Center Stone",
  formatConfigurationLabel(
    b.selectedConfiguration?.["center-stone"]
  )
) +    

debugRow(
  "Finish",
  formatConfigurationLabel(
    b.selectedConfiguration?.finish
  )
) +

debugRow(
  "Accent Stone",
  formatConfigurationLabel(
    b.selectedConfiguration?.["accent-stone"]
  )
) +   

debugRow(
  "Texture",
  formatConfigurationLabel(
    b.selectedConfiguration?.texture
  )
) +

debugRow(
  "Birthstone",
  formatConfigurationLabel(
    b.selectedConfiguration?.birthstone
  )
) +    

debugRow(
  "Chain Style",
  formatConfigurationLabel(
    b.selectedConfiguration?.["chain-style"]
  )
) +

debugRow(
  "Clasp Style",
  formatConfigurationLabel(
    b.selectedConfiguration?.["clasp-style"]
  )
) +

debugRow(
  "Bead Size",
  formatConfigurationLabel(
    b.selectedConfiguration?.["bead-size"]
  )
) +   
    
debugRow(
  "Matched Rules",
  b.matchedVariantRules?.length || 0
) +

buildMatchedRulesDebugRows(
  b.matchedVariantRules
) +
    
    debugSection("Primary Metal") +
    debugRow(
      "Primary Metal",
      b.primaryMetal || "None"
    ) +
    debugRow(
      "Reference Metal Weight",
      formatWeight(b.primaryMetalWeight)
    ) +
    debugRow(
      "Variant Weight Adjustment",
      formatSignedWeight(
        b.variantMetalWeightAdjustment
      )
    ) +
    debugRow(
      "Adjusted Metal Weight",
      formatWeight(b.adjustedMetalWeight)
    ) +
    debugRow(
      "Selected Purity",
      b.selectedPurity
    ) +

    debugRow(
      "Purity Factor",
      getPurityFactor(b.selectedPurity).toFixed(4)
    ) +    
    debugRow(
      "Gold Price / g",
      formatPrice(
        getGlobalPrice("gold-per-gram")
      )
    ) +
    debugRow(
      "Silver Price / g",
      formatPrice(
        getGlobalPrice("silver-per-gram")
      )
    ) +
    debugRow(
      "Metal Cost",
      formatPrice(b.metalCost)
    ) +
    debugSection("Center Stone") +

    debugRow(
      "Center Stone Active",
      b.gemstoneActive ? "Yes" : "No"
    ) +

    debugRow(
      "Selected Center Stone",
      formatConfigurationLabel(
        b.selectedConfiguration?.["center-stone"]
      )
    ) +
    debugSection("Additional Materials") +
    debugRow(
      "Additional Material Active",
      b.additionalMaterialActive ? "Yes" : "No"
    ) +
    debugRow(
      "Base Additional Material Cost",
      formatPrice(
        b.baseAdditionalMaterialCost
      )
    ) +
    debugRow(
      "Variant Material Adjustment",
      formatSignedPrice(
        b.variantMaterialCostAdjustment
      )
    ) +
    debugRow(
      "Adjusted Additional Material Cost",
      formatPrice(
        b.additionalMaterialCost
      )
    ) +

    debugSection("Labor, Packaging & Shipping") +
    debugRow(
      "Labor Level",
      b.laborLevel
        ? b.laborLevel.toUpperCase()
        : "None"
    ) +
    debugRow(
      "Labor Cost",
      formatPrice(b.laborCost)
    ) +
    debugRow(
      "Packaging Level",
      b.packagingLevel || "None"
    ) +
    debugRow(
      "Packaging Cost",
      formatPrice(b.packagingCost)
    ) +
    debugRow(
      "Shipping Allowance",
      formatPrice(b.shippingAllowance)
    ) +

    debugSection("Final") +

    "<tr class='debug-total'>" +
    "<td>Subtotal Cost</td>" +
    "<td>" +
    formatPrice(b.totalCost) +
    "</td>" +
    "</tr>" +

    debugRow(
      "Retail Before Rounding",
      formatPrice(b.unroundedRetailPrice)
    ) +

    debugRow(
      "Rounding Increment",
      formatPrice(b.roundingIncrement)
    ) +

    "<tr class='debug-total'>" +
    "<td>Final Retail Price</td>" +
    "<td>" +
    formatPrice(b.retailPrice) +
    "</td>" +
    "</tr>" +

    "</table>";
  }

  /* =========================
     PRODUCT CONFIGURATION
  ========================= */

  function getProductType() {
  const typeElement = document.querySelector(".product-type-value");

  return typeElement
    ? typeElement.textContent.trim().toLowerCase()
    : "";
}

  function initializeVisibleDropdownGroup(group) {
  if (!group || !isVisible(group)) return;

  let selectedValue = getSelectedValue(group);

  if (!selectedValue) {
    selectedValue = selectFirstVisibleButton(group);
  }

  if (!selectedValue) return;

  const selectedButton = group.querySelector(
    '[data-option-button="' + selectedValue + '"]'
  );

  if (selectedButton) {
    updateDropdownDisplay(group, selectedButton);
  }
}

 function setGroupVisibility(group, shouldShow) {
  if (!group) return;

  group.classList.toggle(
    "option-group-hidden",
    !shouldShow
  );

  group.style.display = shouldShow ? "" : "none";
}

function applyConfigurationDependencies() {
  Object.entries(
    CONFIGURATION_DEPENDENCIES
  ).forEach(
    ([groupName, dependency]) => {
      const group = getGroup(groupName);
      const parentGroup =
        getGroup(dependency.group);

      if (!group || !parentGroup) {
        return;
      }

      const selectedValue =
        getSelectedValue(parentGroup);

      const generatedOptions =
        group.querySelectorAll(
          '[data-option-button]'
        );

      const hasOptions =
        generatedOptions.length > 0;

      const shouldShow =
        selectedValue === dependency.value &&
        hasOptions;

      setGroupVisibility(
        group,
        shouldShow
      );

      if (shouldShow) {
        initializeVisibleDropdownGroup(
          group
        );
      }
    }
  );
}
  
  function selectOptionByValue(group, value) {
  if (!group) return null;

  const button = group.querySelector(
    '[data-option-button="' + value + '"]'
  );

  if (!button || !isVisible(button)) return null;

  selectButton(group, button);
  updateDropdownDisplay(group, button);

  return value;
}

  function updateProductConfiguration() {
  const productType = getProductType();

  const attachmentGroup = getGroup("attachment");
  const lengthGroup = getGroup("length");
  const ringSizeGroup = getGroup("ring-size");
  const centerStoneGroup = getGroup("center-stone");
  const braceletSizeGroup = getGroup("bracelet-size");
  const cuffSizeGroup = getGroup("cuff-size");
  const bangleSizeGroup = getGroup("bangle-size");
  const chainStyleGroup = getGroup("chain-style");
    
  const isPendant = productType === "pendant";
  const isNecklace = productType === "necklace";
  const isBeadNecklace = productType === "bead necklace";
  const isRing = productType === "ring";
  const isBracelet = productType === "bracelet";
  const isCuff = productType === "cuff";
  const isBangle = productType === "bangle";

  const usesDirectLength =
    isNecklace || isBeadNecklace;

  setGroupVisibility(attachmentGroup, isPendant);
  setGroupVisibility(ringSizeGroup, isRing);
  setGroupVisibility(braceletSizeGroup, isBracelet);
  setGroupVisibility(cuffSizeGroup, isCuff);
  setGroupVisibility(bangleSizeGroup, isBangle);
  const gemstoneActive =
    getCostValue("gemstone-active") === "yes";

  setGroupVisibility(
    centerStoneGroup,
    gemstoneActive
  );    

  /*
   * Necklace and Bead Necklace always use Length
   * and default to 16 inches.
   */
  if (usesDirectLength && lengthGroup) {
    lengthGroup.classList.remove("option-group-hidden");
    selectOptionByValue(lengthGroup, "16");
  }

  /*
   * Other product types, except Pendant, do not use Length.
   */
  if (!usesDirectLength && !isPendant && lengthGroup) {
    lengthGroup.classList.add("option-group-hidden");
  }

  initializeVisibleDropdownGroup(ringSizeGroup);
  initializeVisibleDropdownGroup(braceletSizeGroup);
  initializeVisibleDropdownGroup(cuffSizeGroup);
  initializeVisibleDropdownGroup(bangleSizeGroup);
  initializeVisibleDropdownGroup(centerStoneGroup);
  initializeVisibleDropdownGroup(getGroup("finish")); 
  initializeVisibleDropdownGroup(getGroup("accent-stone"));
  initializeVisibleDropdownGroup(getGroup("texture")); 
  initializeVisibleDropdownGroup(getGroup("birthstone")); 
  initializeVisibleDropdownGroup(chainStyleGroup);
  initializeVisibleDropdownGroup(getGroup("clasp-style"));    
  initializeVisibleDropdownGroup(getGroup("bead-size"));
    
  applyConfigurationDependencies();

 if (isPendant) {
  const selectedAttachment =
    getSelectedValue(attachmentGroup);

  if (selectedAttachment) {
    updateSizeVisibility(
      selectedAttachment
    );
  } else {
    setGroupVisibility(
      lengthGroup,
      false
    );

    setGroupVisibility(
      chainStyleGroup,
      false
    );
  }
} else {
  const hasChainStyleOptions =
    !!chainStyleGroup?.querySelector(
      '[data-chain-style-generated="true"]'
    );

  setGroupVisibility(
    chainStyleGroup,
    usesDirectLength &&
      hasChainStyleOptions
  );

  if (
    usesDirectLength &&
    hasChainStyleOptions
  ) {
    initializeVisibleDropdownGroup(
      chainStyleGroup
    );
  }
 }
}
  
/* =========================
   CONFIG DROPDOWNS
========================= */

  function closeAllDropdowns() {
  document
    .querySelectorAll("[data-config-dropdown='true']")
    .forEach((dropdown) => {
      dropdown.classList.remove("is-open");
    });

  document
    .querySelectorAll(".dropdown-suppressed")
    .forEach((group) => {
      group.classList.remove("dropdown-suppressed");
    });
}

  function suppressGroupsBelow(group) {
  const groups = Array.from(document.querySelectorAll("[data-option-group]"));
  const index = groups.indexOf(group);

  if (index === -1) return;

  groups.forEach((otherGroup, otherIndex) => {
    if (otherIndex > index) {
      otherGroup.classList.add("dropdown-suppressed");
    }
  });
}

  function initConfigDropdowns() {
  const dropdowns = document.querySelectorAll("[data-config-dropdown='true']");

  dropdowns.forEach((dropdown) => {
    const group = dropdown.closest("[data-option-group]");
    const toggle = dropdown.querySelector("[data-config-dropdown-toggle='true']");
    const selectedDisplay = dropdown.querySelector(".config-dropdown-selected");

    dropdown.classList.remove("is-open");

    if (!group || !toggle || !selectedDisplay) return;

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (dropdown.classList.contains("is-single-option")) {
        return;
      }      
      const willOpen = !dropdown.classList.contains("is-open");

      closeAllDropdowns();

      if (willOpen) {
        dropdown.classList.add("is-open");
        suppressGroupsBelow(group);
      }
    });
  });

  document.addEventListener("click", function () {
    closeAllDropdowns();
  });
}
  
/* =========================
   OPTION BUTTONS
========================= */

const optionGroups = document.querySelectorAll("[data-option-group]");

  function updateDropdownDisplay(group, button) {

  const dropdown = group.querySelector("[data-config-dropdown='true']");
  if (!dropdown) return;

  const selectedDisplay =
    dropdown.querySelector(".config-dropdown-selected");

  if (!selectedDisplay) return;

  selectedDisplay.textContent = button.textContent.trim();

  dropdown.classList.add("has-selection");
  dropdown.classList.remove("is-open");
}

  function initOptionButtons() {

  optionGroups.forEach((group) => {

    const buttons =
      group.querySelectorAll("[data-option-button]");

    buttons.forEach((button) => {

      button.addEventListener("click", function (event) {

        event.preventDefault();

        selectButton(group, button);
        updateDropdownDisplay(group, button);

        const groupName =
          group.getAttribute("data-option-group");

        const selectedValue =
          button.getAttribute("data-option-button");

        if (groupName === "metal") {

          switchMetalImages(selectedValue);
          updatePurityForMetal(selectedValue);

        }

        if (groupName === "attachment") {

          updateSizeVisibility(selectedValue);

        }
        
        refreshPricingUI();

      });

    });

  });

}

  function initializeOptionDefaults() {
  const metalGroup = getGroup("metal");
  const attachmentGroup = getGroup("attachment");

  /*
   * Initialize Metal and its corresponding Purity options.
   */
  const selectedMetal = selectFirstVisibleButton(metalGroup);

  if (selectedMetal) {
    switchMetalImages(selectedMetal);
    updatePurityForMetal(selectedMetal);
  }

  /*
   * First establish which product-specific groups are visible.
   */
  updateProductConfiguration();

  /*
   * Initialize Attachment only when it applies.
   */
  if (attachmentGroup && isVisible(attachmentGroup)) {
    let selectedAttachment = getSelectedValue(attachmentGroup);

    if (!selectedAttachment) {
      selectedAttachment =
        selectFirstVisibleButton(attachmentGroup);
    }

    if (selectedAttachment) {
      const selectedButton = attachmentGroup.querySelector(
        '[data-option-button="' + selectedAttachment + '"]'
      );

      if (selectedButton) {
        updateDropdownDisplay(
          attachmentGroup,
          selectedButton
        );
      }

      updateSizeVisibility(selectedAttachment);
    }
  }

  /*
   * Synchronize whichever product-specific dropdown is visible.
   */
  initializeVisibleDropdownGroup(getGroup("length"));
  initializeVisibleDropdownGroup(getGroup("ring-size"));
  initializeVisibleDropdownGroup(getGroup("bracelet-size"));
  initializeVisibleDropdownGroup(getGroup("cuff-size"));
  initializeVisibleDropdownGroup(getGroup("bangle-size"));
  initializeVisibleDropdownGroup(getGroup("center-stone"));
  initializeVisibleDropdownGroup(getGroup("finish"));
  initializeVisibleDropdownGroup(getGroup("accent-stone")); 
  initializeVisibleDropdownGroup(getGroup("texture"));
  initializeVisibleDropdownGroup(getGroup("birthstone"));
  initializeVisibleDropdownGroup(getGroup("chain-style"));
  initializeVisibleDropdownGroup(getGroup("clasp-style"));
  initializeVisibleDropdownGroup(getGroup("bead-size"));    
  }
  
  /* =========================
     QUANTITY SELECTOR
  ========================= */

  function initQuantitySelector() {
    const minus = document.querySelector(".quantity-minus");
    const plus = document.querySelector(".quantity-plus");
    const value = document.querySelector(".quantity-value");

    if (!minus || !plus || !value) return;

    plus.addEventListener("click", function (e) {
      e.preventDefault();

      let qty = parseInt(value.textContent, 10) || 1;
      value.textContent = qty + 1;
    });

    minus.addEventListener("click", function (e) {
      e.preventDefault();

      let qty = parseInt(value.textContent, 10) || 1;

      if (qty > 1) {
        value.textContent = qty - 1;
      }
    });
  }


  /* =========================
     FAVORITES BUTTON
  ========================= */

  function initFavoritesButton() {
    const favoriteButton = document.querySelector(".favorite-button");

    if (!favoriteButton) return;

    favoriteButton.addEventListener("click", function (e) {
      e.preventDefault();

      favoriteButton.classList.toggle("is-saved");

      favoriteButton.classList.remove("heartbeat");
      void favoriteButton.offsetWidth;
      favoriteButton.classList.add("heartbeat");

      favoriteButton.addEventListener("animationend", function () {
        favoriteButton.classList.remove("heartbeat");
      }, { once: true });
    });
  }


  /* =========================
     ADD TO CART BUTTON
  ========================= */

  function initAddToCartButton() {
    const addToCartButton = document.querySelector(".add-to-cart-button");

    if (!addToCartButton) return;

    addToCartButton.addEventListener("click", function (e) {
      e.preventDefault();

      addToCartButton.classList.remove("is-added");
      void addToCartButton.offsetWidth;
      addToCartButton.classList.add("is-added");

      setTimeout(() => {
        addToCartButton.classList.remove("is-added");
      }, 300);
    });
  } 

  /* =========================
     INITIALIZE
  ========================= */

  async function initProductPage() {
    await loadGlobalPricing();

    initGallery();
    buildDynamicConfigurationOptions();
    initOptionButtons();
    initConfigDropdowns();
    initializeOptionDefaults();
    initQuantitySelector();
    initFavoritesButton();
    initAddToCartButton();
    refreshPricingUI();
  }

  initProductPage();
});