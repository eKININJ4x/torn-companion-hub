// ==UserScript==
// @name         Torn OC Requirement Display
// @namespace    torn-companion
// @version      3.2.2
// @author       Torn Companion
// @homepageURL  https://github.com/eKININJ4x/torn-companion-hub
// @updateURL    https://raw.githubusercontent.com/eKININJ4x/torn-companion-hub/main/public/scripts/tc-oc-requirements.meta.js
// @downloadURL  https://raw.githubusercontent.com/eKININJ4x/torn-companion-hub/main/public/scripts/tc-oc-requirements.user.js
// @description  Adds your configured minimum CPR beside Torn's displayed role value.
// @match        https://www.torn.com/factions.php*
// @match        https://torn.com/factions.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Local display only. No API, external libraries, storage, requests or clicks.
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

    function clean(value) {
        return String(value).normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/#/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    const aliases = {
        'smoke wing and mirrors': 'smoke and wing mirrors',
        'stage fight': 'stage fright',
        'pier pressure': 'manifest cruelty'
    };
    const minimums = new Map();
    for (const [crime, roles] of Object.entries(crimeMinimums)) {
        minimums.set(clean(crime), new Map(Object.entries(roles).map(
            ([role, minimum]) => [clean(role), minimum]
        )));
    }
    const defaults = new Set(defaultCrimeNames.map(clean));
    const displayed = new Map();

    function findCrime(header) {
        // Read the actual card heading. Descriptions can mention other crimes.
        let node = header.parentElement;
        for (let depth = 0; node && depth < 30; depth++, node = node.parentElement) {
            if (node === document.body || node === document.documentElement) return null;
            const headings = node.querySelectorAll('p[class*="panelTitle___"]');
            if (headings.length > 1) return null; // Never borrow a neighbouring card title.
            if (headings.length === 1) {
                const name = clean(headings[0].textContent || '');
                const canonical = aliases[name] || name;
                return minimums.has(canonical) ? canonical : null;
            }
        }
        return null;
    }

    function lookup(crime, role) {
        const table = minimums.get(crime);
        const name = clean(role).replace(/^impersonator\b/, 'imitator');
        return table?.get(name) ?? table?.get(name.replace(/\s*\d+$/, '')) ?? fallbackMinimum;
    }

    function refresh() {
        const active = new Set();
        for (const header of document.querySelectorAll('button[class*="slotHeader___"]')) {
            const title = header.querySelector('span[class*="title___"]');
            const value = header.querySelector('div[class*="successChance___"]');
            if (!title) continue;
            // Label is never overwritten. Remove only our own suffix when reading it.
            const role = [...title.childNodes].filter(node =>
                node.nodeType === 3 || !node.hasAttribute('data-tc-oc-minimum')
            ).map(node => node.textContent).join('').trim();
            const crime = findCrime(header);
            if (!crime) continue;
            const host = value || title;
            const minimum = lookup(crime, role);
            let suffix = displayed.get(host);
            if (!suffix || suffix.parentElement !== host) {
                if (suffix) suffix.remove();
                suffix = document.createElement('span');
                suffix.setAttribute('data-tc-oc-minimum', 'true');
                suffix.style.whiteSpace = 'nowrap';
                host.appendChild(suffix);
                displayed.set(host, suffix);
            }
            const text = value ? '/' + minimum : ' (Min: ' + minimum + ')';
            if (suffix.textContent !== text) suffix.textContent = text;
            suffix.title = (defaults.has(crime) ? 'Default target of 60; not a verified role minimum. ' : 'Your configured target. ')
                + crime + ' / ' + role;
            active.add(host);
        }
        for (const [host, suffix] of displayed) {
            if (!active.has(host)) {
                suffix.remove();
                displayed.delete(host);
            }
        }
    }

    refresh();
    setInterval(refresh, 1500);
})();
