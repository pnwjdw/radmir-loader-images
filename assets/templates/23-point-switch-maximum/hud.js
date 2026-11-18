(function(){
const vol = "1.0.1",
    lvl = "Maximum",
    nameMod = "Point Switch";

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
        name: "RPM",
        id: "rpm",
        filePath: "additional-scripts/rpm.js",
        enabled: true,
        is_hidden: true,
        options: {
            max: 8000,  
            idle: {
                min: 200,
                max: 300,
            },  
            koefLoad: 80,  
        },
    },
];

const oneasHud = {

    wantedAlwaysShowClass: "",

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
                progress: null,
            },
            freezeEl: {
                wrapper: null,
                value: null,
                progress: null,
            },
            wanted: {
                wrapper: null,
                els: [],
            },
            weaponEl: {
                wrapper: null,
                icon: null,
                ammoEl: null,
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
            [this.data.breathEl.wrapper, this.data.breathEl.value, this.data.breathEl.progress] = [
                hudEl.querySelector(".ONEAS-param__breath"),
                hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount"),
                hudEl.querySelector(".ONEAS-param__breath .ONEAS-progress__value"),
            ];
            [this.data.freezeEl.wrapper, this.data.freezeEl.value, this.data.freezeEl.progress] = [
                hudEl.querySelector(".ONEAS-param__freeze"),
                hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"),
                hudEl.querySelector(".ONEAS-param__freeze .ONEAS-progress__value"),
            ];
            [this.data.wanted.wrapper, this.data.wanted.els] = [
                hudEl.querySelector(".ONEAS-wanted"),
                hudEl.querySelector(".ONEAS-wanted__row").children,
            ];
            [this.data.weaponEl.wrapper, this.data.weaponEl.icon, this.data.weaponEl.ammoEl] = [
                hudEl.querySelector(".ONEAS-weapon"),
                hudEl.querySelector(".ONEAS-weapon__icon"),
                hudEl.querySelector(".ONEAS-weapon__ammo").children,
            ];
            [this.data.server.wrapper, this.data.server.value] = [
                hudEl.querySelector(".ONEAS-logo"),
                hudEl.querySelector("#logo-t2"),
            ];
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-green-zone");

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

                const WeaponValues = [0, 10, 11, 12, 13, 14, 44, 45];
                if (WeaponValues.includes(value)) {
                    this.data.weaponEl.wrapper.style.opacity = "0";
                } else {
                    this.data.weaponEl.wrapper.style.opacity = "1";
                }

                if ((value < 16) | (value == 40) | (value == 46))
                    document.querySelector(".ONEAS-weapon__ammo").style.display = "none";
                else document.querySelector(".ONEAS-weapon__ammo").style.display = "";
            }

            if (prop == "showGreenZoneTab") {
                this.data.greenZoneEl.style.opacity = "1";
                document.querySelector(".ONEAS-radar-border").classList.add("ONEAS-hud-zz");
            }

            if (prop == "hideGreenZoneTab") {
                this.data.greenZoneEl.style.opacity = "0";
                document.querySelector(".ONEAS-radar-border").classList.remove("ONEAS-hud-zz");
            }

            if (prop == "health") {
                this.data.hpEl.wrapper.classList.toggle("ONEAS-hud-warning", value <= 50);
                this.data.hpEl.wrapper.classList.toggle("ONEAS-hud-danger", value <= 25);

                this.data.hpEl.progress.style.width = `${value}%`;
                this.data.hpEl.value.textContent = value;
            }

            if (prop == "armour") {
                if (value == 0) {
                    this.data.armourEl.wrapper.style.display = "none";
                } else {
                    this.data.armourEl.wrapper.style.display = "";
                }

                if (this.data.armourEl.wrapper.style.display === "none") {
                    this.data.freezeEl.wrapper.style.marginLeft = "0vh"; 
                } else {
                    this.data.freezeEl.wrapper.style.marginLeft = "0.2778vh"; 
                }

                this.data.armourEl.progress.style.width = `${value}%`;
                this.data.armourEl.value.textContent = value;
            }

            if (prop == "hunger") {
                this.data.hungerEl.wrapper.classList.toggle("ONEAS-hud-warning", value <= 50);
                this.data.hungerEl.wrapper.classList.toggle("ONEAS-hud-danger", value <= 25);

                this.data.hungerEl.progress.style.width = `${value}%`;
                this.data.hungerEl.value.textContent = value;
            }

            if (prop == "breath") {
                if (value < 100) { 
                    this.data.breathEl.wrapper.style.display = ""; 

                    const freezeDisplay = this.data.freezeEl.wrapper.style.display;
                    const armourDisplay = this.data.armourEl.wrapper.style.display;

                    if (freezeDisplay === "none" || armourDisplay === "none") {

                        if (freezeDisplay === "none" && armourDisplay === "none") {
                            this.data.breathEl.wrapper.style.marginLeft = "0vh";  
                        } else {
                            this.data.breathEl.wrapper.style.marginLeft = "0.2778vh";  
                        }
                    
                    } else {
                        this.data.breathEl.wrapper.style.marginLeft = "0vh";  
                    }

                } else { 
                    this.data.breathEl.wrapper.style.display = "none";  
                }

                this.data.breathEl.progress.style.width = `${value}%`;
                this.data.breathEl.value.textContent = value;
            }

            if (prop == "money") {
                this.data.moneyEl.innerHTML = window.formatNumberWithSpaces(value);
            }

            if (prop == "wanted") {
                if (value === 0 && oneasHud.wantedAlwaysShowClass.length === 0) {
                    this.data.wanted.wrapper.style.display = "none";
                    return;
                }

                this.data.wanted.wrapper.style.display = "";

                for (let i = 0; i < 6; i += 1) {
                    if ((5 - i) / value >= 1 || (5 - i == 0 && value == 0)) {
                        this.data.wanted.els[i].classList.remove("ONEAS-wanted__active");
                        this.data.wanted.els[i].classList.add("ONEAS-wanted__inactive");
                    } else {
                        this.data.wanted.els[i].classList.remove("ONEAS-wanted__inactive");
                        this.data.wanted.els[i].classList.add("ONEAS-wanted__active");
                    }
                }
            }

            if (prop == "ammoInClip") {
                this.data.weaponEl.ammoEl[0].textContent = value;
            }

            if (prop == "totalAmmo") {
                this.data.weaponEl.ammoEl[1].textContent = `/ ${value}`;
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
                if (value <= 1) this.data.bonusEl.style.display = "none";
                else this.data.bonusEl.style.display = "";

                this.data.bonusEl.textContent = `x${value}`;
            }

            if (prop === "isShowFreeze" && value) {
                this.data.freezeEl.wrapper.style.display = "";
            }

            if (prop === "isShowFreeze" && !value) {
                this.data.freezeEl.wrapper.style.display = "none";
            }

            if (prop == "freeze") {
                this.data.freezeEl.progress.style.width = `${value}%`;
                this.data.freezeEl.value.textContent = value;
            }
        },
        init() {
            const hudHtml = `            
        <div class="ONEAS-hud__top">
            <div class="ONEAS-logo">
                <div class="ONEAS-logo__bonus">x3</div>
                <div class="ONEAS-logo__text">
                    <span id="logo-t1">Radmir</span>
                    <span id="logo-t2">20</span>
                </div>
            </div>
            <div class="ONEAS-wanted ${oneasHud.wantedAlwaysShowClass}">
                <div class="ONEAS-wanted__row">                    
                    <div class="ONEAS-wanted__inactive"></div>
                    <div class="ONEAS-wanted__inactive"></div>
                    <div class="ONEAS-wanted__inactive"></div>
                    <div class="ONEAS-wanted__inactive"></div>
                    <div class="ONEAS-wanted__active"></div>
                    <div class="ONEAS-wanted__active"></div>                        
                </div>
            </div>
            <div class="ONEAS-params">
                <div class="ONEAS-param__health ONEAS-param">  
                    <div class="ONEAS-param-info">  
                        <svg class="ONEAS-param__icon" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.0064 11.6998C13.9118 13.134 11.3794 14.9975 10.25 15.75C9.12067 14.9975 6.58824 13.1339 5.49363 11.6998C4.39901 10.2656 4.21223 9.02174 4.25567 8.5791C4.21223 7.7602 4.62054 5.97634 6.60127 5.39204C8.582 4.80775 9.8591 6.16671 10.25 6.91921C10.641 6.16671 11.918 4.80778 13.8987 5.39208C15.8795 5.97637 16.2878 7.76023 16.2443 8.57913C16.2878 9.02178 16.101 10.2656 15.0064 11.6998Z" fill="#2F2F2F" stroke="#2F2F2F" stroke-width="1.26675" stroke-linejoin="bevel"/>
                        </svg>
                        <span class="ONEAS-param__amount">100</span>
                    </div>                    
                    <div class="ONEAS-param__progress">
                        <div class="ONEAS-progress__value"></div>
                    </div>                    
                </div>
                <div class="ONEAS-param__hunger ONEAS-param">
                    <div class="ONEAS-param-info">
                        <svg class="ONEAS-param__icon" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.52202 11.2788H10.7503H15.9786C16.3714 13.0449 15.8755 16.5615 10.7503 16.4992C5.62512 16.5615 5.12929 13.0449 5.52202 11.2788Z" fill="#2F2F2F"/>
                            <path d="M7.21566 4.5C6.84747 5.12333 6.332 6.52584 7.21566 7.14917C8.09932 7.7725 7.19111 8.86334 6.62656 9.33084M10.8976 4.5C10.5294 5.12333 10.0139 6.52584 10.8976 7.14917C11.7813 7.7725 10.8731 8.86334 10.3085 9.33084M14.5058 4.5C14.1376 5.12333 13.6222 6.52584 14.5058 7.14917C15.3895 7.7725 14.4813 8.86334 13.9167 9.33084M10.7503 11.2788C8.70855 11.2788 7.5638 11.2788 5.52202 11.2788C5.12929 13.0449 5.62512 16.5615 10.7503 16.4992C15.8755 16.5615 16.3714 13.0449 15.9786 11.2788H10.7503Z" stroke="#2F2F2F" stroke-width="1.23753" stroke-linejoin="round"/>
                        </svg>
                        <span class="ONEAS-param__amount">42</span>
                    </div>                     
                    <div class="ONEAS-param__progress">
                        <div class="ONEAS-progress__value"></div>
                    </div> 
                </div>
                <div class="ONEAS-param__armour ONEAS-param">
                    <div class="ONEAS-param-info">
                        <svg class="ONEAS-param__icon" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.62919 14.1237C8.10471 16.0635 10.251 17 10.251 17C10.251 17 12.3973 16.0635 13.8728 14.1237C14.9991 12.643 16.1489 6.86637 14.7448 6.63204C12.4472 6.24861 10.251 5 10.251 5C10.251 5 8.27402 6.24886 5.75722 6.63204C4.34983 6.84631 5.50288 12.643 6.62919 14.1237Z" fill="#2F2F2F" stroke="#2F2F2F" stroke-width="1.88073" stroke-linejoin="bevel"/>
                        </svg>                            
                        <span class="ONEAS-param__amount">100</span>
                    </div>                     
                    <div class="ONEAS-param__progress">
                        <div class="ONEAS-progress__value"></div>
                    </div> 
                </div>
                <div style="display: none" class="ONEAS-param__freeze ONEAS-param">
                    <div class="ONEAS-param-info">  
                        <svg class="ONEAS-param__icon" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4014 8.32213V6.89994M10.4014 4.5V6.89994M10.4014 6.89994L11.9171 5.47775M10.4014 6.89994L8.88574 5.47775" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.4024 12.6778V14.1M10.4024 16.4999V14.1M10.4024 14.1L11.9181 15.5222M10.4024 14.1L8.88672 15.5222" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12.2076 9.62306L13.4054 8.85066M15.4267 7.54724L13.4054 8.85066M13.4054 8.85066L15.4264 9.34705M13.4054 8.85066L13.78 6.80947" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12.1646 11.6611L13.3863 12.3953M15.448 13.6342L13.3863 12.3953M13.3863 12.3953L13.8256 14.4236M13.3863 12.3953L15.3905 11.8353" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.29241 9.62306L7.0946 8.85066M5.0733 7.54724L7.0946 8.85066M7.0946 8.85066L5.07361 9.34705M7.0946 8.85066L6.71998 6.80947" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.3325 11.6611L7.11075 12.3953M5.04906 13.6342L7.11075 12.3953M7.11075 12.3953L6.67147 14.4236M7.11075 12.3953L5.10655 11.8353" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12.1861 9.4782L10.4029 8.41156L8.44141 9.4782V11.7004L10.4029 12.767L12.1861 11.7004V9.4782Z" stroke="#2F2F2F" stroke-width="1.2976" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                            
                        <span class="ONEAS-param__amount">30</span>
                    </div>                     
                    <div class="ONEAS-param__progress">
                        <div class="ONEAS-progress__value"></div>
                    </div> 
                </div>
                <div style="display: none" class="ONEAS-param__breath ONEAS-param">
                    <div class="ONEAS-param-info">  
                        <svg class="ONEAS-param__icon" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.33096 14.8822C7.41415 14.8822 6.67509 14.7274 6.11378 14.4179C5.55246 14.0991 5.14083 13.5645 4.87889 12.8142C4.6263 12.0545 4.5 11.0135 4.5 9.69109C4.5 8.3687 4.6263 7.33236 4.87889 6.58206C5.14083 5.82239 5.55246 5.28781 6.11378 4.97831C6.67509 4.65944 7.41415 4.5 8.33096 4.5C9.24777 4.5 9.98684 4.65944 10.5482 4.97831C11.1095 5.28781 11.5164 5.82239 11.769 6.58206C12.031 7.33236 12.1619 8.3687 12.1619 9.69109C12.1619 11.0135 12.031 12.0545 11.769 12.8142C11.5164 13.5645 11.1095 14.0991 10.5482 14.4179C9.98684 14.7274 9.24777 14.8822 8.33096 14.8822ZM9.21503 9.66295C9.21503 8.85639 9.18697 8.24209 9.13083 7.82005C9.08406 7.38863 8.99518 7.0932 8.86421 6.93376C8.74259 6.76495 8.56484 6.68054 8.33096 6.68054C8.10644 6.68054 7.92869 6.76495 7.79772 6.93376C7.66674 7.0932 7.57319 7.38863 7.51706 7.82005C7.47028 8.24209 7.44689 8.85639 7.44689 9.66295C7.44689 10.4601 7.47028 11.0791 7.51706 11.5199C7.57319 11.9607 7.66674 12.2702 7.79772 12.4484C7.92869 12.6172 8.10644 12.7016 8.33096 12.7016C8.56484 12.7016 8.74259 12.6172 8.86421 12.4484C8.99518 12.2702 9.08406 11.9607 9.13083 11.5199C9.18697 11.0791 9.21503 10.4601 9.21503 9.66295Z" fill="#2F2F2F"/>
                            <path d="M14.0246 13.7399C14.2042 13.5035 14.3614 13.2559 14.4961 12.9971C14.6308 12.7382 14.6982 12.4991 14.6982 12.2796C14.6982 12.077 14.6196 11.9363 14.4624 11.8576C14.3053 11.7732 14.1144 11.7309 13.8899 11.7309C13.7383 11.7309 13.5784 11.745 13.41 11.7732C13.2416 11.8013 13.0844 11.8407 12.9385 11.8913L12.6859 10.6505C12.989 10.5549 13.2893 10.4817 13.5868 10.4311C13.8843 10.3804 14.1649 10.3551 14.4288 10.3551C14.8104 10.3551 15.1472 10.4114 15.4391 10.5239C15.7366 10.6365 15.9696 10.8165 16.138 11.0641C16.3063 11.3061 16.3905 11.6268 16.3905 12.0264C16.3905 12.3696 16.3176 12.7045 16.1716 13.0308C16.0257 13.3516 15.8377 13.6611 15.6075 13.9593L14.6982 15.1495H16.5V16.5H12.7364V15.4365L14.0246 13.7399Z" fill="#2F2F2F"/>
                        </svg>
                        <span class="ONEAS-param__amount">85</span>
                    </div>                     
                    <div class="ONEAS-param__progress">
                        <div class="ONEAS-progress__value"></div>
                    </div> 
                </div>
            </div>
            <div class="ONEAS-cash">
                <span id="ONEAS-cash__value">999 999 999</span>
                <span id="ONEAS-cash__text">q</span>
            </div>
        </div>
        <div class="ONEAS-hud__bottom-right">
            <div class="ONEAS-weapon">
                <img class="ONEAS-weapon__icon" src="oneas-img/weapon/31.png">
                <div class="ONEAS-weapon__ammo">
                    <span id="ONEAS-ammo__in-clip">50</span>
                    <span id="ONEAS-ammo__total">/200</span> 
                </div>
            </div>
        </div>
        <div class="ONEAS-hud__bottom-left">
            <div class="ONEAS-green-zone">
                <div class="ONEAS-green-zone__text">
                    <span>Безопасная зона</span>
                </div>
            </div>
            <div class="ONEAS-radar-border">
                <svg width="215" height="215" viewBox="0 0 215 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="214" height="214" rx="5.5" stroke="white"/>
                </svg>                    
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
                dashArray12: 466,
                dashOffset12: 466,
                dashArray6: 493,
                dashOffset6: 493,
            },
            tachometer: {
                dashArray12: 144,
                dashOffset12: 144,
                dashArray6: 153,
                dashOffset6: 153,
            },
            fuel: {
                dashArray12: 116,
                dashOffset12: 116,
                dashArray6: 122,
                dashOffset6: 122,
            },
        },
        data: {
            speedometerEl: null,
            speed: {
                bar12El: null,
                bar6El: null,
                arrowEl: null,
                valueEl: null,
            },
            fuel: {
                progressEl: null,
                bar12El: null,
                bar6El: null,
                arrowEl: null,
                valueEl: null,
                textEl: null,
                wrapperEl: null,
            },
            wash: {
                progressEl: null,
                valueEl: null,
                wrapperEl: null,
            },
            tachometer: {
                bar12El: null,
                bar6El: null,
                arrowEl: null,
                wrapper1vEl: null,
                gear1vEl: null,
                wrapper2vEl: null,
                gear2vEl: null,
                rpm2vEl: null,
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

                if (prop === "left") {
                    document.querySelectorAll(".turn__left").forEach((leftTurn) => {
                        leftTurn.classList.toggle("ONEAS-speedometer-turn--active", +value);
                    });
                }
                if (prop === "right") {
                    document.querySelectorAll(".turn__right").forEach((rightTurn) => {
                        rightTurn.classList.toggle("ONEAS-speedometer-turn--active", +value);
                    });
                }

                const paramIndices = {

                    rem: [4, 6],
                    doors: [5, 7],
                    temperature: [1, 3],
                    lights: [0, 2],
                };

                if (prop in paramIndices) {
                    const indices = paramIndices[prop];
                    indices.forEach((index) => {
                        this.data.paramsEls[index].classList.toggle("ONEAS-speedometer-param--active", +value);
                    });

                }

                if (prop === "tachometer-show") {
                    const display = +value >= 1 ? "" : "none";

                    this.data.tachometer.wrapper1vEl.style.display = display;
                    this.data.tachometer.wrapper2vEl.style.display = display;
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
            document.querySelector(".ONEAS-hud__bottom-right").classList.add("ONEAS-hud-br2");

        },
        hide() {
            this.data.speedometerEl.style.display = "none";
            document.querySelector(".ONEAS-hud__bottom-right").classList.remove("ONEAS-hud-br2");
        },
        setGear(value) {
            this.data.tachometer.gear1vEl.textContent = value; 
            this.data.tachometer.gear2vEl.textContent = value;
        },
        setTachometer(rpm, maxRpm) {

            if (window.__hassleTemplate.interface("Hud").speedometer.tachometer.show) {
                if (rpm / maxRpm < 0.5) {
                    this.data.tachometer.arrowEl.src = `oneas-img/speed/arrow-danger.svg`;
                    this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-speedometer-danger", true);
                    this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-tachometer-glow", false);
                    this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-speedometer-danger", true);
                    this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-tachometer-glow", false);
                } else {
                    this.data.tachometer.arrowEl.src = `oneas-img/speed/arrow-glow.svg`;
                    this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-speedometer-danger", false);
                    this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-tachometer-glow", true);
                    this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-speedometer-danger", true);
                    this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-tachometer-glow", false);
                }
            }

            this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-speedometer-danger", false);
            this.data.tachometer.wrapper1vEl.classList.toggle("ONEAS-tachometer-glow", false);
            this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-speedometer-danger", false);
            this.data.tachometer.wrapper2vEl.classList.toggle("ONEAS-tachometer-glow", false);

            if (rpm > maxRpm) rpm = maxRpm;

            this.data.tachometer.rpm2vEl.textContent = rpm;

            const multiplier12 =
                this.barsValues.tachometer.dashArray12 - (rpm / maxRpm) * this.barsValues.tachometer.dashArray12;
            this.data.tachometer.bar12El.setAttribute('stroke-dashoffset', multiplier12);

            const multiplier6 =
                this.barsValues.tachometer.dashArray6 - (rpm / maxRpm) * this.barsValues.tachometer.dashArray6;
            this.data.tachometer.bar6El.setAttribute('stroke-dashoffset', multiplier6);

            this.data.tachometer.arrowEl.style.transform = `rotate(${(rpm / maxRpm) * (371 - 227) + 227}deg)`;
        },
        setMileage(km) {
            this.data.mileageEl[0].textContent = km;
            this.data.mileageEl[1].textContent = km;
        },
        setSpeed(speed) {
            const maxSpeed = 320;
            this.data.speed.valueEl[0].textContent = speed;
            this.data.speed.valueEl[1].textContent = speed;

            if (speed > maxSpeed) speed = maxSpeed;

            const multiplier12 =
                this.barsValues.speed.dashArray12 - (speed / maxSpeed) * this.barsValues.speed.dashArray12;
            this.data.speed.bar12El.setAttribute('stroke-dashoffset', multiplier12);

            const multiplier6 =
                this.barsValues.speed.dashArray6 - (speed / maxSpeed) * this.barsValues.speed.dashArray6;
            this.data.speed.bar6El.setAttribute('stroke-dashoffset', multiplier6);

            const deg = (speed / maxSpeed) * 241;

            this.data.speed.arrowEl.style.transform = `rotate(${deg - 135}deg)`;
        },
        setWash(floatWash) {

            this.data.wash.wrapperEl.forEach((elws) => {
                 
                elws.classList.remove("ONEAS-speedometer-warning", "ONEAS-speedometer-danger");

                if (floatWash >= 0.75) {
                    elws.classList.add("ONEAS-speedometer-danger");
                } else if (floatWash >= 0.5) {
                    elws.classList.add("ONEAS-speedometer-warning");
                }
            });

            this.data.wash.valueEl[0].textContent = Math.floor(floatWash * 100);
            this.data.wash.valueEl[1].textContent = Math.floor(floatWash * 100);
            this.data.wash.progressEl.style.width = `${Math.floor(floatWash * 100)}%`;
        },
        setFuel(fuel) {
            const maxFuel = window.__hassleTemplate.interface("Hud").speedometer.maxFuel;

            const dashOffset = (100 * fuel) / maxFuel;

            if (fuel > maxFuel) fuel = maxFuel;

            if (dashOffset <= 25) {
                 
                this.data.fuel.arrowEl.src = `oneas-img/speed/arrow-danger.svg`;
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-danger", true);
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-warning", false);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-danger", true);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-warning", false);
            } else if (dashOffset <= 50) {
                 
                this.data.fuel.arrowEl.src = `oneas-img/speed/arrow-warning.svg`;
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-danger", false);
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-warning", true);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-danger", false);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-warning", true);
            } else {
                 
                this.data.fuel.arrowEl.src = `oneas-img/speed/arrow.svg`;
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-warning", false);
                this.data.fuel.wrapperEl[0].classList.toggle("ONEAS-speedometer-danger", false);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-warning", false);
                this.data.fuel.wrapperEl[1].classList.toggle("ONEAS-speedometer-danger", false);
            }

            this.data.fuel.valueEl[0].textContent = fuel;
            this.data.fuel.valueEl[1].textContent = fuel;
            this.data.fuel.progressEl.style.width = `${dashOffset}%`;

            const multiplier12 = this.barsValues.fuel.dashArray12 - (fuel / maxFuel) * this.barsValues.fuel.dashArray12;
            this.data.fuel.bar12El.setAttribute('stroke-dashoffset', multiplier12);

            const multiplier6 = this.barsValues.fuel.dashArray6 - (fuel / maxFuel) * this.barsValues.fuel.dashArray6;
            this.data.fuel.bar6El.setAttribute('stroke-dashoffset', multiplier6);

            this.data.fuel.arrowEl.style.transform = `rotate(${(fuel / maxFuel) * (407 - 285) + 285}deg)`;

            if (window.__hassleTemplate.interface("Hud").speedometer.isElectro)
                (this.data.fuel.textEl[0].textContent = "%"), (this.data.fuel.textEl[1].textContent = "%");
            else (this.data.fuel.textEl[0].textContent = "L"), (this.data.fuel.textEl[1].textContent = "L");
        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.bar12El = speedometerEl.querySelector(".ONEAS-speedometer__bar-value-12 path");
            this.data.speed.bar6El = speedometerEl.querySelector(".ONEAS-speedometer__bar-value-6 path");
            this.data.speed.arrowEl = speedometerEl.querySelector(".ONEAS-speedometer__arrow");
            this.data.speed.valueEl = speedometerEl.querySelectorAll(".ONEAS-speed__value");

            this.data.fuel.progressEl = speedometerEl.querySelector(".ONEAS-speedometer__fuel .ONEAS-progress__value");
            this.data.fuel.bar12El = speedometerEl.querySelector(".ONEAS-fuel__bar-value-12 path");
            this.data.fuel.bar6El = speedometerEl.querySelector(".ONEAS-fuel__bar-value-6 path");
            this.data.fuel.arrowEl = speedometerEl.querySelector(".ONEAS-fuel__arrow");
            this.data.fuel.valueEl = speedometerEl.querySelectorAll(".ONEAS-fuel__value");
            this.data.fuel.textEl = speedometerEl.querySelectorAll(".ONEAS-fuel__text");
            this.data.fuel.wrapperEl = speedometerEl.querySelectorAll(".ONEAS-speedometer__fuel");

            this.data.wash.progressEl = speedometerEl.querySelector(".ONEAS-speedometer__wash .ONEAS-progress__value");
            this.data.wash.valueEl = speedometerEl.querySelectorAll(".ONEAS-wash__value");
            this.data.wash.wrapperEl = speedometerEl.querySelectorAll(".ONEAS-speedometer__wash");

            this.data.mileageEl = speedometerEl.querySelectorAll(".ONEAS-mileage__value");

            this.data.paramsEls = document.querySelectorAll(
                ".ONEAS-speedometer__params-row-1 svg, .ONEAS-speedometer__params-row-2 svg"
            );

            this.data.tachometer.bar12El = speedometerEl.querySelector(".ONEAS-tachometer__bar-value-12 path");
            this.data.tachometer.bar6El = speedometerEl.querySelector(".ONEAS-tachometer__bar-value-6 path");
            this.data.tachometer.arrowEl = speedometerEl.querySelector(".ONEAS-tachometer__arrow");
            this.data.tachometer.wrapper1vEl = speedometerEl.querySelector(".ONEAS-speedometer_v1 .ONEAS-speedometer__tachometer");
            this.data.tachometer.gear1vEl = speedometerEl.querySelector(".ONEAS-speedometer_v1 #ONEAS-tachometer-gear .ONEAS-tachometer-value");
            
            this.data.tachometer.wrapper2vEl = speedometerEl.querySelector(".ONEAS-speedometer_v2 .ONEAS-speedometer__tachometer");
            this.data.tachometer.gear2vEl = speedometerEl.querySelector(".ONEAS-speedometer_v2 #ONEAS-tachometer-gear .ONEAS-tachometer-value");
            this.data.tachometer.rpm2vEl = speedometerEl.querySelector(".ONEAS-speedometer_v2 #ONEAS-tachometer-rpm .ONEAS-tachometer-value");

            this.data.turnsEls = document.querySelectorAll(".turn__left, .turn__right");

        },
        init() {
            const text = `
                <div class="ONEAS-speedometer_v1">
                <div>                
                    <div class="ONEAS-speedometer__tachometer">  
                        <img class="ONEAS-tachometer__arrow" src="oneas-img/speed/arrow.svg" alt="" srcset="">     
                        <div class="ONEAS-tachometer__bars">
                            <svg class="ONEAS-tachometer__bar-value-12" width="127" height="127" viewBox="0 0 127 127" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-dasharray="${this.barsValues.tachometer.dashArray12}" stroke-dashoffset="${this.barsValues.tachometer.dashArray12}" d="M21.5569 102.613C13.2971 93.7551 8.05345 82.5101 6.57748 70.4892C5.1015 58.4684 7.46897 46.2888 13.3406 35.6962C19.2122 25.1035 28.2864 16.6416 39.2628 11.5233C50.2392 6.40487 62.5543 4.89277 74.4429 7.20368" stroke="white" stroke-opacity="0.3" stroke-width="12.3"/>
                            </svg>
                            <svg class="ONEAS-tachometer__bar-value-6" width="127" height="127" viewBox="0 0 127 127" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-dasharray="${this.barsValues.tachometer.dashArray6}" stroke-dashoffset="${this.barsValues.tachometer.dashArray6}" d="M19.2531 104.761C10.5397 95.4169 5.008 83.5542 3.45096 70.8731C1.89391 58.192 4.39141 45.3435 10.5855 34.169C16.7796 22.9946 26.3523 14.0679 37.9316 8.66838C49.5109 3.26886 62.5023 1.67371 75.0439 4.11155" stroke="white" stroke-width="6"/>
                            </svg>
                        </div>
                        <div class="ONEAS-tachometer__data">
                            <div id="ONEAS-tachometer-gear">
                                <div class="ONEAS-tachometer-value">2</div>
                            </div>
                        </div>         
                    </div>
                </div>
                <div class="ONEAS-speedometer__center"> 
                    <img class="ONEAS-speedometer__arrow" src="oneas-img/speed/arrow.svg" alt="" srcset="">                 
                    <div class="ONEAS-speedometer__bars">
                        <svg class="ONEAS-speedometer__bar-value-12" width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-dasharray="${this.barsValues.speed.dashArray12}" stroke-dashoffset="${this.barsValues.speed.dashArray12}" d="M41.6879 198.312C27.8718 184.496 17.9567 167.27 12.949 148.384C7.9414 129.498 8.01945 109.623 13.1753 90.7761C18.3311 71.9296 28.3811 54.7825 42.3054 41.0753C56.2296 27.3681 73.5324 17.5886 92.4576 12.7294C111.383 7.87026 131.257 8.1044 150.062 13.4081C168.867 18.7118 185.935 28.8962 199.532 42.9276C213.13 56.9591 222.773 74.3382 227.484 93.3009C232.194 112.264 231.804 132.135 226.353 150.898" stroke="white" stroke-opacity="0.3" stroke-width="18.5"/>
                        </svg>
                        <svg class="ONEAS-speedometer__bar-value-6" width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-dasharray="${this.barsValues.speed.dashArray6}" stroke-dashoffset="${this.barsValues.speed.dashArray6}" d="M37.2685 202.731C22.6726 188.136 12.198 169.938 6.90779 149.986C1.61755 130.034 1.7 109.037 7.14678 89.1269C12.5936 69.2168 23.2108 51.1021 37.9208 36.6213C52.6309 22.1405 70.9101 11.8091 90.9033 6.67577C110.896 1.5424 131.892 1.78975 151.759 7.39273C171.625 12.9957 189.656 23.7549 204.021 38.5782C218.386 53.4015 228.573 71.7613 233.549 91.7942C238.525 111.827 238.113 132.82 232.354 152.642" stroke="white" stroke-width="6"/>
                        </svg>
                    </div>
                    <div class="ONEAS-speedometer__data">
                        <div class="ONEAS-speedometer__turns">
                            <div class="turn__left icon__speed-params">
                                <svg class="turn__images" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.1727 17.5263C12.0157 17.683 11.8029 17.7711 11.581 17.7711C11.3591 17.7711 11.1463 17.683 10.9893 17.5263L6.24486 12.7818C6.08807 12.6248 6 12.412 6 12.1901C6 11.9682 6.08807 11.7554 6.24486 11.5985L10.9893 6.85397C11.148 6.7059 11.358 6.62523 11.575 6.62898C11.792 6.63273 11.9991 6.7206 12.1526 6.87407C12.306 7.02754 12.3939 7.23462 12.3977 7.45163C12.4014 7.66863 12.3207 7.87862 12.1727 8.0373L8.85711 11.3529H17.1627C17.3848 11.3529 17.5978 11.4411 17.7548 11.5981C17.9118 11.7551 18 11.9681 18 12.1901C18 12.4122 17.9118 12.6251 17.7548 12.7821C17.5978 12.9392 17.3848 13.0274 17.1627 13.0274H8.85711L12.1727 16.3429C12.3295 16.4999 12.4175 16.7127 12.4175 16.9346C12.4175 17.1565 12.3295 17.3693 12.1727 17.5263Z" fill="black"/>
                                </svg>

                            </div>
                            <div class="turn__right icon__speed-params">
                                <svg class="turn__images" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8273 6.87364C11.9843 6.71685 12.1971 6.62878 12.419 6.62878C12.6409 6.62878 12.8537 6.71685 13.0107 6.87364L17.7551 11.6181C17.9119 11.7751 18 11.9879 18 12.2098C18 12.4317 17.9119 12.6445 17.7551 12.8014L13.0107 17.5459C12.852 17.694 12.642 17.7747 12.425 17.7709C12.208 17.7672 12.0009 17.6793 11.8474 17.5258C11.694 17.3724 11.6061 17.1653 11.6023 16.9483C11.5986 16.7313 11.6793 16.5213 11.8273 16.3626L15.1429 13.047L6.83726 13.047C6.61521 13.047 6.40225 12.9588 6.24523 12.8018C6.08821 12.6448 6 12.4318 6 12.2098C6 11.9877 6.08821 11.7748 6.24523 11.6178C6.40225 11.4607 6.61521 11.3725 6.83726 11.3725L15.1429 11.3725L11.8273 8.05697C11.6705 7.89999 11.5825 7.68718 11.5825 7.46531C11.5825 7.24343 11.6705 7.03063 11.8273 6.87364Z" fill="black"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ONEAS-speedometer__params">
                            <div class="ONEAS-speedometer__params-row-1">            
                                <svg class="icon__lights icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.37012 6.54277H8.65583M4.37012 9.28563H8.14155M4.37012 12.0285H8.14155M4.37012 14.9428H8.14155M4.37012 17.8571H8.65583M19.6273 12.0285C19.4969 7.59711 14.9178 5.80817 12.3054 5.39624C12.0624 5.35793 11.8212 5.46395 11.686 5.66942C9.07158 9.64256 9.98769 15.9831 11.6822 18.7142C11.8168 18.9311 12.0698 19.035 12.3203 18.9862C15.0442 18.4564 19.7576 16.4611 19.6273 12.0285Z" stroke="black" stroke-width="1.37143" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>                
                                <svg class="icon__key icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.71973 10.6571V13.2285M1.71973 16.6571V13.2285M1.71973 13.2285H4.46258M4.46258 13.2285V16.3142C4.46258 16.6929 4.76959 16.9999 5.1483 16.9999H6.31833C6.44982 16.9999 6.57853 17.0377 6.68914 17.1088L8.75032 18.4339C8.86092 18.505 8.98964 18.5428 9.12112 18.5428H17.834C18.2127 18.5428 18.5197 18.2358 18.5197 17.8571V17.5999C18.5197 17.2685 18.7884 16.9999 19.1197 16.9999V16.9999C19.4511 16.9999 19.7197 17.2685 19.7197 17.5999V17.8571C19.7197 18.2358 20.0267 18.5428 20.4054 18.5428H21.0305C21.2796 18.5428 21.5118 18.4098 21.6088 18.1805C22.3032 16.5391 22.6589 13.1164 21.6727 10.3874C21.551 10.0507 21.1744 9.89433 20.8379 10.0167L19.5483 10.4856M4.46258 13.2285V10.8285C4.46258 10.4498 4.76959 10.1428 5.1483 10.1428H6.3483C6.56413 10.1428 6.76737 10.0412 6.89687 9.86848L7.52809 9.02685C7.64958 8.86487 7.83645 8.76486 8.03863 8.75362L10.8054 8.59991M19.5483 10.4856V12.0285M19.5483 10.4856L15.5783 10.6327C15.2104 10.6463 14.8974 10.367 14.8692 10L14.7992 9.08977C14.7708 8.72104 14.4552 8.44123 14.0857 8.45729L10.8054 8.59991M10.8054 8.59991V5.94032M10.8054 5.94032L14.2287 5.85706L7.71973 6.02848L10.8054 5.94032Z" stroke="#FF0000" stroke-width="1.37" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="ONEAS-speedometer__params-row-2">
                                <svg class="icon__rem icon__speed-params" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.1142 5.07317C15.5006 4.92347 14.8782 5.31342 14.7428 5.93032C14.5993 6.58423 15.1033 7.25758 15.7713 7.30175C16.3872 7.34247 16.9163 6.88794 16.9713 6.27318C17.0227 5.69957 16.6737 5.20967 16.1142 5.07317Z" fill="#FF0000"/>
                                    <path d="M16.1749 10.6796C16.3302 10.3303 16.1698 9.92139 15.8184 9.7708L15.7025 9.72112C15.4356 9.60671 15.1255 9.67288 14.9285 9.88628L13.4968 11.4373C13.3158 11.6334 13.265 11.9168 13.3666 12.1635L14.4 14.6732L16.1749 10.6796Z" fill="#FF0000"/>
                                    <path d="M16.1142 5.07317C15.5006 4.92347 14.8782 5.31342 14.7428 5.93032C14.5993 6.58423 15.1033 7.25758 15.7713 7.30175C16.3872 7.34247 16.9163 6.88794 16.9713 6.27318C17.0227 5.69957 16.6737 5.20967 16.1142 5.07317Z" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16.1749 10.6796C16.3302 10.3303 16.1698 9.92139 15.8184 9.7708L15.7025 9.72112C15.4356 9.60671 15.1255 9.67288 14.9285 9.88628L13.4968 11.4373C13.3158 11.6334 13.265 11.9168 13.3666 12.1635L14.4 14.6732L16.1749 10.6796Z" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M13.8858 18.7874L11.4858 12.7874M18.0001 8.84457L20.0573 7.47314" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7.25659 13.3678L3.99119 18.0327C3.95974 18.0776 3.94287 18.1311 3.94287 18.186C3.94287 18.4398 4.26353 18.5507 4.42037 18.3511L7.41612 14.5384C7.59498 14.3107 7.89752 14.2199 8.17216 14.3115L10.2857 15.016L9.88976 13.9601C9.81514 13.7611 9.65249 13.608 9.44937 13.5455L8.02001 13.1057C7.73561 13.0182 7.42723 13.1241 7.25659 13.3678Z" fill="#FF0000" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <svg class="icon__doors icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.68534 10.6895C9.77092 10.7323 9.82497 10.8198 9.82497 10.9155V12.8012C9.82497 12.9235 9.79229 13.0435 9.7303 13.1489L8.49956 15.2411C8.29219 15.5937 7.8243 15.6874 7.4971 15.442L6.73926 14.8736L9.35963 10.7793C9.42927 10.6705 9.56979 10.6318 9.68534 10.6895V10.6895Z" fill="#FF0000"/>
                                    <path d="M12.0535 17.1022C12.0535 17.1022 12.8731 17.2591 13.425 17.2736C14.042 17.2899 14.9678 17.1022 14.9678 17.1022C15.025 16.6451 14.4795 15.7308 13.7678 15.7308H13.0821C12.3964 15.7308 11.8821 16.7594 12.0535 17.1022Z" fill="black"/>
                                    <path d="M11.8821 9.2165C12.3964 8.75936 13.7678 8.11936 15.1393 9.2165L14.2821 10.5879C13.9393 10.4736 13.1164 10.3136 12.5678 10.5879L11.8821 9.2165Z" fill="#FF0000"/>
                                    <path d="M10.1678 9.55936V7.20185C10.1678 6.53057 10.4953 5.90152 11.0453 5.51657L11.3509 5.30265C11.6967 5.06061 12.1085 4.93079 12.5306 4.93079H14.3194C14.7414 4.93079 15.1533 5.06061 15.4991 5.30265L15.9591 5.62467C16.4208 5.94784 16.7298 6.44457 16.804 7.0032C16.9723 8.2693 17.2557 10.6522 17.2607 12.3714C17.2668 14.4709 16.8634 17.5306 16.7267 18.5058C16.6989 18.7044 16.5861 18.8805 16.4039 18.9642C15.3339 19.455 12.9363 19.8555 10.5524 18.8242C10.3141 18.7211 10.1678 18.481 10.1678 18.2213V16.2451M13.7678 15.7308C14.4795 15.7308 15.025 16.6451 14.9678 17.1022C14.9678 17.1022 14.042 17.2899 13.425 17.2736C12.8731 17.2591 12.0535 17.1022 12.0535 17.1022C11.8821 16.7594 12.3964 15.7308 13.0821 15.7308M13.7678 15.7308C13.2535 15.7308 13.5964 15.7308 13.0821 15.7308M13.7678 15.7308H13.0821M6.73926 14.8736L7.4971 15.442C7.8243 15.6874 8.29219 15.5937 8.49956 15.2411L9.7303 13.1489C9.79229 13.0435 9.82497 12.9235 9.82497 12.8012V10.9155C9.82497 10.8198 9.77092 10.7323 9.68534 10.6895V10.6895C9.56979 10.6318 9.42927 10.6705 9.35963 10.7793L6.73926 14.8736ZM11.8821 9.2165C12.3964 8.75936 13.7678 8.11936 15.1393 9.2165L14.2821 10.5879C13.9393 10.4736 13.1164 10.3136 12.5678 10.5879L11.8821 9.2165Z" stroke="#FF0000" stroke-width="1.02857" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <div class="ONEAS-speedometer__speed">                        
                            <span class="ONEAS-speed__value">236</span>
                        </div>
                        <div class="ONEAS-speedometer__mileage">
                            <span class="ONEAS-mileage__value">000000</span>
                        </div>
                    </div>
                </div>
                <div>                
                    <div class="ONEAS-speedometer__percent ONEAS-speedometer__fuel">
                    <img class="ONEAS-fuel__arrow" src="oneas-img/speed/arrow.svg" alt="" srcset="">                 
                    <div class="ONEAS-fuel__bars">
                        <svg class="ONEAS-fuel__bar-value-12" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-dasharray="${this.barsValues.fuel.dashArray12}" stroke-dashoffset="${this.barsValues.fuel.dashArray12}" d="M7.81103 46.016C10.3154 36.6695 15.2838 28.1671 22.1972 21.397C29.1106 14.627 37.7152 9.8377 47.112 7.52961C56.5089 5.22152 66.3532 5.4793 75.6164 8.27603C84.8796 11.0728 93.2218 16.3058 99.7713 23.4284" stroke="white" stroke-opacity="0.3" stroke-width="11.94"/>
                        </svg>
                        <svg class="ONEAS-fuel__bar-value-6" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-dasharray="${this.barsValues.fuel.dashArray6}" stroke-dashoffset="${this.barsValues.fuel.dashArray6}" d="M4.94223 45.2473C7.58428 35.3871 12.8258 26.4173 20.1192 19.275C27.4126 12.1328 36.4902 7.08031 46.4036 4.64534C56.317 2.21038 66.7024 2.48233 76.4748 5.43279C86.2472 8.38325 95.0479 13.9039 101.958 21.4181" stroke="white" stroke-width="6"/>
                        </svg>
                    </div>  
                    <div class="ONEAS-percent__data">
                        <div class="ONEAS-percent__fuel">
                            <svg class="fuel__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5 5.23804H11.1539V10.9524H11.4102C12.2599 10.9524 12.9487 11.5919 12.9487 12.3809C12.9487 12.6439 13.1783 12.8571 13.4615 12.8571C13.7448 12.8571 13.9744 12.6439 13.9744 12.3809V8.29246L12.0733 6.52717L12.7985 5.85374L15 7.89797V12.3809C15 13.1699 14.3112 13.8095 13.4615 13.8095C12.6119 13.8095 11.9231 13.1699 11.9231 12.3809C11.9231 12.1179 11.6935 11.9048 11.4102 11.9048H11.1539V14.7618H5V5.23804ZM6.02564 6.19042H10.1282V9.04756H6.02564V6.19042Z" fill="white"/>
                            </svg>
                            <div class="ONEAS-fuel__data">
                                <div class="ONEAS-fuel__value">58</div>
                                <div class="ONEAS-fuel__text">л</div>
                            </div>
                        </div>
                        <div class="ONEAS-speedometer__wash">
                            <svg class="wash__icon" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="white"/>
                                <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="white"/>
                                <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="white"/>
                                <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="white"/>
                                <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="white"/>
                                <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="white"/>
                                <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="white"/>
                                <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="white"/>
                                <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="white"/>
                                <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="white"/>
                                <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="white"/>
                                <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="white"/>
                                <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="white"/>
                                <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="white"/>
                                <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="white"/>
                                <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="white"/>
                                <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="white"/>
                                <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="white"/>
                                <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="white"/>
                                <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="white"/>
                                <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="white"/>
                                <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="white"/>
                                <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="white"/>
                                <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="white"/>
                                <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="white"/>
                                <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="white"/>
                                <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="white"/>
                                <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="white"/>
                            </svg>
                            <div class="ONEAS-wash__data">
                                <div class="ONEAS-wash__value">27</div>
                                <div class="ONEAS-wash__text">%</div>
                            </div>
                        </div>
                    </div>        
                    </div>
                </div>
            </div>    
            <div class="ONEAS-speedometer_v2">
                <div style="display: none;" class="ONEAS-speedometer__tachometer">
                    <div id="ONEAS-tachometer-gear">
                        <div class="ONEAS-tachometer-text">Передача:</div>
                        <div class="ONEAS-tachometer-value">D2</div>
                    </div>
                    <div id="ONEAS-tachometer-rpm">
                        <div class="ONEAS-tachometer-text">Обороты:</div>
                        <div class="ONEAS-tachometer-value">4 000</div>
                    </div>                
                </div>
                <div class="ONEAS-speedometer__center">
                    <div class="ONEAS-speedometer__base">                    
                        <div class="ONEAS-speedometer__speed">                        
                            <span class="ONEAS-speed__value">236</span>
                            <span class="ONEAS-speed__text">km/h</span>
                        </div>
                        <div class="ONEAS-speedometer__data">
                            <div>                        
                                <div class="ONEAS-speedometer__turns">
                                    <div class="turn__left icon__speed-params">
                                        <svg class="turn__images" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.1727 17.5263C12.0157 17.683 11.8029 17.7711 11.581 17.7711C11.3591 17.7711 11.1463 17.683 10.9893 17.5263L6.24486 12.7818C6.08807 12.6248 6 12.412 6 12.1901C6 11.9682 6.08807 11.7554 6.24486 11.5985L10.9893 6.85397C11.148 6.7059 11.358 6.62523 11.575 6.62898C11.792 6.63273 11.9991 6.7206 12.1526 6.87407C12.306 7.02754 12.3939 7.23462 12.3977 7.45163C12.4014 7.66863 12.3207 7.87862 12.1727 8.0373L8.85711 11.3529H17.1627C17.3848 11.3529 17.5978 11.4411 17.7548 11.5981C17.9118 11.7551 18 11.9681 18 12.1901C18 12.4122 17.9118 12.6251 17.7548 12.7821C17.5978 12.9392 17.3848 13.0274 17.1627 13.0274H8.85711L12.1727 16.3429C12.3295 16.4999 12.4175 16.7127 12.4175 16.9346C12.4175 17.1565 12.3295 17.3693 12.1727 17.5263Z" fill="black"/>
                                        </svg>
            
                                    </div>
                                    <div class="turn__right icon__speed-params">
                                        <svg class="turn__images" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.8273 6.87364C11.9843 6.71685 12.1971 6.62878 12.419 6.62878C12.6409 6.62878 12.8537 6.71685 13.0107 6.87364L17.7551 11.6181C17.9119 11.7751 18 11.9879 18 12.2098C18 12.4317 17.9119 12.6445 17.7551 12.8014L13.0107 17.5459C12.852 17.694 12.642 17.7747 12.425 17.7709C12.208 17.7672 12.0009 17.6793 11.8474 17.5258C11.694 17.3724 11.6061 17.1653 11.6023 16.9483C11.5986 16.7313 11.6793 16.5213 11.8273 16.3626L15.1429 13.047L6.83726 13.047C6.61521 13.047 6.40225 12.9588 6.24523 12.8018C6.08821 12.6448 6 12.4318 6 12.2098C6 11.9877 6.08821 11.7748 6.24523 11.6178C6.40225 11.4607 6.61521 11.3725 6.83726 11.3725L15.1429 11.3725L11.8273 8.05697C11.6705 7.89999 11.5825 7.68718 11.5825 7.46531C11.5825 7.24343 11.6705 7.03063 11.8273 6.87364Z" fill="black"/>
                                        </svg>
                                    </div>
                                </div>                            
                                <div class="ONEAS-speedometer__params">
                                    <div class="ONEAS-speedometer__params-row-1">            
                                        <svg class="icon__lights icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4.37012 6.54277H8.65583M4.37012 9.28563H8.14155M4.37012 12.0285H8.14155M4.37012 14.9428H8.14155M4.37012 17.8571H8.65583M19.6273 12.0285C19.4969 7.59711 14.9178 5.80817 12.3054 5.39624C12.0624 5.35793 11.8212 5.46395 11.686 5.66942C9.07158 9.64256 9.98769 15.9831 11.6822 18.7142C11.8168 18.9311 12.0698 19.035 12.3203 18.9862C15.0442 18.4564 19.7576 16.4611 19.6273 12.0285Z" stroke="black" stroke-width="1.37143" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>                
                                        <svg class="icon__key icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.71973 10.6571V13.2285M1.71973 16.6571V13.2285M1.71973 13.2285H4.46258M4.46258 13.2285V16.3142C4.46258 16.6929 4.76959 16.9999 5.1483 16.9999H6.31833C6.44982 16.9999 6.57853 17.0377 6.68914 17.1088L8.75032 18.4339C8.86092 18.505 8.98964 18.5428 9.12112 18.5428H17.834C18.2127 18.5428 18.5197 18.2358 18.5197 17.8571V17.5999C18.5197 17.2685 18.7884 16.9999 19.1197 16.9999V16.9999C19.4511 16.9999 19.7197 17.2685 19.7197 17.5999V17.8571C19.7197 18.2358 20.0267 18.5428 20.4054 18.5428H21.0305C21.2796 18.5428 21.5118 18.4098 21.6088 18.1805C22.3032 16.5391 22.6589 13.1164 21.6727 10.3874C21.551 10.0507 21.1744 9.89433 20.8379 10.0167L19.5483 10.4856M4.46258 13.2285V10.8285C4.46258 10.4498 4.76959 10.1428 5.1483 10.1428H6.3483C6.56413 10.1428 6.76737 10.0412 6.89687 9.86848L7.52809 9.02685C7.64958 8.86487 7.83645 8.76486 8.03863 8.75362L10.8054 8.59991M19.5483 10.4856V12.0285M19.5483 10.4856L15.5783 10.6327C15.2104 10.6463 14.8974 10.367 14.8692 10L14.7992 9.08977C14.7708 8.72104 14.4552 8.44123 14.0857 8.45729L10.8054 8.59991M10.8054 8.59991V5.94032M10.8054 5.94032L14.2287 5.85706L7.71973 6.02848L10.8054 5.94032Z" stroke="#FF0000" stroke-width="1.37" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div class="ONEAS-speedometer__params-row-2">
                                        <svg class="icon__rem icon__speed-params" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16.1142 5.07317C15.5006 4.92347 14.8782 5.31342 14.7428 5.93032C14.5993 6.58423 15.1033 7.25758 15.7713 7.30175C16.3872 7.34247 16.9163 6.88794 16.9713 6.27318C17.0227 5.69957 16.6737 5.20967 16.1142 5.07317Z" fill="#FF0000"/>
                                            <path d="M16.1749 10.6796C16.3302 10.3303 16.1698 9.92139 15.8184 9.7708L15.7025 9.72112C15.4356 9.60671 15.1255 9.67288 14.9285 9.88628L13.4968 11.4373C13.3158 11.6334 13.265 11.9168 13.3666 12.1635L14.4 14.6732L16.1749 10.6796Z" fill="#FF0000"/>
                                            <path d="M16.1142 5.07317C15.5006 4.92347 14.8782 5.31342 14.7428 5.93032C14.5993 6.58423 15.1033 7.25758 15.7713 7.30175C16.3872 7.34247 16.9163 6.88794 16.9713 6.27318C17.0227 5.69957 16.6737 5.20967 16.1142 5.07317Z" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M16.1749 10.6796C16.3302 10.3303 16.1698 9.92139 15.8184 9.7708L15.7025 9.72112C15.4356 9.60671 15.1255 9.67288 14.9285 9.88628L13.4968 11.4373C13.3158 11.6334 13.265 11.9168 13.3666 12.1635L14.4 14.6732L16.1749 10.6796Z" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M13.8858 18.7874L11.4858 12.7874M18.0001 8.84457L20.0573 7.47314" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M7.25659 13.3678L3.99119 18.0327C3.95974 18.0776 3.94287 18.1311 3.94287 18.186C3.94287 18.4398 4.26353 18.5507 4.42037 18.3511L7.41612 14.5384C7.59498 14.3107 7.89752 14.2199 8.17216 14.3115L10.2857 15.016L9.88976 13.9601C9.81514 13.7611 9.65249 13.608 9.44937 13.5455L8.02001 13.1057C7.73561 13.0182 7.42723 13.1241 7.25659 13.3678Z" fill="#FF0000" stroke="#FF0000" stroke-width="1.71429" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <svg class="icon__doors icon__speed-params" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.68534 10.6895C9.77092 10.7323 9.82497 10.8198 9.82497 10.9155V12.8012C9.82497 12.9235 9.79229 13.0435 9.7303 13.1489L8.49956 15.2411C8.29219 15.5937 7.8243 15.6874 7.4971 15.442L6.73926 14.8736L9.35963 10.7793C9.42927 10.6705 9.56979 10.6318 9.68534 10.6895V10.6895Z" fill="#FF0000"/>
                                            <path d="M12.0535 17.1022C12.0535 17.1022 12.8731 17.2591 13.425 17.2736C14.042 17.2899 14.9678 17.1022 14.9678 17.1022C15.025 16.6451 14.4795 15.7308 13.7678 15.7308H13.0821C12.3964 15.7308 11.8821 16.7594 12.0535 17.1022Z" fill="#FF0000"/>
                                            <path d="M11.8821 9.2165C12.3964 8.75936 13.7678 8.11936 15.1393 9.2165L14.2821 10.5879C13.9393 10.4736 13.1164 10.3136 12.5678 10.5879L11.8821 9.2165Z" fill="#FF0000"/>
                                            <path d="M10.1678 9.55936V7.20185C10.1678 6.53057 10.4953 5.90152 11.0453 5.51657L11.3509 5.30265C11.6967 5.06061 12.1085 4.93079 12.5306 4.93079H14.3194C14.7414 4.93079 15.1533 5.06061 15.4991 5.30265L15.9591 5.62467C16.4208 5.94784 16.7298 6.44457 16.804 7.0032C16.9723 8.2693 17.2557 10.6522 17.2607 12.3714C17.2668 14.4709 16.8634 17.5306 16.7267 18.5058C16.6989 18.7044 16.5861 18.8805 16.4039 18.9642C15.3339 19.455 12.9363 19.8555 10.5524 18.8242C10.3141 18.7211 10.1678 18.481 10.1678 18.2213V16.2451M13.7678 15.7308C14.4795 15.7308 15.025 16.6451 14.9678 17.1022C14.9678 17.1022 14.042 17.2899 13.425 17.2736C12.8731 17.2591 12.0535 17.1022 12.0535 17.1022C11.8821 16.7594 12.3964 15.7308 13.0821 15.7308M13.7678 15.7308C13.2535 15.7308 13.5964 15.7308 13.0821 15.7308M13.7678 15.7308H13.0821M6.73926 14.8736L7.4971 15.442C7.8243 15.6874 8.29219 15.5937 8.49956 15.2411L9.7303 13.1489C9.79229 13.0435 9.82497 12.9235 9.82497 12.8012V10.9155C9.82497 10.8198 9.77092 10.7323 9.68534 10.6895V10.6895C9.56979 10.6318 9.42927 10.6705 9.35963 10.7793L6.73926 14.8736ZM11.8821 9.2165C12.3964 8.75936 13.7678 8.11936 15.1393 9.2165L14.2821 10.5879C13.9393 10.4736 13.1164 10.3136 12.5678 10.5879L11.8821 9.2165Z" stroke="#FF0000" stroke-width="1.02857" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>                          
                            </div>
                            <div class="ONEAS-speedometer__mileage">
                                <span class="ONEAS-mileage__value">000000</span>
                                <span class="ONEAS-mileage__text">km</span>
                            </div>
                        </div>
                    </div>      
                    <div class="ONEAS-speedometer__percent ONEAS-params">                    
                        <div class="ONEAS-speedometer__fuel ONEAS-param">  
                            <div class="ONEAS-param-info">  
                                <svg class="fuel__icon ONEAS-param__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5 5.23804H11.1539V10.9524H11.4102C12.2599 10.9524 12.9487 11.5919 12.9487 12.3809C12.9487 12.6439 13.1783 12.8571 13.4615 12.8571C13.7448 12.8571 13.9744 12.6439 13.9744 12.3809V8.29246L12.0733 6.52717L12.7985 5.85374L15 7.89797V12.3809C15 13.1699 14.3112 13.8095 13.4615 13.8095C12.6119 13.8095 11.9231 13.1699 11.9231 12.3809C11.9231 12.1179 11.6935 11.9048 11.4102 11.9048H11.1539V14.7618H5V5.23804ZM6.02564 6.19042H10.1282V9.04756H6.02564V6.19042Z" fill="#2F2F2F"/>
                                </svg>
                                <div class="ONEAS-fuel__data">
                                    <div class="ONEAS-fuel__value">58</div>
                                    <div class="ONEAS-fuel__text">L</div>
                                </div>
                            </div>                    
                            <div class="ONEAS-param__progress">
                                <div class="ONEAS-progress__value"></div>
                            </div>                    
                        </div>
                        <div class="ONEAS-speedometer__wash ONEAS-param"> 
                            <div class="ONEAS-param-info">  
                                <svg class="wash__icon ONEAS-param__icon" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="#2F2F2F"/>
                                    <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="#2F2F2F"/>
                                    <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="#2F2F2F"/>
                                    <path d="M15.935 8.94598C15.7095 8.89236 15.4513 8.91641 15.2113 9.01802C14.9695 9.11968 14.7694 9.28601 14.6476 9.48928C14.5167 9.70553 14.4895 9.94764 14.5731 10.1527C14.6567 10.3579 14.844 10.5094 15.0877 10.5686C15.1658 10.5889 15.2477 10.5981 15.3313 10.5981C15.4895 10.5981 15.655 10.5649 15.8131 10.4983C16.3387 10.2766 16.6187 9.77758 16.4514 9.36362C16.3678 9.15851 16.1786 9.00696 15.935 8.94598Z" fill="#2F2F2F"/>
                                    <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="#2F2F2F"/>
                                    <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="#2F2F2F"/>
                                    <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="#2F2F2F"/>
                                    <path d="M10.7707 14.3478C10.5434 14.2924 10.287 14.3182 10.0452 14.4199C9.80335 14.5215 9.60518 14.6878 9.48333 14.8893C9.3506 15.1073 9.32335 15.3494 9.40696 15.5546C9.52336 15.8392 9.81792 16 10.1634 16C10.3179 16 10.4834 15.9685 10.647 15.8983C11.1743 15.6784 11.4544 15.1794 11.2853 14.7636C11.2016 14.5585 11.0144 14.4069 10.7707 14.3478Z" fill="#2F2F2F"/>
                                    <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="#2F2F2F"/>
                                    <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="#2F2F2F"/>
                                    <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="#2F2F2F"/>
                                    <path d="M5.85463 6.75954C6.00191 6.75954 6.14192 6.72258 6.2692 6.64865C6.75469 6.36405 6.85106 5.60634 6.48376 4.96137C6.11646 4.31454 5.42188 4.0207 4.93821 4.3053C4.65092 4.47347 4.5 4.80613 4.5 5.18314C4.5 5.44556 4.57273 5.73016 4.72365 5.99443C4.89639 6.29752 5.1455 6.53407 5.42551 6.66159C5.56916 6.72627 5.71462 6.75954 5.85463 6.75954Z" fill="#2F2F2F"/>
                                    <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="#2F2F2F"/>
                                    <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="#2F2F2F"/>
                                    <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="#2F2F2F"/>
                                    <path d="M13.8474 13.9876C13.7382 14.1797 13.7346 14.4237 13.8364 14.6566C13.931 14.8728 14.1074 15.0649 14.3346 15.198C14.5347 15.3163 14.7456 15.3736 14.942 15.3736C15.2274 15.3736 15.4765 15.2516 15.6075 15.0206C15.8293 14.6325 15.6147 14.1003 15.122 13.812C14.6274 13.5218 14.0692 13.5994 13.8474 13.9876Z" fill="#2F2F2F"/>
                                    <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="#2F2F2F"/>
                                    <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="#2F2F2F"/>
                                    <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="#2F2F2F"/>
                                    <path d="M14.3317 5.21287C14.1571 5.0798 13.9189 5.04839 13.6789 5.12601C13.4571 5.19808 13.2498 5.35517 13.0952 5.5677C12.9407 5.78207 12.8534 6.02972 12.8516 6.26627C12.8498 6.5213 12.9498 6.74307 13.1261 6.87428C13.2389 6.95929 13.3771 7.0018 13.5244 7.0018C13.6062 7.0018 13.6916 6.98886 13.7789 6.96114C14.0008 6.88907 14.208 6.73198 14.3626 6.51761C14.5171 6.30508 14.6044 6.05744 14.6062 5.82088C14.608 5.56585 14.5081 5.34408 14.3317 5.21287Z" fill="#2F2F2F"/>
                                    <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="#2F2F2F"/>
                                    <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="#2F2F2F"/>
                                    <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="#2F2F2F"/>
                                    <path d="M5.91638 10.1121L6.45823 10.4171C6.6237 10.5095 6.78734 10.6111 6.82371 10.7497C6.86008 10.8957 6.75643 11.0657 6.64552 11.2431C6.62188 11.2819 6.59824 11.3189 6.57642 11.3558C6.13094 12.1117 6.23458 13.1318 6.81643 13.7288C7.14009 14.0596 7.58739 14.2259 8.02924 14.2259C8.43654 14.2259 8.8402 14.0836 9.13295 13.7935C9.30931 13.6197 9.44204 13.4072 9.57117 13.2039C9.7621 12.8972 9.9439 12.6089 10.233 12.5109C10.5549 12.4037 10.9185 12.5737 11.1658 12.7345C11.2658 12.801 11.364 12.8713 11.4604 12.9415C11.6786 13.1023 11.9059 13.2686 12.1713 13.3721C12.7732 13.6124 13.6496 13.531 14.0896 12.9119C14.2624 12.668 14.186 12.2669 14.0551 12.0858C13.9333 11.9158 13.746 11.7809 13.5678 11.6497C13.3896 11.5222 13.2059 11.3891 13.1241 11.245C12.9441 10.9308 12.7714 10.5667 12.8568 10.2396C12.8877 10.1213 12.9532 10.0086 13.0223 9.8885L13.0441 9.85152C13.0877 9.7739 13.1768 9.66856 13.2696 9.55953C13.4659 9.33037 13.6678 9.0938 13.6951 8.85543C13.7423 8.47289 13.615 8.1051 13.366 7.89627C13.0914 7.66526 12.755 7.65417 12.4295 7.64308C12.2295 7.63569 12.0386 7.63015 11.8731 7.57286C11.8131 7.55253 11.8004 7.53774 11.7986 7.53405C11.7949 7.53035 11.7895 7.51557 11.784 7.46197C11.7676 7.27901 11.8058 7.08867 11.8877 6.92418C11.9113 6.87798 11.9368 6.82993 11.9622 6.78189C12.104 6.51946 12.2641 6.22192 12.1768 5.93547C12.1277 5.77284 12.0077 5.64162 11.8186 5.54553C11.6458 5.45497 11.3349 5.29419 11.0058 5.29419C10.7712 5.29419 10.5258 5.3755 10.313 5.6213C10.1021 5.86524 9.98208 6.21083 9.96755 6.6248L9.96571 6.69503C9.96211 6.83917 9.95847 6.97408 9.89662 7.05909C9.793 7.20324 9.5257 7.18846 9.32024 7.14965C9.1093 7.11084 8.9002 7.05909 8.6911 6.99626C8.602 6.96854 8.49109 6.93527 8.36926 6.9556C8.28198 6.97039 8.19652 7.01105 8.11652 7.07757C7.84377 7.30304 7.75831 7.71701 7.92378 8.02009C7.9856 8.13282 8.07288 8.21784 8.14925 8.29362L8.18743 8.33424C8.33108 8.48026 8.49654 8.7002 8.46563 8.91826C8.44745 9.04949 8.36017 9.13631 8.29108 9.18624C8.13834 9.29527 7.91832 9.33774 7.7274 9.29712C7.43829 9.23429 7.18373 9.05133 6.91644 8.85911C6.85462 8.81291 6.7928 8.76856 6.72916 8.7242C6.51642 8.57634 6.25822 8.42296 5.96002 8.39711C5.60545 8.36754 5.27452 8.54866 5.15451 8.8388C5.04723 9.0938 5.11269 9.42093 5.31816 9.66856C5.48726 9.87371 5.71455 10.0012 5.91638 10.1121Z" fill="#2F2F2F"/>
                                    <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="#2F2F2F"/>
                                    <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="#2F2F2F"/>
                                    <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="#2F2F2F"/>
                                    <path d="M8.75673 6.02042C8.82948 6.02042 8.90221 6.00748 8.97309 5.98161C9.17859 5.90769 9.33678 5.72473 9.40766 5.48078C9.47315 5.25347 9.46042 4.99105 9.37312 4.74156C9.28586 4.49022 9.13128 4.27954 8.94039 4.14648C8.73309 4.00233 8.49671 3.96167 8.28942 4.03744C8.08396 4.11136 7.92577 4.29432 7.85485 4.53827C7.78939 4.76558 7.80212 5.02801 7.8894 5.2775C8.04759 5.73028 8.40216 6.02042 8.75673 6.02042Z" fill="#2F2F2F"/>
                                </svg>
                                <div class="ONEAS-wash__data">
                                    <div class="ONEAS-wash__value">27</div>
                                    <div class="ONEAS-wash__text">%</div>
                                </div>
                            </div>                    
                            <div class="ONEAS-param__progress">
                                <div class="ONEAS-progress__value"></div>
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

            window.__hassleTemplate.interface("Hud").speedometer.tachometer.show = 0;
            window.__hassleTemplate.interface("Hud").speedometer.show = 0;
        },
    },
    speedChanger: {
        data: {
            defaultSpeed: "speedometer-2",
            speed: "",
            prevSpeed: "",
        },

        loadConfig() {
            const speed = jsLoader.localStorage.getItem("hud-speed");

            if (speed === null) {
                this.data.speed = this.data.defaultSpeed;
                this.saveConfig(this.data.defaultSpeed);
                return;
            }

            this.data.speed = speed;
        },

        saveConfig(speed) {
            jsLoader.localStorage.setItem("hud-speed", speed);
        },

        applyHudSpeed(speed) {
            document.body.classList.add(speed);
        },

        removeHudSpeed(speed) {
            document.body.classList.remove(speed);
        },

        changeHudSpeed(speed) {
            if (this.data.prevSpeed) this.removeHudSpeed(this.data.prevSpeed);

            this.applyHudSpeed(speed);

            this.data.prevSpeed = speed;

            if (speed === this.data.speed) return;

            this.data.speed = speed;
            this.saveConfig(speed);
        },

        addMenuOption() {
            jsLoader.mainMenu.addNewOption(3, "Вариант спидометра", {
                data: [
                    {
                        id: "speedometer-1",
                        value: "Навороченый",
                    },
                    {
                        id: "speedometer-2",
                        value: "Минималистичный",
                    },
                ],
                selectedId: this.data.speed,
                callback: ({ id }) => {
                    this.changeHudSpeed(id);
                },
            });
        },

        init() {
            this.loadConfig();

            this.changeHudSpeed(this.data.speed);

            this.addMenuOption();
        },
    },
    paramsTheme: {
        data: {
            isDarkTheme: false,
        },
        _addInMenu() {
            jsLoader.mainMenu.addNewOption(1, "Тёмная тема", {
                initialVar: () => this.data.isDarkTheme,
                callback: () => {
                    this.setThemeStatus(!this.data.isDarkTheme);
                },
            });
        },
        _saveData() {
            jsLoader.localStorage.setItem("ONEAS-HUD-theme", +this.data.isDarkTheme);

            jsLoader.log.makeLog("ONEAS", `[savedata theme] Saved data, theme -> ${this.data.isDarkTheme}`);
        },
        _loadData() {
            if (jsLoader.localStorage.getItem("ONEAS-HUD-theme") == null) {
                jsLoader.log.makeLog(
                    "ONEAS",
                    `[loaddata theme] First time load data, theme -> ${this.data.isDarkTheme}`
                );

                this.data.isDarkTheme = false;

                this._saveData();
                return;
            }

            this.data.isDarkTheme = +jsLoader.localStorage.getItem("ONEAS-HUD-theme");

            jsLoader.log.makeLog("ONEAS", `[loaddata theme] Data loaded, theme -> ${this.data.isDarkTheme}`);
        },
        getThemeStatus() {
            return +this.data.isDarkTheme;
        },
        setThemeStatus(newStatus) {
            this.data.isDarkTheme = +newStatus;

            this._saveData();

            document.body.classList.toggle("theme-dark", this.getThemeStatus());
        },
        init() {
            this._loadData();
            this._addInMenu();

            document.body.classList.toggle("theme-dark", this.getThemeStatus());
        },
    },
    init(jslInjected) {
        jsLoader = jslInjected;

        this.hud.init();
        this.speedometer.init();
        this.paramsTheme.init();
        this.speedChanger.init();

        jsLoader.showAddedScript(`HUD ${nameMod} v${vol}`, "info");
    },
};

return oneasHud;
})()