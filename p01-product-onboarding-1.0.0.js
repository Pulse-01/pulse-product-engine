(() => {
  const API = 'https://pulse-commerce-engine.vercel.app';
  let catalog = null;
  let currentReview = null;

  function addStyles() {
    if (document.getElementById('p01-onboarding-styles')) return;
    const style = document.createElement('style');
    style.id = 'p01-onboarding-styles';
    style.textContent = `
      .cc-onboarding{border:1px solid rgba(29,29,27,.18);padding:28px;margin:18px 0;background:#fff}
      .cc-onboarding-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}
      .cc-onboarding h2{margin:0 0 6px;font-family:inherit;font-size:28px;font-weight:400}.cc-onboarding p{margin:0;color:#6b6964;font-size:13px;line-height:1.5}
      .cc-onboarding-tag{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#6b6964;white-space:nowrap}
      .cc-onboarding-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 20px}
      .cc-onboarding-step{border-top:2px solid #d8d3ca;padding:10px 0;color:#77736b;font-size:10px;letter-spacing:.05em;text-transform:uppercase}.cc-onboarding-step strong{display:block;margin-bottom:3px;color:#1d1d1b;font-size:11px}
      .cc-onboarding-step.is-ready{border-color:#a88d5a}.cc-onboarding-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .cc-onboarding-field{display:flex;flex-direction:column;gap:6px}.cc-onboarding-field label{font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:#5d5a55}
      .cc-onboarding-field select,.cc-onboarding-field input{width:100%;box-sizing:border-box;border:1px solid rgba(29,29,27,.28);background:#fff;padding:11px 12px;font:inherit;color:#1d1d1b}
      .cc-onboarding-field select:focus,.cc-onboarding-field input:focus{outline:1px solid #a88d5a;border-color:#a88d5a}.cc-onboarding-help{font-size:11px!important}
      .cc-onboarding-review{margin-top:16px;border:1px solid rgba(29,29,27,.14);padding:16px;background:#faf8f3}.cc-onboarding-review h3{margin:0 0 10px;font-size:14px}
      .cc-onboarding-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cc-onboarding-check{padding:10px;background:#fff;font-size:11px;line-height:1.45}.cc-onboarding-check strong{display:block;margin-bottom:3px}.cc-onboarding-check.is-error{background:#fff0ed;color:#7d281b}.cc-onboarding-check.is-ready{background:#edf7ef;color:#205d2d}
      .cc-onboarding-options{margin-top:12px;font-size:11px;line-height:1.6;color:#5d5a55}.cc-onboarding-options strong{color:#1d1d1b}
      .cc-onboarding-actions{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid rgba(29,29,27,.14)}
      .cc-onboarding-actions button{border:1px solid #1d1d1b;padding:11px 15px;background:#fff;color:#1d1d1b;font:inherit;font-size:10px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}.cc-onboarding-actions button[data-onboard-enable]{background:#1d1d1b;color:#fff}.cc-onboarding-actions button:disabled{opacity:.38;cursor:not-allowed}
      .cc-onboarding-key{display:flex;flex-direction:column;gap:5px;min-width:220px;margin-left:auto}.cc-onboarding-key label{font-size:10px;letter-spacing:.06em;text-transform:uppercase}.cc-onboarding-key input{border:1px solid rgba(29,29,27,.28);padding:10px 12px}
      .cc-onboarding-status{margin-top:12px;padding:12px 14px;background:#f7f5f0;font-size:12px;line-height:1.5}.cc-onboarding-status.is-error{background:#fff0ed;color:#7d281b}.cc-onboarding-status.is-success{background:#edf7ef;color:#205d2d}
      @media(max-width:767px){.cc-onboarding{padding:20px}.cc-onboarding-head{display:block}.cc-onboarding-tag{display:block;margin-top:8px}.cc-onboarding-steps,.cc-onboarding-grid,.cc-onboarding-checks{grid-template-columns:1fr}.cc-onboarding-key{margin-left:0;width:100%}}
    `;
    document.head.appendChild(style);
  }

  function buildPanel() {
    if (document.getElementById('p01-product-onboarding')) return document.getElementById('p01-product-onboarding');
    const panel = document.createElement('section');
    panel.id = 'p01-product-onboarding';
    panel.className = 'cc-onboarding';
    panel.innerHTML = `
      <div class="cc-onboarding-head"><div><h2>Onboard a product</h2><p>Connect a Webflow product to Shopify, validate every variant, and enable it only when the storefront mapping is complete.</p></div><span class="cc-onboarding-tag">Guided setup</span></div>
      <div class="cc-onboarding-steps">
        <div class="cc-onboarding-step" data-step="product"><strong>01 · Product</strong>Choose the Webflow record</div>
        <div class="cc-onboarding-step" data-step="connection"><strong>02 · Connection</strong>Match the Shopify product</div>
        <div class="cc-onboarding-step" data-step="variants"><strong>03 · Variants</strong>Check SKU health</div>
        <div class="cc-onboarding-step" data-step="storefront"><strong>04 · Storefront</strong>Enable when ready</div>
      </div>
      <div class="cc-onboarding-grid">
        <div class="cc-onboarding-field"><label for="cc-onboard-webflow">Webflow product</label><select id="cc-onboard-webflow" data-onboard-webflow></select><p class="cc-onboarding-help">The product page and pricing record managed in Webflow CMS.</p></div>
        <div class="cc-onboarding-field"><label for="cc-onboard-shopify">Shopify product</label><select id="cc-onboard-shopify" data-onboard-shopify></select><p class="cc-onboarding-help">The Shopify product that owns the purchasable variants.</p></div>
        <div class="cc-onboarding-field"><label for="cc-onboard-prefix">SKU family</label><input id="cc-onboard-prefix" data-onboard-prefix autocomplete="off" placeholder="Example: DRIFT"><p class="cc-onboarding-help">All linked variants must begin with this prefix.</p></div>
        <div class="cc-onboarding-field"><label>Current state</label><input data-onboard-current readonly value="Loading…"><p class="cc-onboarding-help">Draft connections do not appear on the storefront.</p></div>
      </div>
      <div class="cc-onboarding-review" data-onboard-review><h3>Connection review</h3><p>Select a product pair, then inspect the connection.</p></div>
      <div class="cc-onboarding-actions">
        <button type="button" data-onboard-inspect>Inspect connection</button>
        <div class="cc-onboarding-key"><label for="cc-onboard-key">Control key · required to save</label><input id="cc-onboard-key" type="password" autocomplete="off" placeholder="Enter only when ready"></div>
        <button type="button" data-onboard-save disabled>Save as draft</button>
        <button type="button" data-onboard-enable disabled>Enable storefront</button>
      </div>
      <div class="cc-onboarding-status" data-onboard-status>Loading Webflow and Shopify products…</div>`;
    const dashboard = document.getElementById('p01-product-dashboard');
    const syncPanel = document.querySelector('.cc-panel-wrap');
    if (dashboard?.parentNode) dashboard.insertAdjacentElement('afterend', panel);
    else if (syncPanel?.parentNode) syncPanel.parentNode.insertBefore(panel, syncPanel);
    else document.body.appendChild(panel);
    return panel;
  }

  async function request(body, key) {
    const response = await fetch(API + '/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Pulse-Control-Key': key } : {}) },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.data = data;
      throw error;
    }
    return data;
  }

  function productById(id) { return catalog?.webflowProducts?.find((item) => item.id === id); }
  function shopifyByHandle(handle) { return catalog?.shopifyProducts?.find((item) => item.handle === handle); }

  function setStatus(message, type) {
    const node = buildPanel().querySelector('[data-onboard-status]');
    node.className = 'cc-onboarding-status' + (type ? ` is-${type}` : '');
    node.textContent = message;
  }

  function markSteps(review) {
    const panel = buildPanel();
    panel.querySelectorAll('[data-step]').forEach((step) => step.classList.remove('is-ready'));
    if (panel.querySelector('[data-onboard-webflow]').value) panel.querySelector('[data-step="product"]').classList.add('is-ready');
    if (review?.checks?.connection) panel.querySelector('[data-step="connection"]').classList.add('is-ready');
    if (review?.checks?.registry) panel.querySelector('[data-step="variants"]').classList.add('is-ready');
    if (review?.checks?.readyToEnable) panel.querySelector('[data-step="storefront"]').classList.add('is-ready');
  }

  function renderReview(review) {
    const panel = buildPanel();
    const box = panel.querySelector('[data-onboard-review]');
    const mapping = review.checks.storefrontMapping;
    const registry = review.checks.registry;
    const options = review.shopifyProduct.optionGroups.length
      ? review.shopifyProduct.optionGroups.map((group) => `<strong>${group.name}:</strong> ${group.values.join(', ')}`).join('<br>')
      : '<strong>Options:</strong> Shopify uses SKU-defined variants for this product.';
    box.innerHTML = `
      <h3>${review.webflowProduct.name} ↔ ${review.shopifyProduct.title}</h3>
      <div class="cc-onboarding-checks">
        <div class="cc-onboarding-check is-ready"><strong>Connection ready</strong>${review.shopifyProduct.handle}</div>
        <div class="cc-onboarding-check ${registry ? 'is-ready' : 'is-error'}"><strong>${registry ? 'Variants healthy' : 'Variants need attention'}</strong>${review.shopifyProduct.variantCount} variants · ${review.health.errorCount} errors</div>
        <div class="cc-onboarding-check ${mapping ? 'is-ready' : 'is-error'}"><strong>${mapping ? 'Storefront mapping ready' : 'Mapping still required'}</strong>${mapping ? 'Configurator can resolve exact variants.' : 'Save the connection as a draft; enabling remains locked.'}</div>
      </div>
      <div class="cc-onboarding-options">${options}</div>`;
    panel.querySelector('[data-onboard-save]').disabled = false;
    panel.querySelector('[data-onboard-enable]').disabled = !review.checks.readyToEnable;
    markSteps(review);
  }

  function syncSelection() {
    const panel = buildPanel();
    const wf = productById(panel.querySelector('[data-onboard-webflow]').value);
    const shopifySelect = panel.querySelector('[data-onboard-shopify]');
    const prefix = panel.querySelector('[data-onboard-prefix]');
    if (!wf) return;
    const match = shopifyByHandle(wf.shopifyHandle) || shopifyByHandle(wf.slug);
    if (match) shopifySelect.value = match.handle;
    const selectedShopify = shopifyByHandle(shopifySelect.value);
    prefix.value = wf.skuPrefix || selectedShopify?.suggestedPrefix || '';
    panel.querySelector('[data-onboard-current]').value = wf.commerceEnabled ? 'Storefront enabled' : (wf.shopifyHandle ? 'Connected draft' : 'Setup required');
    currentReview = null;
    panel.querySelector('[data-onboard-save]').disabled = true;
    panel.querySelector('[data-onboard-enable]').disabled = true;
    panel.querySelector('[data-onboard-review]').innerHTML = '<h3>Connection review</h3><p>Select Inspect connection to validate the product pair and every Shopify SKU.</p>';
    markSteps(null);
  }

  async function loadCatalog() {
    const panel = buildPanel();
    try {
      catalog = await request({ action: 'load' });
      const wfSelect = panel.querySelector('[data-onboard-webflow]');
      const shopifySelect = panel.querySelector('[data-onboard-shopify]');
      wfSelect.innerHTML = catalog.webflowProducts.map((item) => `<option value="${item.id}">${item.name} · ${item.productType}</option>`).join('');
      shopifySelect.innerHTML = catalog.shopifyProducts.map((item) => `<option value="${item.handle}">${item.title} · ${item.variantCount} variants · ${item.status}</option>`).join('');
      const firstIncomplete = catalog.webflowProducts.find((item) => !item.commerceEnabled) || catalog.webflowProducts[0];
      if (firstIncomplete) wfSelect.value = firstIncomplete.id;
      syncSelection();
      setStatus(`${catalog.webflowProducts.length} Webflow products · ${catalog.shopifyProducts.length} Shopify products available for onboarding.`);
    } catch (error) {
      setStatus(`Could not load product onboarding: ${error.message}`, 'error');
    }
  }

  async function inspectConnection() {
    const panel = buildPanel();
    setStatus('Inspecting the Shopify connection and every variant…');
    try {
      currentReview = await request({
        action: 'inspect',
        webflowProductId: panel.querySelector('[data-onboard-webflow]').value,
        shopifyHandle: panel.querySelector('[data-onboard-shopify]').value,
        skuPrefix: panel.querySelector('[data-onboard-prefix]').value
      });
      renderReview(currentReview);
      setStatus(currentReview.checks.readyToEnable ? 'All onboarding checks passed. This product can be enabled.' : 'Connection reviewed. Save it as a draft; remaining checks are shown above.', currentReview.checks.readyToEnable ? 'success' : '');
    } catch (error) {
      setStatus(`Connection review failed: ${error.message}`, 'error');
    }
  }

  async function save(enable) {
    const panel = buildPanel();
    if (!currentReview) return setStatus('Inspect the connection before saving.', 'error');
    const key = panel.querySelector('[data-onboard-key]').value;
    if (!key) return setStatus('Enter the Control Center key to save this connection.', 'error');
    setStatus(enable ? 'Enabling the verified storefront connection…' : 'Saving the product connection as a draft…');
    try {
      const result = await request({
        action: 'save',
        confirm: true,
        enable,
        webflowProductId: currentReview.webflowProduct.id,
        shopifyHandle: currentReview.shopifyProduct.handle,
        skuPrefix: currentReview.skuPrefix
      }, key);
      panel.querySelector('[data-onboard-key]').value = '';
      setStatus(enable ? `${result.product.name} is enabled for the storefront.` : `${result.product.name} connection saved as a draft.`, 'success');
      await loadCatalog();
      if (typeof window.PULSE_CONTROL_RELOAD_PRODUCTS === 'function') window.PULSE_CONTROL_RELOAD_PRODUCTS();
      else window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      const message = error.message === 'invalid_control_key' ? 'Control key not accepted.' : error.message === 'product_not_ready_to_enable' ? 'This product cannot be enabled until all onboarding checks pass.' : error.message;
      setStatus(message, 'error');
    }
  }

  function init() {
    addStyles();
    const panel = buildPanel();
    panel.querySelector('[data-onboard-webflow]').addEventListener('change', syncSelection);
    panel.querySelector('[data-onboard-shopify]').addEventListener('change', () => {
      const match = shopifyByHandle(panel.querySelector('[data-onboard-shopify]').value);
      if (match?.suggestedPrefix) panel.querySelector('[data-onboard-prefix]').value = match.suggestedPrefix;
      currentReview = null;
      panel.querySelector('[data-onboard-save]').disabled = true;
      panel.querySelector('[data-onboard-enable]').disabled = true;
      markSteps(null);
    });
    panel.querySelector('[data-onboard-prefix]').addEventListener('input', () => {
      currentReview = null;
      panel.querySelector('[data-onboard-save]').disabled = true;
      panel.querySelector('[data-onboard-enable]').disabled = true;
      markSteps(null);
    });
    panel.querySelector('[data-onboard-inspect]').addEventListener('click', inspectConnection);
    panel.querySelector('[data-onboard-save]').addEventListener('click', () => save(false));
    panel.querySelector('[data-onboard-enable]').addEventListener('click', () => save(true));
    loadCatalog();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
