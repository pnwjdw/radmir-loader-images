(function () {
    if (window.__oldDialogsHassle) return window.__oldDialogsHassle;
    const fonts = new Map();
    const api = {
        version: 13,
        fontChunk(key, css) {
            let node = fonts.get(key);
            if (!node) {
                node = document.createElement('style');
                node.id = '__hassleFont' + key;
                document.head.appendChild(node);
                fonts.set(key, node);
            }
            node.textContent = css;
            return {};
        },
        status() {
            if (window.__oldDialogsHud) window.__oldDialogsHud.touch();
            return { version: window.__oldDialogsHud && window.__oldDialogsLayout ? 13 : 0, layout: window.__oldDialogsLayout ? window.__oldDialogsLayout.status() : {} };
        },
        shutdown() {
            for (const node of fonts.values()) node.remove();
            fonts.clear();
            if (window.__oldDialogsHud) window.__oldDialogsHud.shutdown();
            if (window.__oldDialogsLayout) window.__oldDialogsLayout.shutdown();
            delete window.__oldDialogsHassle;
        }
    };
    window.__oldDialogsHassle = api;
    return api;
})();
