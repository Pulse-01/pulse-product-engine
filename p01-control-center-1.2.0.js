(() => {
  const API = 'https://pulse-commerce-engine.vercel.app';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const fieldGroups = [
    ['Metal pricing', [
      ['goldPerGram', 'Gold price / gram', 'number', '0.01'],
      ['silverPerGram', 'Silver price / gram', 'number', '0.01'],
      ['gold18kPurityFactor', '18K purity factor', 'number', '0.0001'],
      ['gold22kPurityFactor', '22K purity factor', 'number', '0.0001'],
      ['gold24kPurityFactor', '24K purity factor', 'number', '0.0001']
    ]],
    ['Production costs', [
      ['laborLevelA', 'Labor level A', 'number', '0.01'],
      ['laborLevelB', 'Labor level B', 'number', '0.01'],
      ['laborLevelC', 'Labor level C', 'number', '0.01'],
      ['packagingStandard', 'Packaging standard', 'number', '0.01'],
      ['packagingPremium', 'Packaging premium', 'number', '0.01'],
      ['packagingLuxury', 'Packaging luxury', 'number', '0.01'],
      ['shippingAllowance', 'Shipping allowance', 'number', '0.01']
    ]],
    ['Retail pricing', [
      ['retailMultiplier', 'Retail multiplier', 'number', '0.1'],
      ['roundingIncrement', 'Rounding increment', 'number', '1']
    ]],
    ['Campaign', [
      ['campaignActive', 'Campaign active', 'select'],
      ['campaignName', 'Campaign name', 'text'],
      ['campaignMultiplier', 'Campaign multiplier', 'number', '0.1']
    ]]
  ];
  const friendly = Object.fromEntries(fieldGroups.flatMap(([, fields]) => fields.map(([key, label]) => [key, label])));
  let revision = '';
  let reviewedValues = null;

  function addStyles() {
    if (document.getElementById('p01-control-styles')) return;
    const style = document.createElement('style');
    style.id = 'p01-control-styles';
    style.textContent = `
      .cc-settings-panel{border:1px solid rgba(29,29,27,.18);padding:28px;margin:18px 0;background:#fff}
      .cc-settings-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:22px}
      .cc-settings-head h2{margin:0 0 6px;font-family:inherit;font-size:28px;font-weight:400}
      .cc-settings-head p,.cc-settings-note{margin:0;color:#6b6964;font-size:13px;line-height:1.5}
      .cc-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .cc-settings-group{border-top:1px solid rgba(29,29,27,.14);padding-top:16px}
      .cc-settings-group h3{margin:0 0 13px;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
      .cc-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .cc-field{display:flex;flex-direction:column;gap:6px}
      .cc-field label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#5d5a55}
      .cc-field input,.cc-field select{width:100%;box-sizing:border-box;border:1px solid rgba(29,29,27,.28);background:#fff;padding:11px 12px;font:inherit;color:#1d1d1b}
      .cc-field input:focus,.cc-field select:focus{outline:1px solid #a88d5a;border-color:#a88d5a}
      .cc-settings-actions{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-top:22px;padding-top:18px;border-top:1px solid rgba(29,29,27,.14)}
      .cc-settings-actions button{border:1px solid #1d1d1b;padding:12px 18px;background:#fff;color:#1d1d1b;font-size:11px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .cc-settings-actions button.cc-save{background:#1d1d1b;color:#fff}
      .cc-settings-actions button:disabled{opacity:.38;cursor:not-allowed}
      .cc-key-wrap{display:flex;flex-direction:column;gap:5px;min-width:230px;margin-left:auto}
      .cc-key-wrap label{font-size:10px;letter-spacing:.06em;text-transform:uppercase}
      .cc-key-wrap input{border:1px solid rgba(29,29,27,.28);padding:10px 12px}
      .cc-review{margin-top:15px;padding:14px 16px;background:#f7f5f0;font-size:13px;line-height:1.55}
      .cc-review ul{margin:8px 0 0;padding-left:18px}
      .cc-review.is-error{background:#fff0ed;color:#7d281b}
      .cc-review.is-success{background:#edf7ef;color:#205d2d}
      @media(max-width:767px){.cc-settings-grid,.cc-fields{grid-template-columns:1fr}.cc-key-wrap{margin-left:0;width:100%}}
    `;
    document.head.appendChild(style);
  }

  function inputMarkup([key, label, type, step]) {
    if (type === 'select') return `<div class="cc-field"><label for="cc-${key}">${label}</label><select id="cc-${key}" data-setting="${key}"><option value="false">No</option><option value="true">Yes</option></select></div>`;
    return `<div class="cc-field"><label for="cc-${key}">${label}</label><input id="cc-${key}" data-setting="${key}" type="${type}" ${step ? `step="${step}" min="0"` : ''} autocomplete="off"></div>`;
  }

  function buildPanel() {
    if (document.getElementById('p01-settings-panel')) return document.getElementById('p01-settings-panel');
    const panel = document.createElement('section');
    panel.id = 'p01-settings-panel';
    panel.className = 'cc-settings-panel';
    panel.innerHTML = `
      <div class="cc-settings-head"><div><h2>Business settings</h2><p>Edit the pricing inputs used by the preview engine. Shopify remains unchanged.</p></div><div class="cc-settings-note">Webflow CMS · Current Settings</div></div>
      <div class="cc-settings-grid">${fieldGroups.map(([title, fields]) => `<div class="cc-settings-group"><h3>${title}</h3><div class="cc-fields">${fields.map(inputMarkup).join('')}</div></div>`).join('')}</div>
      <div class="cc-settings-actions">
        <button type="button" data-settings-reload>Reload</button>
        <button type="button" data-settings-review>Review changes</button>
        <div class="cc-key-wrap"><label for="cc-control-key">Control key · used only for this save</label><input id="cc-control-key" type="password" autocomplete="off" placeholder="Required to save"></div>
        <button type="button" class="cc-save" data-settings-save disabled>Confirm & save to Webflow</button>
      </div>
      <div class="cc-review" data-settings-status>Loading current settings…</div>`;
    const cards = document.querySelector('.cc-cards-wrap');
    const syncPanel = document.querySelector('.cc-panel-wrap');
    if (cards?.parentNode) cards.parentNode.insertBefore(panel, syncPanel || cards.nextSibling);
    else document.body.appendChild(panel);
    return panel;
  }

  function setStatus(message, state = '') {
    const box = document.querySelector('[data-settings-status]');
    if (!box) return;
    box.className = 'cc-review' + (state ? ` is-${state}` : '');
    box.innerHTML = message;
  }

  function setCards(values) {
    const metrics = document.querySelectorAll('.cc-metric');
    if (metrics[0]) metrics[0].textContent = money.format(values.goldPerGram);
    if (metrics[1]) metrics[1].textContent = `${values.retailMultiplier}×`;
    if (metrics[2]) metrics[2].textContent = values.campaignActive ? 'On' : 'Off';
    if (metrics[3]) metrics[3].textContent = money.format(values.roundingIncrement);
  }

  function populate(values) {
    Object.entries(values).forEach(([key, value]) => {
      const input = document.querySelector(`[data-setting="${key}"]`);
      if (input) input.value = typeof value === 'boolean' ? String(value) : value;
    });
    setCards(values);
    reviewedValues = null;
    const save = document.querySelector('[data-settings-save]');
    if (save) save.disabled = true;
  }

  function collect() {
    const values = {};
    document.querySelectorAll('[data-setting]').forEach((input) => {
      values[input.dataset.setting] = input.type === 'number' ? Number(input.value) : input.dataset.setting === 'campaignActive' ? input.value === 'true' : input.value;
    });
    return values;
  }

  async function request(path, options = {}) {
    const response = await fetch(API + path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.data = data;
      throw error;
    }
    return data;
  }

  async function loadSettings() {
    setStatus('Loading current settings…');
    try {
      const data = await request('/api/settings');
      revision = data.revision;
      populate(data.values);
      setStatus('Current Webflow settings loaded. Make edits, then select <strong>Review changes</strong>.');
    } catch (error) {
      setStatus(`Could not load settings: ${error.message}`, 'error');
    }
  }

  async function reviewSettings() {
    setStatus('Checking proposed settings…');
    try {
      const data = await request('/api/settings', { method: 'POST', body: JSON.stringify({ values: collect() }) });
      reviewedValues = data.values;
      revision = data.revision;
      const save = document.querySelector('[data-settings-save]');
      if (!data.changes.length) {
        save.disabled = true;
        return setStatus('No changes to save. Current Webflow settings already match these values.', 'success');
      }
      save.disabled = false;
      const list = data.changes.map((item) => `<li><strong>${friendly[item.key] || item.key}:</strong> ${item.before ?? '—'} → ${item.after ?? '—'}</li>`).join('');
      setStatus(`<strong>Review ${data.changes.length} change${data.changes.length === 1 ? '' : 's'}:</strong><ul>${list}</ul>Nothing has been saved yet.`);
    } catch (error) {
      reviewedValues = null;
      document.querySelector('[data-settings-save]').disabled = true;
      const fields = error.data?.fields ? '<br>' + Object.keys(error.data.fields).map((key) => friendly[key] || key).join(', ') : '';
      setStatus(`Review failed: ${error.message}${fields}`, 'error');
    }
  }

  async function saveSettings() {
    if (!reviewedValues) return setStatus('Review the changes before saving.', 'error');
    const keyInput = document.getElementById('cc-control-key');
    const key = keyInput.value;
    if (!key) return setStatus('Enter the Control Center key to authorize this save.', 'error');
    const save = document.querySelector('[data-settings-save]');
    save.disabled = true;
    setStatus('Saving reviewed settings to Webflow…');
    try {
      const data = await request('/api/settings', {
        method: 'PATCH',
        headers: { 'X-Pulse-Control-Key': key },
        body: JSON.stringify({ values: reviewedValues, revision, confirm: true })
      });
      keyInput.value = '';
      revision = data.revision;
      populate(data.values);
      setStatus(`Saved ${data.changes.length} reviewed change${data.changes.length === 1 ? '' : 's'} to Webflow. Shopify was not changed.`, 'success');
    } catch (error) {
      save.disabled = false;
      const message = error.message === 'invalid_control_key' ? 'The Control Center key was not accepted.' : error.message === 'settings_changed_reload_required' ? 'Settings changed elsewhere. Reload before saving.' : error.message;
      setStatus(`Save failed: ${message}`, 'error');
    }
  }

  async function previewPrices(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const output = document.querySelector('[data-cc-preview-output]');
    button.setAttribute('aria-busy', 'true');
    if (output) output.textContent = 'Calculating proposed prices…';
    try {
      const response = await request('/api/pricing/preview', { method: 'POST', body: JSON.stringify({ product: 'Drift' }) });
      if (!output) return;
      const rows = response.variants.map((item) => `<tr><td>${item.title}</td><td>${item.sku || '—'}</td><td>${money.format(item.currentPrice)}</td><td>${item.proposedPrice === null ? 'Request' : money.format(item.proposedPrice)}</td><td>${item.status === 'matched' ? 'Matched' : item.status === 'change' ? `${item.delta > 0 ? '+' : ''}${money.format(item.delta)}` : 'Error'}</td></tr>`).join('');
      output.innerHTML = `<p>${response.summary.total} variants checked · ${response.summary.matched} matched · ${response.summary.change} changes · no prices changed</p><div style="overflow:auto"><table><thead><tr><th>Variant</th><th>SKU</th><th>Shopify</th><th>Proposed</th><th>Change</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } catch (error) {
      if (output) output.textContent = `Preview failed: ${error.message}`;
    } finally {
      button.removeAttribute('aria-busy');
    }
  }

  function init() {
    addStyles();
    const panel = buildPanel();
    panel.querySelector('[data-settings-reload]').addEventListener('click', loadSettings);
    panel.querySelector('[data-settings-review]').addEventListener('click', reviewSettings);
    panel.querySelector('[data-settings-save]').addEventListener('click', saveSettings);
    panel.querySelectorAll('[data-setting]').forEach((input) => input.addEventListener('input', () => {
      reviewedValues = null;
      panel.querySelector('[data-settings-save]').disabled = true;
      setStatus('Unsaved edits detected. Select <strong>Review changes</strong> before saving.');
    }));
    document.querySelector('[data-cc-preview-button]')?.addEventListener('click', previewPrices);
    loadSettings();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
