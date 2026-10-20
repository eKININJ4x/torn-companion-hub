// ==UserScript==
// @name         Torn OC Requirement Display
// @namespace    torn-companion
// @version      3.5.0
// @author       Torn Companion
// @homepageURL  https://github.com/eKININJ4x/torn-companion-hub
// @updateURL    https://raw.githubusercontent.com/eKININJ4x/torn-companion-hub/main/public/scripts/tc-oc-requirements.meta.js
// @downloadURL  https://raw.githubusercontent.com/eKININJ4x/torn-companion-hub/main/public/scripts/tc-oc-requirements.user.js
// @description  Displays OC role CPR/minimum with editable, locally saved crime and role targets.
// @match        https://www.torn.com/factions.php*
// @match        https://torn.com/factions.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Local display and settings only. No API, external libraries or network requests.
    // Settings are stored on this browser/device and survive userscript updates.
    // These targets are faction settings, not official Torn requirements.
    // Catalogue checked against Torn Wiki and Torn Stats on 20 October 2026.
    const fallbackMinimum = 60;
    const crimeMinimums = {
    "Window of Opportunity": {
        "Looter 1": 60,
        "Looter 2": 60,
        "Engineer": 60,
        "Muscle 1": 60,
        "Muscle 2": 60
    },
    "Smoke and Wing Mirrors": {
        "Car Thief": 70,
        "Imitator": 70,
        "Hustler": 62
    },
    "Market Forces": {
        "Enforcer": 70,
        "Negotiator": 70,
        "Muscle": 65,
        "Lookout": 60,
        "Arsonist": 50
    },
    "Gaslight the Way": {
        "Imitator": 70,
        "Looter 3": 70,
        "Looter 1": 55,
        "Looter 2": 55
    },
    "Snow Blind": {
        "Hustler": 72,
        "Imitator": 70,
        "Muscle": 60
    },
    "Stage Fright": {
        "Sniper": 72,
        "Muscle 1": 68,
        "Muscle 3": 68,
        "Enforcer": 68,
        "Lookout": 70,
        "Muscle 2": 60
    },
    "Leave No Trace": {
        "Imitator": 68,
        "Negotiator": 68,
        "Techie": 65
    },
    "No Reserve": {
        "Techie": 70,
        "Engineer": 68,
        "Car Thief": 68
    },
    "Counter Offer": {
        "Robber": 70,
        "Engineer": 70,
        "Picklock": 65,
        "Hacker": 65,
        "Looter": 55
    },
    "Guardian Angels": {
        "Hustler": 70,
        "Engineer": 70,
        "Enforcer": 65
    },
    "Sneaky Git Grab": {
        "Pickpocket": 75,
        "Imitator": 70,
        "Techie": 70,
        "Hacker": 60
    },
    "Bidding War": {
        "Robber 2": 72,
        "Robber 3": 72,
        "Bomber 2": 68,
        "Driver": 65,
        "Robber 1": 60,
        "Bomber 1": 60
    },
    "Honey Trap": {
        "Muscle 1": 68,
        "Muscle 2": 72,
        "Enforcer": 65
    },
    "Blast from the Past": {
        "Muscle": 75,
        "Engineer": 75,
        "Bomber": 75,
        "Picklock 1": 65,
        "Hacker": 65,
        "Picklock 2": 65
    },
    "Clinical Precision": {
        "Imitator": 75,
        "Cleaner": 65,
        "Cat Burglar": 65,
        "Assassin": 60
    },
    "Break the Bank": {
        "Muscle 3": 72,
        "Thief 2": 72,
        "Muscle 1": 65,
        "Robber": 65,
        "Muscle 2": 65,
        "Thief 1": 60
    },
    "Manifest Cruelty": {
        "Reviver": 75,
        "Interrogator": 75,
        "Hacker": 62,
        "Cat Burglar": 62
    },
    "Stacking the Deck": {
        "Imitator": 70,
        "Hacker": 70,
        "Cat Burglar": 70,
        "Driver": 50
    },
    "First Aid and Abet": {
        "Picklock": 60,
        "Decoy": 60,
        "Pickpocket": 60
    },
    "Mob Mentality": {
        "Looter 1": 60,
        "Looter 2": 60,
        "Looter 3": 60,
        "Looter 4": 60
    },
    "Pet Project": {
        "Kidnapper": 60,
        "Muscle": 60,
        "Picklock": 60
    },
    "Thou Shalt Not Steal": {
        "Picklock": 60,
        "Pickpocket": 60,
        "Thief": 60
    },
    "Cash Me If You Can": {
        "Thief 1": 60,
        "Thief 2": 60,
        "Lookout": 60
    },
    "Best of the Lot": {
        "Picklock": 60,
        "Car Thief": 60,
        "Muscle": 60,
        "Imitator": 60
    },
    "Plucking the Lotus Petal": {
        "Robber 1": 60,
        "Hustler": 60,
        "Robber 2": 60,
        "Muscle": 60
    },
    "Dish It Out": {
        "Assassin": 60,
        "Muscle": 60,
        "Saboteur 1": 60,
        "Saboteur 2": 60,
        "Engineer": 60
    },
    "Cleared for Takeoff": {
        "Imitator": 60,
        "Techie": 60,
        "Pickpocket": 60,
        "Lookout": 60,
        "Assassin": 60,
        "Interrogator": 60
    },
    "Ship Happens": {
        "Engineer": 60,
        "Assassin": 60,
        "Hustler": 60,
        "Spy": 60,
        "Interrogator": 60
    },
    "Lock Stock": {
        "Assassin": 60,
        "Smuggler": 60,
        "Hacker": 60,
        "Muscle 1": 60,
        "Muscle 2": 60
    },
    "Ace in the Hole": {
        "Imitator": 60,
        "Muscle 1": 60,
        "Muscle 2": 60,
        "Hacker": 60,
        "Driver": 60
    },
    "Gone Fission": {
        "Hijacker": 60,
        "Engineer": 60,
        "Pickpocket": 60,
        "Imitator": 60,
        "Bomber": 60
    },
    "Hostile Takeover": {
        "Hacker": 60,
        "Engineer": 60,
        "Cat Burglar": 60,
        "Kidnapper": 60,
        "Negotiator": 60,
        "Muscle": 60
    },
    "Crane Reaction": {
        "Sniper": 60,
        "Lookout": 60,
        "Engineer": 60,
        "Bomber": 60,
        "Muscle 1": 60,
        "Muscle 2": 60
    }
};
    const defaultCrimeNames = [
    "First Aid and Abet",
    "Mob Mentality",
    "Pet Project",
    "Thou Shalt Not Steal",
    "Cash Me If You Can",
    "Best of the Lot",
    "Plucking the Lotus Petal",
    "Dish It Out",
    "Cleared for Takeoff",
    "Ship Happens",
    "Lock Stock",
    "Ace in the Hole",
    "Gone Fission",
    "Hostile Takeover",
    "Crane Reaction"
];


    // Expand repeated roles so each numbered slot can have its own override.
    const repeatedSlots = {
        'Smoke and Wing Mirrors': ['Car Thief', 'Imitator', 'Hustler 1', 'Hustler 2'],
        'Gaslight the Way': ['Imitator 1', 'Looter 1', 'Imitator 2', 'Looter 2', 'Imitator 3', 'Looter 3'],
        'Snow Blind': ['Hustler', 'Imitator', 'Muscle 1', 'Muscle 2']
    };
    const storageKey = 'tc.ocRequirementTargets.v1';
    const rootId = 'tc-oc-target-settings';
    const appearanceKey = 'tc.ocRequirementAppearance.v1';
    const positionKey = 'tc.ocRequirementPosition.v1';
    let movement = null;
    const singletonKey = '__tcOCRequirementDisplay';
    const prior = window[singletonKey];
    if (prior && typeof prior.stop === 'function') prior.stop();

    function makeMovableButton({ anchor, handle, read, write, panel, report }) {
        const gap = 8;
        const original = Object.fromEntries(['left', 'right', 'top', 'bottom'].map(key => [key, anchor.style[key]]));
        let saved = null;
        let active = null;
        let disposed = false;
        let touched = false;
        let writes = Promise.resolve();
        const view = () => ({
            width: Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth),
            height: Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight)
        });
        const clamp = (n, low, high) => Math.max(low, Math.min(Math.max(low, high), n));
        const rect = () => anchor.getBoundingClientRect();
        function placePanel() {
            const box = panel?.();
            if (!box || box.hidden) return;
            const size = view();
            box.style.maxWidth = Math.max(0, size.width - gap * 2) + 'px';
            let bounds = box.getBoundingClientRect();
            if (bounds.height > size.height - gap * 2) {
                box.style.maxHeight = Math.max(60, size.height - gap * 2) + 'px';
                bounds = box.getBoundingClientRect();
            }
            const button = rect();
            const below = size.height - button.bottom - gap * 2;
            const above = button.top - gap * 2;
            const top = below >= bounds.height || below >= above ? button.bottom + gap : button.top - gap - bounds.height;
            box.style.left = clamp(button.left, gap, size.width - bounds.width - gap) + 'px';
            box.style.top = clamp(top, gap, size.height - bounds.height - gap) + 'px';
            box.style.right = 'auto'; box.style.bottom = 'auto';
        }
        function move(left, top) {
            const size = view(), bounds = rect();
            anchor.style.left = Math.round(clamp(left, gap, size.width - bounds.width - gap) * 100) / 100 + 'px';
            anchor.style.top = Math.round(clamp(top, gap, size.height - bounds.height - gap) * 100) / 100 + 'px';
            anchor.style.right = 'auto'; anchor.style.bottom = 'auto';
            placePanel();
        }
        function restore() {
            if (!saved) {
                for (const [key, value] of Object.entries(original)) anchor.style[key] = value;
                const bounds = rect(); move(bounds.left, bounds.top);
            } else {
                const size = view(), bounds = rect();
                move(gap + saved.x * Math.max(0, size.width - bounds.width - gap * 2),
                    gap + saved.y * Math.max(0, size.height - bounds.height - gap * 2));
            }
        }
        function persist(value) {
            writes = writes.then(async () => {
                if (disposed) return false;
                try { await write(value); report?.('Button position saved.'); return true; }
                catch { report?.('Moved for this page, but the position could not be saved.'); return false; }
            });
            return writes;
        }
        function remember() {
            const size = view(), bounds = rect();
            saved = {
                version: 1,
                x: clamp((bounds.left - gap) / Math.max(1, size.width - bounds.width - gap * 2), 0, 1),
                y: clamp((bounds.top - gap) / Math.max(1, size.height - bounds.height - gap * 2), 0, 1)
            };
            return persist(JSON.stringify(saved));
        }
        function release() {
            const id = active?.id; active = null;
            try { if (id !== undefined) handle.releasePointerCapture?.(id); } catch {}
            handle.style.cursor = 'grab';
        }
        function cancel() { if (active) { release(); restore(); } }
        function down(event) {
            if (event.button !== 0 || active) return;
            touched = true;
            event.preventDefault(); event.stopPropagation();
            const bounds = rect();
            active = { id: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top, moved: false };
            handle.focus({ preventScroll: true }); handle.style.cursor = 'grabbing';
            try { handle.setPointerCapture?.(event.pointerId); } catch {}
        }
        function pointerMove(event) {
            if (!active || event.pointerId !== active.id) return;
            const dx = event.clientX - active.x, dy = event.clientY - active.y;
            if (!active.moved && Math.hypot(dx, dy) < 4) return;
            active.moved = true; event.preventDefault();
            move(active.left + dx, active.top + dy);
        }
        function up(event) {
            if (!active || event.pointerId !== active.id) return;
            const moved = active.moved; release();
            if (moved) remember();
        }
        function key(event) {
            const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
            if (!arrows[event.key]) return;
            touched = true; event.preventDefault(); event.stopPropagation();
            const bounds = rect(), step = event.shiftKey ? 10 : 2, [x, y] = arrows[event.key];
            move(bounds.left + x * step, bounds.top + y * step); remember();
        }
        function click(event) { event.preventDefault(); event.stopPropagation(); }
        function resize() { cancel(); restore(); }
        handle.addEventListener('pointerdown', down);
        handle.addEventListener('keydown', key);
        handle.addEventListener('click', click);
        handle.addEventListener('lostpointercapture', cancel);
        window.addEventListener('pointermove', pointerMove, { passive: false });
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
        window.addEventListener('blur', cancel);
        window.addEventListener('resize', resize);
        restore();
        const ready = Promise.resolve().then(read).then(value => {
            if (disposed || touched) return;
            const parsed = typeof value === 'string' ? JSON.parse(value || 'null') : value;
            if (parsed?.version === 1 && [parsed.x, parsed.y].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1)) saved = parsed;
            restore();
        }).catch(() => { if (!disposed && !touched) restore(); });
        return {
            ready, placePanel, reflow() { if (!active) restore(); },
            async reset() {
                if (disposed) return false;
                cancel(); touched = true; saved = null; restore();
                const ok = await persist('');
                if (ok) report?.('Default button position restored.');
                return ok;
            },
            stop() {
                cancel(); disposed = true;
                handle.removeEventListener('pointerdown', down); handle.removeEventListener('keydown', key);
                handle.removeEventListener('click', click); handle.removeEventListener('lostpointercapture', cancel);
                window.removeEventListener('pointermove', pointerMove); window.removeEventListener('pointerup', up);
                window.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', cancel);
                window.removeEventListener('resize', resize);
            }
        };
    }

    function clean(value) {
        return String(value).normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/#/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }
    function roleKey(value) {
        return clean(value).replace(/^impersonator\b/, 'imitator');
    }
    const aliases = {
        'smoke wing and mirrors': 'smoke and wing mirrors',
        'stage fight': 'stage fright',
        'pier pressure': 'manifest cruelty'
    };
    const canonicalCrime = value => aliases[clean(value)] || clean(value);
    const validTarget = value => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
    const minimums = new Map();
    const slots = new Map();
    for (const [crime, roles] of Object.entries(crimeMinimums)) {
        minimums.set(clean(crime), new Map(Object.entries(roles).map(([role, value]) => [roleKey(role), value])));
        slots.set(clean(crime), repeatedSlots[crime] || Object.keys(roles));
    }
    const defaults = new Set(defaultCrimeNames.map(clean));
    const displayed = new Map();
    let loadMessage = '';
    function freshSettings() { return { version: 1, crimes: {} }; }
    function readSettings() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return freshSettings();
            const parsed = JSON.parse(raw);
            if (parsed.version !== 1 || !parsed.crimes || typeof parsed.crimes !== 'object') {
                throw new Error('Unsupported settings');
            }
            const safe = freshSettings();
            for (const [crime, entry] of Object.entries(parsed.crimes)) {
                if (!minimums.has(crime) || !entry || typeof entry !== 'object') continue;
                const result = { roles: {} };
                if (validTarget(entry.default)) result.default = entry.default;
                const allowed = new Set(slots.get(crime).map(roleKey));
                for (const [role, target] of Object.entries(entry.roles || {})) {
                    if (allowed.has(role) && validTarget(target)) result.roles[role] = target;
                }
                safe.crimes[crime] = result;
            }
            return safe;
        } catch {
            loadMessage = 'Saved settings could not be read. Built-in targets are active. Saving will replace the unreadable settings.';
            return freshSettings();
        }
    }
    function readAppearance() {
        try {
            const saved = JSON.parse(localStorage.getItem(appearanceKey) || 'null');
            return saved && /^#[0-9a-f]{6}$/i.test(saved.background) && /^#[0-9a-f]{6}$/i.test(saved.text) ? saved : null;
        } catch { return null; }
    }
    let appearance = readAppearance();
    function paintAppearance(element, colours) {
        element.style.background = colours?.background || 'linear-gradient(180deg,#a855f7,#7c3aed)';
        element.style.color = colours?.text || '#ffffff';
    }
    let settings = readSettings();
    let draft = JSON.parse(JSON.stringify(settings));
    let dirty = false;
    let selectedCrime = clean('Window of Opportunity');
    let panelOpen = false;
    let root = null;
    let shadow = null;

    function builtin(crime, role) {
        const table = minimums.get(crime);
        const name = roleKey(role);
        return table?.get(name) ?? table?.get(name.replace(/\s*\d+$/, '')) ?? fallbackMinimum;
    }
    function targetFrom(config, crime, role) {
        const entry = config.crimes[crime];
        const override = entry?.roles?.[roleKey(role)];
        if (validTarget(override)) return override;
        if (validTarget(entry?.default)) return entry.default;
        return builtin(crime, role);
    }
    function findCrime(header) {
        let node = header.parentElement;
        for (let depth = 0; node && depth < 30; depth++, node = node.parentElement) {
            if (node === document.body || node === document.documentElement) return null;
            const headings = node.querySelectorAll('p[class*="panelTitle___"]');
            if (headings.length > 1) return null;
            if (headings.length === 1) {
                const name = canonicalCrime(headings[0].textContent || '');
                return minimums.has(name) ? name : null;
            }
        }
        return null;
    }
    function message(text) {
        const status = shadow?.getElementById('status');
        if (status) status.textContent = text;
    }
    function captureDraft() {
        if (!shadow) return true;
        const form = shadow.getElementById('targets-form');
        if (!form.reportValidity()) return false;
        const entry = { roles: {} };
        const all = shadow.getElementById('crime-minimum').value.trim();
        if (all !== '') entry.default = Number(all);
        for (const input of shadow.querySelectorAll('[data-role]')) {
            if (input.value.trim() !== '') entry.roles[input.dataset.role] = Number(input.value);
        }
        if (entry.default === undefined && Object.keys(entry.roles).length === 0) delete draft.crimes[selectedCrime];
        else draft.crimes[selectedCrime] = entry;
        return true;
    }
    function updatePlaceholders() {
        const input = shadow.getElementById('crime-minimum');
        const value = input.value.trim();
        const crimeDefault = value !== '' && validTarget(Number(value)) ? Number(value) : null;
        for (const field of shadow.querySelectorAll('[data-role]')) {
            const effective = crimeDefault ?? builtin(selectedCrime, field.dataset.role);
            field.placeholder = String(effective);
            field.closest('label').querySelector('small').textContent = 'Inherited target: ' + effective;
        }
    }
    function renderFields() {
        const entry = draft.crimes[selectedCrime];
        shadow.getElementById('crime-minimum').value = entry?.default ?? '';
        const list = shadow.getElementById('roles');
        list.replaceChildren();
        for (const role of slots.get(selectedCrime)) {
            const label = document.createElement('label');
            label.className = 'role';
            const text = document.createElement('span');
            text.textContent = role.replace(/ (\d+)$/, ' #$1');
            const small = document.createElement('small');
            text.appendChild(small);
            const input = document.createElement('input');
            input.type = 'number'; input.min = '0'; input.max = '100'; input.step = '1'; input.inputMode = 'numeric';
            input.dataset.role = roleKey(role);
            input.setAttribute('aria-label', role + ' minimum CPR');
            input.value = entry?.roles?.[roleKey(role)] ?? '';
            label.append(text, input); list.appendChild(label);
        }
        updatePlaceholders();
    }
    function openPanel(open) {
        panelOpen = open;
        shadow.getElementById('panel').hidden = !open;
        shadow.getElementById('toggle').setAttribute('aria-expanded', String(open));
        if (open) {
            movement?.placePanel();
            shadow.getElementById('crime').focus();
        } else {
            shadow.getElementById('toggle').focus();
        }
    }
    function makeSettings() {
        if (root?.isConnected) return;
        root = document.createElement('div'); root.id = rootId;
        root.style.cssText = 'all:initial;position:fixed;right:12px;bottom:80px;bottom:calc(80px + env(safe-area-inset-bottom, 0px));z-index:99999;';
        shadow = root.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
        <style>
          :host{color-scheme:dark;font:14px/1.5 Arial,sans-serif;color:#f4efff}
          *{box-sizing:border-box} [hidden]{display:none!important}
          button,input,select{font:inherit}button{cursor:pointer}
          button{border:1px solid #66527f;border-radius:9px;padding:9px 12px;background:#261c37;color:#f4efff}
          button:hover{background:#3b2855}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #c699ff;outline-offset:2px}
          #toggle{font:700 14px/1.2 Arial,sans-serif;display:block;margin-left:auto;background:#6522a8;box-shadow:0 4px 18px #0005;font-weight:700}
          #panel{position:fixed;width:min(390px,calc(100vw - 24px));max-height:min(640px,calc(100dvh - 24px));overflow:auto;margin:0;padding:18px;border:1px solid #71528c;border-radius:14px;background:#11101c;box-shadow:0 12px 44px #0008}
          .top{display:flex;align-items:center;justify-content:space-between;gap:8px}h2{font-size:18px;margin:0}p{color:#c3b6d4;font-size:12px;margin:8px 0 15px}.close{font-size:18px;padding:2px 9px}
          label{display:block;font-weight:600}select,input{border:1px solid #68577d;border-radius:8px;background:#1b1529;color:#f4efff;padding:9px;width:100%;margin-top:6px}input{min-width:0}
          .crime-default{margin:16px 0}small{display:block;font-size:11px;color:#b5a5c8;font-weight:400}
          #roles{border-top:1px solid #3c304c}.role{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #30263e;font-size:13px}.role input{width:84px;margin:0;flex-shrink:0}input::placeholder{color:#aaa0b9;opacity:1}
          .actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}.primary{background:#7227bf;border-color:#a872e0;font-weight:700}#status{margin:12px 0 0;min-height:18px;color:#dcc4ff}
          #launcher{display:flex;align-items:center;justify-content:flex-end;gap:6px}.drag-handle{cursor:grab;touch-action:none;user-select:none;font:700 20px/1 Arial,sans-serif;padding:9px 7px}
          .colour-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}input[type="color"]{height:42px;padding:4px}.preview{display:inline-block;border-radius:999px;padding:10px 13px;font:700 14px/1.2 Arial,sans-serif}
          @media(max-width:700px){#toggle{font-size:clamp(11px,3vw,13px)}}
          @media(max-width:400px){#panel{padding:14px}.actions button{flex:1 1 auto}}
          @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
        </style>
        <section id="panel" role="dialog" aria-labelledby="heading" hidden>
          <div class="top"><h2 id="heading">OC minimums</h2><button type="button" class="close" id="close" aria-label="Close settings">×</button></div>
          <p>Set your faction’s targets for this browser. Saved choices survive script updates. These are not official Torn requirements.</p>
          <form id="targets-form">
            <label for="crime">Crime</label><select id="crime"></select>
            <label class="crime-default" for="crime-minimum">Crime-wide minimum <small>Optional. Applies unless a role below has its own target.</small><input id="crime-minimum" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="Use built-in role targets"></label>
            <p>Leave a role blank to use its inherited target. Unknown targets default to 60. Whole numbers from 0 to 100.</p>
            <div id="roles"></div>
            <div class="actions"><button class="primary" type="submit">Save targets</button><button type="button" id="reset-crime">Reset this crime</button><button type="button" id="reset-all">Reset all</button></div>
          </form>
          <p id="status" role="status" aria-live="polite"></p>
          <details style="border-top:1px solid #3c304c;margin-top:16px;padding-top:12px">
            <summary style="cursor:pointer;font-weight:700">Button colours</summary>
            <p>Choose background and text colours for your OC minimums button. Saved choices survive script updates in this browser.</p>
            <form id="appearance-form">
              <div class="colour-grid">
                <label for="button-background">Background<input type="color" id="button-background"></label>
                <label for="button-text">Text<input type="color" id="button-text"></label>
              </div>
              <p style="margin:12px 0 6px">Preview</p><span class="preview" id="button-preview">TC · OC minimums</span>
              <div class="actions"><button class="primary" type="submit">Save colours</button><button type="button" id="reset-colours">Reset colours</button></div>
              <p id="appearance-status" role="status" aria-live="polite"></p>
            </form>
          </details>
          <details style="border-top:1px solid #3c304c;margin-top:16px;padding-top:12px">
            <summary style="cursor:pointer;font-weight:700">Button position</summary>
            <p>Drag the dotted handle beside the button with a mouse or finger. With the handle focused, arrow keys move it; hold Shift for larger steps. Position is saved for this browser and adapts to screen size.</p>
            <button type="button" id="reset-position">Reset position</button>
            <p id="position-status" role="status" aria-live="polite"></p>
          </details>
        </section>
        <div id="launcher"><button id="toggle" type="button" aria-expanded="false" aria-controls="panel">TC · OC minimums</button><button id="drag-handle" class="drag-handle" type="button" aria-label="Move OC minimums button" title="Drag to move. Arrow keys move; Shift moves faster.">⠿</button></div>`;
        const background = shadow.getElementById('button-background');
        const foreground = shadow.getElementById('button-text');
        const preview = shadow.getElementById('button-preview');
        const appearanceStatus = shadow.getElementById('appearance-status');
        background.value = appearance?.background || '#7c3aed';
        foreground.value = appearance?.text || '#ffffff';
        paintAppearance(preview, appearance);
        paintAppearance(shadow.getElementById('toggle'), appearance);
        const chosenColours = () => ({ background: background.value, text: foreground.value });
        for (const input of [background, foreground]) input.addEventListener('input', () => {
            paintAppearance(preview, chosenColours());
            appearanceStatus.textContent = 'Preview only. Save colours to apply.';
        });
        shadow.getElementById('appearance-form').addEventListener('submit', event => {
            event.preventDefault();
            try {
                const chosen = chosenColours();
                localStorage.setItem(appearanceKey, JSON.stringify(chosen));
                appearance = chosen;
                paintAppearance(shadow.getElementById('toggle'), appearance);
                appearanceStatus.textContent = 'Button colours saved.';
            } catch { appearanceStatus.textContent = 'Could not save colours. Your saved colours have not changed.'; }
        });
        shadow.getElementById('reset-colours').addEventListener('click', () => {
            try {
                localStorage.removeItem(appearanceKey); appearance = null;
                background.value = '#7c3aed'; foreground.value = '#ffffff';
                paintAppearance(preview, null); paintAppearance(shadow.getElementById('toggle'), null);
                appearanceStatus.textContent = 'Default button colours restored.';
            } catch { appearanceStatus.textContent = 'Could not reset colours. Your saved colours have not changed.'; }
        });
        const select = shadow.getElementById('crime');
        for (const name of Object.keys(crimeMinimums).sort((a,b)=>a.localeCompare(b))) {
            const option = document.createElement('option'); option.value = clean(name); option.textContent = name; select.appendChild(option);
        }
        select.value = selectedCrime;
        select.addEventListener('change', () => {
            if (!captureDraft()) { select.value = selectedCrime; return; }
            selectedCrime = select.value; renderFields();
            message(dirty ? 'Unsaved changes kept. Save targets to apply them.' : '');
        });
        shadow.getElementById('targets-form').addEventListener('input', () => {
            dirty = true; updatePlaceholders(); message('Unsaved changes. Select Save targets to apply.');
        });
        shadow.getElementById('targets-form').addEventListener('submit', event => {
            event.preventDefault(); if (!captureDraft()) return;
            try {
                localStorage.setItem(storageKey, JSON.stringify(draft));
                settings = JSON.parse(JSON.stringify(draft)); dirty = false; refresh();
                message('Saved in this browser. Updated role targets are now visible.');
            } catch { message('Could not save: browser storage is unavailable or full. Your saved targets have not changed.'); }
        });
        shadow.getElementById('reset-crime').addEventListener('click', () => {
            delete draft.crimes[selectedCrime]; dirty = true; renderFields(); message('This crime is reset in your draft. Save targets to apply.');
        });
        shadow.getElementById('reset-all').addEventListener('click', () => {
            draft = freshSettings(); dirty = true; renderFields(); message('All targets are reset in your draft. Save targets to apply.');
        });
        shadow.getElementById('toggle').addEventListener('click', () => openPanel(!panelOpen));
        shadow.getElementById('close').addEventListener('click', () => openPanel(false));
        shadow.addEventListener('keydown', event => { if (event.key === 'Escape' && panelOpen) { event.preventDefault(); openPanel(false); } });
        document.body.appendChild(root); renderFields(); message(loadMessage);
        movement = makeMovableButton({
            anchor: root, handle: shadow.getElementById('drag-handle'),
            read: () => localStorage.getItem(positionKey),
            write: value => localStorage.setItem(positionKey, value),
            panel: () => shadow.getElementById('panel'),
            report: text => { shadow.getElementById('position-status').textContent = text; }
        });
        shadow.getElementById('reset-position').addEventListener('click', () => movement.reset());
        shadow.addEventListener('toggle', () => movement.placePanel(), true);
    }
    function refresh() {
        const headers = document.querySelectorAll('button[class*="slotHeader___"]');
        const onCrimes = headers.length > 0 || /crimes/i.test(location.hash);
        if (onCrimes) { makeSettings(); const wasHidden = root.style.display === 'none'; root.style.display = 'block'; if (wasHidden) movement?.reflow(); movement?.placePanel(); }
        else if (root) root.style.display = 'none';
        const active = new Set();
        for (const header of headers) {
            const title = header.querySelector('span[class*="title___"]');
            const value = header.querySelector('div[class*="successChance___"]');
            if (!title) continue;
            const role = [...title.childNodes].filter(node => node.nodeType === 3 ||
                (node.nodeType === 1 && !node.hasAttribute('data-tc-oc-minimum'))
            ).map(node => node.textContent).join('').trim();
            const crime = findCrime(header); if (!crime) continue;
            const host = value || title;
            const minimum = targetFrom(settings, crime, role);
            let suffix = displayed.get(host);
            if (!suffix || suffix.parentElement !== host) {
                if (suffix) suffix.remove();
                suffix = document.createElement('span'); suffix.setAttribute('data-tc-oc-minimum', 'true');
                suffix.style.whiteSpace = 'nowrap'; host.appendChild(suffix); displayed.set(host, suffix);
            }
            const text = value ? '/' + minimum : ' (Min: ' + minimum + ')';
            if (suffix.textContent !== text) suffix.textContent = text;
            const saved = settings.crimes[crime];
            const custom = validTarget(saved?.roles?.[roleKey(role)]) || validTarget(saved?.default);
            suffix.title = (custom ? 'Your saved target. ' : defaults.has(crime) ? 'Default target of 60; not a verified role minimum. ' : 'Built-in faction target. ') + crime + ' / ' + role;
            active.add(host);
        }
        for (const [host, suffix] of displayed) {
            if (!active.has(host)) { suffix.remove(); displayed.delete(host); }
        }
    }
    refresh();
    const interval = setInterval(refresh, 1500);
    window[singletonKey] = { stop() { movement?.stop(); clearInterval(interval); displayed.forEach(node => node.remove()); root?.remove(); } };
})();
