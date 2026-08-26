/* =========================================================
   PULSE:01 VERIFIED STAGING MINI CART
   - Runs only on the Webflow staging hostname
   - Preserves the reusable Shopify variant bridge
   - Stores configured variants locally
   - Opens an on-brand cart drawer before Shopify checkout
========================================================= */
(function () {
  "use strict";

  const ALLOWED_HOST = "pulse-01.webflow.io";
  const SHOPIFY_DOMAIN = "pulse-01.myshopify.com";
  const STORAGE_KEY = "p01:cart:v1";

  if (window.location.hostname !== ALLOWED_HOST) return;

  function money(value) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n);
  }

  function readPrice() {
    const text = document.querySelector(".product-price")?.textContent || "";
    return Number(text.replace(/[^0-9.]/g, "")) || 0;
  }

  function readImage() {
    return document.querySelector('[data-main-image="true"]')?.src || "";
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge(cart);
  }

  function pretty(value) {
    return String(value || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function optionSummary(selections) {
    if (!selections) return "";
    const labels = [];
    Object.keys(selections).forEach(function (key) {
      const value = selections[key];
      if (!value || value === "none" || value === "pendant-only") {
        if (key === "attachment" && value === "pendant-only") labels.push("Pendant Only");
        return;
      }
      if (key === "purity") labels.push(String(value).toUpperCase());
      else if (key === "length" && /^\\d+$/.test(String(value))) labels.push(value + " in");
      else labels.push(pretty(value));
    });
    return labels.join(" · ");
  }

  function addResolved(resolved) {
    if (!resolved?.available) {
      console.warn("PULSE:01 mini cart blocked: variant unavailable.");
      return false;
    }
    const cart = readCart();
    const existing = cart.find(function (item) {
      return item.variantId === resolved.variantId;
    });

    if (existing) {
      existing.quantity += resolved.quantity || 1;
      existing.price = Number(resolved.price) || readPrice() || existing.price;
      existing.image = readImage() || existing.image;
    } else {
      cart.push({
        variantId: String(resolved.variantId),
        sku: resolved.sku || "",
        productName: resolved.productName || "PULSE:01 Piece",
        slug: resolved.slug || "",
        selections: resolved.selections || {},
        quantity: resolved.quantity || 1,
        price: Number(resolved.price) || readPrice(),
        image: readImage(),
        verifiedAt: resolved.verifiedAt || Date.now()
      });
    }

    writeCart(cart);
    renderCart();
    openCart();
    return true;
  }

  function cartSubtotal(cart) {
    return cart.reduce(function (sum, item) {
      return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1));
    }, 0);
  }

  function buildCheckoutUrl(cart) {
    const lines = cart
      .filter(function (item) { return item.variantId && item.quantity > 0; })
      .map(function (item) { return item.variantId + ":" + item.quantity; });
    if (!lines.length) return "";
    return "https://" + SHOPIFY_DOMAIN + "/cart/" + lines.join(",");
  }

  function ensureUI() {
    if (document.getElementById("p01-cart-shell")) return;

    const style = document.createElement("style");
    style.textContent = `
      #p01-cart-shell{position:fixed;inset:0;z-index:12000;pointer-events:none;font-family:Inter Tight,Arial,sans-serif}
      .p01-cart-backdrop{position:absolute;inset:0;background:rgba(20,17,14,.32);backdrop-filter:blur(3px);opacity:0;transition:opacity .45s cubic-bezier(.19,1,.22,1)}
      .p01-cart-drawer{position:absolute;top:0;right:0;width:min(460px,100%);height:100%;background:#f6f3ec;color:#36302a;transform:translateX(100%);transition:transform .55s cubic-bezier(.19,1,.22,1);display:flex;flex-direction:column;box-shadow:-18px 0 60px rgba(20,17,14,.10)}
      #p01-cart-shell.is-open{pointer-events:auto}.is-open .p01-cart-backdrop{opacity:1}.is-open .p01-cart-drawer{transform:translateX(0)}
      .p01-cart-head{display:flex;justify-content:space-between;align-items:center;padding:28px 30px 22px;border-bottom:1px solid #ded7cd}
      .p01-cart-title{font-size:12px;letter-spacing:.18em;text-transform:uppercase}.p01-cart-close{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:#36302a;padding:5px}
      .p01-cart-items{flex:1;overflow:auto;padding:8px 30px}.p01-cart-item{display:grid;grid-template-columns:92px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid #e2dbd2}
      .p01-cart-image{width:92px;height:110px;object-fit:cover;background:#ece4da}.p01-cart-name{font-family:Playfair Display,serif;font-size:24px;font-weight:400;margin:0 0 7px}
      .p01-cart-options{font-size:11px;line-height:1.5;letter-spacing:.04em;color:#746d64;margin-bottom:12px}.p01-cart-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .p01-cart-qty{display:inline-flex;border:1px solid #dcd1c7;height:34px;align-items:center}.p01-cart-qty button{width:32px;height:32px;border:0;background:transparent;cursor:pointer}.p01-cart-qty span{min-width:28px;text-align:center;font-size:12px}
      .p01-cart-price{font-size:13px}.p01-cart-remove{display:inline-block;margin-top:11px;border:0;background:none;padding:0;color:#817970;font-size:10px;text-transform:uppercase;letter-spacing:.12em;cursor:pointer;border-bottom:1px solid #cfc5b9}
      .p01-cart-empty{padding:52px 0;text-align:center;color:#756e66;font-size:13px;line-height:1.6}.p01-cart-foot{padding:22px 30px 28px;border-top:1px solid #ded7cd;background:#f6f3ec}
      .p01-cart-subtotal{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-size:13px}.p01-cart-note{font-size:10px;line-height:1.5;color:#817970;margin-bottom:18px}
      .p01-cart-checkout{width:100%;height:54px;border:0;background:#36302a;color:#f6f3ec;text-transform:uppercase;letter-spacing:.14em;font-size:11px;cursor:pointer;transition:background .2s}.p01-cart-checkout:hover{background:#2b261f}.p01-cart-checkout:disabled{opacity:.45;cursor:default}
      .p01-cart-continue{width:100%;border:0;background:none;margin-top:14px;text-transform:uppercase;letter-spacing:.13em;font-size:10px;color:#6e675f;cursor:pointer}
      .p01-cart-count{display:none;position:absolute;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#a88d5a;color:#fff;font-size:9px;line-height:16px;text-align:center}
      @media(max-width:479px){.p01-cart-head,.p01-cart-foot{padding-left:20px;padding-right:20px}.p01-cart-items{padding-left:20px;padding-right:20px}.p01-cart-item{grid-template-columns:78px 1fr}.p01-cart-image{width:78px;height:94px}}
    `;
    document.head.appendChild(style);

    const shell = document.createElement("div");
    shell.id = "p01-cart-shell";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="p01-cart-backdrop" data-p01-cart-close></div>
      <aside class="p01-cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div class="p01-cart-head"><div class="p01-cart-title">Your Cart</div><button class="p01-cart-close" type="button" aria-label="Close cart" data-p01-cart-close>×</button></div>
        <div class="p01-cart-items" data-p01-cart-items></div>
        <div class="p01-cart-foot">
          <div class="p01-cart-subtotal"><span>Subtotal</span><strong data-p01-cart-subtotal>$0</strong></div>
          <div class="p01-cart-note">Made to order. Complimentary insured shipping. Taxes calculated at checkout.</div>
          <button class="p01-cart-checkout" type="button" data-p01-checkout>Checkout</button>
          <button class="p01-cart-continue" type="button" data-p01-cart-close>Continue shopping</button>
        </div>
      </aside>`;
    document.body.appendChild(shell);

    shell.addEventListener("click", function (event) {
      const close = event.target.closest("[data-p01-cart-close]");
      if (close) { closeCart(); return; }

      const action = event.target.closest("[data-cart-action]");
      if (action) {
        const variantId = action.getAttribute("data-variant-id");
        const cart = readCart();
        const item = cart.find(function (x) { return x.variantId === variantId; });
        if (!item) return;
        const type = action.getAttribute("data-cart-action");
        if (type === "plus") item.quantity += 1;
        if (type === "minus") item.quantity = Math.max(1, item.quantity - 1);
        if (type === "remove") cart.splice(cart.indexOf(item), 1);
        writeCart(cart);
        renderCart();
        return;
      }

      if (event.target.closest("[data-p01-checkout]")) {
        const url = buildCheckoutUrl(readCart());
        if (url) window.location.assign(url);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && shell.classList.contains("is-open")) closeCart();
    });
  }

  function renderCart() {
    ensureUI();
    const cart = readCart();
    const list = document.querySelector("[data-p01-cart-items]");
    const subtotal = document.querySelector("[data-p01-cart-subtotal]");
    const checkout = document.querySelector("[data-p01-checkout]");
    if (!list || !subtotal || !checkout) return;

    if (!cart.length) {
      list.innerHTML = '<div class="p01-cart-empty">Your cart is empty.<br>Choose a piece that speaks to you.</div>';
    } else {
      list.innerHTML = cart.map(function (item) {
        const image = item.image ? '<img class="p01-cart-image" src="' + item.image + '" alt="">' : '<div class="p01-cart-image"></div>';
        return '<div class="p01-cart-item">' + image + '<div>' +
          '<h3 class="p01-cart-name">' + item.productName + '</h3>' +
          '<div class="p01-cart-options">' + optionSummary(item.selections) + '</div>' +
          '<div class="p01-cart-row"><div class="p01-cart-qty">' +
          '<button type="button" aria-label="Decrease quantity" data-cart-action="minus" data-variant-id="' + item.variantId + '">−</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button type="button" aria-label="Increase quantity" data-cart-action="plus" data-variant-id="' + item.variantId + '">+</button></div>' +
          '<div class="p01-cart-price">' + money(item.price * item.quantity) + '</div></div>' +
          '<button type="button" class="p01-cart-remove" data-cart-action="remove" data-variant-id="' + item.variantId + '">Remove</button>' +
          '</div></div>';
      }).join("");
    }

    subtotal.textContent = money(cartSubtotal(cart));
    checkout.disabled = !cart.length;
  }

  function updateCartBadge(cart) {
    const count = (cart || readCart()).reduce(function (sum, item) { return sum + (item.quantity || 0); }, 0);
    document.querySelectorAll("[data-p01-cart-count]").forEach(function (node) {
      node.textContent = count;
      node.style.display = count ? "block" : "none";
    });
  }

  function openCart() {
    ensureUI();
    renderCart();
    const shell = document.getElementById("p01-cart-shell");
    shell.classList.add("is-open");
    shell.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    const shell = document.getElementById("p01-cart-shell");
    if (!shell) return;
    shell.classList.remove("is-open");
    shell.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", async function (event) {
    const button = event.target.closest(".add-to-cart-button");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.getAttribute("aria-busy") === "true") return;

    const bridge = window.PULSE_SHOPIFY;
    button.setAttribute("aria-busy", "true");
    try {
      await bridge?.refreshProduct?.();
      const resolved = bridge?.syncButtonVariant?.();
      if (!resolved || !resolved.variantId) {
        console.warn("PULSE:01 mini cart blocked: no matching Shopify variant.");
        return;
      }
      if (!resolved.available) {
        console.warn("PULSE:01 mini cart blocked: selected variant unavailable.");
        return;
      }
      addResolved(resolved);
    } catch (error) {
      console.error("PULSE:01 mini cart verification failed:", error);
    } finally {
      button.removeAttribute("aria-busy");
    }
  }, true);

  window.PULSE_CART = {
    open: openCart,
    close: closeCart,
    getItems: readCart,
    clear: function () { writeCart([]); renderCart(); },
    checkoutUrl: function () { return buildCheckoutUrl(readCart()); }
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureUI();
    renderCart();
    updateCartBadge();
  });
})();
