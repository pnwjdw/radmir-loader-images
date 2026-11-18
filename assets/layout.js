(function () {
    if (window.__oldDialogsLayout) window.__oldDialogsLayout.shutdown();
    const state = {
        config: {},
        dpi: 1,
        nodes: new Map(),
        style: null,
        css: '',
        active: new Set(),
        restoring: new Map(),
        disposed: false
    };
    const selectors = [
        ['radar', 'Радар', '.hud-radmir-radar__radar'],
        ['safety', 'Безопасная зона', '.hud-radmir-radar__safe-zone'],
        ['chat', 'Чат', '.radmir-chat'],
        ['clock', 'Часы', '#__hassleClock'],
        ['hud', 'Оригинальный HUD', '.hud-radmir-info,.hud-hassle-info'],
        ['template.hud', 'HUD шаблона', 'body > [data-hassle-template].ONEAS-hud'],
        ['template.speedometer', 'Спидометр шаблона', 'body > [data-hassle-template].ONEAS-speedometer'],
        ['template.health', 'Здоровье', '[data-hassle-template] .ONEAS-param__health'],
        ['template.armour', 'Броня', '[data-hassle-template] .ONEAS-param__armour'],
        ['template.params', 'Индикаторы шаблона', '[data-hassle-template] .ONEAS-hud__params,[data-hassle-template] .ONEAS-params,[data-hassle-template] .ONEAS-params-2'],
        ['template.weapon', 'Оружие', '[data-hassle-template] .ONEAS-hud__weapon'],
        ['template.money', 'Деньги', '[data-hassle-template] .ONEAS-hud__cash'],
        ['template.logo', 'Логотип шаблона', '[data-hassle-template] .ONEAS-hud__logo'],
        ['template.time', 'Время шаблона', '[data-hassle-template] .ONEAS-hud__time-data,[data-hassle-template] .ONEAS-info__time-data,[data-hassle-template] .ONEAS-hud__time,[data-hassle-template] .ONEAS-timer'],
        ['message', 'Сообщение по центру', '.game-text--content.center-type'],
        ['message.top', 'Сообщение сверху', '.game-text--content.top-type'],
        ['message.bottom', 'Сообщение снизу', '.game-text--content.bottom-type'],
        ['message.key', 'Подсказка действия', '.game-text--content.key-type'],
        ['message.money', 'Изменение денег', '.game-text--content.right-type']
    ];
    function parentScale(node, axis) {
        let scale = 1;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
            const transform = getComputedStyle(parent).transform || '';
            const values = (transform.match(/\(([^)]+)\)/) || [])[1];
            if (!values) continue;
            const numbers = values.split(',').map(Number);
            if (transform.indexOf('matrix3d(') === 0)
                scale *= Math.hypot(...numbers.slice(axis * 4, axis * 4 + 3));
            else if (transform.indexOf('matrix(') === 0)
                scale *= Math.hypot(numbers[axis * 2], numbers[axis * 2 + 1]);
            else if (transform.indexOf('scale') === 0)
                scale *= Math.abs(numbers[axis] === undefined ? numbers[0] : numbers[axis]);
        }
        return Number.isFinite(scale) && scale > 0.001 ? scale : 1;
    }
    function resized() {
        const config = state.config;
        api.reset();
        state.config = config;
        requestAnimationFrame(collect);
    }
    function collect() {
        if (state.disposed) return;
        const candidates = [];
        const claimed = new Set();
        for (const [id, label, selector] of selectors) {
            let node = document.querySelector(selector);
            if (id === 'radar' && node)
                node = node.closest('.hud-radmir-radar') || node;
            if (node && !claimed.has(node)) {
                claimed.add(node);
                candidates.push({ id, label, node });
            }
        }
        const active = new Set();
        let css = '';
        const transformed = new Set();
        for (const candidate of candidates) {
            const { id, node } = candidate;
            if (!node.isConnected) continue;
            active.add(id);
            let item = state.nodes.get(id);
            if (!item || item.node !== node) {
                if (item) item.node.removeAttribute('data-od-layout');
                const nativeTransform = getComputedStyle(node).transform || '';
                item = { ...candidate, base: nativeTransform === 'none' ? '' : nativeTransform };
                state.nodes.set(id, item);
            }
            if (node.getAttribute('data-od-layout') !== id) node.setAttribute('data-od-layout', id);
            let value = state.config[id];
            let base = item.base;
            if (!value || (!value.x && !value.y && value.scale === 1)) {
                if (state.active.has(id)) state.restoring.set(id, Date.now() + 75);
                if ((state.restoring.get(id) || 0) > Date.now())
                    css +=
                        'body [data-od-layout][data-od-layout="' +
                        id +
                        '"]{transform:' +
                        (base || 'none') +
                        '!important;transition:none!important;}';
                else state.restoring.delete(id);
                continue;
            }
            transformed.add(id);
            state.restoring.delete(id);
            const transform =
                'translate3d(' +
                value.x * state.dpi +
                'px,' +
                value.y * state.dpi +
                'px,0) scale(' +
                value.scale +
                ')' +
                (base ? ' ' + base : '');
            const rule =
                'body [data-od-layout][data-od-layout="' +
                id +
                '"]{transform:' +
                transform +
                '!important;transition:none!important;}';
            css += rule;
        }
        for (const [id, item] of state.nodes)
            if (!active.has(id)) {
                item.node.removeAttribute('data-od-layout');
                state.nodes.delete(id);
                state.restoring.delete(id);
            }
        state.active = transformed;
        if (state.restoring.size) setTimeout(collect, 90);
        if (css !== state.css) {
            state.css = css;
            if (!css) {
                if (state.style) state.style.remove();
                state.style = null;
            } else {
                if (!state.style) {
                    state.style = document.createElement('style');
                    state.style.id = '__oldDialogsLayoutStyle';
                    document.head.appendChild(state.style);
                }
                state.style.textContent = css;
            }
        }
    }
    const api = {
        reset() {
            state.config = {};
            if (state.style) state.style.remove();
            state.style = null;
            state.css = '';
            for (const item of state.nodes.values()) item.node.removeAttribute('data-od-layout');
            state.nodes.clear();
            state.active.clear();
            state.restoring.clear();
            return {};
        },
        configure(config, dpi) {
            state.config = config || {};
            state.dpi = dpi || 1;
            collect();
            return {};
        },
        status() {
            collect();
            const elements = [];
            for (const item of state.nodes.values()) {
                const style = getComputedStyle(item.node);
                if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)
                    continue;
                let rect = item.node.getBoundingClientRect();
                if ((item.id === 'template.hud' || item.id === 'template.speedometer') &&
                    rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
                    const parts = Array.from(item.node.querySelectorAll('.ONEAS-hud-base,.ONEAS-hud__top-right,.ONEAS-hud__bottom-right,.ONEAS-speedometer-base,.ONEAS-hud__params,.ONEAS-hud__weapon,.ONEAS-hud__cash,.ONEAS-hud__logo,.ONEAS-hud__time-data,.ONEAS-info__time-data'))
                        .filter(node => getComputedStyle(node).visibility !== 'hidden')
                        .map(node => node.getBoundingClientRect()).filter(r => r.width > 2 && r.height > 2);
                    if (parts.length) {
                        const left = Math.min(...parts.map(r=>r.left)), top = Math.min(...parts.map(r=>r.top));
                        rect = {left,top,width:Math.max(...parts.map(r=>r.right))-left,height:Math.max(...parts.map(r=>r.bottom))-top};
                    } else continue;
                }
                if (rect.width > 2 && rect.height > 2)
                    elements.push({
                        id: item.id,
                        label: item.label,
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        parentScale: parentScale(item.node, 0) * state.dpi,
                        parentScaleY: parentScale(item.node, 1) * state.dpi
                    });
            }
            return { width: window.innerWidth, height: window.innerHeight, elements };
        },
        shutdown() {
            state.disposed = true;
            window.removeEventListener('resize', resized);
            if (state.style) state.style.remove();
            for (const item of state.nodes.values()) item.node.removeAttribute('data-od-layout');
            state.nodes.clear();
            delete window.__oldDialogsLayout;
        }
    };
    window.addEventListener('resize', resized);
    window.__oldDialogsLayout = api;
    return api;
})();
