(function(){
const vol = "1.1.1",
    lvl = "Maximum",
    nameMod = "Greeen Spirit";

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
        name: "Время на экране",
        id: "screenTime",
        filePath: "additional-scripts/screenTime.js",
        enabled: true,
        is_hidden: false,
        options: {
            dateSettings: {
                showDate: true,  
                format: "3",  
            },
            timeSettings: {
                showTime: true,  
                showHours: true,  
                showMinutes: true,  
                showSeconds: true,  
                showMs: false,  
            },
            timeSelector: "#ONEAS-time_value",
            dateSelector: "#ONEAS-data_value",
            wrapperSelector: ".ONEAS-info__time-data",
        },
    },
    {
        name: "Rak-net-info",
        id: "rak-net-info",
        filePath: "additional-scripts/rak-net-info.js",
        enabled: true,
        is_hidden: true,
        options: {
            playerId: {
                selector: "#ONEAS-id_value",
            },
            serverOnline: {
                selector: "#ONEAS-online_value",
                refreshTime: 100,  
            },
        },
    },
];

const oneasHud = {

    wantedAlwaysShowClass: "",
    paramsPercentage: {
        data: {
            isValuesShow: false,
        },
        _addInMenu() {
            jsLoader.mainMenu.addNewOption(1, "Числовое значение индикаторов хп / брони / еды", {
                initialVar: () => this.data.isValuesShow,
                callback: () => {
                    this.setPercentageStatus(!this.data.isValuesShow);
                },
            });
        },
        _saveData() {
            jsLoader.localStorage.setItem("ONEAS-HUD-percentage", +this.data.isValuesShow);

            jsLoader.log.makeLog("ONEAS", `[savedata percentage] Saved data, percentage -> ${this.data.isValuesShow}`);
        },
        _loadData() {
            if (jsLoader.localStorage.getItem("ONEAS-HUD-percentage") == null) {
                jsLoader.log.makeLog(
                    "ONEAS",
                    `[loaddata percentage] First time load data, percentage -> ${this.data.isValuesShow}`
                );

                this.data.isValuesShow = false;

                this._saveData();
                return;
            }

            this.data.isValuesShow = +jsLoader.localStorage.getItem("ONEAS-HUD-percentage");

            jsLoader.log.makeLog("ONEAS", `[loaddata percentage] Data loaded, percentage -> ${this.data.isValuesShow}`);
        },
        getPercentageStatus() {
            return +this.data.isValuesShow;
        },
        setPercentageStatus(newStatus) {
            this.data.isValuesShow = +newStatus;

            this._saveData();
        },
        init() {
            this._loadData();
            this._addInMenu();
        },
    },
    hud: {
        data: {
            hudEl: null,
            hud_topEl: null,
            hud_bottomLeftEl: null,
            hud_bottomRightEl: null,
            moneyEl: null,
            hpEl: {
                wrapper: null,
                value: null,
                progress: null,
            },
            armourEl: {
                wrapper: null,
                value: null,
                progress: null,
            },
            hungerEl: {
                wrapper: null,
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
                wrapper: null,
                icon: null,
                ammoEl: null,
                nameEl: null,
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
            this.data.hud_topEl = hudEl.querySelector(".ONEAS-hud__top");
            this.data.hud_bottomLeftEl = hudEl.querySelector(".ONEAS-hud__bottom-left");
            this.data.hud_bottomRightEl = hudEl.querySelector(".ONEAS-hud__bottom-right");
            this.data.moneyEl = hudEl.querySelector("#ONEAS-cash__value");
            [this.data.hpEl.wrapper, this.data.hpEl.value, this.data.hpEl.progress] = [
                hudEl.querySelector(".ONEAS-param__health"),
                hudEl.querySelector(".ONEAS-param__health .ONEAS-param__amount"),
                hudEl.querySelector(".ONEAS-param__health .ONEAS-progress__value"),
            ];
            [this.data.armourEl.wrapper, this.data.armourEl.value, this.data.armourEl.progress] = [
                hudEl.querySelector(".ONEAS-param__armour"),
                hudEl.querySelector(".ONEAS-param__armour .ONEAS-param__amount"),
                hudEl.querySelector(".ONEAS-param__armour .ONEAS-progress__value"),
            ];
            [this.data.hungerEl.wrapper, this.data.hungerEl.value, this.data.hungerEl.progress] = [
                hudEl.querySelector(".ONEAS-param__hunger"),
                hudEl.querySelector(".ONEAS-param__hunger .ONEAS-param__amount"),
                hudEl.querySelector(".ONEAS-param__hunger .ONEAS-progress__value"),
            ];
            [this.data.breathEl.wrapper, this.data.breathEl.value] = [
                hudEl.querySelector(".ONEAS-param__breath"),
                hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount"),
            ];
            [this.data.freezeEl.wrapper, this.data.freezeEl.value] = [
                hudEl.querySelector(".ONEAS-param__freeze"),
                hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"),
            ];
            [this.data.wanted.wrapper, this.data.wanted.els] = [
                hudEl.querySelector(".ONEAS-wanted"),
                hudEl.querySelector(".ONEAS-wanted__row").children,
            ];
            [
                this.data.weaponEl.wrapper,
                this.data.weaponEl.icon,
                this.data.weaponEl.ammoEl,
                this.data.weaponEl.nameEl,
            ] = [
                hudEl.querySelector(".ONEAS-weapon"),
                hudEl.querySelector(".ONEAS-weapon__icon"),
                hudEl.querySelector(".ONEAS-weapon__ammo").children,
                hudEl.querySelector("#ONEAS-weapon__name"),
            ];
            [this.data.server.wrapper, this.data.server.value] = [
                hudEl.querySelector(".ONEAS-logo"),
                hudEl.querySelector("#logo-t3"),
            ];
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-green-zone");

        },
        onInfoChange(prop, value) {
            if ((prop == "show" || prop == "showBars") && +value >= 1) {
                this.data.hudEl.style.display = "";

                this.data.hudEl.classList.toggle("show-values", oneasHud.paramsPercentage.getPercentageStatus());
            }

            if ((prop == "show" || prop == "showBars") && +value === 0) {
                this.data.hudEl.style.display = "none";
            }

            if (prop == "weapon") {
                this.data.weaponEl.icon.src = `oneas-img/weapon/${value}.png`;

                if (value == 0) this.data.weaponEl.wrapper.style.display = "none";
                else this.data.weaponEl.wrapper.style.display = "";

                if (value == 1) this.data.weaponEl.nameEl.textContent = "Кастет";
                else if (value == 2) this.data.weaponEl.nameEl.textContent = "Коса";
                else if (value == 3) this.data.weaponEl.nameEl.textContent = "Полицейская дубинка";
                else if (value == 4) this.data.weaponEl.nameEl.textContent = "Нож";
                else if (value == 5) this.data.weaponEl.nameEl.textContent = "Бита";
                else if (value == 6) this.data.weaponEl.nameEl.textContent = "Лопата";
                else if (value == 7) this.data.weaponEl.nameEl.textContent = "Кий";
                else if (value == 8) this.data.weaponEl.nameEl.textContent = "Мачета";
                else if (value == 9) this.data.weaponEl.nameEl.textContent = "Бензопила";
                else if ((value == 10) | (value == 11) | (value == 12) | (value == 13))
                    this.data.weaponEl.nameEl.textContent = "Игрушка для взрослых";  
                  else if (value == 14) this.data.weaponEl.nameEl.textContent = "Цветы";
                else if (value == 15) this.data.weaponEl.nameEl.textContent = "Топор";
                else if (value == 16) this.data.weaponEl.nameEl.textContent = "Граната";
                else if (value == 17) this.data.weaponEl.nameEl.textContent = "Дымовая граната";
                else if (value == 18) this.data.weaponEl.nameEl.textContent = "Коктейль Молотова";
                else if (value == 22) this.data.weaponEl.nameEl.textContent = "Glock 19";
                else if (value == 23) this.data.weaponEl.nameEl.textContent = "Тайзер";
                else if (value == 24) this.data.weaponEl.nameEl.textContent = "Desert Eagle";
                else if (value == 25) this.data.weaponEl.nameEl.textContent = "Remington 870";
                else if (value == 26) this.data.weaponEl.nameEl.textContent = "Обрез";
                else if (value == 27) this.data.weaponEl.nameEl.textContent = "Сайга-12";
                else if (value == 28) this.data.weaponEl.nameEl.textContent = "ОЦ-14 Гроза";
                else if (value == 29) this.data.weaponEl.nameEl.textContent = "АКС-74У";
                else if (value == 30) this.data.weaponEl.nameEl.textContent = "AKМ";
                else if (value == 31) this.data.weaponEl.nameEl.textContent = "HK416";
                else if (value == 32) this.data.weaponEl.nameEl.textContent = "Скорпион 61";
                else if (value == 33) this.data.weaponEl.nameEl.textContent = "MSR";
                else if (value == 34) this.data.weaponEl.nameEl.textContent = "AWM";
                else if (value == 35) this.data.weaponEl.nameEl.textContent = "РПГ";
                else if (value == 36) this.data.weaponEl.nameEl.textContent = "Bazooka";
                else if (value == 37) this.data.weaponEl.nameEl.textContent = "Огнемёт";
                else if (value == 38) this.data.weaponEl.nameEl.textContent = "Миниган";
                else if (value == 39) this.data.weaponEl.nameEl.textContent = "С4";
                else if (value == 40) this.data.weaponEl.nameEl.textContent = "Кнопка детонатора";
                else if (value == 41) this.data.weaponEl.nameEl.textContent = "Баллончик";
                else if (value == 42) this.data.weaponEl.nameEl.textContent = "Огнетушитель";
                else if (value == 43) this.data.weaponEl.nameEl.textContent = "Фотоаппарат";
                else if (value == 46) this.data.weaponEl.nameEl.textContent = "Парашют";

                if ((value < 16) | (value == 40) | (value == 46))
                    (this.data.weaponEl.ammoEl[1].style.display = "none"),
                        (this.data.weaponEl.ammoEl[0].style.display = "none");
                else
                    (this.data.weaponEl.ammoEl[1].style.display = ""),
                        (this.data.weaponEl.ammoEl[0].style.display = "");
            }

            if (prop == "showGreenZoneTab") {
                this.data.greenZoneEl.style.display = "";
            }

            if (prop == "hideGreenZoneTab") {
                this.data.greenZoneEl.style.display = "none";
            }

            if (prop == "health") {
                this.data.hpEl.wrapper.classList.toggle("ONEAS-hud-danger", value <= 20);

                this.data.hpEl.progress.style.width = `${value}%`;
                this.data.hpEl.value.textContent = value;
            }

            if (prop == "armour") {
                if (value > 0)
                    (this.data.armourEl.wrapper.style.opacity = "1"),
                        (this.data.armourEl.wrapper.style.width = `6.0185vh`),
                        (this.data.hungerEl.wrapper.style.width = `6.0185vh`),
                        (this.data.hpEl.wrapper.style.width = `12.0370vh`),
                        (this.data.hpEl.wrapper.style.marginRight = `0.4630vh`),
                        (this.data.armourEl.wrapper.style.marginRight = `0.4630vh`);

 else
                    (this.data.armourEl.wrapper.style.opacity = "0"),
                        (this.data.armourEl.wrapper.style.width = `0vh`),
                        (this.data.hungerEl.wrapper.style.width = `12.3148vh`),
                        (this.data.hpEl.wrapper.style.width = `12.3148vh`),
                        (this.data.hpEl.wrapper.style.marginRight = `0.3704vh`),
                        (this.data.armourEl.wrapper.style.marginRight = `0vh`); 

                this.data.armourEl.progress.style.width = `${value}%`;
                this.data.armourEl.value.textContent = value;
            }

            if (prop == "hunger") {
                this.data.hungerEl.wrapper.classList.toggle("ONEAS-hud-danger", value <= 20);

                this.data.hungerEl.progress.style.width = `${value}%`;
                this.data.hungerEl.value.textContent = value;
            }

            if (prop == "breath") {
                if (value < 100) this.data.breathEl.wrapper.style.display = "";
                else this.data.breathEl.wrapper.style.display = "none";

                this.data.breathEl.value.textContent = value;
            }

            if (prop == "money") {
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
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted-inactive.svg";
                        this.data.wanted.els[i].classList.remove("ONEAS-wanted__active");
                        this.data.wanted.els[i].classList.add("ONEAS-wanted__inactive");
                    } else {
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted-active.svg";
                        this.data.wanted.els[i].classList.remove("ONEAS-wanted__inactive");
                        this.data.wanted.els[i].classList.add("ONEAS-wanted__active");
                    }
                }
            }

            if (prop == "ammoInClip") {
                this.data.weaponEl.ammoEl[0].textContent = value;
            }

            if (prop == "totalAmmo") {
                this.data.weaponEl.ammoEl[1].textContent = `/${value}`;
            }

            if (prop == "setServer") {
                const serverLength = 2;
                const server = value;
                const serverStr = server.toString();
                const paddingLength = serverLength - serverStr.length;

                const zero = paddingLength > 0 ? "0".repeat(paddingLength) : "";

                if (serverStr.length > serverLength) {
                    this.data.server.value.innerHTML = `${server}`;
                } else {
                    this.data.server.value.innerHTML = `${zero}${server}`;
                }

                if (value > 0 && this.data.server.wrapper.style.display == "none")
                    this.data.server.wrapper.style.display = "";

                if (value <= 0) this.data.server.wrapper.style.display = "none";
            }

            if (prop == "setBonus") {
                if (value <= 1) this.data.bonusEl.style.opacity = "0";
                else this.data.bonusEl.style.opacity = "1";

                this.data.bonusEl.src = `oneas-img/hud/bonus-${value}.png`;
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
        init() {
            const hudHtml = `            
            <div class="ONEAS-hud__top">
              <div>
                <div class="ONEAS-logo">
                    <img class="ONEAS-logo__bonus" src="oneas-img/hud/bonus-3.png">
                    <div class="ONEAS-logo__text">
                        <span id="logo-t1" class="text-primary">Radmir</span>
                        <span id="logo-t2" class="text-primary">Role Play</span>
                    </div>
                    <div class="ONEAS-logo__server">
                        <span id="logo-t3" class="text-primary">08</span>
                    </div>
                </div>
                <div class="ONEAS-info__servers">
                  <div class="ONEAS-online ONEAS-info__server">
                      <img class="ONEAS-info__server-icon" src="oneas-img/hud/icon-online.svg">
                      <span id="ONEAS-online_value" >508</span>
                  </div>
                  <div class="ONEAS-id ONEAS-info__server">
                      <img class="ONEAS-info__server-icon" src="oneas-img/hud/icon-id.svg">                        
                      <span id="ONEAS-id_value" >035</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="ONEAS-wanted ${oneasHud.wantedAlwaysShowClass}">
                    <div class="ONEAS-wanted__row">
                        <img class="ONEAS-wanted__inactive" alt="" src="oneas-img/hud/wanted-inactive.svg">
                        <img class="ONEAS-wanted__inactive" alt="" src="oneas-img/hud/wanted-inactive.svg">
                        <img class="ONEAS-wanted__inactive" alt="" src="oneas-img/hud/wanted-inactive.svg">
                        <img class="ONEAS-wanted__inactive" alt="" src="oneas-img/hud/wanted-inactive.svg">
                        <img class="ONEAS-wanted__active" alt="" src="oneas-img/hud/wanted-active.svg">
                        <img class="ONEAS-wanted__active" alt="" src="oneas-img/hud/wanted-active.svg">
                    </div>
                </div>
                <div class="ONEAS-cash">
                  <span id="ONEAS-cash__text">o</span>
                  <span id="ONEAS-cash__value">1.900.905</span>
                </div>
              </div>
              <div class="ONEAS-weapon">
                <img class="ONEAS-weapon__icon" src="oneas-img/weapon/29.png">                
                <span id="ONEAS-weapon__name">Desert Eagle</span>
                <div class="ONEAS-weapon__ammo">
                    <span id="ONEAS-ammo__in-clip">50</span>
                    <span id="ONEAS-ammo__total">/200</span> 
                </div>
              </div> 
            </div>
            <div class="ONEAS-hud__bottom-right">
              <div class="ONEAS-params">
                  <div style="display: none;" class="ONEAS-param ONEAS-param__breath">
                      <img class="ONEAS-param__icon" src="oneas-img/hud/icon-breath.png">
                      <span class="ONEAS-param__amount">88</span>
                  </div>
                  <div style="display: none;" class="ONEAS-param ONEAS-param__freeze">
                      <img class="ONEAS-param__icon" src="oneas-img/hud/icon-freeze.png">
                      <span class="ONEAS-param__amount">25</span>
                  </div>
              </div>
            </div>        
            <div class="ONEAS-hud__bottom-left">
              <div>
                  <div class="ONEAS-radar-border">
                      <img class="ONEAS-radar__images" src="oneas-img/hud/radar.png">
                  </div>
                  <div class="ONEAS-params-2"> 
                      <div class="ONEAS-param__health ONEAS-param-2">
                          <div class="ONEAS-param-info-2">                                
                              <img class="ONEAS-param__icon" src="oneas-img/hud/icon-health.png">
                              <span class="ONEAS-param__amount">85</span>
                          </div>                
                          <div class="ONEAS-param__progress">
                              <div class="ONEAS-progress__value"></div>
                          </div>
                      </div>
                      <div class="ONEAS-params--2">                    
                          <div class="ONEAS-param__armour ONEAS-param-2">                                                    
                              <div class="ONEAS-param-info-2">                                
                                  <img class="ONEAS-param__icon" src="oneas-img/hud/icon-armour.png">
                                  <span class="ONEAS-param__amount">45</span>
                              </div>
                              <div class="ONEAS-param__progress">
                                  <div class="ONEAS-progress__value"></div>
                              </div>
                          </div>                 
                          <div class="ONEAS-param__hunger ONEAS-param-2">                                                    
                              <div class="ONEAS-param-info-2">                                
                                  <img class="ONEAS-param__icon" src="oneas-img/hud/icon-hunger.png">
                                  <span class="ONEAS-param__amount">45</span>
                              </div>
                              <div class="ONEAS-param__progress">
                                  <div class="ONEAS-progress__value"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="ONEAS-ONEAS-info__servers-2">
                  <div class="ONEAS-info__time-data">
                      <div class="ONEAS-time ONEAS-info__server">
                          <img class="ONEAS-info__server-icon" src="oneas-img/hud/icon-time.svg">
                          <span id="ONEAS-time_value" >19:32:25</span>
                      </div>
                      <div class="ONEAS-data ONEAS-info__server">
                          <img class="ONEAS-info__server-icon" src="oneas-img/hud/icon-data.svg">
                          <span id="ONEAS-data_value" >22/05/2023</span>
                      </div>
                  </div>
                  <div style="display: none;" class="ONEAS-green-zone ONEAS-info__server">
                      <img class="ONEAS-green-zone__image" src="oneas-img/hud/icon-zz.svg">
                      Безопасная зона
                  </div>
                  <div style="display: none;" class="ONEAS-fishing-zone ONEAS-info__server">
                      <img class="ONEAS-fishing-zone__image" src="oneas-img/hud/icon-fish.svg">
                      Зона для рыбалки
                  </div>
              </div>
            </div>
            `;
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
            window.__hassleTemplate.interface("Hud").info.isShowFreeze = window.__hassleTemplate.interface("Hud").info.isShowFreeze;
            window.__hassleTemplate.interface("Hud").hideGreenZoneTab();
        },
    },
    speedometer: {
        barsValues: {
            speed: {
                dashArray: 353,
                dashOffset: 353,
            },
            tachometer: {
                dashArray: 402,
                dashOffset: 402,
            },
        },
        data: {
            speedometerEl: null,
            speed: {
                barEl: null,
                valueEl: null,
                zeroEl: null,
            },
            fuel: {
                valueEl: null,
                textEl: null,
                progress: null,
                wrapperEl: null,
            },
            wash: {
                progress: null,
                valueEl: null,
                wrapperEl: null,
            },
            tachometer: {
                wrapper: null,
                rpmEl: null,
                gearEl: null,
                barEl: null,
            },
            mileageEl: null,
            turnsEls: [],
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

                if (prop === "mileage") {
                    this.setMileage(value);
                }

                if (prop === "speed") {
                    this.setSpeed(value);
                }

                if (prop === "fuel") {
                    this.setFuel(value);
                }

                if (prop == "left") {
                    this.data.turnsEls[0].classList.toggle("ONEAS-speedometer-turn--active", +value);
                }

                if (prop == "right") {
                    this.data.turnsEls[2].classList.toggle("ONEAS-speedometer-turn--active", +value);
                }

                if (prop == "rem") {
                    this.data.paramsEls[0]
                        .querySelector("svg")
                        .classList.toggle("ONEAS-speedometer-param--active", +value);
                }
                if (prop == "doors") {
                    this.data.paramsEls[2]
                        .querySelector("svg")
                        .classList.toggle("ONEAS-speedometer-param--active", +value);
                }
                if (prop == "temperature") {
                    this.data.paramsEls[1]
                        .querySelector("svg")
                        .classList.toggle("ONEAS-speedometer-param--active", +value);
                }
                if (prop == "lights") {
                    this.data.paramsEls[3]
                        .querySelector("svg")
                        .classList.toggle("ONEAS-speedometer-param--active", +value);
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
            this.data.speedometerEl.style.opacity = "1";
            document.querySelector(".ONEAS-hud__bottom-right").style.bottom = "20.8vh";
        },
        hide() {
            this.data.speedometerEl.style.opacity = "0";
            document.querySelector(".ONEAS-hud__bottom-right").style.bottom = "0.8vh";
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

            const multiplier =
                this.barsValues.tachometer.dashArray - (rpm / maxRpm) * this.barsValues.tachometer.dashArray;

            this.data.tachometer.barEl.setAttribute('stroke-dashoffset', multiplier);

        },
        setMileage(km) {
            this.data.mileageEl.textContent = km;
        },
        setSpeed(speed) {
            const maxSpeed = window.__hassleTemplate.interface("Hud").speedometer.maxSpeed;

            const speedLength = 3;
            const speedValue = speed;
             
            const zero = speedValue === 0 ? "000" : "0".repeat(speedLength - speedValue.toString().length);

            this.data.speed.valueEl.textContent = `${speedValue}`;
            this.data.speed.zeroEl.textContent = `${zero}`;

            if (speedValue === 0) {
                this.data.speed.valueEl.style.display = "none";
            } else {
                this.data.speed.valueEl.style.display = "";
            }

            if (speed > maxSpeed) speed = maxSpeed;

            const multiplier = this.barsValues.speed.dashArray - (speed / maxSpeed) * this.barsValues.speed.dashArray;

            this.data.speed.barEl.setAttribute('stroke-dashoffset', multiplier);
        },
        setWash(floatWash) {
            this.data.wash.wrapperEl.classList.toggle("ONEAS-speedometer-danger", floatWash >= 0.75);

            this.data.wash.progress.style.height = `${Math.floor(floatWash * 100)}%`;
            this.data.wash.valueEl.textContent = Math.floor(floatWash * 100);
        },
        setFuel(fuel) {
            this.data.fuel.wrapperEl.classList.toggle("ONEAS-speedometer-danger", fuel <= 15);

            const maxFuel = window.__hassleTemplate.interface("Hud").speedometer.maxFuel;

            const dashOffset = (100 * fuel) / maxFuel;

            this.data.fuel.valueEl.textContent = fuel;
            this.data.fuel.progress.style.height = `${dashOffset}%`;

            if (window.__hassleTemplate.interface("Hud").speedometer.isElectro) this.data.fuel.textEl.textContent = "%";
            else this.data.fuel.textEl.textContent = "л";
        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.zeroEl = speedometerEl.querySelector("#speed__value-1");
            this.data.speed.valueEl = speedometerEl.querySelector("#speed__value-2");
            this.data.speed.barEl = speedometerEl.querySelector(".ONEAS-speedometer-speed__bar-value path");

            this.data.fuel.valueEl = speedometerEl.querySelector(".ONEAS-fuel__value");
            this.data.fuel.textEl = speedometerEl.querySelector(".ONEAS-fuel__text");
            this.data.fuel.progress = speedometerEl.querySelector(".ONEAS-fuel__progress-value");
            this.data.fuel.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__fuel");

            this.data.wash.progress = speedometerEl.querySelector(".ONEAS-wash__progress-value");
            this.data.wash.valueEl = speedometerEl.querySelector(".ONEAS-wash__value");
            this.data.wash.wrapperEl = speedometerEl.querySelector(".ONEAS-speedometer__wash");

            this.data.mileageEl = speedometerEl.querySelector(".ONEAS-mileage__value");

            this.data.paramsEls = speedometerEl.querySelector(".ONEAS-speedometer__params").children;

            this.data.tachometer.barEl = speedometerEl.querySelector(".ONEAS-speedometer-rpm__bar-value path");
            this.data.tachometer.wrapper = speedometerEl.querySelector(".ONEAS-speedometer__tachometer");
            this.data.tachometer.gearEl = this.data.tachometer.wrapper.querySelector(
                ".ONEAS-tachometer-gear .ONEAS-tachometer-value"
            );
            this.data.tachometer.rpmEl = this.data.tachometer.wrapper.querySelector(
                ".ONEAS-tachometer-rpm .ONEAS-tachometer-value"
            );

            this.data.turnsEls = speedometerEl.querySelector(".ONEAS-speedometer__turns").children;

        },
        init() {
            const text = `
            <div style="display: none;" class="ONEAS-speedometer__tachometer">
              <svg width="137" height="161" viewBox="0 0 137 161" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.5" d="M135.843 135.778C136.312 136.247 136.313 137.007 135.837 137.469C124.782 148.197 110.857 155.512 95.7306 158.521C80.2122 161.608 64.1268 160.023 49.5087 153.968C34.8907 147.913 22.3964 137.66 13.6058 124.504C4.81533 111.348 0.123414 95.8805 0.123413 80.058C0.123412 64.2355 4.81533 48.7683 13.6058 35.6124C22.3964 22.4564 34.8906 12.2026 49.5087 6.14762C64.1268 0.092612 80.2121 -1.49166 95.7306 1.59516C110.857 4.60388 124.782 11.9186 135.837 22.6472C136.313 23.1087 136.312 23.8693 135.843 24.338V24.338C135.375 24.8066 134.616 24.8058 134.14 24.3444C123.42 13.9514 109.923 6.86516 95.2624 3.94904C80.2095 0.954826 64.6067 2.49157 50.4272 8.36493C36.2476 14.2383 24.1282 24.1845 15.6014 36.9457C7.07457 49.707 2.52341 64.7102 2.52341 80.058C2.52341 95.4058 7.07457 110.409 15.6014 123.17C24.1282 135.931 36.2476 145.878 50.4272 151.751C64.6067 157.624 80.2095 159.161 95.2624 156.167C109.923 153.251 123.42 146.165 134.14 135.772C134.616 135.31 135.375 135.309 135.843 135.778V135.778Z" fill="white"/>
              </svg>  
              <div class="ONEAS-speedometer-rpm__bars">
                  <svg class="ONEAS-speedometer-rpm__bar-bg" width="157" height="186" viewBox="0 0 157 186" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.3" d="M151.772 158.183C139.259 169.45 123.761 176.867 107.138 179.545C90.514 182.222 73.4708 180.046 58.053 173.278C42.6351 166.511 29.4975 155.438 20.2163 141.389C10.9351 127.34 5.90453 110.911 5.72821 94.0743C5.55189 77.2373 10.2373 60.707 19.2222 46.4667C28.2072 32.2264 41.1101 20.881 56.3828 13.7916C71.6555 6.70228 88.6494 4.17011 105.325 6.49894C122.002 8.82777 137.652 15.9187 150.398 26.9209" stroke="white" stroke-width="10" stroke-linecap="round" />
                  </svg>
                  <svg class="ONEAS-speedometer-rpm__bar-value" width="157" height="186" viewBox="0 0 157 186" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-dasharray="${this.barsValues.tachometer.dashArray}" stroke-dashoffset="${this.barsValues.tachometer.dashArray}"  d="M151.772 158.183C139.259 169.45 123.761 176.867 107.138 179.545C90.514 182.222 73.4708 180.046 58.053 173.278C42.6351 166.511 29.4975 155.438 20.2163 141.389C10.9351 127.34 5.90453 110.911 5.72821 94.0743C5.55189 77.2373 10.2373 60.707 19.2222 46.4667C28.2072 32.2264 41.1101 20.881 56.3828 13.7916C71.6555 6.70228 88.6494 4.17011 105.325 6.49894C122.002 8.82777 137.652 15.9187 150.398 26.9209" stroke="url(#paint0_linear_4495_2375)" stroke-width="10" stroke-linecap="round" />
                      <defs>
                        <linearGradient id="paint0_linear_4495_2375" x1="109.211" y1="41.2309" x2="36.8198" y2="163.09" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#ff5967" />
                          <stop offset="1" stop-color="#c60a1a" />
                        </linearGradient>
                      </defs>
                  </svg>
              </div>       
              <div class="ONEAS-tachometer__data">
                  <div id="ONEAS-tachometer-gear">
                      <div class="ONEAS-tachometer-text">Передача</div>
                      <div class="ONEAS-tachometer-value text-primary">D3</div>
                  </div>
                  <div id="ONEAS-tachometer-rpm">
                      <div class="ONEAS-tachometer-text">Обороты</div>
                      <div class="ONEAS-tachometer-value">4 000</div>
                  </div>
              </div>
            </div>
            <div class="ONEAS-speedometer__base">
              <svg width="201" height="171" viewBox="0 0 201 171" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.5" d="M30.4734 169.708C29.8876 170.294 28.9369 170.294 28.3599 169.7C14.9492 155.881 5.80579 138.474 2.04488 119.567C-1.81364 100.169 0.166697 80.0623 7.73546 61.7896C15.3042 43.517 28.1215 27.8992 44.5664 16.911C61.0113 5.92288 80.3453 0.0579832 100.123 0.0579834C119.902 0.0579836 139.236 5.92288 155.68 16.911C172.125 27.8992 184.943 43.517 192.511 61.7896C200.08 80.0623 202.06 100.169 198.202 119.567C194.441 138.474 185.298 155.881 171.887 169.7C171.31 170.294 170.359 170.294 169.773 169.708V169.708C169.188 169.122 169.189 168.173 169.765 167.578C182.757 154.179 191.614 137.307 195.26 118.982C199.002 100.166 197.081 80.6621 189.74 62.9377C182.398 45.2133 169.965 30.0639 154.014 19.4054C138.062 8.74693 119.308 3.05798 100.123 3.05798C80.9386 3.05798 62.1847 8.74693 46.2331 19.4054C30.2815 30.0639 17.8488 45.2133 10.5071 62.9377C3.1654 80.6621 1.24447 100.166 4.98724 118.982C8.63239 137.307 17.4902 154.179 30.4815 167.578C31.0582 168.173 31.0592 169.122 30.4734 169.708V169.708Z" fill="white"/>
              </svg>                
              <div class="ONEAS-speedometer-speed__bars">                
                  <svg class="ONEAS-speedometer-speed__bar-value" width="209" height="194" viewBox="0 0 209 194" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-dasharray="${this.barsValues.speed.dashArray}" stroke-dashoffset="${this.barsValues.speed.dashArray}"  d="M33.9972 187.935C24.1299 176.977 16.5889 164.13 11.8306 150.172C7.07222 136.214 5.1955 121.436 6.31399 106.732C7.43249 92.0285 11.523 77.7045 18.3378 64.6272C25.1526 51.55 34.5501 39.9915 45.9615 30.6514C57.3728 21.3113 70.5608 14.3838 84.727 10.2883C98.8933 6.19269 113.743 5.0142 128.378 6.8241C143.013 8.63401 157.129 13.3947 169.87 20.818C182.612 28.2413 193.715 38.1728 202.507 50.0115" stroke="url(#paint0_linear_4536_2436)" stroke-width="12" stroke-linecap="round"/>
                      <defs>
                      <linearGradient id="paint0_linear_4536_2436" x1="134.877" y1="50.442" x2="44.8766" y2="201.942" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#12C061"/>
                      <stop offset="1" stop-color="#1F643F"/>
                      </linearGradient>
                      </defs>
                  </svg>
                  <svg class="ONEAS-speedometer-speed__bar-bg" width="209" height="194" viewBox="0 0 209 194" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.3" d="M33.9972 187.935C24.1299 176.977 16.5889 164.13 11.8306 150.172C7.07222 136.214 5.1955 121.436 6.31399 106.732C7.43249 92.0285 11.523 77.7045 18.3378 64.6272C25.1526 51.55 34.5501 39.9915 45.9615 30.6514C57.3728 21.3113 70.5608 14.3838 84.727 10.2883C98.8933 6.19269 113.743 5.0142 128.378 6.8241C143.013 8.63401 157.129 13.3947 169.87 20.818C182.612 28.2413 193.715 38.1728 202.507 50.0115" stroke="white" stroke-width="12" stroke-linecap="round" />
                  </svg>                
              </div>
                <div class="ONEAS-speedometer__data">
                    <div class="ONEAS-speedometer__mileage">
                        <span class="ONEAS-mileage__value">000528</span>
                        <span class="ONEAS-mileage__text">км</span>
                    </div>
                    <div class="ONEAS-speedometer__turns">
                        <div class="ONEAS-turns-icon turn__left">                        
                            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.6234 2.97465L13.6234 10.1413C13.6234 10.5741 13.4831 10.9951 13.2234 11.3413L12.7234 12.008C12.3457 12.5116 11.7529 12.808 11.1234 12.808H10.6138C10.2916 12.808 9.97426 12.7302 9.68865 12.5812L1.88724 8.51085C0.48107 7.7772 0.447501 5.77698 1.82826 4.99655L9.6654 0.566857C9.96564 0.397161 10.3046 0.307983 10.6495 0.307983H11.1234C11.7529 0.307983 12.3457 0.604372 12.7234 1.10798L13.2234 1.77465C13.4831 2.12084 13.6234 2.54191 13.6234 2.97465Z" fill="white"/>
                                </svg>                            
                        </div>
                        <div class="ONEAS-speedometer__speed">
                            <div class="ONEAS-speed__value text-primary">
                                <span id="speed__value-1">0</span>
                                <span id="speed__value-2">90</span>
                            </div>
                        </div>
                        <div class="ONEAS-turns-icon turn__right">                        
                            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.6234 2.97465L13.6234 10.1413C13.6234 10.5741 13.4831 10.9951 13.2234 11.3413L12.7234 12.008C12.3457 12.5116 11.7529 12.808 11.1234 12.808H10.6138C10.2916 12.808 9.97426 12.7302 9.68865 12.5812L1.88724 8.51085C0.48107 7.7772 0.447501 5.77698 1.82826 4.99655L9.6654 0.566857C9.96564 0.397161 10.3046 0.307983 10.6495 0.307983H11.1234C11.7529 0.307983 12.3457 0.604372 12.7234 1.10798L13.2234 1.77465C13.4831 2.12084 13.6234 2.54191 13.6234 2.97465Z" fill="white"/>
                            </svg>                            
                        </div>             
                    </div>
                    <span class="ONEAS-speed__text">км/ч</span> 
                </div>
                <div class="ONEAS-speedometer__params">
                    <div>
                        <svg class="icon__rem icon__speed-params" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.3">
                            <g clip-path="url(#clip0_246_46)">
                            <path d="M16.939 18.1422H18.3879L17.422 19.116L15.812 19.4406L13.5581 21.0638L14.6851 19.116L16.617 18.7915L16.939 18.1422Z" fill="#fff"/>
                            <path d="M30.3608 11.0007L33.1994 16.1354L28.2829 19.0999L25.4443 13.9652L30.3608 11.0007Z" fill="#fff"/>
                            <path d="M12.6617 21.6735L16.4836 26.2152L11.5671 29.1797L8.72852 24.0451L12.6617 21.6735Z" fill="#fff"/>
                            <path d="M18.5615 18.1156L21.4 23.2503L19.8871 23.478L18.9418 24.7326L16.4836 26.2148L13.645 21.0802L16.1033 19.5978L17.6162 19.3702L18.5615 18.1156Z" fill="#fff"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M28.5667 19.6135L24.5928 12.4249L19.6763 15.3895L24.2179 23.6049L29.1344 20.6404L28.5667 19.6135ZM28.5667 19.6135L24.6334 21.9851L21.2272 15.8235L24.1771 14.0448L28.5667 19.6135Z" fill="#fff"/>
                            <path d="M25.794 12.6238L24.8281 12.2992L25.794 13.5977L30.3019 11.0007L25.794 12.6238Z" fill="#fff"/>
                            </g>
                            </g>
                            <defs>
                            <clipPath id="clip0_246_46">
                            <rect width="25.6" height="20.8" fill="white" transform="translate(8 9.59998)"/>
                            </clipPath>
                            </defs>
                        </svg> 
                        <span>SHIFT</span>
                    </div>
                    <div>
                        <svg class="icon__key icon__speed-params" width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.3">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M30.7378 19.8729C33.1401 18.4859 34.0617 15.585 32.7964 13.3935C31.5311 11.202 28.558 10.5497 26.1557 11.9366C24.4564 12.9177 23.4977 14.657 23.5305 16.3664L23.5621 16.3734L24.2244 18.6365L22.7442 16.8456L10.0298 24.1864L9.21631 26.1257L12.4038 26.6523L12.9812 24.8337L15.1948 25.3193L15.6781 25.0403L16.1356 23.6005L17.6113 23.9242L18.5778 23.3662L19.0354 21.9263L20.5111 22.2501L20.9944 21.971L21.6806 19.8112L23.8941 20.2968L25.1081 19.596C26.5954 20.7922 28.8442 20.9661 30.7378 19.8729ZM30.889 15.6704C31.4229 15.3622 31.6277 14.7176 31.3465 14.2306C31.0653 13.7436 30.4047 13.5986 29.8708 13.9068C29.337 14.215 29.1322 14.8597 29.4133 15.3467C29.6945 15.8337 30.3553 15.9786 30.889 15.6704Z" fill="#fff"/>
                            </g>
                        </svg>
                        <span>L.CTRL</span>
                    </div>
                    <div>
                        <svg class="icon__doors icon__speed-params" width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.3">
                            <path d="M22.9529 14.1275C24.9452 12.3655 27.404 12.2554 28.9756 14.1304C30.535 15.9909 30.8955 17.8968 28.9467 19.6634L24.7195 22.5954L23.1631 21.0991L26.8699 18.5024L26.9134 18.4639C27.8483 17.6372 28.0976 16.7275 27.2212 15.682C26.3451 14.6366 25.2772 14.9586 24.3425 15.7854L21.9252 17.5671L25.2705 23.0578L25.6425 25.4122L19.6149 15.2488L11.401 21.1207L11.3286 19.5283L19.5425 13.6563L20.7822 15.6911L22.9529 14.1275Z" fill="#fff"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4014 21.1209L19.6635 16.3107L25.6429 25.4125L17.9318 30.6853L11.4014 21.1209ZM19.75 24.0417C19.1946 24.7037 18.2509 24.8262 17.6422 24.3153C17.0335 23.8046 16.9903 22.8541 17.5457 22.1921C18.1011 21.5302 19.0447 21.4077 19.6534 21.9185C20.2622 22.4293 20.3054 23.3798 19.75 24.0417Z" fill="#fff"/>
                            </g>
                        </svg>
                        <span>R.CTRL</span>
                    </div>
                    <div>    
                        <svg class="icon__lights icon__speed-params" width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.3">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5728 15.5953C15.577 17.8868 16.8411 23.2742 21.8637 26.4915C22.4366 26.2544 23.0772 25.9539 23.7436 25.5971C21.5777 24.2704 18.5587 21.7868 18.0463 18.8862C19.4257 20.824 22.659 24.3545 25.5225 24.5373C28.8783 22.3165 31.9721 18.873 29.7639 15.0485C26.7179 9.77242 19.034 13.2147 15.5728 15.5953Z" fill="#fff"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.1456 29.4039L18.8889 26.1407C18.5718 25.8341 18.2734 25.52 17.9928 25.2005L12.4734 28.2396L13.1456 29.4039ZM11.8636 27.1834L17.2447 24.2828C16.9742 23.9249 16.7238 23.5627 16.4922 23.1988L11.1914 26.0191L11.8636 27.1834ZM10.5816 24.9629L15.8765 22.1486C15.6536 21.735 15.4535 21.3223 15.2742 20.9143L9.90943 23.7986L10.5816 24.9629ZM9.29963 22.7424L14.8018 19.7207C14.6307 19.2369 14.4884 18.7658 14.3714 18.3143L8.62744 21.5782L9.29963 22.7424Z" fill="#fff" fill-opacity="0.85"/>
                            </g>
                        </svg>
                        <span>ALT</span>
                    </div>
                </div>
                <div class="ONEAS-speedometer__percent">
                    <div class="ONEAS-speedometer__wash">                    
                        <div class="ONEAS-wash__progress-value ONEAS-percent__progress-value">                          
                        </div>                    
                        <div>
                            <div class="ONEAS-wash__data">
                                <div class="ONEAS-wash__value">27</div>
                                <div class="ONEAS-wash__text">%</div>
                            </div>                        
                            <svg class="wash__icon icon_percent" width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_4494_2200)">
                                <path d="M22.4175 14.2404C22.1356 14.1734 21.8129 14.2034 21.5129 14.3304C21.2105 14.4575 20.9605 14.6654 20.8083 14.9195C20.6446 15.1898 20.6105 15.4925 20.7151 15.7489C20.8196 16.0053 21.0537 16.1947 21.3583 16.2687C21.456 16.294 21.5583 16.3056 21.6629 16.3056C21.8606 16.3056 22.0674 16.264 22.2652 16.1809C22.922 15.9036 23.2721 15.2799 23.0629 14.7624C22.9584 14.506 22.722 14.3166 22.4175 14.2404Z" fill="white"/>
                                <path d="M22.4175 14.2404C22.1356 14.1734 21.8129 14.2034 21.5129 14.3304C21.2105 14.4575 20.9605 14.6654 20.8083 14.9195C20.6446 15.1898 20.6105 15.4925 20.7151 15.7489C20.8196 16.0053 21.0537 16.1947 21.3583 16.2687C21.456 16.294 21.5583 16.3056 21.6629 16.3056C21.8606 16.3056 22.0674 16.264 22.2652 16.1809C22.922 15.9036 23.2721 15.2799 23.0629 14.7624C22.9584 14.506 22.722 14.3166 22.4175 14.2404Z" fill="white"/>
                                <path d="M22.4175 14.2404C22.1356 14.1734 21.8129 14.2034 21.5129 14.3304C21.2105 14.4575 20.9605 14.6654 20.8083 14.9195C20.6446 15.1898 20.6105 15.4925 20.7151 15.7489C20.8196 16.0053 21.0537 16.1947 21.3583 16.2687C21.456 16.294 21.5583 16.3056 21.6629 16.3056C21.8606 16.3056 22.0674 16.264 22.2652 16.1809C22.922 15.9036 23.2721 15.2799 23.0629 14.7624C22.9584 14.506 22.722 14.3166 22.4175 14.2404Z" fill="white"/>
                                <path d="M22.4175 14.2404C22.1356 14.1734 21.8129 14.2034 21.5129 14.3304C21.2105 14.4575 20.9605 14.6654 20.8083 14.9195C20.6446 15.1898 20.6105 15.4925 20.7151 15.7489C20.8196 16.0053 21.0537 16.1947 21.3583 16.2687C21.456 16.294 21.5583 16.3056 21.6629 16.3056C21.8606 16.3056 22.0674 16.264 22.2652 16.1809C22.922 15.9036 23.2721 15.2799 23.0629 14.7624C22.9584 14.506 22.722 14.3166 22.4175 14.2404Z" fill="white"/>
                                <path d="M15.9624 20.9928C15.6783 20.9235 15.3578 20.9558 15.0555 21.0829C14.7532 21.2099 14.5055 21.4178 14.3532 21.6696C14.1873 21.9422 14.1532 22.2448 14.2577 22.5013C14.4032 22.857 14.7714 23.058 15.2033 23.058C15.3964 23.058 15.6033 23.0187 15.8078 22.9309C16.467 22.656 16.817 22.0323 16.6056 21.5126C16.5011 21.2561 16.267 21.0667 15.9624 20.9928Z" fill="white"/>
                                <path d="M15.9624 20.9928C15.6783 20.9235 15.3578 20.9558 15.0555 21.0829C14.7532 21.2099 14.5055 21.4178 14.3532 21.6696C14.1873 21.9422 14.1532 22.2448 14.2577 22.5013C14.4032 22.857 14.7714 23.058 15.2033 23.058C15.3964 23.058 15.6033 23.0187 15.8078 22.9309C16.467 22.656 16.817 22.0323 16.6056 21.5126C16.5011 21.2561 16.267 21.0667 15.9624 20.9928Z" fill="white"/>
                                <path d="M15.9624 20.9928C15.6783 20.9235 15.3578 20.9558 15.0555 21.0829C14.7532 21.2099 14.5055 21.4178 14.3532 21.6696C14.1873 21.9422 14.1532 22.2448 14.2577 22.5013C14.4032 22.857 14.7714 23.058 15.2033 23.058C15.3964 23.058 15.6033 23.0187 15.8078 22.9309C16.467 22.656 16.817 22.0323 16.6056 21.5126C16.5011 21.2561 16.267 21.0667 15.9624 20.9928Z" fill="white"/>
                                <path d="M15.9624 20.9928C15.6783 20.9235 15.3578 20.9558 15.0555 21.0829C14.7532 21.2099 14.5055 21.4178 14.3532 21.6696C14.1873 21.9422 14.1532 22.2448 14.2577 22.5013C14.4032 22.857 14.7714 23.058 15.2033 23.058C15.3964 23.058 15.6033 23.0187 15.8078 22.9309C16.467 22.656 16.817 22.0323 16.6056 21.5126C16.5011 21.2561 16.267 21.0667 15.9624 20.9928Z" fill="white"/>
                                <path d="M9.81661 11.5076C10.0007 11.5076 10.1757 11.4614 10.3348 11.3689C10.9417 11.0132 11.0621 10.0661 10.603 9.25984C10.1439 8.4513 9.27567 8.084 8.67108 8.43975C8.31197 8.64997 8.12332 9.06579 8.12332 9.53705C8.12332 9.86508 8.21424 10.2208 8.40288 10.5512C8.61881 10.93 8.93019 11.2257 9.28021 11.3851C9.45977 11.466 9.6416 11.5076 9.81661 11.5076Z" fill="white"/>
                                <path d="M9.81661 11.5076C10.0007 11.5076 10.1757 11.4614 10.3348 11.3689C10.9417 11.0132 11.0621 10.0661 10.603 9.25984C10.1439 8.4513 9.27567 8.084 8.67108 8.43975C8.31197 8.64997 8.12332 9.06579 8.12332 9.53705C8.12332 9.86508 8.21424 10.2208 8.40288 10.5512C8.61881 10.93 8.93019 11.2257 9.28021 11.3851C9.45977 11.466 9.6416 11.5076 9.81661 11.5076Z" fill="white"/>
                                <path d="M9.81661 11.5076C10.0007 11.5076 10.1757 11.4614 10.3348 11.3689C10.9417 11.0132 11.0621 10.0661 10.603 9.25984C10.1439 8.4513 9.27567 8.084 8.67108 8.43975C8.31197 8.64997 8.12332 9.06579 8.12332 9.53705C8.12332 9.86508 8.21424 10.2208 8.40288 10.5512C8.61881 10.93 8.93019 11.2257 9.28021 11.3851C9.45977 11.466 9.6416 11.5076 9.81661 11.5076Z" fill="white"/>
                                <path d="M9.81661 11.5076C10.0007 11.5076 10.1757 11.4614 10.3348 11.3689C10.9417 11.0132 11.0621 10.0661 10.603 9.25984C10.1439 8.4513 9.27567 8.084 8.67108 8.43975C8.31197 8.64997 8.12332 9.06579 8.12332 9.53705C8.12332 9.86508 8.21424 10.2208 8.40288 10.5512C8.61881 10.93 8.93019 11.2257 9.28021 11.3851C9.45977 11.466 9.6416 11.5076 9.81661 11.5076Z" fill="white"/>
                                <path d="M19.8082 20.5423C19.6718 20.7825 19.6672 21.0875 19.7945 21.3786C19.9127 21.6488 20.1332 21.8891 20.4173 22.0554C20.6673 22.2033 20.931 22.2749 21.1765 22.2749C21.5333 22.2749 21.8447 22.1224 22.0083 21.8337C22.2856 21.3485 22.0174 20.6832 21.4015 20.3228C20.7832 19.9602 20.0855 20.0572 19.8082 20.5423Z" fill="white"/>
                                <path d="M19.8082 20.5423C19.6718 20.7825 19.6672 21.0875 19.7945 21.3786C19.9127 21.6488 20.1332 21.8891 20.4173 22.0554C20.6673 22.2033 20.931 22.2749 21.1765 22.2749C21.5333 22.2749 21.8447 22.1224 22.0083 21.8337C22.2856 21.3485 22.0174 20.6832 21.4015 20.3228C20.7832 19.9602 20.0855 20.0572 19.8082 20.5423Z" fill="white"/>
                                <path d="M19.8082 20.5423C19.6718 20.7825 19.6672 21.0875 19.7945 21.3786C19.9127 21.6488 20.1332 21.8891 20.4173 22.0554C20.6673 22.2033 20.931 22.2749 21.1765 22.2749C21.5333 22.2749 21.8447 22.1224 22.0083 21.8337C22.2856 21.3485 22.0174 20.6832 21.4015 20.3228C20.7832 19.9602 20.0855 20.0572 19.8082 20.5423Z" fill="white"/>
                                <path d="M19.8082 20.5423C19.6718 20.7825 19.6672 21.0875 19.7945 21.3786C19.9127 21.6488 20.1332 21.8891 20.4173 22.0554C20.6673 22.2033 20.931 22.2749 21.1765 22.2749C21.5333 22.2749 21.8447 22.1224 22.0083 21.8337C22.2856 21.3485 22.0174 20.6832 21.4015 20.3228C20.7832 19.9602 20.0855 20.0572 19.8082 20.5423Z" fill="white"/>
                                <path d="M20.4127 9.57399C20.1945 9.40766 19.8968 9.3684 19.5967 9.46542C19.3194 9.55551 19.0603 9.75187 18.8671 10.0175C18.6739 10.2855 18.5648 10.5951 18.5626 10.8907C18.5603 11.2095 18.6853 11.4867 18.9057 11.6508C19.0467 11.757 19.2194 11.8102 19.4035 11.8102C19.5058 11.8102 19.6126 11.794 19.7217 11.7593C19.999 11.6692 20.2581 11.4729 20.4513 11.2049C20.6445 10.9393 20.7536 10.6297 20.7559 10.334C20.7581 10.0152 20.6332 9.73801 20.4127 9.57399Z" fill="white"/>
                                <path d="M20.4127 9.57399C20.1945 9.40766 19.8968 9.3684 19.5967 9.46542C19.3194 9.55551 19.0603 9.75187 18.8671 10.0175C18.6739 10.2855 18.5648 10.5951 18.5626 10.8907C18.5603 11.2095 18.6853 11.4867 18.9057 11.6508C19.0467 11.757 19.2194 11.8102 19.4035 11.8102C19.5058 11.8102 19.6126 11.794 19.7217 11.7593C19.999 11.6692 20.2581 11.4729 20.4513 11.2049C20.6445 10.9393 20.7536 10.6297 20.7559 10.334C20.7581 10.0152 20.6332 9.73801 20.4127 9.57399Z" fill="white"/>
                                <path d="M20.4127 9.57399C20.1945 9.40766 19.8968 9.3684 19.5967 9.46542C19.3194 9.55551 19.0603 9.75187 18.8671 10.0175C18.6739 10.2855 18.5648 10.5951 18.5626 10.8907C18.5603 11.2095 18.6853 11.4867 18.9057 11.6508C19.0467 11.757 19.2194 11.8102 19.4035 11.8102C19.5058 11.8102 19.6126 11.794 19.7217 11.7593C19.999 11.6692 20.2581 11.4729 20.4513 11.2049C20.6445 10.9393 20.7536 10.6297 20.7559 10.334C20.7581 10.0152 20.6332 9.73801 20.4127 9.57399Z" fill="white"/>
                                <path d="M20.4127 9.57399C20.1945 9.40766 19.8968 9.3684 19.5967 9.46542C19.3194 9.55551 19.0603 9.75187 18.8671 10.0175C18.6739 10.2855 18.5648 10.5951 18.5626 10.8907C18.5603 11.2095 18.6853 11.4867 18.9057 11.6508C19.0467 11.757 19.2194 11.8102 19.4035 11.8102C19.5058 11.8102 19.6126 11.794 19.7217 11.7593C19.999 11.6692 20.2581 11.4729 20.4513 11.2049C20.6445 10.9393 20.7536 10.6297 20.7559 10.334C20.7581 10.0152 20.6332 9.73801 20.4127 9.57399Z" fill="white"/>
                                <path d="M9.89395 15.698L10.5713 16.0792C10.7781 16.1947 10.9827 16.3218 11.0281 16.495C11.0736 16.6775 10.944 16.89 10.8054 17.1118C10.7758 17.1603 10.7463 17.2065 10.719 17.2527C10.1621 18.1976 10.2917 19.4727 11.019 20.2189C11.4236 20.6324 11.9827 20.8403 12.535 20.8403C13.0441 20.8403 13.5487 20.6624 13.9147 20.2998C14.1351 20.0826 14.301 19.8169 14.4624 19.5628C14.7011 19.1794 14.9283 18.819 15.2897 18.6965C15.6921 18.5625 16.1466 18.7751 16.4557 18.9761C16.5808 19.0592 16.7035 19.147 16.8239 19.2348C17.0967 19.4358 17.3808 19.6437 17.7126 19.773C18.465 20.0734 19.5605 19.9717 20.1105 19.1978C20.3264 18.8929 20.231 18.3916 20.0673 18.1652C19.915 17.9527 19.6809 17.784 19.4582 17.6201C19.2354 17.4606 19.0059 17.2943 18.9036 17.1141C18.6786 16.7214 18.4627 16.2663 18.5695 15.8575C18.6081 15.7096 18.69 15.5687 18.7763 15.4185L18.8036 15.3723C18.8581 15.2753 18.9695 15.1436 19.0854 15.0073C19.3309 14.7209 19.5832 14.4252 19.6173 14.1272C19.6764 13.649 19.5173 13.1893 19.2059 12.9283C18.8627 12.6395 18.4422 12.6256 18.0354 12.6118C17.7854 12.6025 17.5467 12.5956 17.3399 12.524C17.2649 12.4986 17.249 12.4801 17.2467 12.4755C17.2421 12.4709 17.2353 12.4524 17.2285 12.3854C17.208 12.1567 17.2558 11.9187 17.3581 11.7131C17.3876 11.6554 17.4194 11.5953 17.4512 11.5353C17.6285 11.2072 17.8285 10.8353 17.7195 10.4773C17.6581 10.274 17.5081 10.1099 17.2717 9.98982C17.0558 9.87662 16.6671 9.67565 16.2557 9.67565C15.9625 9.67565 15.6557 9.77729 15.3898 10.0845C15.1261 10.3895 14.9761 10.8215 14.9579 11.3389L14.9556 11.4267C14.9511 11.6069 14.9466 11.7755 14.8693 11.8818C14.7397 12.062 14.4056 12.0435 14.1488 11.995C13.8851 11.9465 13.6237 11.8818 13.3623 11.8032C13.251 11.7686 13.1123 11.727 12.96 11.7524C12.851 11.7709 12.7441 11.8217 12.6441 11.9049C12.3032 12.1867 12.1964 12.7042 12.4032 13.083C12.4805 13.2239 12.5896 13.3302 12.685 13.4249L12.7328 13.4757C12.9123 13.6582 13.1192 13.9332 13.0805 14.2057C13.0578 14.3698 12.9487 14.4783 12.8623 14.5407C12.6714 14.677 12.3964 14.7301 12.1577 14.6793C11.7963 14.6008 11.4781 14.3721 11.144 14.1318C11.0667 14.0741 10.9895 14.0186 10.9099 13.9632C10.644 13.7783 10.3212 13.5866 9.94849 13.5543C9.50529 13.5173 9.09162 13.7437 8.94161 14.1064C8.80751 14.4252 8.88934 14.8341 9.14617 15.1436C9.35755 15.4001 9.64166 15.5594 9.89395 15.698Z" fill="white"/>
                                <path d="M9.89395 15.698L10.5713 16.0792C10.7781 16.1947 10.9827 16.3218 11.0281 16.495C11.0736 16.6775 10.944 16.89 10.8054 17.1118C10.7758 17.1603 10.7463 17.2065 10.719 17.2527C10.1621 18.1976 10.2917 19.4727 11.019 20.2189C11.4236 20.6324 11.9827 20.8403 12.535 20.8403C13.0441 20.8403 13.5487 20.6624 13.9147 20.2998C14.1351 20.0826 14.301 19.8169 14.4624 19.5628C14.7011 19.1794 14.9283 18.819 15.2897 18.6965C15.6921 18.5625 16.1466 18.7751 16.4557 18.9761C16.5808 19.0592 16.7035 19.147 16.8239 19.2348C17.0967 19.4358 17.3808 19.6437 17.7126 19.773C18.465 20.0734 19.5605 19.9717 20.1105 19.1978C20.3264 18.8929 20.231 18.3916 20.0673 18.1652C19.915 17.9527 19.6809 17.784 19.4582 17.6201C19.2354 17.4606 19.0059 17.2943 18.9036 17.1141C18.6786 16.7214 18.4627 16.2663 18.5695 15.8575C18.6081 15.7096 18.69 15.5687 18.7763 15.4185L18.8036 15.3723C18.8581 15.2753 18.9695 15.1436 19.0854 15.0073C19.3309 14.7209 19.5832 14.4252 19.6173 14.1272C19.6764 13.649 19.5173 13.1893 19.2059 12.9283C18.8627 12.6395 18.4422 12.6256 18.0354 12.6118C17.7854 12.6025 17.5467 12.5956 17.3399 12.524C17.2649 12.4986 17.249 12.4801 17.2467 12.4755C17.2421 12.4709 17.2353 12.4524 17.2285 12.3854C17.208 12.1567 17.2558 11.9187 17.3581 11.7131C17.3876 11.6554 17.4194 11.5953 17.4512 11.5353C17.6285 11.2072 17.8285 10.8353 17.7195 10.4773C17.6581 10.274 17.5081 10.1099 17.2717 9.98982C17.0558 9.87662 16.6671 9.67565 16.2557 9.67565C15.9625 9.67565 15.6557 9.77729 15.3898 10.0845C15.1261 10.3895 14.9761 10.8215 14.9579 11.3389L14.9556 11.4267C14.9511 11.6069 14.9466 11.7755 14.8693 11.8818C14.7397 12.062 14.4056 12.0435 14.1488 11.995C13.8851 11.9465 13.6237 11.8818 13.3623 11.8032C13.251 11.7686 13.1123 11.727 12.96 11.7524C12.851 11.7709 12.7441 11.8217 12.6441 11.9049C12.3032 12.1867 12.1964 12.7042 12.4032 13.083C12.4805 13.2239 12.5896 13.3302 12.685 13.4249L12.7328 13.4757C12.9123 13.6582 13.1192 13.9332 13.0805 14.2057C13.0578 14.3698 12.9487 14.4783 12.8623 14.5407C12.6714 14.677 12.3964 14.7301 12.1577 14.6793C11.7963 14.6008 11.4781 14.3721 11.144 14.1318C11.0667 14.0741 10.9895 14.0186 10.9099 13.9632C10.644 13.7783 10.3212 13.5866 9.94849 13.5543C9.50529 13.5173 9.09162 13.7437 8.94161 14.1064C8.80751 14.4252 8.88934 14.8341 9.14617 15.1436C9.35755 15.4001 9.64166 15.5594 9.89395 15.698Z" fill="white"/>
                                <path d="M9.89395 15.698L10.5713 16.0792C10.7781 16.1947 10.9827 16.3218 11.0281 16.495C11.0736 16.6775 10.944 16.89 10.8054 17.1118C10.7758 17.1603 10.7463 17.2065 10.719 17.2527C10.1621 18.1976 10.2917 19.4727 11.019 20.2189C11.4236 20.6324 11.9827 20.8403 12.535 20.8403C13.0441 20.8403 13.5487 20.6624 13.9147 20.2998C14.1351 20.0826 14.301 19.8169 14.4624 19.5628C14.7011 19.1794 14.9283 18.819 15.2897 18.6965C15.6921 18.5625 16.1466 18.7751 16.4557 18.9761C16.5808 19.0592 16.7035 19.147 16.8239 19.2348C17.0967 19.4358 17.3808 19.6437 17.7126 19.773C18.465 20.0734 19.5605 19.9717 20.1105 19.1978C20.3264 18.8929 20.231 18.3916 20.0673 18.1652C19.915 17.9527 19.6809 17.784 19.4582 17.6201C19.2354 17.4606 19.0059 17.2943 18.9036 17.1141C18.6786 16.7214 18.4627 16.2663 18.5695 15.8575C18.6081 15.7096 18.69 15.5687 18.7763 15.4185L18.8036 15.3723C18.8581 15.2753 18.9695 15.1436 19.0854 15.0073C19.3309 14.7209 19.5832 14.4252 19.6173 14.1272C19.6764 13.649 19.5173 13.1893 19.2059 12.9283C18.8627 12.6395 18.4422 12.6256 18.0354 12.6118C17.7854 12.6025 17.5467 12.5956 17.3399 12.524C17.2649 12.4986 17.249 12.4801 17.2467 12.4755C17.2421 12.4709 17.2353 12.4524 17.2285 12.3854C17.208 12.1567 17.2558 11.9187 17.3581 11.7131C17.3876 11.6554 17.4194 11.5953 17.4512 11.5353C17.6285 11.2072 17.8285 10.8353 17.7195 10.4773C17.6581 10.274 17.5081 10.1099 17.2717 9.98982C17.0558 9.87662 16.6671 9.67565 16.2557 9.67565C15.9625 9.67565 15.6557 9.77729 15.3898 10.0845C15.1261 10.3895 14.9761 10.8215 14.9579 11.3389L14.9556 11.4267C14.9511 11.6069 14.9466 11.7755 14.8693 11.8818C14.7397 12.062 14.4056 12.0435 14.1488 11.995C13.8851 11.9465 13.6237 11.8818 13.3623 11.8032C13.251 11.7686 13.1123 11.727 12.96 11.7524C12.851 11.7709 12.7441 11.8217 12.6441 11.9049C12.3032 12.1867 12.1964 12.7042 12.4032 13.083C12.4805 13.2239 12.5896 13.3302 12.685 13.4249L12.7328 13.4757C12.9123 13.6582 13.1192 13.9332 13.0805 14.2057C13.0578 14.3698 12.9487 14.4783 12.8623 14.5407C12.6714 14.677 12.3964 14.7301 12.1577 14.6793C11.7963 14.6008 11.4781 14.3721 11.144 14.1318C11.0667 14.0741 10.9895 14.0186 10.9099 13.9632C10.644 13.7783 10.3212 13.5866 9.94849 13.5543C9.50529 13.5173 9.09162 13.7437 8.94161 14.1064C8.80751 14.4252 8.88934 14.8341 9.14617 15.1436C9.35755 15.4001 9.64166 15.5594 9.89395 15.698Z" fill="white"/>
                                <path d="M9.89395 15.698L10.5713 16.0792C10.7781 16.1947 10.9827 16.3218 11.0281 16.495C11.0736 16.6775 10.944 16.89 10.8054 17.1118C10.7758 17.1603 10.7463 17.2065 10.719 17.2527C10.1621 18.1976 10.2917 19.4727 11.019 20.2189C11.4236 20.6324 11.9827 20.8403 12.535 20.8403C13.0441 20.8403 13.5487 20.6624 13.9147 20.2998C14.1351 20.0826 14.301 19.8169 14.4624 19.5628C14.7011 19.1794 14.9283 18.819 15.2897 18.6965C15.6921 18.5625 16.1466 18.7751 16.4557 18.9761C16.5808 19.0592 16.7035 19.147 16.8239 19.2348C17.0967 19.4358 17.3808 19.6437 17.7126 19.773C18.465 20.0734 19.5605 19.9717 20.1105 19.1978C20.3264 18.8929 20.231 18.3916 20.0673 18.1652C19.915 17.9527 19.6809 17.784 19.4582 17.6201C19.2354 17.4606 19.0059 17.2943 18.9036 17.1141C18.6786 16.7214 18.4627 16.2663 18.5695 15.8575C18.6081 15.7096 18.69 15.5687 18.7763 15.4185L18.8036 15.3723C18.8581 15.2753 18.9695 15.1436 19.0854 15.0073C19.3309 14.7209 19.5832 14.4252 19.6173 14.1272C19.6764 13.649 19.5173 13.1893 19.2059 12.9283C18.8627 12.6395 18.4422 12.6256 18.0354 12.6118C17.7854 12.6025 17.5467 12.5956 17.3399 12.524C17.2649 12.4986 17.249 12.4801 17.2467 12.4755C17.2421 12.4709 17.2353 12.4524 17.2285 12.3854C17.208 12.1567 17.2558 11.9187 17.3581 11.7131C17.3876 11.6554 17.4194 11.5953 17.4512 11.5353C17.6285 11.2072 17.8285 10.8353 17.7195 10.4773C17.6581 10.274 17.5081 10.1099 17.2717 9.98982C17.0558 9.87662 16.6671 9.67565 16.2557 9.67565C15.9625 9.67565 15.6557 9.77729 15.3898 10.0845C15.1261 10.3895 14.9761 10.8215 14.9579 11.3389L14.9556 11.4267C14.9511 11.6069 14.9466 11.7755 14.8693 11.8818C14.7397 12.062 14.4056 12.0435 14.1488 11.995C13.8851 11.9465 13.6237 11.8818 13.3623 11.8032C13.251 11.7686 13.1123 11.727 12.96 11.7524C12.851 11.7709 12.7441 11.8217 12.6441 11.9049C12.3032 12.1867 12.1964 12.7042 12.4032 13.083C12.4805 13.2239 12.5896 13.3302 12.685 13.4249L12.7328 13.4757C12.9123 13.6582 13.1192 13.9332 13.0805 14.2057C13.0578 14.3698 12.9487 14.4783 12.8623 14.5407C12.6714 14.677 12.3964 14.7301 12.1577 14.6793C11.7963 14.6008 11.4781 14.3721 11.144 14.1318C11.0667 14.0741 10.9895 14.0186 10.9099 13.9632C10.644 13.7783 10.3212 13.5866 9.94849 13.5543C9.50529 13.5173 9.09162 13.7437 8.94161 14.1064C8.80751 14.4252 8.88934 14.8341 9.14617 15.1436C9.35755 15.4001 9.64166 15.5594 9.89395 15.698Z" fill="white"/>
                                <path d="M13.4441 10.5835C13.535 10.5835 13.626 10.5673 13.7146 10.535C13.9714 10.4426 14.1692 10.2139 14.2578 9.90896C14.3396 9.62482 14.3237 9.29679 14.2146 8.98493C14.1055 8.67075 13.9123 8.40741 13.6737 8.24108C13.4146 8.06089 13.1191 8.01007 12.86 8.10479C12.6031 8.19719 12.4054 8.42589 12.3168 8.73082C12.2349 9.01496 12.2508 9.34299 12.3599 9.65486C12.5577 10.2208 13.0009 10.5835 13.4441 10.5835Z" fill="white"/>
                                <path d="M13.4441 10.5835C13.535 10.5835 13.626 10.5673 13.7146 10.535C13.9714 10.4426 14.1692 10.2139 14.2578 9.90896C14.3396 9.62482 14.3237 9.29679 14.2146 8.98493C14.1055 8.67075 13.9123 8.40741 13.6737 8.24108C13.4146 8.06089 13.1191 8.01007 12.86 8.10479C12.6031 8.19719 12.4054 8.42589 12.3168 8.73082C12.2349 9.01496 12.2508 9.34299 12.3599 9.65486C12.5577 10.2208 13.0009 10.5835 13.4441 10.5835Z" fill="white"/>
                                <path d="M13.4441 10.5835C13.535 10.5835 13.626 10.5673 13.7146 10.535C13.9714 10.4426 14.1692 10.2139 14.2578 9.90896C14.3396 9.62482 14.3237 9.29679 14.2146 8.98493C14.1055 8.67075 13.9123 8.40741 13.6737 8.24108C13.4146 8.06089 13.1191 8.01007 12.86 8.10479C12.6031 8.19719 12.4054 8.42589 12.3168 8.73082C12.2349 9.01496 12.2508 9.34299 12.3599 9.65486C12.5577 10.2208 13.0009 10.5835 13.4441 10.5835Z" fill="white"/>
                                <path d="M13.4441 10.5835C13.535 10.5835 13.626 10.5673 13.7146 10.535C13.9714 10.4426 14.1692 10.2139 14.2578 9.90896C14.3396 9.62482 14.3237 9.29679 14.2146 8.98493C14.1055 8.67075 13.9123 8.40741 13.6737 8.24108C13.4146 8.06089 13.1191 8.01007 12.86 8.10479C12.6031 8.19719 12.4054 8.42589 12.3168 8.73082C12.2349 9.01496 12.2508 9.34299 12.3599 9.65486C12.5577 10.2208 13.0009 10.5835 13.4441 10.5835Z" fill="white"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_4494_2200">
                                <rect width="15" height="15" fill="white" transform="translate(8.12341 8.05798)"/>
                                </clipPath>
                                </defs>
                            </svg> 
                        </div> 
                    </div>
                    <div class="ONEAS-speedometer__fuel">                    
                        <div class="ONEAS-fuel__progress-value ONEAS-percent__progress-value">
                        </div>
                        <div>
                            <svg class="fuel__icon icon_percent" width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_4494_1916)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.12341 8.41513H17.3542V16.9866H17.7388C19.0133 16.9866 20.0465 17.946 20.0465 19.1295C20.0465 19.524 20.3909 19.8438 20.8157 19.8438C21.2406 19.8438 21.585 19.524 21.585 19.1295V12.9968L18.7333 10.3488L19.8212 9.33868L23.1234 12.405V19.1295C23.1234 20.3129 22.0902 21.2723 20.8157 21.2723C19.5412 21.2723 18.5081 20.3129 18.5081 19.1295C18.5081 18.735 18.1636 18.4152 17.7388 18.4152H17.3542V22.7008H8.12341V8.41513ZM9.66188 9.8437H15.8157V14.1294H9.66188V9.8437Z" fill="white"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_4494_1916">
                                <rect width="15" height="14.2857" fill="white" transform="translate(8.12341 8.41513)"/>
                                </clipPath>
                                </defs>
                            </svg>
                            <div class="ONEAS-fuel__data">
                                <div class="ONEAS-fuel__value">58</div>
                                <div class="ONEAS-fuel__text">л</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            const speedometerEl = jsLoader._x1040123.ljfkles(text, "ONEAS-speedometer", (prop, value) =>
                this.onChangeInfo(prop, value)
            );

            this.create(speedometerEl);

            window.__hassleTemplate.interface("Hud").speedometer.show = 0;
        },
    },
    dialogChanger: {
        data: {
            defaultDialog: "dialog-1",
            dialog: "",
            prevDialog: "",
        },

        loadConfig() {
            const dialog = jsLoader.localStorage.getItem("hud-dialog");

            if (dialog === null) {
                this.data.dialog = this.data.defaultDialog;
                this.saveConfig(this.data.defaultDialog);
                return;
            }

            this.data.dialog = dialog;
        },

        saveConfig(dialog) {
            jsLoader.localStorage.setItem("hud-dialog", dialog);
        },

        applyHudDialog(dialog) {
            document.body.classList.add(dialog);
        },

        removeHudDialog(dialog) {
            document.body.classList.remove(dialog);
        },

        changeHudDialog(dialog) {
            if (this.data.prevDialog) this.removeHudDialog(this.data.prevDialog);

            this.applyHudDialog(dialog);

            this.data.prevDialog = dialog;

            if (dialog === this.data.dialog) return;

            this.data.dialog = dialog;
            this.saveConfig(dialog);
        },

        addMenuOption() {
            jsLoader.mainMenu.addNewOption(3, "Диалоговые окна", {
                data: [
                    {
                        id: "dialog-1",
                        value: "Вариант 1",
                        img: "",
                    },
                    {
                        id: "dialog-2",
                        value: "Вариант 2",
                        img: "",
                    },
                ],
                selectedId: this.data.dialog,
                callback: ({ id }) => {
                    this.changeHudDialog(id);
                },
            });
        },

        init() {
            this.loadConfig();

            this.changeHudDialog(this.data.dialog);

            this.addMenuOption();
        },
    },
    minimapChanger: {
        data: {
            defaultMinimap: "shape-minimap-2",
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
        this.paramsPercentage.init();

        this.hud.init();
        this.speedometer.init();
        this.dialogChanger.init();
        
        this.minimapChanger.init();
        jsLoader.showAddedScript(`HUD ${nameMod} v${vol}`, "info");
    },
};

let isAutoComplete = 0;
const conditionsOfWindowType = [1, 3];
const conditionsOfWindowTitles = [
    "введите сумму",
    "введите цену",
    "укажите сумму",
    ["снятие средств", "киоск"],
    ["укажите сумму", "безналичный перевод"],
];

window.addDialogInQueue = new Proxy(window.addDialogInQueue, {
    apply(target, thisArg, args) {
        let params = typeof args === "string" ? JSON.parse(args) : args;
        let windowType = typeof params[0] === "string" ? JSON.parse(params[0]) : params[0];
        let allArgs = params.join(", ").toLowerCase();
        if (conditionsOfWindowType.includes(windowType[1])) {
            if (
                conditionsOfWindowTitles.some((t) =>
                    Array.isArray(t) ? allArgs.includes(t[0]) && allArgs.includes(t[1]) : allArgs.includes(t)
                )
            ) {
                if (args[1]) args[1] += '{888888}\n\nАвтоматическое разделение значения символом "."';
                isAutoComplete = 1;
            }
        } else isAutoComplete = 0;
        Reflect.apply(target, thisArg, args);

        if (isAutoComplete) {
            setTimeout(() => {
                const inputEl = document.querySelector(".window-input > div > input");
                inputEl.addEventListener("input", () => {
                     
                    const oldValue = inputEl.value;
                    const cursorPosition = inputEl.selectionStart;

                    const valueWithoutDots = oldValue.replaceAll(".", "");

                    const newValue = valueWithoutDots.replace(/(\d)(?=(\d{3})+(?!\d))/g, "\$1.");

                    inputEl.value = newValue;

                    let newCursorPosition = cursorPosition;

                    let dotsAdded = 0;
                    for (let i = 0; i < cursorPosition; i++) {
                        if (oldValue[i] !== newValue[i]) {
                            if (newValue[i] === '.') {
                                dotsAdded++;
                            }
                        }
                    }

                    newCursorPosition += dotsAdded;
                    inputEl.setSelectionRange(newCursorPosition, newCursorPosition);
                });
            }, 400);
        }
    },
});

window.sendClientEventHandle = new Proxy(window.sendClientEventHandle, {
    apply(target, thisArg, args) {
        if (args[5]) {
            if (isAutoComplete) args[5] = args[5].replaceAll(".", "");
        }
        Reflect.apply(target, thisArg, args);
    },
});

window.openInterface = new Proxy(window.openInterface, {
    apply: (target, thisArg, e) => {
        if (e[0] === "Stall") {

            Reflect.apply(target, thisArg, e);
            setTimeout(() => {
                if (getInterfaceStatus("Interactions")) window.__hassleTemplate.interface("Interactions").close();
            });
        } else Reflect.apply(target, thisArg, e);
    },
});

const randomValue = Math.floor(Math.random() * 31);

const style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
#app .authorization__gradient {
  background-image: url(oneas-img/interfaces/bg-auth-${randomValue}.png);
  background-size: cover;
  filter: grayscale(1);
}
`;
document.head.appendChild(style);

const jsLoaderInterval = setInterval(() => {
    if (jsLoader) {
        clearInterval(jsLoaderInterval)
        jsLoader.utils.initDynamicReplacePathImages([
            [
                'PlayerInteraction',
                [
                    '.player-interaction',
                    'PlayerInteraction',
                    [
                        {
                            target: 'player-interaction__sector',
                            params: ['style', 'class'],
                            assets: {
                            'assets/option_active': ['oneas-img/interfaces/option_active.svg', 'src'],
                            'assets/option_hover': ['oneas-img/interfaces/option_hover.svg', 'src'],
                            },
                        },
                        {
                            target: 'player-interaction-layer__sector',
                            params: ['style', 'class'],
                            assets: {
                            'assets/layer_option_active': ['oneas-img/interfaces/layer_option_active.svg', 'src'],
                            'assets/layer_option_hover': ['oneas-img/interfaces/layer_option_hover.svg', 'src']
                            },
                        },
                    ],
                ],
            ],

        ])
        jsLoader.utils.staticReplacePathImages([
            [
                'PlayerInteraction',
                '.player-interaction',
                {
                    '.player-interaction__sector': [
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAACdCAMAAABbyM5gAAAA5FBMVEUAAAD',
                        'none', 
                        'src',
                    ],
                },
            ],

        ])
    }
}, 100)

window.openInterface = new Proxy(window.openInterface, {
    apply: (target, thisArg, args) => {
        Reflect.apply(target, thisArg, args)
        if (args[0] === "Fuel") {
            jsLoader.runtime.executeFunctionWhen(() => {
                window.__hassleTemplate.interface('Fuel')._.components.FuelTank.methods.calcFill = function(s) {
                    const l = s.x;
                    const  t = this.$refs.container.getBoundingClientRect().left;
                    let v = l - t;

                    if (s.touches) {
                      let u = s.touches[s.touches.length - 1];
                      const r = u.target.getBoundingClientRect().left;
                      u && (v = u.clientX - r);
                    }

                    const i = this.$el.offsetHeight;
                    const e = Math.ceil((v / i) * 100);

                    return e > 100 ? 100 : e < 0 ? 0 : e;
                };
            }, () => window.__hassleTemplate.interface('Fuel') !== false)
        }
    }
})

return oneasHud;
})()