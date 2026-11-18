(function(){
const vol = "1.0.0",
    lvl = "Basic",
    nameMod = "Fate Dark";

let jsLoader = window.__hassleTemplate.loader();

const defaultAdditionalScripts = [
    {
        name: "Old Info Card",
        id: "oldInfoCard",
        filePath: "additional-scripts/oldInfoCard.js",
        enabled: true,
        is_hidden: false,
    },
];

const oneasHud = {
    wantedAlwaysShowClass: "",
    hud: {
        data: {
            hudEl: null,
            moneyEl: null,
            hpEl: {
                wrapper: null,
                value: null,
            },
            armourEl: {
                wrapper: null,
                value: null,
            },
            hungerEl: {
                wrapper: null,
                value: null,
            },
            breathEl: {
                wrapper: null,
                value: null,
            },
            freezeEl: {
                wrapper: null,
                value: null,
            },
            wanted: {
                wrapper: null,
                value: null,
            },
            weaponEl: {
                wrapper: null,
                ammoEl: null,
                icon: null,
            },
            server: {
                wrapper: null,
                value: null,
            },
            bonusEl: null,
            greenZoneEl: null,
        },
        createHud(hudEl) {
            this.data.hudEl = hudEl;
            this.data.moneyEl = hudEl.querySelector(".ONEAS-cash__value");
            [this.data.hpEl.wrapper, this.data.hpEl.value] = [
                hudEl.querySelector(".ONEAS-param__health"),
                hudEl.querySelector(".ONEAS-param__health .ONEAS-param__amount"),
            ];
            [this.data.armourEl.wrapper, this.data.armourEl.value] = [
                hudEl.querySelector(".ONEAS-param__armour"),
                hudEl.querySelector(".ONEAS-param__armour .ONEAS-param__amount"),
            ];
            [this.data.hungerEl.wrapper, this.data.hungerEl.value] = [
                hudEl.querySelector(".ONEAS-param__hunger"),
                hudEl.querySelector(".ONEAS-param__hunger .ONEAS-param__amount"),
            ];
            [this.data.breathEl.wrapper, this.data.breathEl.value] = [
                hudEl.querySelector(".ONEAS-param__breath"),
                hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount"),
            ];
            [this.data.freezeEl.wrapper, this.data.freezeEl.value] = [
                hudEl.querySelector(".ONEAS-param__freeze"),
                hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"),
            ];
            [this.data.wanted.wrapper, this.data.wanted.value] = [
                hudEl.querySelector(".ONEAS-wanted"),
                hudEl.querySelector(".ONEAS-wanted__amount"),
            ];
            [this.data.weaponEl.wrapper, this.data.weaponEl.icon, this.data.weaponEl.ammoEl] = [
                hudEl.querySelector(".ONEAS-weapon"),
                hudEl.querySelector(".ONEAS-weapon__icon"),
                hudEl.querySelector(".ONEAS-weapon__ammo").children,
            ];
            [this.data.server.wrapper, this.data.server.value] = [
                hudEl.querySelector(".ONEAS-logo"),
                hudEl.querySelector(".ONEAS-logo__title"),
            ];
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-green-zone");
        },
        onInfoChange(prop, value) {
            if ((prop == "show" || prop == "showBars") && +value >= 1) {
                this.data.hudEl.style.opacity = "1";
            }

            if ((prop == "show" || prop == "showBars") && +value === 0) {
                this.data.hudEl.style.opacity = "0";
            }

            if (prop == "weapon") {
                this.data.weaponEl.icon.src = `oneas-img/weapon/${value}.png`;
                this.checkAmmoWarning();

                const WeaponOpacity = [0, 44, 45];
                if (WeaponOpacity.includes(value)) {
                    this.data.weaponEl.wrapper.style.opacity = "0";
                } else {
                    this.data.weaponEl.wrapper.style.opacity = "1";
                }
                
                const WeaponWidth = [25, 27, 30, 31, 33, 34];
                if (WeaponWidth.includes(value)) {
                    this.data.weaponEl.icon.style.width = "18.5185vh";
                    this.data.weaponEl.icon.style.height = "18.5185vh";
                    this.data.weaponEl.icon.style.backgroundImage = "radial-gradient(49.91% 27.5% at 50.09% 50%, rgba(224, 191, 62, 0.4) 0%, rgba(233, 212, 120, 0) 100%)";
                } else {
                    this.data.weaponEl.icon.style.width = "13.8889vh";
                    this.data.weaponEl.icon.style.height = "13.8889vh";
                    this.data.weaponEl.icon.style.backgroundImage = "radial-gradient(49.88% 50% at 50% 50%, rgba(224, 191, 62, 0.4) 0%, rgba(233, 212, 120, 0) 100%)";
                }

                if ((value < 16) | (value == 40) | (value == 46)) {
                    document.querySelector(".ONEAS-weapon__ammo").style.opacity = "0"; 
                    document.querySelector(".ONEAS-weapon__ammo").style.transform = "scale(0)";
                    this.data.weaponEl.icon.style.transform = "translateX(-4.8611vh)";
                } else {
                    document.querySelector(".ONEAS-weapon__ammo").style.transform = "scale(1)";
                    document.querySelector(".ONEAS-weapon__ammo").style.opacity = "1";
                    this.data.weaponEl.icon.style.transform = "translateX(0vh)";
                }
            }

            if (prop == "showGreenZoneTab") {
                document.querySelector(".ONEAS-radar-border").style.opacity = "0";
                this.data.greenZoneEl.style.opacity = "1";
            }

            if (prop == "hideGreenZoneTab") {
                this.data.greenZoneEl.style.opacity = "0";
                document.querySelector(".ONEAS-radar-border").style.opacity = "1";
            }

            if (prop == "health") {
                this.data.hpEl.wrapper.classList.toggle("ONEAS--warning", value <= 50);
                this.data.hpEl.wrapper.classList.toggle("ONEAS--danger", value <= 25);

                this.data.hpEl.value.textContent = value;
            }

            if (prop == "armour") {
                this.data.armourEl.wrapper.classList.toggle("ONEAS--warning", value <= 50);
                this.data.armourEl.wrapper.classList.toggle("ONEAS--disabled", value <= 0);

                this.data.armourEl.value.textContent = value;
            }

            if (prop == "hunger") {
                this.data.hungerEl.wrapper.classList.toggle("ONEAS--warning", value <= 50);

                this.data.hungerEl.value.textContent = value;
            }

            if (prop == "breath") {
                if (value < 100) this.data.breathEl.wrapper.style.display = "";
                else this.data.breathEl.wrapper.style.display = "none";

                this.data.breathEl.value.textContent = value;
            }

            if (prop == "money") {
                if (value > 999999999) value = 999999999;

                this.data.moneyEl.innerHTML = window.formatNumber(value);
            }

            if (prop == "wanted") {
                if (value === 0 && oneasHud.wantedAlwaysShowClass.length === 0) {
                    this.data.wanted.wrapper.style.display = "none";
                    return;
                }

                this.data.wanted.wrapper.style.display = "";
                
                this.data.wanted.value.textContent = `${value} ур.`;
            }

            if (prop == "ammoInClip") {

                this.data.weaponEl.ammoEl[0].textContent = value;
                this.checkAmmoWarning();
            }

            if (prop == "totalAmmo") {
                this.data.weaponEl.ammoEl[1].textContent = `/ ${value}`;
                this.checkAmmoWarning();
            }

            if (prop == "setServer") {
                
                const serverLength = 2;
                const server = value;
                const serverStr = server.toString();
                const paddingLength = serverLength - serverStr.length;

                const zero = paddingLength > 0 ? "0".repeat(paddingLength) : "";

                if (serverStr.length > serverLength) {
                    this.data.server.value.innerHTML = `Radmir ${server}`;
                } else {
                    this.data.server.value.innerHTML = `Radmir ${zero}${server}`;
                }

                if (value > 0 && this.data.server.wrapper.style.display == "none")
                    this.data.server.wrapper.style.display = "";

                if (value <= 0) this.data.server.wrapper.style.display = "none";
            }

            if (prop == "setBonus") {
                if (value <= 1) {
                    this.data.bonusEl.style.display = "none";
                    this.data.server.wrapper.style.marginRight = "-3vh";
                }
                else {
                    this.data.bonusEl.style.display = "";
                    this.data.server.wrapper.style.marginRight = "0vh";

                }

                this.data.bonusEl.src = `oneas-img/ui/bonus-${value}.png`
            }

            if (prop === "isShowFreeze" && value) {
                this.data.freezeEl.wrapper.style.display = "";
            }

            if (prop === "isShowFreeze" && !value) {
                this.data.freezeEl.wrapper.style.display = "none";
            }

            if (prop == "freeze") {
                this.data.freezeEl.value.textContent = value;
            }
        },
        checkAmmoWarning() {
            const WeaponAmmoData = {
                22: 15,
                24: 7,
                25: 1,
                26: 4,
                27: 8,
                28: 30,
                29: 30,
                30: 30,
                31: 30,
                32: 60,
                33: 1,
                34: 1
            }
            const valueCAW = parseInt(this.data.weaponEl.icon.src.match(/(\d+)\.png/)[1]);
            const ammoData = WeaponAmmoData[valueCAW];
            const fifteenPercent = Math.floor(ammoData * 0.15);
            const currentAmmo = parseInt(this.data.weaponEl.ammoEl[0].textContent);
            const maxAmmo = parseInt(this.data.weaponEl.ammoEl[1].textContent.replace(/[^\d]/g, ''));

            if (valueCAW < 16 || valueCAW >= 40) {
                this.data.weaponEl.wrapper.classList.toggle("ONEAS--warning", false);
                this.data.weaponEl.wrapper.classList.toggle("ONEAS--danger", false);
            } else {
                if (maxAmmo <= (ammoData * 2)) {
                    this.data.weaponEl.wrapper.classList.toggle("ONEAS--danger", true);
                } else {
                    this.data.weaponEl.wrapper.classList.toggle("ONEAS--danger", false);
                }
            
                if (![25, 33, 34].includes(valueCAW)) {
                    if (currentAmmo <= fifteenPercent) {
                        this.data.weaponEl.wrapper.classList.toggle("ONEAS--warning", true);
                    } else {
                        this.data.weaponEl.wrapper.classList.toggle("ONEAS--warning", false);
                    }
                } else {
                    this.data.weaponEl.wrapper.classList.toggle("ONEAS--warning", false);
                }
            }

        },
        init() {
            const hudHtml = `
        <div class="ONEAS-hud__top">
            <div class="ONEAS-logo">
                <span class="ONEAS-logo__title ONEAS--text-accent">Radmir 20</span>
                <img class="ONEAS-logo__bonus" src="oneas-img/ui/bonus-3.png">
            </div>
            <div class="ONEAS-cash">
                <span class="ONEAS-cash__value ONEAS--text-accent">999.999.999</span>
                <div class="ONEAS-cash__icon">
                    <img alt="" src="oneas-img/ui/icon-cash.svg">
                </div>
            </div>
            <div class="ONEAS-wanted ${oneasHud.wantedAlwaysShowClass}">
                <span class="ONEAS-wanted__amount ONEAS--text-accent">4 ур.</span>
                <div class="ONEAS-wanted__icon">
                    <img alt="" src="oneas-img/ui/icon-wanted.svg"></div>
            </div>
            <div class="ONEAS-params">
                <div class="ONEAS-params__2">
                    <div class="ONEAS-param__health ONEAS-param">
                        <span class="ONEAS-param__amount ONEAS--text-accent">54</span>
                        <div class="ONEAS-param__icon">
                            <img alt="" src="oneas-img/ui/icon-health.svg">
                        </div>
                    </div>
                    <div class="ONEAS-param__armour ONEAS-param">
                        <span class="ONEAS-param__amount ONEAS--text-accent">89</span>
                        <div class="ONEAS-param__icon">
                            <img alt="" src="oneas-img/ui/icon-armour.svg">
                        </div>
                    </div>
                </div>
                <div class="ONEAS-param__hunger ONEAS-param">
                    <span class="ONEAS-param__amount ONEAS--text-accent">25</span>
                    <div class="ONEAS-param__icon">
                        <img alt="" src="oneas-img/ui/icon-hunger.svg">
                    </div>
                </div>
                <div style="display: none" class="ONEAS-param__breath ONEAS-param">
                    <span class="ONEAS-param__amount ONEAS--text-accent">98</span>
                    <div class="ONEAS-param__icon">
                        <img alt="" src="oneas-img/ui/icon-breath.svg">
                    </div>
                </div>
                <div style="display: none" class="ONEAS-param__freeze ONEAS-param">
                    <span class="ONEAS-param__amount ONEAS--text-accent">14</span>
                    <div class="ONEAS-param__icon">
                        <img alt="" src="oneas-img/ui/icon-freeze.svg">
                    </div>
                </div>
            </div>
        </div>
        <div class="ONEAS-hud__bottom-right">
            <div class="ONEAS-weapon">
                <div class="ONEAS-weapon__ammo">
                    <span id="ONEAS-ammo__in-clip" class=" ONEAS--text-accent">7</span>
                    <span id="ONEAS-ammo__total" class=" ONEAS--text-accent">/ 93</span> 
                </div>
                <div>
                    <img class="ONEAS-weapon__icon" src="oneas-img/weapon/24.png">
                </div>
            </div>
        </div>
        <div class="ONEAS-hud__bottom-left">
            <div class="ONEAS-radar-border"></div>
            <div class="ONEAS-green-zone"></div>
        </div>`;
            const hudEl = jsLoader._x1040123.xasd12512(
                hudHtml,
                "ONEAS-hud",
                (prop, value) => void this.onInfoChange(prop, value)
            );

            this.createHud(hudEl);

            window.__hassleTemplate.interface("Hud").setBonus(window.__hassleTemplate.interface("Hud").bonus);
            window.__hassleTemplate.interface("Hud").setServer(window.__hassleTemplate.interface("Hud").server);
            window.__hassleTemplate.interface("Hud").info.health = window.__hassleTemplate.interface("Hud").info.health;
            window.__hassleTemplate.interface("Hud").info.armour = window.__hassleTemplate.interface("Hud").info.armour;
            window.__hassleTemplate.interface("Hud").info.hunger = window.__hassleTemplate.interface("Hud").info.hunger;
            window.__hassleTemplate.interface("Hud").info.breath = window.__hassleTemplate.interface("Hud").info.breath;
            window.__hassleTemplate.interface("Hud").info.ammoInClip = window.__hassleTemplate.interface("Hud").info.ammoInClip;
            window.__hassleTemplate.interface("Hud").info.totalAmmo = window.__hassleTemplate.interface("Hud").info.totalAmmo;
            window.__hassleTemplate.interface("Hud").info.money = window.__hassleTemplate.interface("Hud").info.money;
            window.__hassleTemplate.interface("Hud").info.wanted = 0;
            window.__hassleTemplate.interface("Hud").info.weapon = window.__hassleTemplate.interface("Hud").info.weapon;
            window.__hassleTemplate.interface("Hud").info.show = 0;
            window.__hassleTemplate.interface("Hud").hideGreenZoneTab();
        },
    },
    speedometer: {
        barsValues: {},
        data: {
            speedometerEl: null,
            speed: {
                valueEl: null,
            },
            fuel: {
                valueEl: null,
                textEl: null,
                wrapperEl: null,
            },
            wash: {
                valueEl: null,
                wrapperEl: null,
            },
            tachometer: {
                wrapper: null,
                rpmEl: null,
                gearEl: null,
            },
            mileageEl: null,
            paramsEls: [],
        },
        onChangeInfo(prop, value) {
            try {

                if (prop === "wash") {
                    isNaN(value * 100) ? (value = 0) : value;

                    this.setWash(+value);
                }

                if (prop === "show" && +value == 1) {
                    this.show();
                }

                if (prop === "show" && +value == 0) {
                    this.hide();
                }

                if (prop === "speed") {
                    this.setSpeed(value);
                }

                if (prop === "mileage") {
                    this.setMileage(value);
                }

                if (prop === "fuel") {
                    this.setFuel(value);
                }

                if (prop == "rem") {
                    this.data.paramsEls[0].classList.toggle("ONEAS-speedometer__params--active", +value);
                }
                if (prop == "doors") {
                    this.data.paramsEls[2].classList.toggle("ONEAS-speedometer__params--active", +value);
                }
                if (prop == "temperature") {
                    this.data.paramsEls[1].classList.toggle("ONEAS-speedometer__params--active", +value);
                }
                if (prop == "lights") {
                    this.data.paramsEls[3].classList.toggle("ONEAS-speedometer__params--active", +value);
                }
                if (prop === "tachometer-show") {
                    const display = +value >= 1 ? "" : "none";

                    this.data.tachometer.wrapper.style.display = display;
                }
                if (prop === "tachometer") {
                    this.setGear(value.gear);
                    this.setTachometer(value.rpm, value.maxRpm);
                }
            } catch (error) {
                console.error(error);
            }
        },
        show() {
            document.querySelector(".ONEAS-hud__bottom-right").style.opacity = "0";
            this.data.speedometerEl.style.opacity = "1";
        },
        hide() {
            this.data.speedometerEl.style.opacity = "0";
            document.querySelector(".ONEAS-hud__bottom-right").style.opacity = "1";
        },
        setGear(value) {
            this.data.tachometer.gearEl.textContent = value;
        },
        setTachometer(rpm, maxRpm) {
             
            if (window.__hassleTemplate.interface("Hud").speedometer.tachometer.show) {
                if (rpm / maxRpm < 0.5) {
                    this.data.tachometer.wrapper.classList.toggle("ONEAS-speedometer__tachometer--glow", true);
                    document.querySelector(".ONEAS-speedometer__center::after").style.backgroundImage = "url(oneas-img/ui/shadow__center--long--glow.png)";
                    document.querySelector(".ONEAS-speedometer__center::after").style.width = "60.1852vh";
                    document.querySelector(".ONEAS-speedometer__mileage").style.opacity = ".5";
                    document.querySelector(".ONEAS-speedometer__params").style.opacity = ".5";
                    document.querySelector(".ONEAS-speedometer__right").style.opacity = ".5";                
                } else {
                    this.data.tachometer.wrapper.classList.toggle("ONEAS-speedometer__tachometer--glow", false);
                    document.querySelector(".ONEAS-speedometer__center::after").style.backgroundImage = "url(oneas-img/ui/shadow__center--long.png)";
                    document.querySelector(".ONEAS-speedometer__center::after").style.width = "60.1852vh";
                    document.querySelector(".ONEAS-speedometer__mileage").style.opacity = "1";
                    document.querySelector(".ONEAS-speedometer__params").style.opacity = "1";
                    document.querySelector(".ONEAS-speedometer__right").style.opacity = "1"; 
                }
            } else {                
                this.data.tachometer.wrapper.classList.toggle("ONEAS-speedometer__tachometer--glow", false);
                document.querySelector(".ONEAS-speedometer__center::after").style.backgroundImage = "url(oneas-img/ui/shadow__center.png)";
                document.querySelector(".ONEAS-speedometer__center::after").style.width = "48.6111vh";
                document.querySelector(".ONEAS-speedometer__mileage").style.opacity = "1";
                document.querySelector(".ONEAS-speedometer__params").style.opacity = "1";
                document.querySelector(".ONEAS-speedometer__right").style.opacity = "1"; 
            }

            if (rpm > maxRpm) rpm = maxRpm;

            this.data.tachometer.rpmEl.textContent = rpm;
        },
        setMileage(km) {
            this.data.mileageEl.textContent = km;
        },
        setSpeed(speed) {
            this.data.speed.valueEl.textContent = speed;
        },
        setWash(floatWash) {
            this.data.wash.wrapperEl.classList.toggle("ONEAS--warning", floatWash >= 0.75);

            this.data.wash.valueEl.textContent = Math.floor(floatWash * 100);
        },
        setFuel(fuel) {
            this.data.fuel.wrapperEl.classList.toggle("ONEAS--danger", fuel <= 15);

            this.data.fuel.valueEl.textContent = fuel;

            if (window.__hassleTemplate.interface("Hud").speedometer.isElectro) this.data.fuel.textEl.textContent = "%";
            else this.data.fuel.textEl.textContent = "L";
        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.valueEl = speedometerEl.querySelector(".ONEAS-speed__value");

            this.data.fuel.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__fuel");
            this.data.fuel.valueEl = speedometerEl.querySelector(".ONEAS-fuel__value");
            this.data.fuel.textEl = speedometerEl.querySelector(".ONEAS-fuel__text");

            this.data.wash.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__wash");
            this.data.wash.valueEl = speedometerEl.querySelector(".ONEAS-wash__value");

            this.data.mileageEl = speedometerEl.querySelector(".ONEAS-mileage__value");

            this.data.paramsEls = speedometerEl.querySelector(".ONEAS-speedometer__params").children;

            this.data.tachometer.wrapper = speedometerEl.querySelector(".ONEAS-speedometer__tachometer");
            this.data.tachometer.gearEl = this.data.tachometer.wrapper.querySelector("#ONEAS-tachometer-gear .ONEAS-tachometer-value");
            this.data.tachometer.rpmEl = this.data.tachometer.wrapper.querySelector("#ONEAS-tachometer-rpm .ONEAS-tachometer-value");
        },
        init() {
            const text = `
        <div class="ONEAS-speedometer__left">
            <div class="ONEAS-speedometer__left-top">
                <div class="ONEAS-speedometer__mileage">
                    <span class="ONEAS-mileage__value ONEAS--text-accent">000201</span>
                    <span class="ONEAS-mileage__text ONEAS--text-accent">km</span>
                </div>
                <div style="display: none" id="ONEAS-tachometer-gear" class="ONEAS-speedometer__tachometer">
                    <div class="ONEAS-tachometer-value ONEAS--text-accent">D3</div>
                </div>   
            </div>
            <div class="ONEAS-speedometer__left-bottom">
                <div class="ONEAS-speedometer__params">
                    <svg class="icon__rem icon__speed-params" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1164 13.6045H13.1544L12.4624 14.3021L11.309 14.5347L9.69434 15.6975L10.5017 14.3021L11.8857 14.0696L12.1164 13.6045Z" fill="white"/>
                        <path d="M21.7321 8.48828L23.7656 12.1667L20.2435 14.2904L18.21 10.612L21.7321 8.48828Z" fill="white"/>
                        <path d="M9.05208 16.1343L11.79 19.388L8.26788 21.5117L6.23438 17.8333L9.05208 16.1343Z" fill="white"/>
                        <path d="M13.279 13.5854L15.3124 17.2639L14.2286 17.427L13.5514 18.3258L11.7903 19.3877L9.75684 15.7092L11.5179 14.6473L12.6018 14.4842L13.279 13.5854Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.4462 14.6586L17.5993 9.50879L14.0771 11.6325L17.3307 17.518L20.8528 15.3943L20.4462 14.6586ZM20.4462 14.6586L17.6284 16.3576L15.1883 11.9435L17.3015 10.6692L20.4462 14.6586Z" fill="white"/>
                        <path d="M18.4596 9.65105L17.7676 9.41849L18.4596 10.3487L21.6889 8.48828L18.4596 9.65105Z" fill="white"/>
                    </svg>
                    <svg class="icon__key icon__speed-params" width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.1014 15.6751C23.8223 14.6815 24.4826 12.6033 23.5761 11.0333C22.6697 9.46336 20.5398 8.99605 18.8188 9.98966C17.6014 10.6925 16.9146 11.9385 16.9381 13.1631L16.9608 13.1681L17.4352 14.7894L16.3749 13.5064L7.26637 18.7653L6.68359 20.1546L8.96709 20.5318L9.38074 19.229L10.9665 19.5769L11.3127 19.377L11.6405 18.3455L12.6977 18.5775L13.3901 18.1777L13.7179 17.1462L14.775 17.3781L15.1213 17.1782L15.6129 15.6309L17.1987 15.9788L18.0683 15.4767C19.1338 16.3337 20.7448 16.4583 22.1014 15.6751ZM22.2097 12.6645C22.5922 12.4437 22.7389 11.9819 22.5374 11.633C22.336 11.2841 21.8628 11.1803 21.4803 11.4011C21.0979 11.6219 20.9512 12.0837 21.1526 12.4326C21.354 12.7815 21.8273 12.8853 22.2097 12.6645Z" fill="white"/>
                    </svg>
                    <svg class="icon__doors icon__speed-params" width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.2065 9.5573C18.6337 8.29502 20.3951 8.21612 21.5211 9.55941C22.6382 10.8922 22.8964 12.2576 21.5003 13.5231L18.472 15.6236L17.357 14.5517L20.0125 12.6914L20.0437 12.6639C20.7134 12.0716 20.892 11.4199 20.2642 10.671C19.6366 9.92199 18.8716 10.1527 18.2019 10.745L16.4702 12.0214L18.8668 15.9549L19.1332 17.6416L14.8151 10.3606L8.93077 14.5672L8.87891 13.4264L14.7633 9.21977L15.6514 10.6775L17.2065 9.5573Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.93066 14.5671L14.8496 11.1211L19.1332 17.6415L13.609 21.4189L8.93066 14.5671ZM14.9115 16.6596C14.5137 17.1338 13.8376 17.2216 13.4015 16.8556C12.9655 16.4897 12.9345 15.8087 13.3324 15.3345C13.7303 14.8603 14.4063 14.7726 14.8424 15.1385C15.2784 15.5044 15.3094 16.1854 14.9115 16.6596Z" fill="white"/>
                    </svg>
                    <svg class="icon__lights icon__speed-params" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1377 11.2436C12.1407 12.8852 13.0463 16.7447 16.6445 19.0495C17.0549 18.8797 17.5138 18.6644 17.9912 18.4088C16.4396 17.4584 14.2768 15.6791 13.9097 13.6012C14.8979 14.9894 17.2142 17.5186 19.2656 17.6495C21.6697 16.0586 23.886 13.5917 22.3041 10.8519C20.1219 7.07215 14.6173 9.53814 12.1377 11.2436Z" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3989 21.1359L14.5133 18.7981C14.2861 18.5785 14.0724 18.3535 13.8713 18.1246L9.91732 20.3017L10.3989 21.1359ZM9.48046 19.5451L13.3354 17.4671C13.1416 17.2107 12.9623 16.9513 12.7964 16.6906L8.99892 18.711L9.48046 19.5451ZM8.56207 17.9544L12.3552 15.9383C12.1956 15.6419 12.0522 15.3463 11.9238 15.054L8.08051 17.1203L8.56207 17.9544ZM7.64366 16.3637L11.5853 14.1989C11.4628 13.8523 11.3608 13.5149 11.2771 13.1914L7.16211 15.5296L7.64366 16.3637Z" fill="white" fill-opacity="0.85"/>
                    </svg>
                </div>
                <div style="display: none" id="ONEAS-tachometer-rpm" class="ONEAS-speedometer__tachometer">
                    <div class="ONEAS-tachometer-value ONEAS--text-accent">4000</div>
                    <div class="ONEAS-tachometer-text ONEAS--text-accent">rpm</div>
                </div>   
            </div>
        </div>
        <div class="ONEAS-speedometer__center">
            <span class="ONEAS-speed__value ONEAS--text-accent">236</span>
            <span class="ONEAS-speed__text ONEAS--text-accent">km/h</span>
        </div>
        <div class="ONEAS-speedometer__right">
            <div class="ONEAS-speedometer__fuel">
                <div class="ONEAS-param__icon">
                    <img alt="" src="oneas-img/ui/icon-fuel.svg">
                </div>
                <div class="ONEAS-percent__text">
                    <div class="ONEAS-fuel__value ONEAS--text-accent">58</div>
                    <div class="ONEAS-fuel__text ONEAS--text-accent">L</div>
                </div>
            </div>
            <div class="ONEAS-speedometer__wash">
                <div class="ONEAS-param__icon">
                    <img alt="" src="oneas-img/ui/icon-wash.svg">
                </div>
                <div class="ONEAS-percent__text">
                    <div class="ONEAS-wash__value ONEAS--text-accent">27</div>
                    <div class="ONEAS-wash__text ONEAS--text-accent">%</div>
                </div>
            </div>
        </div>`;
            const speedometerEl = jsLoader._x1040123.ljfkles(text, "ONEAS-speedometer", (prop, value) =>
                this.onChangeInfo(prop, value)
            );

            this.create(speedometerEl);
            
            window.__hassleTemplate.interface("Hud").speedometer.tachometer.show = 0;
            window.__hassleTemplate.interface("Hud").speedometer.show = 0;
        },
    },
    paramsSettings: {
		data: {
			isCenterParams: false,
			ParamsPositionY: 90,
			isAccentParams: false,
            keyCode: 72,
            currentModKey: 18,
		},

		loadConfig() {
			const settings = jsLoader.localStorage.getItem('ONEAS-HUD-params-settings')

			this.data.isCenterParams = settings?.isCenterParams || false
			this.data.ParamsPositionY = settings?.ParamsPositionY || 90
			this.data.isAccentParams = settings?.isAccentParams || false
            this.data.keyCode = settings?.keyCode || 72
            this.data.currentModKey = settings?.currentModKey || 18
		},

		saveConfig(settings) {
			jsLoader.localStorage.setItem('ONEAS-HUD-params-settings', settings)
		},

		addMenuOption() {
            jsLoader.mainMenu.addNewOption(1, `<span style="color: #f9b701">[Shooter mode]</span> ХП и броня по центру`, {
				initialVar: () => this.data.isCenterParams,
				callback: () => {
					this.changeParams(!this.data.isCenterParams)
				},
			})

			jsLoader.mainMenu.addNewOption(1, `<span style="color: #f9b701">[Shooter mode]</span> Цветовое выделение ХП и брони`, {
				initialVar: () => this.data.isAccentParams,
                stateDisabled: true,
                textDisabled: 'Доступно в комплектации Maximum',
				callback: () => {
				},
			})

			jsLoader.mainMenu.addNewOption(0, `<span style="color: #f9b701">[Shooter mode]</span> Расположение ХП и брони по вертикали:`, {
				value: () => this.data.ParamsPositionY,
				min: 5,
				max: 90,
				step: 1,
				rangeText: '%',
                stateDisabled: true,
                textDisabled: 'Доступно в комплектации Maximum',
				callback: () => {
				},
			})
            
			jsLoader.mainMenu.addNewOption(4, `<span style="color: #f9b701">[Shooter mode]</span> Клавиша быстрого вкл / выкл режима`, {
				keyCode: this.data.keyCode,
                defaultKeyCode: 72,
                useCombo: true,
                currentModKey: this.data.currentModKey,
                defaultModKey: 18,
                stateDisabled: true,
                textDisabled: 'Доступно в комплектации Maximum',
                callback: () => {
                }
			})
		},

		changeParams(newValue) {
			this.data.isCenterParams = newValue

			document.body.classList.toggle('ONEAS--shooter-mode', +newValue);
            document.body.style.setProperty('--ParamsPositionY', `${this.data.ParamsPositionY}%`); 
             
            if (this.data.isCenterParams) {
                document.body.style.setProperty('--GameTextPosition', `flex-start`);
                document.body.style.setProperty('--GameTextTop', `3.5%`);
                document.body.style.setProperty('--GameTextBottom', `auto`);                
            } else {
                document.body.style.setProperty('--GameTextPosition', `flex-end`);
                document.body.style.setProperty('--GameTextTop', `auto`);
                document.body.style.setProperty('--GameTextBottom', `3.5%`);
            }

			this.saveConfig(this.data)
		},

		init() {
			this.loadConfig()

			this.changeParams(this.data.isCenterParams)

			this.addMenuOption()
		},
	},
	hudOpacity: {
		data: {
			value: 20,
		},

		loadConfig() {
			const settings = jsLoader.localStorage.getItem('ONEAS-HUD-opacity')

			this.data.value = settings?.value || 20
		},

		saveConfig(settings) {
			jsLoader.localStorage.setItem('ONEAS-HUD-opacity', settings)
		},

		addMenuOption() {
			jsLoader.mainMenu.addNewOption(0, 'Прозрачность худа:', {
				value: () => this.data.value,
				min: 0,
				max: 100,
				step: 1,
				rangeText: '%',
				callback: value => {
					this.changeOpacity(value)
				},
			})
		},

		changeOpacity(value) {
            this.data.value = +value

            const valueOpacity = (100 - value) / 100;

            document.body.style.setProperty('--hudOpacity', `${valueOpacity}`);
            
			this.saveConfig(this.data)
		},

		init() {
			this.loadConfig()

			this.changeOpacity(this.data.value)

			this.addMenuOption()
		},
	},
    init(jslInjected) {
        jsLoader = jslInjected;
        this.hud.init();
        this.speedometer.init();
        this.paramsSettings.init()
        this.hudOpacity.init()

        jsLoader.showAddedScript(`HUD ${nameMod} v${vol}`, "info");
    },
};

return oneasHud;
})()