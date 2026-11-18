(function(){
const vol = "1.5.1",
    lvl = "Basic",
    nameMod = "Ghetto Love";

let jsLoader = window.__hassleTemplate.loader();

const defaultAdditionalScripts = [
    {
        name: "Old Info Card",
        id: "oldInfoCard",
        filePath: "additional-scripts/oldInfoCard.js",
        enabled: true,
        is_hidden: false,
    },
    
    {
        name: "Hide_Chat",
        id: "hideChat",
        filePath: "additional-scripts/hideChat.js",
        enabled: true,
        is_hidden: true,
    },
    {
        name: "Время на экране",
        id: "screenTime",
        filePath: "additional-scripts/screenTime.js",
        enabled: true,
        is_hidden: false,
        options: {
            dateSettings: {
                showDate: true,  
                format: "0",  
            },
            timeSettings: {
                showTime: true,  
                showHours: true,  
                showMinutes: true,  
                showSeconds: true,  
                showMs: false,  
            },
            timeSelector: ".ONEAS-time",
            dateSelector: ".ONEAS-data",
            wrapperSelector: ".ONEAS-hud__time-data",
        },
    },
    {
        name: "PageSize",
        id: "pageSize",
        filePath: "additional-scripts/pageSize.js",
        enabled: true,
        is_hidden: true,
    }
];

const oneasHud = {

    wantedAlwaysShowClass: "",
    hud: {
        data: {
            hudEl: null,
            hud_baseEl: null,
            hud_btEl: null,
            moneyEl: null,
            hpEl: {
                value: null,
                progress: null,
            },
            armourEl: {
                value: null,
                progress: null,
            },
            hungerEl: {
                value: null,
                progress: null,
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
                els: [],
            },
            weaponEl: {
                ammoEl: null,
                icon: null,
            },
            server: {
                wrapper: null,
                image: null,
            },
            bonusEl: null,
            greenZoneEl: null,
        },
        createHud(hudEl) {
            this.data.hudEl = hudEl;
            this.data.hud_baseEl = hudEl.querySelector(".ONEAS-hud-base");
            this.data.moneyEl = hudEl.querySelector("#ONEAS-cash__value");
            this.data.hud_btEl = hudEl.querySelector(".ONEAS-hud-bottom");
            [this.data.hpEl.progress, this.data.hpEl.value] = [
                hudEl.querySelector(".ONEAS-param__health .ONEAS-progress__value"),
                hudEl.querySelector(".ONEAS-param__health .ONEAS-param__amount"),
            ];
            [this.data.armourEl.progress, this.data.armourEl.value] = [
                hudEl.querySelector(".ONEAS-param__armour .ONEAS-progress__value"),
                hudEl.querySelector(".ONEAS-param__armour .ONEAS-param__amount"),
            ];
            [this.data.hungerEl.progress, this.data.hungerEl.value] = [
                hudEl.querySelector(".ONEAS-param__hunger .ONEAS-progress__value"),
                hudEl.querySelector(".ONEAS-param__hunger .ONEAS-param__amount"),
            ];
            [this.data.breathEl.wrapper, this.data.breathEl.value] = [
                hudEl.querySelector(".ONEAS-param__breath"),
                hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount"),
            ];
            [this.data.wanted.wrapper, this.data.wanted.els] = [
                hudEl.querySelector(".ONEAS-hud__wanted"),
                hudEl.querySelector(".ONEAS-wanted__row").children,
            ];
            this.data.weaponEl.ammoEl = hudEl.querySelector(".ONEAS-weapon__ammo").children;
            this.data.server.wrapper = hudEl.querySelector(".ONEAS-hud__logo");
            this.data.server.image = this.data.server.wrapper.children[0];
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-hud__green-zone");
            this.data.weaponEl.icon = hudEl.querySelector(".ONEAS-weapon__icon");
            [this.data.freezeEl.wrapper, this.data.freezeEl.value] = [
                hudEl.querySelector(".ONEAS-param__freeze"),
                hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"),
            ];

        },
        onInfoChange(prop, value) {
            if ((prop == "show" || prop == "showBars") && +value >= 1) {
                this.data.hudEl.style.display = "";
            }

            if ((prop == "show" || prop == "showBars") && +value === 0) {
                this.data.hudEl.style.display = "none";
            }

            if (prop == "weapon") {
                this.data.weaponEl.icon.src = `oneas-img/weapon/${value}.png`;
            }

            if (prop === "weapon" && value >= 16) {
                this.data.weaponEl.ammoEl[0].style.display = "";
                this.data.weaponEl.ammoEl[1].style.display = "";
            }

            if (prop === "weapon" && value < 16) {
                this.data.weaponEl.ammoEl[0].style.display = "none";
                this.data.weaponEl.ammoEl[1].style.display = "none";
            }

            if (prop == "showGreenZoneTab") {
                this.data.greenZoneEl.style.display = "";
            }

            if (prop == "hideGreenZoneTab") {
                this.data.greenZoneEl.style.display = "none";
            }

            if (prop == "health") {
                this.data.hpEl.progress.style.width = `${value}%`;
                this.data.hpEl.value.textContent = value;
            }

            if (prop == "armour") {
                this.data.armourEl.progress.style.width = `${value}%`;
                this.data.armourEl.value.textContent = value;
            }

            if (prop == "hunger") {
                this.data.hungerEl.progress.style.width = `${value}%`;
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
                    document.querySelector(".ONEAS-hud__info").style.right = "0vh";
                    return;
                }

                this.data.wanted.wrapper.style.display = "";
                document.querySelector(".ONEAS-hud__info").style.right = "2.3148vh";

                for (let i = 0; i < 6; i += 1) {
                    if ((5 - i) / value >= 1 || (5 - i == 0 && value == 0)) {
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted_inactive.png";
                        this.data.wanted.els[i].className = "ONEAS-wanted__inactive";
                    } else {
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted_active.png";
                        this.data.wanted.els[i].className = "ONEAS-wanted__active";
                    }
                }
            }

            if (prop == "ammoInClip") {
                this.data.weaponEl.ammoEl[0].textContent = value;
            }

            if (prop == "totalAmmo") {
                this.data.weaponEl.ammoEl[1].textContent = value;
            }

            if (prop == "setServer") {
                this.data.server.image.src = `oneas-img/logo/${value}.png`;

                if (value > 0 && this.data.server.wrapper.style.display == "none")
                    this.data.server.wrapper.style.display = "";

                if (value <= 0) this.data.server.wrapper.style.display = "none";
            }

            if (prop == "setBonus") {
                if (value <= 1) this.data.bonusEl.style.display = "none";
                else this.data.bonusEl.style.display = "";

                this.data.bonusEl.textContent = `x${value}`;
            }

            if (prop === "isShowFreeze" && value) {
                this.data.freezeEl.wrapper.style.opacity = "1";
            }

            if (prop === "isShowFreeze" && !value) {
                this.data.freezeEl.wrapper.style.opacity = "0";
            }

            if (prop == "freeze") {
                this.data.freezeEl.value.textContent = value;
            }
        },
        init() {
            const hudHtml = `
            <div class="ONEAS-hud-base">
<div class="ONEAS-hud__logo"><img src="oneas-img/logo/3.png" class="ONEAS-logo__image">
 <div class="ONEAS-logo__bonus">x2</div>
</div>
<div class="ONEAS-hud__info">
 <div class="ONEAS-hud__weapon"><img src="oneas-img/weapon/24.png" alt="" class="ONEAS-weapon__icon">
   <div class="ONEAS-weapon__ammo"><span id="ONEAS-ammo__in-clip">15</span><span id="ONEAS-ammo__total">100</span></div>
 </div>
 <div class="ONEAS-hud__params">
   <div class="ONEAS-param__health ONEAS-param"><span class="ONEAS-param__amount">50</span>
     <div class="ONEAS-param__progress">
       <div class="ONEAS-progress__value"></div>
     </div><img src="oneas-img/hud/health.png" alt="" class="ONEAS-param__icon"></div>
   <div class="ONEAS-param__armour ONEAS-param"><span class="ONEAS-param__amount">0</span>
     <div class="ONEAS-param__progress">
       <div class="ONEAS-progress__value"></div>
     </div><img src="oneas-img/hud/armour.png" alt="" class="ONEAS-param__icon"></div>
   <div class="ONEAS-param__hunger ONEAS-param"><span class="ONEAS-param__amount">0</span>
     <div class="ONEAS-param__progress">
       <div class="ONEAS-progress__value"></div>
     </div><img src="oneas-img/hud/hunger.png" alt="" class="ONEAS-param__icon"></div>
 </div>
 <div class="ONEAS-hud__cash">
   <div id="ONEAS-cash__value">10000</div>
 </div>
 <div class="ONEAS-hud__wanted ${oneasHud.wantedAlwaysShowClass}">
   <div class="ONEAS-wanted__row"><img src="oneas-img/hud/wanted_inactive.png" alt="" id="ONEAS-wanted-1" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/wanted_inactive.png" alt="" id="ONEAS-wanted-2" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/wanted_inactive.png" alt="" id="ONEAS-wanted-3" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/wanted_active.png" alt="" id="ONEAS-wanted-4" class="ONEAS-wanted__active"> <img src="oneas-img/hud/wanted_active.png" alt="" id="ONEAS-wanted-5" class="ONEAS-wanted__active"> <img src="oneas-img/hud/wanted_active.png" alt="" id="ONEAS-wanted-6" class="ONEAS-wanted__active"></div>
 </div><img src="oneas-img/hud/weapon_back.png" class="ONEAS-hud-info__bg"></div>
</div>
<div class="ONEAS-hud__green-zone"><img src="oneas-img/hud/zone.png" alt="" class="ONEAS-green-zone__image"></div>
<div class="ONEAS-hud-bottom">
<div class="ONEAS-hud__time-data" style="display: none">
     <div class="ONEAS-data">22.05.2023</div>
     <div class="ONEAS-time">19:32:25</div>
   </div>
 <div style="opacity: 0" class="ONEAS-param__freeze ONEAS-param">
   <img src="https://i.ibb.co/GMmDpnx/freeze-icon-ghetto.png" alt="" class="ONEAS-param__icon">
   <span class="ONEAS-param__amount">0</span>
 </div>
 <div class="ONEAS-hud__radar-border">
   <img src="oneas-img/hud/border.png" class="ONEAS-radar__images">
 </div>    
 <div style="display: none" class="ONEAS-param__breath ONEAS-param">
   <svg class="ONEAS-param__icon" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path fill-rule="evenodd" clip-rule="evenodd" d="M5.91596 11.8319C9.18326 11.8319 11.8319 9.18326 11.8319 5.91596C11.8319 2.64867 9.18326 0 5.91596 0C2.64867 0 0 2.64867 0 5.91596C0 9.18326 2.64867 11.8319 5.91596 11.8319ZM4.19199 4.63441C4.87268 4.63441 5.42448 4.08261 5.42448 3.40192C5.42448 2.72123 4.87268 2.16943 4.19199 2.16943C3.5113 2.16943 2.9595 2.72123 2.9595 3.40192C2.9595 4.08261 3.5113 4.63441 4.19199 4.63441Z" fill="white"></path>
     <path fill-rule="evenodd" clip-rule="evenodd" d="M3.84366 18.9805C5.4228 18.9805 6.70295 17.7004 6.70295 16.1212C6.70295 14.5421 5.4228 13.262 3.84366 13.262C2.26452 13.262 0.984375 14.5421 0.984375 16.1212C0.984375 17.7004 2.26452 18.9805 3.84366 18.9805ZM3.05899 15.9812C3.38798 15.9812 3.65468 15.7145 3.65468 15.3856C3.65468 15.0566 3.38798 14.7899 3.05899 14.7899C2.73001 14.7899 2.46331 15.0566 2.46331 15.3856C2.46331 15.7145 2.73001 15.9812 3.05899 15.9812Z" fill="white"></path>
     <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5599 7.69182C12.7275 7.09624 12.8171 6.46802 12.8171 5.81888C12.8171 5.75603 12.8162 5.69337 12.8146 5.63092C12.9129 5.6244 13.0122 5.62109 13.1122 5.62109C15.5626 5.62109 17.5491 7.60759 17.5491 10.0581C17.5491 12.5085 15.5626 14.495 13.1122 14.495C11.3368 14.495 9.80499 13.4523 9.0957 11.9459C10.1106 11.418 10.9777 10.6454 11.619 9.70624C11.8451 9.98131 12.1879 10.1567 12.5717 10.1567C13.2524 10.1567 13.8042 9.60494 13.8042 8.92426C13.8042 8.24357 13.2524 7.69176 12.5717 7.69176C12.5678 7.69176 12.5639 7.69178 12.5599 7.69182Z" fill="white"></path>
   </svg>
   <span class="ONEAS-param__amount">100</span>
 </div>
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
            window.__hassleTemplate.interface("Hud").info.ammoInClip = window.__hassleTemplate.interface("Hud").info.ammoInClip;
            window.__hassleTemplate.interface("Hud").info.totalAmmo = window.__hassleTemplate.interface("Hud").info.totalAmmo;
            window.__hassleTemplate.interface("Hud").info.money = window.__hassleTemplate.interface("Hud").info.money;
            window.__hassleTemplate.interface("Hud").info.wanted = 0;
            window.__hassleTemplate.interface("Hud").info.weapon = window.__hassleTemplate.interface("Hud").info.weapon;
            window.__hassleTemplate.interface("Hud").info.show = 0;
            window.__hassleTemplate.interface("Hud").info.isShowFreeze = window.__hassleTemplate.interface("Hud").info.isShowFreeze;
            window.__hassleTemplate.interface("Hud").hideGreenZoneTab();
        },
    },
    speedometer: {
        barsValues: {
            speed: {
                dashArray: 400,
                dashOffset: 400,
            },
            fuel: {
                dashArray: 171,
                dashOffset: 0,
            },
            wash: {
                dashArray: 185,
                dashOffset: 185,
            },
            damage: {
                dashArray: 185,
                dashOffset: 185,
            },
        },
        data: {
            speedometerEl: null,
            speed: {
                valueEl: null,
                barEl: null,
            },
            fuel: {
                progress: null,
                valueEl: null,
                barEl: null,
                wrapperEl: null,
            },
            wash: {
                valueEl: null,
                barEl: null,
                wrapperEl: null,
            },
            damage: {
                valueEl: null,
                barEl: null,
            },
            tachometer: {
                wrapper: null,
                rpmEl: null,
                gearEl: null,
                 
            },
            mileageEl: null,
            turnsEls: [],
            paramsEls: [],
        },
        onChangeInfo(prop, value) {
            try {
                if (prop === "damage") {
                    isNaN(value * 100) ? (value = 0) : value;

                    this.setDamage(+value);
                }

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

                if (prop == "left") {
                    this.data.turnsEls[0].classList.toggle("ONEAS-speedometer-turn--active", +value);
                }

                if (prop == "right") {
                    this.data.turnsEls[1].classList.toggle("ONEAS-speedometer-turn--active", +value);
                }

                if (prop == "rem") {
                    this.data.paramsEls[2].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "doors") {
                    this.data.paramsEls[3].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "temperature") {
                    this.data.paramsEls[1].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "lights") {
                    this.data.paramsEls[0].classList.toggle("ONEAS-spedometer-param--active", +value);
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

            this.data.speedometerEl.style.bottom = "4vh";
             
        },
        hide() {

            this.data.speedometerEl.style.bottom = "-70vh";
             
        },
        setGear(value) {
            this.data.tachometer.gearEl.textContent = value;
        },
        setTachometer(rpm, maxRpm) {
             
            if (window.__hassleTemplate.interface("Hud").speedometer.tachometer.show) {
                this.data.tachometer.wrapper.classList.toggle("ONEAS-tachometer-glow", rpm / maxRpm > 0.5);
            } else {
                this.data.tachometer.wrapper.classList.toggle("ONEAS-tachometer-glow", false);
            }

            if (rpm > maxRpm) rpm = maxRpm;

            this.data.tachometer.rpmEl.textContent = rpm;

        },
        setMileage(km) {

            this.data.mileageEl.textContent = km;
        },
        setSpeed(speed) {
            const maxSpeed = window.__hassleTemplate.interface("Hud").speedometer.maxSpeed;
            this.data.speed.valueEl.textContent = speed;

            if (speed > maxSpeed) speed = maxSpeed;

            const multiplier = this.barsValues.speed.dashArray - (speed / maxSpeed) * this.barsValues.speed.dashArray;

            this.data.speed.barEl.setAttribute('stroke-dashoffset', multiplier);
             
        },
        setDamage(floatDamage) {
            const multiplier = this.barsValues.damage.dashArray - floatDamage * this.barsValues.damage.dashArray;

            this.data.damage.barEl.setAttribute('stroke-dashoffset', multiplier);
        },
        setWash(floatWash) {
            this.data.wash.wrapperEl.classList.toggle("ONEAS-speedometer-danger", floatWash >= 0.75);

            const multiplier = this.barsValues.wash.dashArray - floatWash * this.barsValues.wash.dashArray;

            this.data.wash.barEl.setAttribute('stroke-dashoffset', multiplier);
        },
        setFuel(fuel) {
            this.data.fuel.wrapperEl.classList.toggle("ONEAS-speedometer-danger", fuel <= 15);

            const maxFuel = window.__hassleTemplate.interface("Hud").speedometer.maxFuel;

            this.data.fuel.valueEl.textContent = fuel;

            if (window.__hassleTemplate.interface("Hud").speedometer.isElectro) this.data.fuel.textEl.textContent = "%";
            else this.data.fuel.textEl.textContent = "л";

            if (fuel > maxFuel) fuel = maxFuel;

            const dashOffset = this.barsValues.fuel.dashArray - (fuel / maxFuel) * this.barsValues.fuel.dashArray;

            this.data.fuel.barEl.style.strokeDashoffset = dashOffset;
        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-speed__value");
            this.data.speed.barEl = speedometerEl.querySelector(".ONEAS-speedometer-speed__bar path");

            this.data.fuel.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-fuel__value");
            this.data.fuel.barEl = speedometerEl.querySelector(".ONEAS-speedometer-fuel__bar path");
            this.data.fuel.textEl = speedometerEl.querySelector(".ONEAS-speedometer-fuel__text");
            this.data.fuel.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__fuel");

            this.data.wash.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-wash__value");
            this.data.wash.barEl = speedometerEl.querySelector(".ONEAS-speedometer-wash__bar path");
            this.data.wash.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__wash");

            this.data.damage.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-damage__value");
            this.data.damage.barEl = speedometerEl.querySelector(".ONEAS-speedometer-damage__bar path");

            this.data.mileageEl = speedometerEl.querySelector(".ONEAS-speedometer-mileage__value");

            this.data.paramsEls = speedometerEl.querySelector(".ONEAS-speedometer__params").children;

            this.data.turnsEls = speedometerEl.querySelector(".ONEAS-speedometer__turns").children;

            this.data.tachometer.wrapper = speedometerEl.querySelector(".ONEAS-speedometer__tachometer");
            this.data.tachometer.gearEl = this.data.tachometer.wrapper.querySelector(
                "#ONEAS-tachometer-gear .ONEAS-tachometer-value"
            );
            this.data.tachometer.rpmEl = this.data.tachometer.wrapper.querySelector(
                "#ONEAS-tachometer-rpm .ONEAS-tachometer-value"
            );

        },
        init() {
            const text = `
            <div style="display: none" class="ONEAS-speedometer__tachometer">
                          <div id="ONEAS-tachometer-gear">
                               <div class="ONEAS-tachometer-text">Передача:</div>
                               <div class="ONEAS-tachometer-value">2</div>
                          </div>
                          <div id="ONEAS-tachometer-rpm">
                               <div class="ONEAS-tachometer-text">Обороты:</div>
                               <div class="ONEAS-tachometer-value">2850</div>
                          </div>
                     </div>
                     <img class="ONEAS-speedometer-bg" src="oneas-img/speed/back.png" alt="" srcset="">
            <div class="ONEAS-speedometer__speed">
              <svg class="ONEAS-speedometer-speed__bar" width="159" height="147" viewBox="0 0 159 147" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke-dasharray="${this.barsValues.speed.dashArray}" stroke-dashoffset="${this.barsValues.speed.dashArray}"  d="M37.8181 144.837C23.7136 135.839 12.8996 122.518 6.99216 106.865C1.0847 91.2128 0.400993 74.0689 5.04322 57.9956C9.68544 41.9224 19.4043 27.7829 32.7474 17.6902C46.0905 7.5976 62.3413 2.09374 79.0713 2.00119C95.8012 1.90864 112.112 7.23237 125.566 17.1768C139.02 27.1212 148.895 41.1523 153.714 57.1732C158.534 73.1941 158.04 90.3446 152.306 106.061C146.572 121.778 135.906 135.218 121.902 144.371" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg class="ONEAS-speedometer-speed__bar-bg" width="159" height="147" viewBox="0 0 159 147" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.8181 144.837C23.7136 135.839 12.8996 122.518 6.99216 106.865C1.0847 91.2128 0.400993 74.0689 5.04322 57.9956C9.68544 41.9224 19.4043 27.7829 32.7474 17.6902C46.0905 7.5976 62.3413 2.09374 79.0713 2.00119C95.8012 1.90864 112.112 7.23237 125.566 17.1768C139.02 27.1212 148.895 41.1523 153.714 57.1732C158.534 73.1941 158.04 90.3446 152.306 106.061C146.572 121.778 135.906 135.218 121.902 144.371" stroke="black" stroke-opacity="0.5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="ONEAS-speedometer-speed__data"><span class="ONEAS-speedometer-speed__value">0</span><span class="ONEAS-speedometer-speed__text">км/ч</span></div>
            </div>
            <div class="ONEAS-speedometer__speed-params">
              <div class="ONEAS-speedometer__mileage"><span class="ONEAS-speedometer-mileage__value">000000</span></div>
              <div class="ONEAS-speedometer__turns">
                <div class="ONEAS-speedometer-turn__left"></div>
                <div class="ONEAS-speedometer-turn__right"></div>
              </div>
            </div>
            <div class="ONEAS-speedometer__params">
              <div class="ONEAS-spedometer-param__lights ONEAS-spedometer-param--active"></div>
              <div class="ONEAS-spedometer-param__key ONEAS-spedometer-param--active"></div>
              <div class="ONEAS-spedometer-param__rem ONEAS-spedometer-param--active"></div>
              <div class="ONEAS-spedometer-param__doors ONEAS-spedometer-param--active"></div>
            </div>
            <div class="ONEAS-speedometer__fuel">
              <div class="ONEAS-speedometer-fuel__icon"></div>
              <div class="ONEAS-speedometer-data__text">
                <div class="ONEAS-speedometer-fuel__value">50</div>
                <div class="ONEAS-speedometer-fuel__text ONEAS-speedometer-data__text">%</div>
              </div>
            </div>
            <div class="ONEAS-speedometer__wash">
              <div class="ONEAS-speedometer-wash__icon"></div>
              <div class="ONEAS-speedometer-data__wash">
                <svg class="ONEAS-speedometer-wash__bar" width="111" height="121" viewBox="0 0 111 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-dasharray="${this.barsValues.wash.dashArray}" stroke-dashoffset="${this.barsValues.wash.dashArray}"  d="M105.56 2.07677C109.747 16.9547 110.118 32.6478 106.639 47.7071C103.16 62.7664 95.9438 76.7066 85.6554 88.2406C75.367 99.7747 62.3386 108.531 47.773 113.701C33.2074 118.871 17.574 120.287 2.31623 117.821" stroke="white" stroke-width="4" stroke-linecap="round" />
                </svg>
                <svg class="ONEAS-speedometer-wash__bar-bg" width="111" height="121" viewBox="0 0 111 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M105.56 2.07677C109.747 16.9547 110.118 32.6478 106.639 47.7071C103.16 62.7664 95.9438 76.7066 85.6554 88.2406C75.367 99.7747 62.3386 108.531 47.773 113.701C33.2074 118.871 17.574 120.287 2.31623 117.821" stroke="black" stroke-opacity="0.5" stroke-width="4" stroke-linecap="round" />
                </svg>
              </div>
            </div>
            <div class="ONEAS-speedometer__damage">
              <div class="ONEAS-speedometer-damage__icon"></div>
              <div class="ONEAS-speedometer-data__damage">
                <svg class="ONEAS-speedometer-damage__bar" width="161" height="48" viewBox="0 0 161 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-dasharray="${this.barsValues.damage.dashArray}" stroke-dashoffset="${this.barsValues.damage.dashArray}"  d="M2.93307 45.3214C11.111 32.2062 22.4612 21.3628 35.936 13.7921C49.4108 6.22137 64.5757 2.16748 80.0308 2.00465C95.4858 1.84183 110.733 5.57533 124.364 12.8605C137.995 20.1456 149.572 30.7475 158.024 43.6875" stroke="white" stroke-width="4" stroke-linecap="round" />
                </svg>
                <svg class="ONEAS-speedometer-damage__bar-bg" width="161" height="48" viewBox="0 0 161 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.93307 45.3214C11.111 32.2062 22.4612 21.3628 35.936 13.7921C49.4108 6.22137 64.5757 2.16748 80.0308 2.00465C95.4858 1.84183 110.733 5.57533 124.364 12.8605C137.995 20.1456 149.572 30.7475 158.024 43.6875" stroke="black" stroke-opacity="0.5" stroke-width="4" stroke-linecap="round" />
                </svg>
              </div>
            </div>`;
            const speedometerEl = jsLoader._x1040123.ljfkles(text, "ONEAS-speedometer", (prop, value) =>
                this.onChangeInfo(prop, value)
            );

            this.create(speedometerEl);

            window.__hassleTemplate.interface("Hud").speedometer.show = 0;
        },
    },
    init(jslInjected) {
        jsLoader = jslInjected;
        this.hud.init();
        this.speedometer.init();
        jsLoader.showAddedScript(`HUD ${nameMod} v${vol}`, "info");
    },
};

return oneasHud;
})()