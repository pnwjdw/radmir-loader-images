(function () {
    if (window.__hassleTemplate) return window.__hassleTemplate;
    const infoKeys = ['show', 'showBars', 'weapon', 'ammoInClip', 'totalAmmo', 'money', 'health', 'armour', 'hunger', 'breath', 'wanted', 'freeze'];
    const carKeys = ['show', 'speed', 'fuel', 'maxFuel', 'mileage', 'isElectro', 'wash', 'damage'];
    const state = { id: '', hud: null, facade: null, timers: new Set(), timeouts: new Set(), nodes: new Set(), options: [], storage: {}, error: '', callbacks: [], carCallbacks: [], changes: [], optionsRevision: 0, bodyChanges: new Map(), observers: new Map(), openListeners: [], opening: new Map(), closing: new Map() };
    const nativeInterval = window.setInterval.bind(window);
    const nativeTimeout = window.setTimeout.bind(window);
    const trackedObjects = new WeakMap();
    let resources = {};
    let seen = Date.now();
    const upload = { script: '', css: '' };
    const lease = nativeInterval(() => { if (Date.now() - seen > 15000) api.shutdown(); }, 1000);
    const originalInterface = name => (window.getInterface || window.interface)(name);
    const format = value => String(Math.trunc(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    function change(target, key, value) {
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        target[key] = value;
        state.changes.push(() => {
            if (target[key] !== value) throw new Error('Property was replaced externally: ' + String(key));
            if (descriptor) Object.defineProperty(target, key, descriptor);
            else delete target[key];
        });
    }
    function hook(name, callback) {
        if (typeof window[name] !== 'function') throw new Error('Missing Hassle function: ' + name);
        change(window, name, new Proxy(window[name], { apply: (target, receiver, args) => run(() => callback(target, receiver, args)) }));
    }
    function rememberAttribute(node, name, value) {
        if (node.getAttribute(name) === value) return;
        const previous = node.getAttribute(name);
        node.setAttribute(name, value);
        state.changes.push(() => {
            if (node.getAttribute(name) !== value) return;
            if (previous === null) node.removeAttribute(name);
            else node.setAttribute(name, previous);
        });
    }
    function replaceImages(selector, parameters, observerName) {
        const apply = () => {
            const root = document.querySelector(selector);
            if (!root) return false;
            const update = () => {
                for (const setting of parameters) {
                    for (const node of root.querySelectorAll(setting.target)) {
                        const source = node.getAttribute('src');
                        if (!source) continue;
                        for (const asset of Object.keys(setting.assets)) {
                            if (source.indexOf(asset) >= 0) rememberAttribute(node, 'src', setting.assets[asset][0]);
                        }
                    }
                }
            };
            update();
            if (observerName && !state.observers.has(observerName)) {
                const observer = new MutationObserver(() => { try { run(update); } catch (error) { state.error = String(error); } });
                observer.observe(root, { attributes: true, childList: true, subtree: true, attributeFilter: ['src', 'style', 'class'] });
                state.observers.set(observerName, observer);
            }
            return true;
        };
        if (!apply()) {
            let attempts = 0;
            const id = interval(() => {
                if (apply() || ++attempts > 200) { clearInterval(id); state.timers.delete(id); }
            }, 50);
        }
    }
    function installInterfaceHooks() {
        hook('openInterface', (target, receiver, args) => {
            const callback = state.opening.get(args[0]);
            if (callback && callback(args) === false) return false;
            for (const listener of state.openListeners) if (listener.forInterface === args[0]) {
                listener.callBack(args);
                if (listener.notShow) return false;
            }
            return Reflect.apply(target, receiver, args);
        });
        hook('closeInterface', (target, receiver, args) => {
            const callback = state.closing.get(args[0]);
            if (callback && callback(args) === false) return false;
            return Reflect.apply(target, receiver, args);
        });
    }
    function tracked(target) {
        if (!target || typeof target !== 'object') return target;
        if (trackedObjects.has(target)) return trackedObjects.get(target);
        const proxy = new Proxy(target, {
            get(object, key) {
                const value = object[key];
                return typeof value === 'function' ? value.bind(object) : tracked(value);
            },
            set(object, key, value) { change(object, key, value); return true; }
        });
        trackedObjects.set(target, proxy);
        return proxy;
    }
    function run(callback) {
        const before = new Set(document.body.className.split(/\s+/).filter(Boolean));
        try { return callback(); }
        finally {
            const after = new Set(document.body.className.split(/\s+/).filter(Boolean));
            for (const name of before) if (!after.has(name) && !state.bodyChanges.has(name)) state.bodyChanges.set(name, true);
            for (const name of after) if (!before.has(name) && !state.bodyChanges.has(name)) state.bodyChanges.set(name, false);
        }
    }
    function interval(callback, delay) {
        const id = nativeInterval(() => { try { run(callback); } catch (error) { state.error = String(error.stack || error); } }, Math.max(16, delay || 0));
        state.timers.add(id);
        return id;
    }
    function timeout(callback, delay) {
        const id = nativeTimeout(() => { state.timeouts.delete(id); try { run(callback); } catch (error) { state.error = String(error.stack || error); } }, delay);
        state.timeouts.add(id);
        return id;
    }
    function style(css) {
        const node = document.createElement('style');
        node.setAttribute('data-hassle-template', state.id);
        node.textContent = css;
        document.head.appendChild(node);
        state.nodes.add(node);
        return node;
    }
    function notify(callbacks, key, value) {
        for (const callback of callbacks) {
            try { callback(key, value); } catch (error) { state.error = String(error.stack || error); }
        }
    }
    function model(keys, callbacks, source) {
        const values = {};
        for (const key of keys) values[key] = source && source[key] !== undefined ? source[key] : 0;
        return new Proxy(values, { set(object, key, value) { object[key] = value; notify(callbacks, key, value); return true; } });
    }
    function facade() {
        const original = originalInterface('Hud');
        if (!original) throw new Error('Hassle Hud is not ready');
        const result = {
            info: model(infoKeys, state.callbacks, original.info),
            speedometer: model(carKeys, state.carCallbacks, original.speedometer),
            server: original.server || 1,
            bonus: original.bonus || 0,
            useChat: original.useChat,
            isPlayerSwiming: original.isPlayerSwiming,
            $refs: original.$refs,
            hideGreenZoneTab() { notify(state.callbacks, 'hideGreenZoneTab'); },
            showGreenZoneTab() { notify(state.callbacks, 'showGreenZoneTab'); },
            showFishingZone() { notify(state.callbacks, 'showFishingZone'); },
            setBonus(value) { this.bonus = value; notify(state.callbacks, 'setBonus', value); },
            setServer(value) { this.server = value; notify(state.callbacks, 'setServer', value); },
            setHelloween(value) { this.isHelloween = value; notify(state.callbacks, 'setHelloween', value); },
            setNewYear(value) { this.isNewYear = value; notify(state.callbacks, 'setNewYear', value); },
            showTachometer() { notify(state.carCallbacks, 'tachometer-show', 1); },
            hideTachometer() { notify(state.carCallbacks, 'tachometer-show', 0); },
            setTurnLightStatus(right, value) { notify(state.carCallbacks, right ? 'right' : 'left', value); }
        };
        const params = original.speedometer && original.speedometer.params;
        result.speedometer.params = model(['temperature', 'lights', 'rem', 'doors', 'key', 'alarm'], state.carCallbacks, params);
        result.speedometer.tachometer = Object.assign({ show: false, rpm: 0, gear: 0 }, original.speedometer && original.speedometer.tachometer);
        return result;
    }
    function create(html, className, callback, car) {
        const node = document.createElement('div');
        node.className = className;
        node.style.cssText = 'pointer-events:none;';
        node.innerHTML = html;
        node.setAttribute('data-hassle-template', state.id);
        document.body.appendChild(node);
        state.nodes.add(node);
        (car ? state.carCallbacks : state.callbacks).push(callback);
        if (car) style('#app .hud-radmir-speedometer{display:none!important}');
        else style('#app .hud-radmir-info,#app .hud-hassle-info{display:none!important}');
        return node;
    }
    function synchronize() {
        if (!state.facade) return;
        const original = originalInterface('Hud');
        if (!original) return;
        for (const [source, target, keys] of [[original.info, state.facade.info, infoKeys], [original.speedometer, state.facade.speedometer, carKeys]]) {
            if (!source) continue;
            for (const key of keys) if (source[key] !== undefined && target[key] !== source[key]) target[key] = source[key];
        }
        const params = original.speedometer && original.speedometer.params;
        if (params) {
            for (const key of ['temperature', 'lights', 'rem', 'doors', 'key', 'alarm']) {
                if (state.facade.speedometer.params[key] !== params[key]) state.facade.speedometer.params[key] = params[key];
            }
            for (const side of ['left', 'right']) notify(state.carCallbacks, side, !!(params.turns && params.turns[side]));
        }
        const tachometer = original.speedometer && original.speedometer.tachometer;
        if (tachometer) {
            const previous = state.facade.speedometer.tachometer;
            if (previous.show !== tachometer.show) notify(state.carCallbacks, 'tachometer-show', +!!tachometer.show);
            for (const key of Object.keys(tachometer)) previous[key] = tachometer[key];
        }
        for (const key of ['server', 'bonus']) {
            if (original[key] !== undefined && state.facade[key] !== original[key]) state.facade[key === 'server' ? 'setServer' : 'setBonus'](original[key]);
        }
        const safe = document.querySelector('.hud-radmir-radar__safe-zone');
        const visible = !!safe && getComputedStyle(safe).display !== 'none';
        if (state.safe !== visible) { state.safe = visible; notify(state.callbacks, visible ? 'showGreenZoneTab' : 'hideGreenZoneTab'); }
        const info = state.facade.info;
        for (const node of state.nodes) {
            if (node.tagName !== 'DIV') continue;
            const isCar = /speedometer/i.test(node.className);
            node.style.visibility = (isCar ? state.facade.speedometer.show : info.show) && !original.hudIsManuallyHidden ? '' : 'hidden';
            for (const image of node.querySelectorAll('img[src]')) {
                const replacement = resources[image.getAttribute('src')];
                if (replacement) image.setAttribute('src', replacement);
            }
        }
    }
    function cleanup() {
        for (const id of state.timers) clearInterval(id);
        for (const id of state.timeouts) clearTimeout(id);
        state.timers.clear();
        state.timeouts.clear();
        for (const observer of state.observers.values()) observer.disconnect();
        state.observers.clear();
        const errors = [];
        for (const undo of state.changes.reverse()) { try { undo(); } catch (error) { errors.push(String(error)); } }
        for (const node of state.nodes) node.remove();
        state.nodes.clear();
        if (state.bodyChanges) for (const [name, present] of state.bodyChanges) document.body.classList.toggle(name, present);
        state.bodyChanges = new Map();
        state.callbacks = [];
        state.carCallbacks = [];
        state.changes = [];
        state.options = [];
        state.openListeners = [];
        state.opening.clear();
        state.closing.clear();
        state.hud = null;
        state.facade = null;
        state.id = '';
        state.safe = undefined;
        if (errors.length) throw new Error(errors.join('\n'));
    }
    function loader() {
        const storage = {
            getItem(key) { return Object.prototype.hasOwnProperty.call(state.storage, key) ? state.storage[key] : null; },
            setItem(key, value) { state.storage[key] = value; state.optionsRevision++; }
        };
        return {
            isLoaded: true,
            localStorage: storage,
            log: { makeLog() {} },
            showAddedScript() {},
            showConnectedScript() {},
            runtime: {
                createStyleTag(css) { return style(css); },
                executeFunctionWhen(callback, predicate, name, delay) {
                    let attempts = 0;
                    const id = interval(() => { if (predicate()) { clearInterval(id); state.timers.delete(id); callback(); } else if (++attempts > 200) { clearInterval(id); state.timers.delete(id); state.error = 'Timeout: ' + name; } }, delay || 50);
                },
                hudInfo: { addEventOnChangeHudInfo(callback) { state.callbacks.push(callback); } }
            },
            mainMenu: {
                addNewOption(type, label, options) { state.options.push({ type, label, options }); },
                getLvlAndExp(callback) { callback([0, 0]); }
            },
            _x1040123: {
                xasd12512(html, className, callback) { return create(html, className, callback, false); },
                ljfkles(html, className, callback) { return create(html, className, callback, true); }
            },
            utils: {
                initDynamicReplacePathImages(events) {
                    hook('openInterface', (target, receiver, args) => {
                        const result = Reflect.apply(target, receiver, args);
                        for (const event of events) if (event[0] === args[0]) replaceImages(event[1][0], event[1][2], event[1][1]);
                        return result;
                    });
                    hook('closeInterface', (target, receiver, args) => {
                        for (const event of events) if (event[0] === args[0]) {
                            const observer = state.observers.get(event[1][1]);
                            if (observer) observer.disconnect();
                            state.observers.delete(event[1][1]);
                        }
                        return Reflect.apply(target, receiver, args);
                    });
                },
                staticReplacePathImages(events) {
                    hook('openInterface', (target, receiver, args) => {
                        const result = Reflect.apply(target, receiver, args);
                        for (const event of events) if (event[0] === args[0]) {
                            let attempts = 0;
                            const id = interval(() => {
                                if (!document.querySelector(event[1])) {
                                    if (++attempts > 200) { clearInterval(id); state.timers.delete(id); }
                                    return;
                                }
                                clearInterval(id);
                                state.timers.delete(id);
                                for (const selector of Object.keys(event[2])) for (const node of document.querySelectorAll(selector)) {
                                    const entry = event[2][selector];
                                    if (entry[1] === 'style') {
                                        const previous = node.style.backgroundImage;
                                        node.style.backgroundImage = 'url("' + entry[0] + '")';
                                        const applied = node.style.backgroundImage;
                                        state.changes.push(() => { if (node.style.backgroundImage === applied) node.style.backgroundImage = previous; });
                                    } else rememberAttribute(node, 'src', entry[0]);
                                }
                            }, 50);
                        }
                        return result;
                    });
                },
                openInterfaceOptions: {
                    addListenerToOpenInterface(listener) { state.openListeners.push(listener); },
                    setListenerToOpenInterface(name, callback) { state.opening.set(name, callback); },
                    setListenerToCloseInterface(name, callback) { state.closing.set(name, callback); }
                }
            },
            chat: { registerCommand() {}, addChatListener() {}, send() {} },
            network: { addListener() {} }
        };
    }
    const api = {
        loader,
        resources(value) { resources = value || {}; return {}; },
        upload(kind, text, reset) {
            if (kind !== 'script' && kind !== 'css') throw new Error('Invalid template upload');
            upload[kind] = (reset ? '' : upload[kind]) + text;
            return {};
        },
        configureUploaded(id, storage) {
            const script = upload.script, css = upload.css;
            upload.script = upload.css = '';
            return api.configure(id, script, css, storage);
        },
        interface(name) { return name === 'Hud' && state.facade ? state.facade : tracked(originalInterface(name)); },
        configure(id, script, css, storage) {
            seen = Date.now();
            cleanup();
            state.id = id;
            state.error = '';
            state.storage = Object.assign({}, storage || {});
            state.facade = facade();
            const globals = { setInterval: interval, setTimeout: timeout, formatNumber: format, formatNumberWithSpaces: format, formatNumberWithCommas: value => format(value).replace(/ /g, ','), __hassleTemplate: api };
            const scope = new Proxy(window, {
                get(target, key) {
                    if (key === 'window' || key === 'self' || key === 'globalThis') return scope;
                    if (key === 'addEventListener') return (type, callback, options) => {
                        const wrapped = event => run(() => callback(event));
                        target.addEventListener(type, wrapped, options);
                        state.changes.push(() => target.removeEventListener(type, wrapped, options));
                    };
                    return Object.prototype.hasOwnProperty.call(globals, key) ? globals[key] : target[key];
                },
                set(target, key, value) { change(target, key, value); return true; }
            });
            const documentScope = new Proxy(document, {
                get(target, key) {
                    if (key === 'createElement') return (...args) => { const node = target.createElement(...args); state.nodes.add(node); return node; };
                    const value = target[key];
                    return typeof value === 'function' ? value.bind(target) : value;
                }
            });
            try {
                installInterfaceHooks();
                style(css);
                run(() => {
                    state.hud = new Function('window', 'document', 'setInterval', 'setTimeout', 'clearInterval', 'clearTimeout', 'return ' + script)(scope, documentScope, interval, timeout, clearInterval, clearTimeout);
                    state.hud.init(loader());
                });
                for (const key of infoKeys) notify(state.callbacks, key, state.facade.info[key]);
                for (const key of carKeys) notify(state.carCallbacks, key, state.facade.speedometer[key]);
                for (const key of ['temperature', 'lights', 'rem', 'doors', 'key', 'alarm'])
                    notify(state.carCallbacks, key, state.facade.speedometer.params[key]);
                notify(state.callbacks, 'setServer', state.facade.server);
                notify(state.callbacks, 'setBonus', state.facade.bonus);
                synchronize();
                interval(synchronize, 50);
            } catch (error) {
                const message = String(error.stack || error);
                cleanup();
                state.error = message;
                throw new Error(message);
            }
            return api.status();
        },
        options() {
            return state.options.map((item, index) => {
                const options = item.options;
                return { index, type: item.type, label: item.label, value: item.type === 1 && options.initialVar ? !!options.initialVar() : options.value ? options.value() : null, min: options.min, max: options.max, step: options.step, items: options.data || [], selected: options.selectedId };
            });
        },
        hudVisible() {
            const original = originalInterface('Hud');
            return !!(original && original.info && original.info.show && !original.hudIsManuallyHidden);
        },
        clock(config) {
            let found = false;
            const now = new Date();
            const pad = (value, length = 2) => String(value).padStart(length, '0');
            const hour = config.format24 ? now.getHours() : now.getHours() % 12 || 12;
            let time = pad(hour) + ':' + pad(now.getMinutes());
            if (config.seconds || config.milliseconds) time += ':' + pad(now.getSeconds());
            if (config.milliseconds) time += '.' + pad(now.getMilliseconds(), 3);
            if (!config.format24) time += now.getHours() < 12 ? ' AM' : ' PM';
            const date = pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear();
            for (const root of state.nodes) {
                if (root.tagName !== 'DIV') continue;
                const times = root.querySelectorAll('.ONEAS-time,#ONEAS-time_value');
                if (!times.length) continue;
                found = true;
                for (const node of times) {
                    if (node.querySelector('#ONEAS-time_value')) continue;
                    if (node.textContent !== time) node.textContent = time;
                }
                for (const node of root.querySelectorAll('.ONEAS-data,#ONEAS-data_value')) {
                    if (!node.querySelector('#ONEAS-data_value') && node.textContent !== date) node.textContent = date;
                    const display = config.date ? '' : 'none';
                    if (node.style.display !== display) node.style.display = display;
                }
                for (const node of root.querySelectorAll('.ONEAS-hud__time-data,.ONEAS-info__time-data,.ONEAS-hud__time,.ONEAS-timer')) {
                    const display = config.enabled && !config.standalone ? 'flex' : 'none';
                    if (node.style.display !== display) node.style.display = display;
                }
            }
            return found;
        },
        action(index, value) {
            const item = state.options[index];
            if (!item || typeof item.options.callback !== 'function') return {};
            run(() => item.options.callback(value));
            return api.status();
        },
        status() { seen = Date.now(); return { id: state.id, error: state.error, storage: state.storage, options: api.options(), revision: state.optionsRevision, nodes: state.nodes.size, timers: state.timers.size }; },
        shutdown() {
            try { cleanup(); }
            finally { clearInterval(lease); resources = {}; delete window.__hassleTemplate; }
            return {};
        }
    };
    window.__hassleTemplate = api;
    return api;
})();
