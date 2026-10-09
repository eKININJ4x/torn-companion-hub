/* Shared Torn credentials stay in this browser. Requests go directly to Torn. */
(function () {
  'use strict';
  const SESSION = 'tc:api:session:v1';
  const REMEMBERED = 'tc:api:remembered:v1';
  const REVISION = 'tc:api:revision:v1';
  let generation = 0;
  let pendingValidation = 0;
  let activeKey = '';
  const invalidKeys = new Set();
  const requests = new Set();
  function parse(storage, name) {
    try { return JSON.parse(storage.getItem(name) || 'null'); } catch { return null; }
  }
  function record() {
    try {
      const remembered = parse(localStorage, REMEMBERED);
      if (remembered && typeof remembered.key === 'string') return remembered;
      const session = parse(sessionStorage, SESSION);
      if (session && session.revision === localStorage.getItem(REVISION)) return session;
      sessionStorage.removeItem(SESSION);
    } catch { return null; }
    return null;
  }
  function getKey() { return record()?.key || ''; }
  function errorMessage(data, status) {
    const e = data?.error;
    const code = Number(e?.code);
    if (code === 2 || code === 1) return 'Torn could not accept this API key. Check it or create a replacement on Torn.';
    if (code === 7) return 'This private faction data is unavailable to your key or faction role. Ask faction leadership to check your Faction API Access permission.';
    if (code === 16) return 'This key does not include the requested API selection or access level. Update your key permissions on Torn, then replace it on the hub.';
    if (code === 5) return 'Torn’s API request limit has been reached. Wait a minute, then try again.';
    return e?.error || e?.message || (typeof e === 'string' ? e : null) || 'Torn API request failed (HTTP ' + status + ').';
  }
  function invalidate() {
    generation++;
    if (activeKey) invalidKeys.add(activeKey);
    activeKey = getKey();
    invalidKeys.delete(activeKey);
    for (const controller of requests) {
      if (controller.tcKey !== activeKey) invalidKeys.add(controller.tcKey);
      controller.abort();
    }
    requests.clear();
    window.dispatchEvent(new Event('tc-api-change'));
    render(true);
  }
  function save(key, remember) {
    const revision = Date.now() + ':' + Math.random().toString(36).slice(2);
    // Storage failures are reported instead of claiming the key was saved.
    localStorage.removeItem(REMEMBERED);
    sessionStorage.removeItem(SESSION);
    const value = JSON.stringify({ key, revision, remember: !!remember });
    if (remember) localStorage.setItem(REMEMBERED, value);
    else sessionStorage.setItem(SESSION, value);
    localStorage.setItem(REVISION, revision);
    invalidate();
  }
  function clear() {
    pendingValidation++;
    localStorage.removeItem(REMEMBERED);
    sessionStorage.removeItem(SESSION);
    localStorage.setItem(REVISION, Date.now() + ':clear:' + Math.random());
    invalidate();
  }
  async function request(url, options = {}) {
    const parsed = new URL(url);
    if (parsed.origin !== 'https://api.torn.com') throw new Error('API credentials can only be sent to Torn.');
    const headers = new Headers(options.headers || {});
    const key = parsed.searchParams.get('key') || (headers.get('Authorization') || '').replace(/^ApiKey\s+/i, '');
    const shared = getKey();
    if (invalidKeys.has(key)) throw new Error('This API key was cleared or replaced. Reconnect with your current key.');
    if (shared && key !== shared) throw new Error('Your shared API key changed. Reconnect using the key from the hub.');
    const started = generation;
    const controller = new AbortController();
    controller.tcKey = key;
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    requests.add(controller);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      // Read the body before releasing the controller so clear/replace also cancels body downloads.
      const body = await response.text();
      if (generation !== started) throw new Error('API key changed or cleared. Reconnect before loading more data.');
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch (e) {
      if (controller.signal.aborted) throw new Error('API request cancelled because the key changed or was cleared.');
      throw e;
    } finally {
      requests.delete(controller);
      options.signal?.removeEventListener('abort', abort);
    }
  }
  function render(collapse = false) {
    const saved = record();
    const key = saved?.key || '';
    if (generation === 0) activeKey = key;
    const panel = document.getElementById('tcApiDetails');
    const summary = document.getElementById('tcApiSummary');
    if (panel && (collapse === true || !panel.dataset.initialized)) {
      panel.open = !key;
      panel.dataset.initialized = '1';
    }
    if (summary) summary.textContent = key
      ? 'Shared key saved · Expand to replace or clear it'
      : 'No shared key saved · Expand to enter your key';
    if (document.getElementById('tcKey')) {
      document.getElementById('tcKey').value = key;
      document.getElementById('tcRemember').checked = !!saved?.remember;
      document.getElementById('tcKeyState').textContent = key
        ? 'Shared key saved' + (saved.remember ? ' in this browser.' : ' for this tab session.') + ' Open a tool and press its Connect or Load button.'
        : 'No shared API key saved. Education Manual Mode is available without a key.';
    }
    const note = document.getElementById('tcSharedKeyNotice');
    if (note) note.textContent = key ? 'Using the hub’s shared API key. Connect or load data when ready.' : 'No shared API key saved. Manage your key on the hub, or enter a key here for this tool.';
    for (const id of ['apiKey', 'newApiKey']) {
      const field = document.getElementById(id);
      if (!field) continue;
      if (key || field.dataset.tcShared === '1') field.value = key;
      field.dataset.tcShared = key ? '1' : '0';
      field.readOnly = !!key;
      field.autocomplete = 'off';
    }
  }
  async function validateAndSave(event) {
    event.preventDefault();
    const key = document.getElementById('tcKey').value.trim();
    const remember = document.getElementById('tcRemember').checked;
    const status = document.getElementById('tcKeyState');
    const button = document.getElementById('tcSave');
    const attempt = ++pendingValidation;
    if (!key || /\s/.test(key) || key.length > 256) {
      status.textContent = 'Paste an API key without spaces.';
      button.disabled = false;
      return;
    }
    button.disabled = true;
    status.textContent = 'Checking your key directly with Torn…';
    try {
      // This validates the candidate key; it deliberately does not use the previous shared key.
      const response = await fetch('https://api.torn.com/v2/key/info?key=' + encodeURIComponent(key), { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (attempt !== pendingValidation) return;
      if (!response.ok || data?.error) throw new Error(errorMessage(data, response.status));
      if (!data || typeof data !== 'object' || !data.info) throw new Error('Torn did not return key information. Your previous key has not been replaced.');
      save(key, remember);
      status.textContent += ' Torn accepted the key; each tool checks the permissions it needs when loading.';
    } catch (e) {
      if (attempt === pendingValidation) status.textContent = 'Key was not saved: ' + e.message;
    } finally {
      if (attempt === pendingValidation) button.disabled = false;
    }
  }
  window.TCAuth = { getKey, request, errorMessage, clear };
  window.addEventListener('storage', event => {
    if (event.key === REVISION || event.key === null) {
      pendingValidation++;
      invalidate();
      const button = document.getElementById('tcSave');
      if (button) button.disabled = false;
    }
  });
  window.addEventListener('pageshow', render);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tcKeyForm')?.addEventListener('submit', validateAndSave);
    document.getElementById('tcClear')?.addEventListener('click', () => {
      try {
        clear();
        const saveButton = document.getElementById('tcSave');
        if (saveButton) saveButton.disabled = false;
      } catch { document.getElementById('tcKeyState').textContent = 'Browser storage is unavailable. The key could not be cleared.'; }
    });
    document.getElementById('tcShow')?.addEventListener('click', event => {
      const field = document.getElementById('tcKey');
      field.type = field.type === 'password' ? 'text' : 'password';
      event.currentTarget.textContent = field.type === 'password' ? 'Show' : 'Hide';
    });
    // Capture before Education's visible connector copies its key into the legacy connector.
    document.addEventListener('click', event => {
      if (event.target.closest('#connect, #newConnect, #connectBtn')) render();
    }, true);
    render();
  });
})();
