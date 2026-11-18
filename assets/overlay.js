(function () {
    if (window.__hassleStudioOverlay) return window.__hassleStudioOverlay;
    const node = document.createElement('canvas');
    node.id = '__hassleStudioOverlay';
    node.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;';
    const context = node.getContext('2d');
    if (!context) throw new Error('Gameface Canvas 2D is unavailable');
    document.body.appendChild(node);
    let seen = Date.now();
    let disposed = false, pending = null, pendingUrl = '', queued = null, presented = 0, failed = 0, deadline = 0, error = '';
    const layers = new Map();
    let desired = null, current = [], scheduled = false;
    function compose() {
        scheduled = false;
        if (disposed || !desired) return;
        for (const frame of desired.items) if (!layers.get(frame.url).ready) return;
        try {
            if (node.width !== desired.width) node.width = desired.width;
            if (node.height !== desired.height) node.height = desired.height;
            context.clearRect(0, 0, node.width, node.height);
            for (const frame of desired.items) {
                const left = Math.max(frame.x, frame.clip[0], 0), top = Math.max(frame.y, frame.clip[1], 0);
                const right = Math.min(frame.x + frame.width, frame.clip[2], node.width), bottom = Math.min(frame.y + frame.height, frame.clip[3], node.height);
                if (right <= left || bottom <= top) continue;
                context.save();
                context.beginPath();
                context.rect(frame.clip[0], frame.clip[1], Math.max(0, frame.clip[2] - frame.clip[0]), Math.max(0, frame.clip[3] - frame.clip[1]));
                context.clip();
                context.drawImage(layers.get(frame.url).image, left - frame.x, top - frame.y, right - left, bottom - top, left, top, right - left, bottom - top);
                context.restore();
            }
            current = desired.items.map(frame => frame.url);
            desired = null;
            presented++;
            for (const [url, item] of layers) if (current.indexOf(url) < 0) {
                item.image.onload = item.image.onerror = null;
                layers.delete(url);
            }
        } catch (exception) { failed++; error = 'compose: ' + String(exception); }
    }
    function schedule() {
        if (!scheduled) { scheduled = true; requestAnimationFrame(compose); }
    }
    function load(frame) {
        const image = new Image();
        pending = image;
        pendingUrl = frame.url;
        function next() {
            clearTimeout(deadline);
            image.onload = null;
            image.onerror = null;
            pending = null;
            pendingUrl = '';
            if (!disposed && queued) {
                const frame = queued;
                queued = null;
                load(frame);
            }
        }
        image.onload = () => {
            if (!disposed) {
                try {
                    if (node.width !== frame.width) node.width = frame.width;
                    if (node.height !== frame.height) node.height = frame.height;
                    context.clearRect(0, 0, node.width, node.height);
                    context.drawImage(image, 0, 0, node.width, node.height);
                    presented++;
                } catch (exception) { failed++; error = 'draw: ' + String(exception); }
            }
            next();
        };
        image.onerror = () => { failed++; error = 'load: ' + frame.url; next(); };
        deadline = setTimeout(() => { failed++; error = 'timeout: ' + frame.url; next(); }, 2000);
        image.src = frame.url;
    }
    const timer = setInterval(() => {
        if (Date.now() - seen > 8000) api.shutdown();
    }, 1000);
    const api = {
        layers(items, width, height) {
            seen = Date.now();
            desired = { items, width, height };
            const wanted = new Set(current.concat(items.map(frame => frame.url)));
            for (const [url, item] of layers) if (!wanted.has(url)) {
                item.image.onload = item.image.onerror = null;
                layers.delete(url);
            }
            for (const frame of items) if (!layers.has(frame.url)) {
                const image = new Image();
                const item = { image, ready: false };
                layers.set(frame.url, item);
                image.onload = () => { item.ready = true; schedule(); };
                image.onerror = () => { failed++; error = 'layer: ' + frame.url; };
                image.src = frame.url;
            }
            schedule();
            return api.status();
        },
        frame(image, visible, width, height) {
            seen = Date.now();
            node.style.display = visible ? '' : 'none';
            if (image && !disposed) {
                const frame = { url: image, width: Math.max(1, width || innerWidth), height: Math.max(1, height || innerHeight) };
                if (pending) queued = frame;
                else load(frame);
            }
            return api.status();
        },
        status() { return { presented, failed, error, pending: !!pending || !!desired, queued: !!queued, retained: [pendingUrl, queued && queued.url].filter(Boolean).concat(Array.from(layers.keys())), width: node.width, height: node.height }; },
        shutdown() {
            disposed = true;
            for (const item of layers.values()) item.image.onload = item.image.onerror = null;
            layers.clear();
            desired = null;
            clearTimeout(deadline);
            queued = null;
            if (pending) pending.onload = pending.onerror = null;
            pending = null;
            pendingUrl = '';
            clearInterval(timer);
            node.remove();
            delete window.__hassleStudioOverlay;
        }
    };
    window.__hassleStudioOverlay = api;
    return api;
})();
