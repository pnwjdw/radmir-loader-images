(function () {
    if (window.__oldDialogsHud) window.__oldDialogsHud.shutdown();
    const style = document.createElement('style');
    style.id = '__hassleChatStyle';
    document.head.appendChild(style);
    let clock = null;
    let config = {};
    let seen = Date.now();
    function updateClock() {
        const cfg = config.clock || {};
        const hud = window.__hassleTemplate;
        const embedded = hud && hud.clock(cfg);
        const visible = !hud || hud.hudVisible();
        if (!cfg.enabled || (!cfg.standalone && embedded) || !visible) {
            if (clock) { clock.remove(); clock = null; }
            return;
        }
        if (!clock) {
            clock = document.createElement('div');
            clock.id = '__hassleClock';
            document.body.appendChild(clock);
        }
        const color = cfg.color || [1,1,1,1];
        const css = 'position:fixed;left:' + cfg.x + 'px;top:' + cfg.y + 'px;pointer-events:none;white-space:nowrap;z-index:1000;font-family:OldDialogsLocal' + cfg.font + ',sans-serif;font-size:' + cfg.size + 'px;font-weight:' + (cfg.bold ? 700 : 400) + ';color:rgba(' + color.slice(0,3).map(v=>Math.round(v*255)).join(',') + ',' + color[3] + ');text-shadow:1px 1px 2px black;';
        if (clock.__hassleCss !== css) { clock.style.cssText = css; clock.__hassleCss = css; }
        const now = new Date();
        const pad = (n, length=2) => String(n).padStart(length,'0');
        const hour = cfg.format24 ? now.getHours() : now.getHours()%12 || 12;
        let text = pad(hour) + ':' + pad(now.getMinutes());
        if (cfg.seconds || cfg.milliseconds) text += ':' + pad(now.getSeconds());
        if (cfg.milliseconds) text += '.' + pad(now.getMilliseconds(),3);
        if (!cfg.format24) text += now.getHours()<12 ? ' AM' : ' PM';
        if (cfg.date) text += '  ' + pad(now.getDate()) + '.' + pad(now.getMonth()+1) + '.' + now.getFullYear();
        if (clock.textContent !== text) clock.textContent = text;
    }
    const timer = setInterval(() => {
        if (Date.now()-seen>15000) { api.shutdown(); return; }
        updateClock();
    }, 50);
    const api = {
        configure(value) {
            seen = Date.now();
            config = value || {};
            const chat = config.chat;
            let css = '';
            if (chat && chat.enabled) {
                const root = '#app .radmir-chat';
                css = root + '{position:fixed!important;left:' + chat.x + 'px!important;top:' + chat.y + 'px!important;width:' + chat.width + 'px!important;max-width:none!important;margin:0!important;opacity:' + chat.opacity + '!important;}';
                const shadows = [];
                const rgba = chat.outlineColor || [0,0,0,1];
                const color = 'rgba(' + rgba.slice(0,3).map(v=>Math.round(v*255)).join(',') + ',' + rgba[3] + ')';
                for (const [x,y] of [[-1,0],[1,0],[0,-1],[0,1]]) shadows.push(x*chat.outline+'px '+y*chat.outline+'px 0 '+color);
                css += root + ',' + root + ' *{font-family:OldDialogsLocal' + chat.font + ',sans-serif!important;font-weight:' + (chat.bold?700:400) + '!important;font-size:' + chat.size + 'px!important;line-height:' + chat.lineHeight + 'px!important;text-shadow:' + shadows.join(',') + '!important;}';
                css += root + ' .radmir-chat__messages{height:' + chat.lines*chat.lineHeight + 'px!important;max-height:' + chat.lines*chat.lineHeight + 'px!important;}';
                css += root + ' .radmir-chat__controls{top:' + chat.lines*chat.lineHeight + 'px!important;}';
            }
            if (style.textContent !== css) style.textContent = css;
            updateClock();
            return {};
        },
        touch() { seen = Date.now(); },
        shutdown() {
            clearInterval(timer);
            style.remove();
            if (clock) clock.remove();
            delete window.__oldDialogsHud;
        }
    };
    window.__oldDialogsHud = api;
    return api;
})();
