(function(){
const vol = "1.0.0",
    lvl = "Pletnev Style",
    nameMod = "Radmir Classic";

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
        name: "PageSize",
        id: "pageSize",
        filePath: "additional-scripts/pageSize.js",
        enabled: true,
        is_hidden: true,
    },
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
                wrapper: null,
            },
            hungerEl: {
                value: null,
                progress: null,
            },
            freezeEl: {
                wrapper: null,
                value: null,
                progress: null,
            },
            breathEl: {
                wrapper: null,
                value: null,
                progress: null,
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
            this.data.hud_baseEl = hudEl.querySelector(".ONEAS-hud-info");
            this.data.moneyEl = hudEl.querySelector("#ONEAS-cash__value");
            this.data.hud_btEl = hudEl.querySelector(".ONEAS-hud-bottom");
            [this.data.hpEl.progress, this.data.hpEl.value] = [hudEl.querySelector(".ONEAS-param__health .ONEAS-progress__value"), hudEl.querySelector(".ONEAS-param__health .ONEAS-param__amount")];
            [this.data.armourEl.wrapper, this.data.armourEl.progress, this.data.armourEl.value] = [hudEl.querySelector(".ONEAS-param__armour"), hudEl.querySelector(".ONEAS-param__armour .ONEAS-progress__value"), hudEl.querySelector(".ONEAS-param__armour .ONEAS-param__amount")];
            [this.data.breathEl.wrapper, this.data.breathEl.progress, this.data.breathEl.value] = [hudEl.querySelector(".ONEAS-param__breath"), hudEl.querySelector(".ONEAS-param__breath .ONEAS-progress__value"), hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount")];
            [this.data.hungerEl.progress, this.data.hungerEl.value] = [hudEl.querySelector(".ONEAS-param__hunger .ONEAS-progress__value"), hudEl.querySelector(".ONEAS-param__hunger .ONEAS-param__amount")];
            [this.data.wanted.wrapper, this.data.wanted.els] = [hudEl.querySelector(".ONEAS-wanted"), hudEl.querySelector(".ONEAS-wanted__row").children];
            this.data.weaponEl.ammoEl = hudEl.querySelector(".ONEAS-weapon__ammo").children;
            this.data.server.wrapper = hudEl.querySelector(".ONEAS-logo");
            this.data.server.image = this.data.server.wrapper.children[0];
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-green-zone");
            this.data.weaponEl.icon = hudEl.querySelector(".ONEAS-weapon__icon");
            [this.data.freezeEl.wrapper, this.data.freezeEl.value, this.data.freezeEl.progress] = [hudEl.querySelector(".ONEAS-param__freeze"), hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"), hudEl.querySelector(".ONEAS-param__freeze .ONEAS-progress__value")];

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

                this.data.breathEl.progress.style.width = `${value}%`;
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

                for (let i = 0; i < 6; i += 1) {
                    if ((5 - i) / value >= 1 || (5 - i == 0 && value == 0)) {
                        this.data.wanted.els[i].src = "oneas-img/hud/inactive.png";
                        this.data.wanted.els[i].className = "ONEAS-wanted__inactive";
                    } else {
                        this.data.wanted.els[i].src = "oneas-img/hud/active.png";
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

                if (value > 0 && this.data.server.wrapper.style.display == "none") this.data.server.wrapper.style.display = "";

                if (value <= 0) this.data.server.wrapper.style.display = "none";
            }

            if (prop == "setBonus") {
                if (value <= 1) this.data.bonusEl.style.display = "none";
                else this.data.bonusEl.style.display = "";

                this.data.bonusEl.textContent = `x${value}`;
            }

            if (prop === "isShowFreeze" && value) {
              this.data.freezeEl.wrapper.style.display = '';
            }
      
            if (prop === "isShowFreeze" && !value) {
              this.data.freezeEl.wrapper.style.display = 'none';
            }

            if (prop == "freeze") {
                this.data.freezeEl.progress.style.width = `${value}%`;
                this.data.freezeEl.value.textContent = value;
            }
        },
        init() {
            const hudHtml = `
      <div class="ONEAS-logo"> 
          <img src="oneas-img/logo/1.png" class="ONEAS-logo__image">
          <div class="ONEAS-logo__bonus">x2</div>
        </div>
        
        <div class="ONEAS-hud-info">
          <div class="ONEAS-weapon"> <img src="oneas-img/hud/weapon_back.png" alt="" class="ONEAS-weapon__back"> <img src="oneas-img/weapon/0.png" alt="" class="ONEAS-weapon__icon">
            <div class="ONEAS-weapon__ammo"> <span id="ONEAS-ammo__in-clip">1</span> <span id="ONEAS-ammo__total">1</span> </div>
          </div>
          <div class="ONEAS-cash"> <img src="oneas-img/hud/cash.png" alt="" class="ONEAS-cash__icon">
            <div id="ONEAS-cash__value">10000</div>
          </div>
          <div class="ONEAS-params">
              <div class="ONEAS-param__health ONEAS-param"> <img src="oneas-img/hud/health.png" alt="" class="ONEAS-param__icon">
                <div class="ONEAS-param__progress">
                  <div class="ONEAS-progress__value"> <img src="oneas-img/hud/circle.png" alt="" class="ONEAS-param__circle"> </div>
                </div> <span class="ONEAS-param__amount">50</span> </div>
      
              <div class="ONEAS-param__armour ONEAS-param"> <img src="oneas-img/hud/armour.png" alt="" class="ONEAS-param__icon">
                <div class="ONEAS-param__progress">
                  <div class="ONEAS-progress__value"> <img src="oneas-img/hud/circle.png" alt="" class="ONEAS-param__circle"> </div>
                </div><span class="ONEAS-param__amount">0</span> </div>
      
              <div class="ONEAS-param__hunger ONEAS-param"> <img src="oneas-img/hud/hunger.png" alt="" class="ONEAS-param__icon">
                <div class="ONEAS-param__progress">
                  <div class="ONEAS-progress__value"> <img src="oneas-img/hud/circle.png" alt="" class="ONEAS-param__circle"> </div>
                </div><span class="ONEAS-param__amount">0</span> </div>
                
              <div style="display: none" class="ONEAS-param__freeze ONEAS-param"> <img src="oneas-img/hud/freeze.png"" alt="" class="ONEAS-param__icon">
                <div class="ONEAS-param__progress">
                  <div class="ONEAS-progress__value"> <img src="oneas-img/hud/circle.png" alt="" class="ONEAS-param__circle"> </div>
                </div><span class="ONEAS-param__amount">20</span> </div>
          
              <div style="display: none" class="ONEAS-param__breath ONEAS-param"> <img src="oneas-img/hud/breath.png" alt="" class="ONEAS-param__icon">
                  <div class="ONEAS-param__progress">
                    <div class="ONEAS-progress__value"> <img src="oneas-img/hud/circle.png" alt="" class="ONEAS-param__circle"> </div>
                  </div><span class="ONEAS-param__amount">70</span> </div>
          </div>
          <div class="ONEAS-wanted ${oneasHud.wantedAlwaysShowClass}"> <img src="oneas-img/hud/wanted_back.png" alt="" class="ONEAS-wanted__back">
            <div class="ONEAS-wanted__row"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__inactive"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__active"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__active"> <img src="oneas-img/hud/active.png" alt="" class="ONEAS-wanted__active"> </div>
          </div>
        </div>
      
      <div class="ONEAS-hud-bottom">
        <div class="ONEAS-green-zone"> <img src="oneas-img/hud/zone.png" alt="" class="ONEAS-green-zone__image">
          <div class="ONEAS-green-zone__text">
            <div>Безопасная зона</div>
            <div>Вы находитесь в безопасной зоне.</div>
          </div>
        </div>
        <div class="ONEAS-radar-border"></div>
      </div>`;
            const hudEl = jsLoader._x1040123.xasd12512(hudHtml, "ONEAS-hud", (prop, value) => void this.onInfoChange(prop, value));

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
            window.__hassleTemplate.interface("Hud").info.isShowFreeze = window.__hassleTemplate.interface("Hud").info.isShowFreeze;
            window.__hassleTemplate.interface("Hud").hideGreenZoneTab();
        },
    },
    speedometer: {
        barsValues: {
            speed: {
                dashArray: 504,
                dashOffset: 504,
            },
            fuel: {
                dashArray: 171,
                dashOffset: 0,
            },
            wash: {
                dashArray: 172,
                dashOffset: 172,
            },
            damage: {
                dashArray: 172,
                dashOffset: 172,
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
                    this.data.paramsEls[3].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "doors") {
                    this.data.paramsEls[2].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "temperature") {
                    this.data.paramsEls[0].classList.toggle("ONEAS-spedometer-param--active", +value);
                }
                if (prop == "lights") {
                    this.data.paramsEls[1].classList.toggle("ONEAS-spedometer-param--active", +value);
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
            this.data.speedometerEl.style.display = "";

        },
        hide() {
            this.data.speedometerEl.style.display = "none";

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
            document.querySelector('.ONEAS-wash__bar').classList.toggle("ONEAS-speedometer-danger", floatWash >= 0.75);

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

        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.valueEl = speedometerEl.querySelector(".ONEAS-speed__value");
            this.data.speed.barEl = speedometerEl.querySelector(".ONEAS-speed__bar path");

            this.data.fuel.valueEl = speedometerEl.querySelector(".ONEAS-fuel__value");
             
            this.data.fuel.textEl = speedometerEl.querySelector(".ONEAS-fuel__text");
            this.data.fuel.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__fuel");

            this.data.wash.barEl = speedometerEl.querySelector(".ONEAS-wash__bar path");
            this.data.wash.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__wash");

            this.data.damage.barEl = speedometerEl.querySelector(".ONEAS-damage__bar path");

            this.data.mileageEl = speedometerEl.querySelector(".ONEAS-speed__mileage");

            this.data.paramsEls = speedometerEl.querySelector(".ONEAS-speedometer__params").children;

            this.data.turnsEls = speedometerEl.querySelector(".ONEAS-speedometer__turns").children;

            this.data.tachometer.wrapper = speedometerEl.querySelector(".ONEAS-speedometer__tachometer");
            this.data.tachometer.gearEl = this.data.tachometer.wrapper.querySelector("#ONEAS-tachometer-gear");
            this.data.tachometer.rpmEl = this.data.tachometer.wrapper.querySelector('#ONEAS-tachometer-rpm');

        },
        init() {
            const text = `
            <div style="display: none" class="ONEAS-speedometer__tachometer">
                    <div id="ONEAS-tachometer-gear">d4</div>
                    <div id="ONEAS-tachometer-rpm">1000</div>
                </div>
                <div class="ONEAS-speedometer__params">
      <img src="oneas-img/speed/temperature.ff0342b4.svg" alt="" class="icon__params icon__key">
      <img src="oneas-img/speed/lights.b80a81e1.svg" alt="" class="icon__params icon__lights">
      <img src="oneas-img/speed/doors.0d81e32e.svg" alt="" class="icon__params icon__doors ONEAS-spedometer-param--active">
      <img src="oneas-img/speed/rem.8c1c949b.svg" alt="" class="icon__params icon__rem ONEAS-spedometer-param--active">
      <div class="ONEAS-speedometer__fuel">
        <img class="fuel__icon" src="oneas-img/speed/fuel.b29d3d45.svg" alt="">
        <div class="ONEAS-fuel__value ONEAS-speedometer-fuel__data">50</div>
        <div class="ONEAS-fuel__text ONEAS-speedometer-fuel__data">%</div>
      </div>
    </div>
    
    <div class="ONEAS-speedometer__main">
      <img src="oneas-img/speed/play.031947a7.png" alt="" class="ONEAS-speedometer-bg">
      <div class="ONEAS-speedometer__damage">           
      <img src="oneas-img/speed/damage.2ad5b799.svg" alt="" class="main-icon damage__icon">                  
      </div>
              
      <div class="ONEAS-speedometer__speed">
        <div class="ONEAS-speed__data">
          <div class="ONEAS-speed__value">228</div>
          <div class="ONEAS-speed__text">км/ч</div>
          <div class="ONEAS-speed__mileage">000340</div>
          <div class="ONEAS-speedometer__turns">
            <img src="oneas-img/speed/turn.90c133f9.svg" alt="" class="turn__left">
            <img src="oneas-img/speed/turn.90c133f9.svg" alt="" class="turn__right">
          </div>
        </div>
        <svg class="ONEAS-speed__bar" width="249" height="249" viewBox="0 0 249 249" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke-dasharray="${this.barsValues.speed.dashArray}" stroke-dashoffset="${this.barsValues.speed.dashArray}" d="M77.1398 208.853C58.8077 198.269 44.4618 181.954 36.31 162.418C28.1581 142.883 26.6521 121.21 32.0237 100.735C37.3953 80.2594 49.3467 62.1168 66.0388 49.099C82.7309 36.0812 103.238 28.9096 124.405 28.6879C145.572 28.4662 166.225 35.2068 183.187 47.8722C200.148 60.5376 212.476 78.4259 218.276 98.7841C224.075 119.142 223.023 140.842 215.282 160.544C207.541 180.246 193.54 196.858 175.433 207.824" stroke="url(#paint0_linear_2353_2)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <defs>
            <linearGradient id="paint0_linear_2353_2" x1="27.3633" y1="27.1826" x2="223.47" y2="27.1826" gradientUnits="userSpaceOnUse">
              <stop offset="0.05" stop-color="#F5BE09" />
              <stop offset="1" stop-color="#E9651B" />
            </linearGradient>
          </defs>
        </svg>
        <svg class="ONEAS-speed__bar-bg" width="249" height="249" viewBox="0 0 249 249" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M77.1398 208.853C58.8077 198.269 44.4618 181.954 36.31 162.418C28.1581 142.883 26.6521 121.21 32.0237 100.735C37.3953 80.2594 49.3467 62.1168 66.0388 49.099C82.7309 36.0812 103.238 28.9096 124.405 28.6879C145.572 28.4662 166.225 35.2068 183.187 47.8722C200.148 60.5376 212.476 78.4259 218.276 98.7841C224.075 119.142 223.023 140.842 215.282 160.544C207.541 180.246 193.54 196.858 175.433 207.824" stroke="black" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg class="ONEAS-speed__bar-line" width="249" height="249" viewBox="0 0 249 249" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M27.8535 124.767H57.2046" stroke="white" stroke-width="2.49998" />
          <path d="M124.66 56.8145V27.4634" stroke="white" stroke-width="2.49998" />
          <path d="M51.5567 61.6441L75.2256 75.0704" stroke="white" stroke-width="2.49998" />
          <path d="M222.928 124.767H192.579" stroke="white" stroke-width="2.49998" />
          <path d="M180.046 77.1422L197.761 59.8974" stroke="white" stroke-width="2.49998" />
        </svg>
          <svg class="ONEAS-damage__bar" width="278" height="278" viewBox="0 0 278 278" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path stroke-dasharray="${this.barsValues.damage.dashArray}" stroke-dashoffset="${this.barsValues.damage.dashArray}"  d="M31.7773 139.778C31.7773 125.543 34.5911 111.45 40.0569 98.3067C45.5227 85.1637 53.5326 73.2308 63.6261 63.1943C73.7196 53.1577 85.6976 45.2153 98.8712 39.824C112.045 34.4326 126.154 31.6986 140.388 31.7791" stroke="url(#paint0_linear_2071_131)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="paint0_linear_2071_131" x1="30.2773" y1="30.2773" x2="249.278" y2="30.2773" gradientUnits="userSpaceOnUse">
                <stop offset="0.05" stop-color="#F5BE09" />
                <stop offset="1" stop-color="#E9651B" />
              </linearGradient>
            </defs>
          </svg>         
          <svg class="ONEAS-damage__bar-bg" width="278" height="278" viewBox="0 0 278 278" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31.7773 139.778C31.7773 125.541 34.5922 111.444 40.0601 98.299C45.5279 85.1539 53.5408 73.2196 63.6379 63.1826C73.7349 53.1456 85.7167 45.204 98.8942 39.8146C112.072 34.4252 126.185 31.6944 140.421 31.7793" stroke="black" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>  
          <svg class="ONEAS-wash__bar" width="278" height="278" viewBox="0 0 278 278" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path stroke-dasharray="${this.barsValues.wash.dashArray}" stroke-dashoffset="${this.barsValues.wash.dashArray}"  d="M247.778 139.77C247.779 154.033 244.955 168.154 239.469 181.32C233.982 194.485 225.943 206.434 215.814 216.475C205.685 226.517 193.668 234.452 180.455 239.824C167.243 245.196 153.097 247.898 138.835 247.774" stroke="url(#paint0_linear_2071_136)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="paint0_linear_2071_136" x1="30.2773" y1="30.2773" x2="249.278" y2="30.2773" gradientUnits="userSpaceOnUse">
                <stop offset="0.05" stop-color="#F5BE09" />
                <stop offset="1" stop-color="#E9651B" />
              </linearGradient>
            </defs>
          </svg>         
          <svg class="ONEAS-wash__bar-bg" width="278" height="278" viewBox="0 0 278 278" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M247.778 139.778C247.778 154.039 244.953 168.159 239.467 181.324C233.981 194.488 225.942 206.435 215.814 216.475C205.686 226.516 193.669 234.451 180.458 239.823C167.247 245.195 153.103 247.897 138.842 247.774" stroke="black" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>   
      </div>

      <div class="ONEAS-speedometer__wash">
        <img src="oneas-img/speed/wash.59b5a8da.svg" alt="" class="main-icon wash__icon">             
      </div>         
    </div>`;
            const speedometerEl = jsLoader._x1040123.ljfkles(text, "ONEAS-speedometer", (prop, value) => this.onChangeInfo(prop, value));

            this.create(speedometerEl);
            window.__hassleTemplate.interface("Hud").speedometer.show = 0;
        },
    },  
    minimapChanger: {
        data: {
            defaultMinimap: "shape-minimap-1",
            minimap: "",
            prevMinimap: "",
        },

        loadConfig() {
            const minimap = jsLoader.localStorage.getItem("ONEAS-minimap-fix");

            if (minimap === null) {
                this.data.minimap = this.data.defaultMinimap;
                this.saveConfig(this.data.defaultMinimap);
                return;
            }

            this.data.minimap = minimap;
        },

        saveConfig(minimap) {
            jsLoader.localStorage.setItem("ONEAS-minimap-fix", minimap);
        },

        applyHudMinimap(minimap) {
            document.body.classList.add(minimap);
        },

        removeHudMinimap(minimap) {
            document.body.classList.remove(minimap);
        },

        changeHudMinimap(minimap) {
            if (this.data.prevMinimap) this.removeHudMinimap(this.data.prevMinimap);

            this.applyHudMinimap(minimap);

            this.data.prevMinimap = minimap;

            if (minimap === this.data.minimap) return;

            this.data.minimap = minimap;
            this.saveConfig(minimap);
        },

        addMenuOption() {
            jsLoader.mainMenu.addNewOption(3, "Форма мини-карты", {
                data: [
                    {
                        id: "shape-minimap-1",
                        value: "Квадрат",
                        img: ``,
                    },
                    {
                        id: "shape-minimap-2",
                        value: "Прямоугольник",
                        img: ``,
                    },
                    {
                        id: "shape-minimap-3",
                        value: "Прямоугольник с фиксом меток",
                        img: ``,
                    },
                ],
                selectedId: this.data.minimap,
                callback: ({ id }) => {
                    this.changeHudMinimap(id);
                },
            });
        },

        init() {
            this.loadConfig();

            this.changeHudMinimap(this.data.minimap);

            this.addMenuOption();
        },
    },
    init(jslInjected) {
        jsLoader = jslInjected;
        this.hud.init();
        this.speedometer.init();
        
        this.minimapChanger.init();
        jsLoader.showAddedScript(`HUD RC ${lvl} v${vol}`, "info");
    },
};

return oneasHud;
})()