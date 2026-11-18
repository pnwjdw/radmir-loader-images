(function(){
const vol = "2.1.1",
    lvl = "Maximum",
    nameMod = "NFS Most Wanted";

;

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
                min: 300,
                max: 400,
            },  
            koefLoad: 80,  
        },
    }
];

const oneasHud = {

    wantedAlwaysShowClass: ".ONEAS-hud__wanted--always-show",
    hud: {
        barsValues: {
            hp: {
                dashArray: 355,
                dashOffset: 355,
            },
            armour: {
                dashArray: 376,
                dashOffset: 376,
            },
            hunger: {
                dashArray: 355,
                dashOffset: 355,
            },
            freeze: {
                dashArray: 354,
                dashOffset: 354,
            },
        },
        data: {
            hudEl: null,
            hud_topEl: null,
            hud_bottomEl: null,
            moneyEl: null,
            hpEl: {
                value: null,
                barEl: null,
            },
            armourEl: {
                wrapper: null,
                value: null,
                barEl: null,
            },
            hungerEl: {
                value: null,
                barEl: null,
            },
            breathEl: {
                wrapper: null,
                value: null,
            },
            freezeEl: {
                wrapper: null,
                value: null,
                barEl: null,
            },
            wanted: {
                wrapper: null,
                els: [],
            },
            weaponEl: {
                wrapper: null,
                ammoEl: null,
                icon: null,
            },
            server: {
                wrapper: null,
                value: null,
                image: null,
            },
            bonusEl: null,
            greenZoneEl: null,
        },
        createHud(hudEl) {
            this.data.hudEl = hudEl;
            this.data.hud_topEl = hudEl.querySelector(".ONEAS-hud__top");
            this.data.hud_bottomEl = hudEl.querySelector(".ONEAS-hud__bottom");
            this.data.moneyEl = hudEl.querySelector("#ONEAS-cash__value");
            [this.data.hpEl.barEl, this.data.hpEl.value] = [hudEl.querySelector(".ONEAS-bar__health path"), hudEl.querySelector(".ONEAS-param__health .ONEAS-param__amount")];
            [this.data.armourEl.wrapper, this.data.armourEl.barEl, this.data.armourEl.value] = [hudEl.querySelector(".ONEAS-param__armour"), hudEl.querySelector(".ONEAS-bar__armour path"), hudEl.querySelector(".ONEAS-param__armour .ONEAS-param__amount")];
            [this.data.hungerEl.barEl, this.data.hungerEl.value] = [hudEl.querySelector(".ONEAS-bar__hunger path"), hudEl.querySelector(".ONEAS-param__hunger .ONEAS-param__amount")];
            [this.data.breathEl.wrapper, this.data.breathEl.value] = [hudEl.querySelector(".ONEAS-param__breath"), hudEl.querySelector(".ONEAS-param__breath .ONEAS-param__amount")];
            [this.data.wanted.wrapper, this.data.wanted.els] = [hudEl.querySelector(".ONEAS-wanted__row"), hudEl.querySelector(".ONEAS-wanted__row").children];
            this.data.weaponEl.ammoEl = hudEl.querySelector(".ONEAS-weapon__ammo").children;
            this.data.weaponEl.wrapper = hudEl.querySelector(".ONEAS-weapon__ammo");
            this.data.server.wrapper = hudEl.querySelector(".ONEAS-hud__logo");
            this.data.server.value = hudEl.querySelector("#ONEAS-logo__title-2");
             
            this.data.bonusEl = hudEl.querySelector(".ONEAS-logo__bonus");
            this.data.greenZoneEl = hudEl.querySelector(".ONEAS-hud__green-zone");
            this.data.weaponEl.icon = hudEl.querySelector(".ONEAS-weapon__icon");
            [this.data.freezeEl.wrapper, 
                this.data.freezeEl.value, 
                this.data.freezeEl.barEl] = [
                    hudEl.querySelector(".ONEAS-param__freeze"), 
                    hudEl.querySelector(".ONEAS-param__freeze .ONEAS-param__amount"), 
                    hudEl.querySelector(".ONEAS-bar__freeze path")];

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

                if ((value == 0) | (value == 10) | (value == 11) | (value == 12) | (value == 13) | (value == 14)) 
                (document.querySelector(".ONEAS-hud__weapon").style.width = "0vh"), 

                (document.querySelector(".ONEAS-hud__weapon").style.opacity = "0"), 
                (document.querySelector(".ONEAS-weapon__icon-bg").style.opacity = "0");
                else (document.querySelector(".ONEAS-hud__weapon").style.width = "16.1111vh"), 

                (document.querySelector(".ONEAS-hud__weapon").style.opacity = "1"), 
                (document.querySelector(".ONEAS-weapon__icon-bg").style.opacity = "1");
            }

            if (prop === "weapon" && value >= 16) {
                this.data.weaponEl.ammoEl[0].style.display = "";
                this.data.weaponEl.ammoEl[1].style.display = "";
                this.data.weaponEl.wrapper.style.display = "";
                document.querySelector(".ONEAS-weapon__icon").style.width = "9.2593vh";
                document.querySelector(".ONEAS-weapon__icon").style.height = "9.2593vh";
                document.querySelector(".ONEAS-weapon__icon-bg").style.transform = "none";
                document.querySelector(".ONEAS-weapon__icon-bg").style.top = "1.1111vh";
            }

            if (prop === "weapon" && value < 16) {
                this.data.weaponEl.ammoEl[0].style.display = "none";
                this.data.weaponEl.ammoEl[1].style.display = "none";
                this.data.weaponEl.wrapper.style.display = "none";
                document.querySelector(".ONEAS-weapon__icon").style.width = "11.1111vh";
                document.querySelector(".ONEAS-weapon__icon").style.height = "11.1111vh";
                document.querySelector(".ONEAS-weapon__icon-bg").style.transform = "scale(1.2)";
                document.querySelector(".ONEAS-weapon__icon-bg").style.top = "2.2222vh";
            }

            if (prop == "showGreenZoneTab") {
                this.data.greenZoneEl.style.display = "";
            }

            if (prop == "hideGreenZoneTab") {
                this.data.greenZoneEl.style.display = "none";
            }

            if (prop == "health") {
                const maxValue = 100;
                if (value > maxValue) value = maxValue;

                const multiplier = this.barsValues.hp.dashArray - (value / maxValue) * this.barsValues.hp.dashArray;

                this.data.hpEl.barEl.setAttribute('stroke-dashoffset', multiplier);

                this.data.hpEl.value.textContent = value;
            }

            if (prop == "armour") {
                if (value > 0) this.data.armourEl.wrapper.style.opacity = "1";
                else this.data.armourEl.wrapper.style.opacity = "0";

                const maxValue = 100;
                if (value > maxValue) value = maxValue;

                const multiplier = this.barsValues.armour.dashArray - (value / maxValue) * this.barsValues.armour.dashArray;

                this.data.armourEl.barEl.setAttribute('stroke-dashoffset', multiplier);

                this.data.armourEl.value.textContent = value;
            }

            if (prop == "hunger") {
                const maxValue = 100;
                if (value > maxValue) value = maxValue;

                const multiplier = this.barsValues.hunger.dashArray - (value / maxValue) * this.barsValues.hunger.dashArray;

                this.data.hungerEl.barEl.setAttribute('stroke-dashoffset', multiplier);

                this.data.hungerEl.value.textContent = value;
            }

            if (prop == "breath") {
                if (value < 100) this.data.breathEl.wrapper.style.display = "";
                else this.data.breathEl.wrapper.style.display = "none";

                this.data.breathEl.value.textContent = value;
            }

            if (prop == "money") {
                if (value > 9999999999) value = 9999999999;

                this.data.moneyEl.innerHTML = window.formatNumberWithCommas(value);
            }

            if (prop == "wanted") {
                if (value === 0 && oneasHud.wantedAlwaysShowClass.length === 0) {
                    this.data.wanted.wrapper.style.display = "none";
                    return;
                }

                this.data.wanted.wrapper.style.display = "";

                for (let i = 0; i < 6; i += 1) {
                    if ((5 - i) / value >= 1 || (5 - i == 0 && value == 0)) {
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted_star.svg";
                        this.data.wanted.els[i].className = "ONEAS-wanted__inactive";
                    } else {
                        this.data.wanted.els[i].src = "oneas-img/hud/wanted_star.svg";
                        this.data.wanted.els[i].className = "ONEAS-wanted__active";
                    }
                }

                if (value == 0) document.querySelector(".ONEAS-wanted__text-none").style.opacity = "1";
                else document.querySelector(".ONEAS-wanted__text-none").style.opacity = "0";
            }

            if (prop == "ammoInClip") {
                this.data.weaponEl.ammoEl[0].textContent = value;
            }

            if (prop == "totalAmmo") {
                this.data.weaponEl.ammoEl[1].textContent = value;
            }

            if (prop == "setServer") {
                const numLength = 2;
                const num = value;
                const zero = "0".repeat(numLength - num.toString().length);

                this.data.server.value.textContent = `${zero}${num}`;

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
                const maxValue = 100;
                if (value > maxValue) value = maxValue;

                const multiplier = this.barsValues.freeze.dashArray - (value / maxValue) * this.barsValues.freeze.dashArray;

                this.data.freezeEl.barEl.setAttribute('stroke-dashoffset', multiplier);

                this.data.freezeEl.value.textContent = value;
            }
        },
        init() {
            const hudHtml = `
               <div class="ONEAS-hud__bottom">
               <div style="display: none" class="ONEAS-param__breath ONEAS-param">
                  <svg style="width: 1.6667vh; height: 1.7593vh;" class="ONEAS-param__icon" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.91596 11.8319C9.18326 11.8319 11.8319 9.18326 11.8319 5.91596C11.8319 2.64867 9.18326 0 5.91596 0C2.64867 0 0 2.64867 0 5.91596C0 9.18326 2.64867 11.8319 5.91596 11.8319ZM4.19199 4.63441C4.87268 4.63441 5.42448 4.08261 5.42448 3.40192C5.42448 2.72123 4.87268 2.16943 4.19199 2.16943C3.5113 2.16943 2.9595 2.72123 2.9595 3.40192C2.9595 4.08261 3.5113 4.63441 4.19199 4.63441Z" fill="white"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.84366 18.9805C5.4228 18.9805 6.70295 17.7004 6.70295 16.1212C6.70295 14.5421 5.4228 13.262 3.84366 13.262C2.26452 13.262 0.984375 14.5421 0.984375 16.1212C0.984375 17.7004 2.26452 18.9805 3.84366 18.9805ZM3.05899 15.9812C3.38798 15.9812 3.65468 15.7145 3.65468 15.3856C3.65468 15.0566 3.38798 14.7899 3.05899 14.7899C2.73001 14.7899 2.46331 15.0566 2.46331 15.3856C2.46331 15.7145 2.73001 15.9812 3.05899 15.9812Z" fill="white"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5599 7.69182C12.7275 7.09624 12.8171 6.46802 12.8171 5.81888C12.8171 5.75603 12.8162 5.69337 12.8146 5.63092C12.9129 5.6244 13.0122 5.62109 13.1122 5.62109C15.5626 5.62109 17.5491 7.60759 17.5491 10.0581C17.5491 12.5085 15.5626 14.495 13.1122 14.495C11.3368 14.495 9.80499 13.4523 9.0957 11.9459C10.1106 11.418 10.9777 10.6454 11.619 9.70624C11.8451 9.98131 12.1879 10.1567 12.5717 10.1567C13.2524 10.1567 13.8042 9.60494 13.8042 8.92426C13.8042 8.24357 13.2524 7.69176 12.5717 7.69176C12.5678 7.69176 12.5639 7.69178 12.5599 7.69182Z" fill="white"></path>
                  </svg>
                  <span class="ONEAS-param__amount">100</span>
                </div>
               <div class="ONEAS-hud__params">
                    <div class="ONEAS-param__health ONEAS-param">
                         <div class="ONEAS-param-health__data ONEAS-param__data">
                              <svg style="width: 1.7593vh; height: 1.7593vh;" class="ONEAS-param__icon" width="19" height="19" viewBox="0 0 19 19" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path
                                        d="M17.5004 4.00037C14.7004 0.000374317 11.0004 2.00037 9.50042 3.50037C8.00042 2.00037 4.3 0.000374317 1.5 4.00037C-2 9.00037 7.00042 16 9.50042 17C12.0004 16 21.0004 9.00037 17.5004 4.00037Z"
                                        fill="white" />
                              </svg>
                              <span class="ONEAS-param__amount">0</span>
                         </div>
                         <div class="ONEAS-param-bars">
                              <svg style="width: 1.3889vh; height: 1.2963vh;" class="ONEAS-param-bar__icon" width="15" height="14" viewBox="0 0 15 14" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path d="M14.4734 0.965083L7.6868 13.8846L0.111124 3.55275L14.4734 0.965083Z" fill="white" />
                              </svg>
                                <svg style="width: 21.2037vh; height: 21.2037vh;" class="ONEAS-bar__health ONEAS-param--bars" width="229" height="197" viewBox="0 0 229 197" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-dasharray="${this.barsValues.hp.dashArray}" stroke-dashoffset="${this.barsValues.hp.dashArray}" d="M4.20935 44.6096C25.5616 22.2513 54.3432 8.45738 85.1543 5.8158C115.965 3.17422 146.689 11.8665 171.56 30.2618C196.431 48.6572 213.741 75.4914 220.242 105.73C226.744 135.969 221.989 167.534 206.871 194.503" stroke="#E23232" stroke-width="10"/>
                                </svg>
                                <svg style="width: 21.2037vh; height: 21.2037vh;" class="ONEAS-bar-bg__health ONEAS-param--bars__bg" width="229" height="197" viewBox="0 0 229 197" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.20935 44.6096C25.5616 22.2513 54.3432 8.45738 85.1543 5.8158C115.965 3.17422 146.689 11.8665 171.56 30.2618C196.431 48.6572 213.741 75.4914 220.242 105.73C226.744 135.969 221.989 167.534 206.871 194.503" stroke="white" stroke-opacity="0.3" stroke-width="10"/>
                                </svg>  
                         </div>
                    </div>
                    <div class="ONEAS-param__armour ONEAS-param">
                         <div class="ONEAS-param-armour__data ONEAS-param__data">
                              <svg style="width: 1.7593vh; height: 1.7593vh;" class="ONEAS-param__icon" width="19" height="19" viewBox="0 0 19 19" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path
                                        d="M16.9954 3.7931C14.4585 4.04138 11.2297 1.00001 9.49995 1C7.77025 0.999987 4.54154 4.04138 2.00463 3.7931C1.90853 7.31034 3.27298 15.2759 9.49995 19C15.7269 15.2759 17.0915 7.31034 16.9954 3.7931Z"
                                        fill="white" />
                              </svg>
                              <span class="ONEAS-param__amount">0</span>
                         </div>
                         <div class="ONEAS-param-bars">
                              <svg style="width: 1.3889vh; height: 1.2037vh;" class="ONEAS-param-bar__icon" width="15" height="13" viewBox="0 0 15 13" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path d="M14.5903 0.0869112L7.43945 12.8084L0.160306 2.26559L14.5903 0.0869112Z" fill="white" />
                              </svg>
                              <svg style="width: 22.5926vh; height: 22.5926vh;" class="ONEAS-bar__armour ONEAS-param--bars" width="244" height="216" viewBox="0 0 244 216" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-dasharray="${this.barsValues.armour.dashArray}" stroke-dashoffset="${this.barsValues.armour.dashArray}" d="M3.32309 35.7584C29.2282 15.5904 61.1846 4.75485 94.0239 5.00421C126.863 5.25357 158.665 16.5733 184.286 37.1325C209.907 57.6918 227.849 86.2883 235.21 118.297C242.57 150.306 238.92 183.855 224.848 213.519" stroke="#00ABC2" stroke-width="10"/>
                                </svg>
                                <svg style="width: 22.5926vh; height: 22.5926vh;" class="ONEAS-bar-bg__armour ONEAS-param--bars__bg" width="244" height="216" viewBox="0 0 244 216" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3.32309 35.7584C29.2282 15.5904 61.1846 4.75485 94.0239 5.00421C126.863 5.25357 158.665 16.5733 184.286 37.1325C209.907 57.6918 227.849 86.2883 235.21 118.297C242.57 150.306 238.92 183.855 224.848 213.519" stroke="white" stroke-opacity="0.3" stroke-width="10"/>
                                </svg>
                         </div>
                    </div>
                    <div class="ONEAS-param__hunger ONEAS-param">
                         <div class="ONEAS-param-hunger__data ONEAS-param__data">
                              <svg style="width: 1.7593vh; height: 1.7593vh;" class="ONEAS-param__icon" width="19" height="19" viewBox="0 0 19 19" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1322_65)">
                                        <path
                                             d="M2.6713 11.565C5.74084 14.6345 10.2198 15.1322 12.6754 12.6766C15.131 10.221 14.6334 5.74199 11.5638 2.67247C8.49432 -0.397035 4.01536 -0.894702 1.5597 1.56091C-0.895858 4.01651 -0.398249 8.49552 2.6713 11.565Z"
                                             fill="white" />
                                        <path
                                             d="M15.2655 13.043L16.3164 14.0939C16.9304 13.48 17.9257 13.48 18.5396 14.0939C19.1535 14.7078 19.1535 15.7031 18.5396 16.317C17.9256 16.9309 16.9303 16.9309 16.3164 16.317C16.9303 16.9309 16.9303 17.9263 16.3164 18.5401C15.7025 19.1541 14.7072 19.154 14.0933 18.5401C13.4794 17.9263 13.4794 16.9309 14.0933 16.317L11.5999 13.8237C12.9348 13.7537 14.1941 13.4935 15.2655 13.043Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1322_65">
                                             <rect width="19" height="19" fill="white" transform="matrix(-1 0 0 1 19 0.000976562)" />
                                        </clipPath>
                                   </defs>
                              </svg>
                              <span class="ONEAS-param__amount">0</span>
                         </div>
                         <div class="ONEAS-param-bars">
                              <svg style="width: 1.4815vh; height: 1.2037vh;" class="ONEAS-param-bar__icon" width="16" height="13" viewBox="0 0 16 13" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path d="M0.515012 12.8171L9.0078 0.949308L15.0964 12.2217L0.515012 12.8171Z" fill="white" />
                              </svg>
                              
                                <svg style="width: 21.2037vh; height: 21.2037vh;" class="ONEAS-bar__hunger ONEAS-param--bars" width="229" height="197" viewBox="0 0 229 197" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-dasharray="${this.barsValues.hunger.dashArray}" stroke-dashoffset="${this.barsValues.hunger.dashArray}" d="M224.567 151.444C203.373 173.952 174.69 187.949 143.898 190.807C113.107 193.666 82.323 185.191 57.3228 166.971C32.3226 148.751 14.8238 122.04 8.10956 91.8475C1.39528 61.6553 5.92688 30.0574 20.8542 2.98195" stroke="#FF8E34" stroke-width="10"/>
                                </svg>
                                <svg style="width: 21.2037vh; height: 21.2037vh;" class="ONEAS-bar-bg__hunger ONEAS-param-bars__bg" width="229" height="197" viewBox="0 0 229 197" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M224.567 151.444C203.373 173.952 174.69 187.949 143.898 190.807C113.107 193.666 82.323 185.191 57.3228 166.971C32.3226 148.751 14.8238 122.04 8.10956 91.8475C1.39528 61.6553 5.92688 30.0574 20.8542 2.98195" stroke="white" stroke-opacity="0.3" stroke-width="10"/>
                                </svg>
    
                         </div>
                    </div>

                    <div style="display: none" class="ONEAS-param__freeze ONEAS-param">
                         <div class="ONEAS-param-freeze__data ONEAS-param__data">
                              <svg style="width: 1.7593vh; height: 1.8519vh;" class="ONEAS-param__icon" width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.38448 6.8748V4.83463M9.38448 1.39185V4.83463M9.38448 4.83463L11.5522 2.79446M9.38448 4.83463L7.2168 2.79446" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M9.38448 13.1232V15.1634M9.38448 18.6062V15.1634M9.38448 15.1634L11.5522 17.2036M9.38448 15.1634L7.2168 17.2036" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M11.966 8.74107L13.6791 7.63304M16.5699 5.76324L13.6791 7.63304M13.6791 7.63304L16.5694 8.34513M13.6791 7.63304L14.2149 4.70489" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M11.9058 11.6644L13.6531 12.7176M16.6017 14.4949L13.6531 12.7176M13.6531 12.7176L14.2814 15.6273M13.6531 12.7176L16.5194 11.9143" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M6.36601 8.74107L4.65295 7.63304M1.76217 5.76324L4.65295 7.63304M4.65295 7.63304L1.76262 8.34513M4.65295 7.63304L4.11718 4.70489" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M6.42426 11.6644L4.67697 12.7176M1.72842 14.4949L4.67697 12.7176M4.67697 12.7176L4.04872 15.6273M4.67697 12.7176L1.81064 11.9143" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M11.9355 8.5333L9.38531 7.00317L6.58008 8.5333V11.7211L9.38531 13.2512L11.9355 11.7211V8.5333Z" stroke="white" stroke-width="1.85578" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>                                     
                              <span class="ONEAS-param__amount">0</span>
                         </div>
                         <div class="ONEAS-param-bars">
                              <svg style="width: 1.3889vh; height: 1.2037vh;" class="ONEAS-param-bar__icon" width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.270645 10.4066L10.784 0.285212L14.7164 12.4784L0.270645 10.4066Z" fill="white"/>
                              </svg>                                     
                              
                                <svg style="width: 21.6667vh; height: 21.6667vh;" class="ONEAS-bar__freeze ONEAS-param--bars" width="234" height="203" viewBox="0 0 234 203" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-dasharray="${this.barsValues.freeze.dashArray}" stroke-dashoffset="${this.barsValues.freeze.dashArray}" d="M230.647 173.92C205.09 190.525 174.963 198.692 144.51 197.272C114.056 195.852 84.8085 184.916 60.8854 166.005C36.9624 147.094 19.5686 121.159 11.1531 91.8526C2.73754 62.5461 3.72412 31.3439 13.9739 2.63902" stroke="#97EBFF" stroke-width="10"/>
                                </svg>
                                <svg style="width: 21.6667vh; height: 21.6667vh;" class="ONEAS-bar-bg__freeze ONEAS-param-bars__bg" width="234" height="203" viewBox="0 0 234 203" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M230.647 173.92C205.09 190.525 174.963 198.692 144.51 197.272C114.056 195.852 84.8085 184.916 60.8854 166.005C36.9624 147.094 19.5686 121.159 11.1531 91.8526C2.73754 62.5461 3.72412 31.3439 13.9739 2.63902" stroke="white" stroke-opacity="0.3" stroke-width="10"/>
                                </svg>
                              
                         </div>
                    </div>

               </div>
               <img src="oneas-img/hud/border.png" alt="" class="ONEAS-radar__border">
          </div>
          <div class="ONEAS-hud__top">
               <div class="ONEAS-hud__weapon">
                    <img src="oneas-img/weapon/0.png" alt="" class="ONEAS-weapon__icon">
                    <div class="ONEAS-weapon__icon-bg">
                    </div>
                    <div class="ONEAS-weapon__ammo">
                         <span id="ONEAS-ammo__in-clip">0</span>
                         <span id="ONEAS-ammo__total">0</span>
                    </div>
     
               </div>
               <div class="ONEAS-hud__info">
                    <div class="ONEAS-hud__logo">
                         <div class="ONEAS-logo__text">
                              <div class="ONEAS-logo__title">
                                   <span id="ONEAS-logo__title-1">Сервер</span>
                                   <span id="ONEAS-logo__title-2">-1</span>
                              </div>
                         </div>
                         <div class="ONEAS-logo__bonus"></div>
                    </div>
                    <div class="ONEAS-hud__cash">
                         <span id="ONEAS-cash__text">деньги ></span>
                         <span id="ONEAS-cash__value"></span>
                    </div>
                    <div class="ONEAS-hud__wanted ${oneasHud.wantedAlwaysShowClass}">
                         <span class="ONEAS-wanted__text">Розыск ></span>
                         <span class="ONEAS-wanted__text-none">-</span>
                         <div class="ONEAS-wanted__row">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__inactive">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__inactive">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__inactive">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__active">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__active">
                              <img src="oneas-img/hud/wanted_star.svg" alt="" class="ONEAS-wanted__active">
                         </div>
                    </div>
               </div>
          </div>
          <div class="ONEAS-hud__green-zone">
               <div class="ONEAS-green-zone__text">
                    <span>Безопасная</span>
                    <span>зона</span>
               </div>
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
            wash: {
                dashArray: 347,
                dashOffset: 347,
            },
            damage: {
                dashArray: 347,
                dashOffset: 347,
            },
        },
        data: {
            speedometerEl: null,
            speed: {
                barEl: null,
                valueEl: null,
            },
            fuel: {
                valueEl: null,
                textEl: null,
            },
            wash: {
                barEl: null,
            },
            damage: {
                barEl: null,
            },
            tachometer: {
                wrapper: null,
                 
                gearEl: null,
                barEl: null,
            },
            mileageEl: null,
            paramsEls: [],
        },
        onChangeInfo(prop, value) {
            if (prop === "damage") {
                isNaN(value * 100) ? (value = 0) : value;

                this.setDamage(+value);
            } else if (prop === "wash") {
                isNaN(value * 100) ? (value = 0) : value;

                this.setWash(+value);
            } else if (prop === "show" && +value == 1) {
                this.show();
            } else if (prop === "show" && +value == 0) {
                this.hide();
            } else if (prop === "mileage") {
                this.setMileage(value);
            } else if (prop === "speed") {
                this.setSpeed(value);
            } else if (prop === "fuel") {
                this.setFuel(value);
            }

            else if (prop == "rem") {
                this.data.paramsEls[3].classList.toggle("ONEAS-speedometer-param--active", +value);
            } else if (prop == "doors") {
                this.data.paramsEls[2].classList.toggle("ONEAS-speedometer-param--active", +value);
            } else if (prop == "temperature") {
                this.data.paramsEls[0].classList.toggle("ONEAS-speedometer-param--active", +value);
            } else if (prop == "lights") {
                this.data.paramsEls[1].classList.toggle("ONEAS-speedometer-param--active", +value);
            } else if (prop === "tachometer-show") {
                const display = +value >= 1 ? "" : "none";

                this.data.tachometer.wrapper.style.display = display;

            } else if (prop === "tachometer") {
                this.setGear(value.gear);
                this.setTachometer(value.rpm, value.maxRpm);
            }
        },
        show() {
            this.data.speedometerEl.style.bottom = "4.4vh";
            document.querySelector(".ONEAS-hud__green-zone").style.right = "8vh";
            document.querySelector(".ONEAS-hud__green-zone").style.bottom = "30vh";
        },
        hide() {
            this.data.speedometerEl.style.bottom = "-70vh";
            document.querySelector(".ONEAS-hud__green-zone").style.right = "4vh";
            document.querySelector(".ONEAS-hud__green-zone").style.bottom = "4vh";
        },
        setGear(value) {
            this.data.tachometer.gearEl.textContent = value;
        },
        setTachometer(rpm, maxRpm) {
             
            if (window.__hassleTemplate.interface("Hud").speedometer.tachometer.show && rpm / maxRpm > 0.5) {
                this.data.tachometer.barEl.src = `oneas-img/speed/arrow-glow.svg`;
            } else {
                this.data.tachometer.barEl.src = `oneas-img/speed/arrow.svg`;
            }

            if (rpm > maxRpm) rpm = maxRpm;

            this.data.tachometer.barEl.style.transform = `rotate(${(rpm / maxRpm) * (472 - 248) + 248}deg)`;
        },
        setMileage(km) {
            this.data.mileageEl.textContent = km;
        },
        setSpeed(speed) {
            this.data.speed.valueEl.textContent = speed;

            const maxSpeed = 320;

            if (speed > maxSpeed) speed = maxSpeed;

            const deg = (speed / maxSpeed) * 225;

            this.data.speed.barEl.style.transform = `rotate(${deg - 112}deg)`;
        },
        setDamage(floatDamage) {
            const multiplier = this.barsValues.damage.dashArray + floatDamage * this.barsValues.damage.dashArray;

            this.data.damage.barEl.setAttribute('stroke-dashoffset', multiplier);
        },
        setWash(floatWash) {
            const multiplier = this.barsValues.wash.dashArray + floatWash * this.barsValues.wash.dashArray;

            this.data.wash.barEl.setAttribute('stroke-dashoffset', multiplier);
        },
        setFuel(fuel) {
            this.data.fuel.valueEl.textContent = fuel;

            if (window.__hassleTemplate.interface("Hud").speedometer.isElectro) this.data.fuel.textEl.textContent = "%";
            else this.data.fuel.textEl.textContent = "л";
        },
        create(speedometerEl) {
            this.data.speedometerEl = speedometerEl;

            this.data.speed.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-speed__value");
            this.data.speed.barEl = speedometerEl.querySelector(".ONEAS-speedometer-speed__arrow");

            this.data.fuel.valueEl = speedometerEl.querySelector(".ONEAS-speedometer-fuel__value");
            this.data.fuel.textEl = speedometerEl.querySelector(".ONEAS-speedometer-fuel__text");

            this.data.wash.barEl = speedometerEl.querySelector(".ONEAS-bars__wash path");

            this.data.damage.barEl = speedometerEl.querySelector(".ONEAS-bars__damage path");

            this.data.mileageEl = speedometerEl.querySelector(".ONEAS-speedometer-mileage__value");

            this.data.paramsEls = speedometerEl.querySelector(".ONEAS-speedometer-params").children;

            this.data.tachometer.barEl = speedometerEl.querySelector(".ONEAS-speedometer-tachometer__arrow");
            this.data.tachometer.wrapper = speedometerEl.querySelector(".ONEAS-speedometer__tachometer");
            this.data.tachometer.gearEl = this.data.tachometer.wrapper.querySelector("#ONEAS-tachometer-gear");

        },
        init() {
            const text = `
            <img src="oneas-img/speed/speed_bg.png" alt="" class="ONEAS-speedometer-bg fon1">
            <img src="oneas-img/speed/speed_bg-2.png" alt="" class="ONEAS-speedometer-bg fon2">
               <div class="ONEAS-speedometer__speed">
               <img class="ONEAS-speedometer-speed__arrow" src="oneas-img/speed/arrow.svg" alt="" srcset=""> 
                    <div class="ONEAS-speedometer-speed__data">
                         <span class="ONEAS-speedometer-speed__value">0</span>
                         <span class="ONEAS-speedometer-speed__text">km/h</span>
                    </div>
               </div>
               <div class="ONEAS-speedometer__mileage"><span class="ONEAS-speedometer-mileage__value">000000</span></div>
               <div class="ONEAS-speedometer__params">
                    <div class="ONEAS-speedometer-params">
                         <div class="ONEAS-spedometer-param__key">
                              <svg style="width: 2.5000vh; height: 1.9444vh;" width="27" height="21" viewBox="0 0 27 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1413_51)">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M22.6357 11.0355C24.9317 9.83938 25.7586 6.88441 24.4828 4.43543C23.2069 1.98646 20.3114 0.970716 18.0154 2.16685C16.3913 3.01296 15.502 4.73974 15.5727 6.54463L15.6036 6.55546L16.2967 9.01328L14.8219 6.96272L2.67011 13.2934L1.92609 15.247L5.02645 16.1541L5.54448 14.3016L7.70025 15.0578L8.16216 14.8172L8.57263 13.3505L10.0098 13.8546L10.9336 13.3734L11.3441 11.9066L12.7813 12.4108L13.2432 12.1701L13.8589 9.97011L16.0146 10.7263L17.1748 10.1219C18.6432 11.5467 20.826 11.9783 22.6357 11.0355ZM22.6866 6.62402C23.1968 6.35823 23.3806 5.70157 23.097 5.15735C22.8135 4.61312 22.1701 4.38742 21.6599 4.65321C21.1496 4.91903 20.9659 5.57568 21.2494 6.11991C21.5329 6.66413 22.1764 6.88984 22.6866 6.62402Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1413_51">
                                             <rect width="25" height="10" fill="white"
                                                  transform="translate(0.000976562 11.5518) rotate(-27.5179)" />
                                        </clipPath>
                                   </defs>
                              </svg>
          
                         </div>
                         <div class="ONEAS-spedometer-param__lights">
                              <svg style="width: 1.7593vh; height: 1.1111vh;" width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1413_53)">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M7.6968 0.0569126C6.66913 1.91648 5.23037 6.87532 7.6968 11.8341C8.24997 11.91 8.88437 11.9662 9.56423 11.9889C8.47322 9.89972 7.23802 6.47344 8.14377 3.88235C8.3468 6.09877 9.27801 10.474 11.4273 11.9624C15.0416 11.7328 19.0017 10.3892 19.0017 6.25546C19.0017 0.552797 11.4651 -0.253014 7.6968 0.0569126Z"
                                             fill="white" />
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M0.000976562 11.7032L5.53564 10.1579C5.42645 9.76087 5.33521 9.3667 5.26027 8.97635L0.000976562 10.4449V11.7032ZM0.000976562 9.30324L5.09025 7.88223C5.04048 7.46548 5.0083 7.05471 4.99156 6.65137L0.000976562 8.04487V9.30324ZM0.000976562 6.90328L4.9842 5.51184C4.99665 5.07219 5.02635 4.64398 5.07022 4.22941L0.000976562 5.64487V6.90328ZM0.000976562 4.50328L5.23908 3.04067C5.32345 2.56845 5.42449 2.11995 5.53649 1.69922L0.000976562 3.24487V4.50328Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1413_53">
                                             <rect width="19" height="12" fill="white" transform="translate(0.000976562)" />
                                        </clipPath>
                                   </defs>
                              </svg>
          
                         </div>
                         <div class="ONEAS-spedometer-param__doors">
                              <svg style="width: 1.3889vh; height: 1.8519vh;" width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1413_41)">
                                        <path
                                             d="M5.5202 4.2765C5.89382 1.8 7.61473 0.232528 9.90183 0.633801C12.1711 1.03194 13.5963 2.18832 13.257 4.64187L11.9721 9.31479L9.92725 9.17747L11.0383 5.06131L11.0465 5.00725C11.2218 3.84526 10.848 3.0383 9.57283 2.81456C8.29765 2.59083 7.71769 3.4693 7.54239 4.6313L6.8717 7.37923L12.655 9.31479L14.3623 10.7877L3.77694 7.10535L1.38669 16.3113L0.362305 15.2066L2.75255 6.00064L4.89575 6.71792L5.5202 4.2765Z"
                                             fill="white" />
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M1.38672 16.3113L4.4599 7.8418L14.3623 10.7877L11.9721 19.2572L1.38672 16.3113ZM9.2404 13.3654C9.2404 14.1789 8.62889 14.8383 7.87451 14.8383C7.12018 14.8383 6.50867 14.1789 6.50867 13.3654C6.50867 12.5519 7.12018 11.8925 7.87451 11.8925C8.62889 11.8925 9.2404 12.5519 9.2404 13.3654Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1413_41">
                                             <rect width="14" height="19" fill="white" transform="translate(0.362305 0.571289)" />
                                        </clipPath>
                                   </defs>
                              </svg>
          
                         </div>
                         <div class="ONEAS-spedometer-param__rem">
                              <svg style="width: 2.5000vh; height: 2.6852vh;" width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1413_44)">
                                        <path
                                             d="M13.8056 18.455L13.2356 17.2182L14.4913 17.6391L15.4166 18.8787L17.763 20.1299L15.5681 19.9752L14.5162 18.4607L13.8056 18.455Z"
                                             fill="white" />
                                        <path d="M2.10286 9.95861L5.60355 5.40753L10.2036 8.3755L6.70298 12.9266L2.10286 9.95861Z"
                                             fill="white" />
                                        <path d="M18.6626 20.6427L21.2432 15.498L25.8433 18.4659L22.3426 23.017L18.6626 20.6427Z"
                                             fill="white" />
                                        <path
                                             d="M13.1429 17.0817L16.6437 12.5306L17.4436 13.7277L18.9437 14.0145L21.2437 15.4985L17.7431 20.0496L15.443 18.5656L14.643 17.3686L13.1429 17.0817Z"
                                             fill="white" />
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M10.5536 7.92013L5.65269 14.2917L10.2528 17.2596L15.8539 9.97785L11.2538 7.00989L10.5536 7.92013ZM10.5536 7.92013L14.2337 10.2945L10.0329 15.7558L7.27285 13.975L10.5536 7.92013Z"
                                             fill="white" />
                                        <path d="M5.35884 13.1844L5.44695 14.1435L6.23458 12.7807L2.12579 10.0093L5.35884 13.1844Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1413_44">
                                             <rect width="23" height="18" fill="white"
                                                  transform="translate(10.6133 28.4238) rotate(-114.745)" />
                                        </clipPath>
                                   </defs>
                              </svg>
          
                         </div>
                    </div>
                    <div class="ONEAS-speedometer__fuel">
                         <div class="ONEAS-speedometer-fuel__icon">
                              <svg style="width: 1.9444vh; height: 1.8519vh;" data-v-0c96a3a3="" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                   xmlns="http://www.w3.org/2000/svg" class="">
                                   <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M0 0H12.9231V12.0001H13.4615C15.2458 12.0001 16.6923 13.3432 16.6923 15.0001C16.6923 15.5524 17.1745 16.0001 17.7692 16.0001C18.364 16.0001 18.8462 15.5524 18.8462 15.0001V6.41429L14.8539 2.70718L16.3769 1.29297L21 5.58586V15.0001C21 16.6569 19.5535 18.0001 17.7692 18.0001C15.9849 18.0001 14.5385 16.6569 14.5385 15.0001C14.5385 14.4478 14.0563 14.0001 13.4615 14.0001H12.9231V20H0V0ZM2.15385 2H10.7692V8H2.15385V2Z"
                                        fill="white"></path>
                              </svg>
                         </div>
                         <div class="ONEAS-speedometer-fuel__data">
                              <div class="ONEAS-speedometer-fuel__value">0</div>
                              <div class="ONEAS-speedometer-fuel__text">л</div>
                         </div>
                    </div>
               </div>
               <div class="ONEAS-speedometer__tachometer">
               <img class="ONEAS-speedometer-tachometer__arrow" src="oneas-img/speed/arrow.svg" alt="" srcset="">
                    <div class="ONEAS-tachometer__data">
                         <div id="ONEAS-tachometer-gear">4</div>
                    </div>
               </div>
               <div class="ONEAS-speedometer__bars">
                    <div class="ONEAS-speedometer__damage">
                         <div class="ONEAS-speedometer-damage__icon">
                              <svg style="width: 2.1296vh; height: 2.1296vh;" class="ONEAS-bars__icon" width="23" height="23" viewBox="0 0 23 23" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1332_228)">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M16.1688 2.74368C17.1037 2.62392 17.9587 3.28471 18.0785 4.21962L18.3472 6.31709C18.4047 6.76604 18.6382 7.17376 18.9963 7.45055L20.6694 8.74364C21.4152 9.32003 21.5525 10.3918 20.9761 11.1376L19.683 12.8107C19.4062 13.1689 19.2831 13.6223 19.3406 14.0713L19.6093 16.1687C19.7291 17.1036 19.0682 17.9586 18.1334 18.0784L16.036 18.3471C15.587 18.4046 15.1792 18.6381 14.9024 18.9963L13.6093 20.6693C13.033 21.4152 11.9612 21.5524 11.2154 20.9761L9.54223 19.683C9.18409 19.4062 8.73068 19.2829 8.28171 19.3405L6.18429 19.6093C5.2494 19.729 4.3944 19.0682 4.27463 18.1332L4.0059 16.0359C3.9484 15.5869 3.71489 15.1792 3.35675 14.9024L1.6836 13.6093C0.937824 13.0329 0.800502 11.9611 1.3769 11.2153L2.67002 9.54216C2.9468 9.18403 3.06999 8.73061 3.01248 8.28165L2.74376 6.18422C2.62398 5.24932 3.28478 4.39433 4.21969 4.27455L6.31712 4.00583C6.76608 3.94832 7.1738 3.71481 7.45058 3.35667L8.74369 1.68356C9.32007 0.93778 10.3919 0.800462 11.1377 1.37685L12.8108 2.66995C13.1689 2.94673 13.6223 3.06992 14.0713 3.01241L16.1688 2.74368ZM8.41904 14.7442C10.3895 16.2671 13.2214 15.9043 14.7443 13.9339C16.2672 11.9634 15.9044 9.13154 13.9339 7.60866C11.9635 6.08577 9.13156 6.44858 7.60868 8.41902C6.08579 10.3895 6.44861 13.2213 8.41904 14.7442Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1332_228">
                                             <rect width="19.87" height="19.87" fill="white"
                                                  transform="translate(2.66211) rotate(7.6993)" />
                                        </clipPath>
                                   </defs>
                              </svg>
                         </div>
                         <div class="ONEAS-speedometer-bars">
                              <svg style="width: 1.2037vh; height: 1.3889vh;" class="ONEAS-speedometer-bars__icon" width="13" height="15" viewBox="0 0 13 15" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path d="M1.47377 0.102966L12.2683 9.92384L0.361923 14.6541L1.47377 0.102966Z" fill="white" />
                              </svg>
                              <svg style="width: 23.4259vh;  height: 10.3704vh;" class="ONEAS-bars__damage ONEAS-speedometer--bars" width="253" height="112" viewBox="0 0 253 112"
                                   fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path  stroke-dasharray="${this.barsValues.damage.dashArray}" stroke-dashoffset="${this.barsValues.damage.dashArray}" 
                                        d="M5.3007 110.458C9.38135 81.577 23.6331 55.1 45.4927 35.789C67.3522 16.4781 95.3848 5.60058 124.548 5.11304C153.712 4.6255 182.092 14.5599 204.585 33.1294C227.078 51.6989 242.207 77.6847 247.251 106.413"
                                        stroke="#6FA400" stroke-width="10" />
                              </svg>
                              <svg style="width: 23.4259vh;  height: 10.3704vh;"  class="ONEAS-bars-bg__damage ONEAS-speedometer--bars-bg" width="253" height="112"
                                   viewBox="0 0 253 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path
                                        d="M5.3007 110.458C9.38135 81.577 23.6331 55.1 45.4927 35.789C67.3522 16.4781 95.3848 5.60058 124.548 5.11304C153.712 4.6255 182.092 14.5599 204.585 33.1294C227.078 51.6989 242.207 77.6847 247.251 106.413"
                                        stroke="white" stroke-opacity="0.3" stroke-width="10" />
                              </svg>
                         </div>
                    </div>
                    <div class="ONEAS-speedometer__wash">
                         <div class="ONEAS-speedometer-wash__icon">
                              <svg style="width: 2.0370vh; height: 2.1296vh;" class="ONEAS-bars__icon" width="22" height="23" viewBox="0 0 22 23" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <g clip-path="url(#clip0_1332_226)">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                             d="M12.8287 1.64505C11.2225 0.748817 9.20543 1.15639 8.06416 2.60779L6.03988 5.18214C5.77932 5.51349 5.46543 5.79861 5.11127 6.02564L3.72505 6.91421C2.3482 7.79677 1.69459 9.47237 2.10814 11.0593L2.36386 12.0405C2.55107 12.7588 2.52329 13.5172 2.28402 14.2205L1.87865 15.4119C0.829162 18.4965 3.89508 21.3734 6.88124 20.106L8.78332 19.2988C9.69545 18.9116 10.7401 19.0193 11.5538 19.5842C13.3314 20.8185 15.7811 19.728 16.0725 17.5727L16.2421 16.3177C16.357 15.4681 16.762 14.6848 17.3878 14.102L18.7489 12.8344C19.9246 11.7396 20.2815 10.016 19.6377 8.54269L18.3549 5.60722C18.0256 4.85334 17.4597 4.22904 16.744 3.82966L12.8287 1.64505ZM10.3542 8.57338C11.2433 8.69359 12.0635 8.05584 12.1861 7.14894C12.3087 6.24203 11.6873 5.40939 10.7982 5.28919C9.9091 5.16898 9.08892 5.80674 8.96632 6.71364C8.84371 7.62055 9.4651 8.45318 10.3542 8.57338ZM14.7399 12.5106C14.6786 12.964 14.2685 13.2829 13.8239 13.2228C13.3794 13.1627 13.0688 12.7464 13.1301 12.2929C13.1914 11.8394 13.6014 11.5206 14.0459 11.5807C14.4905 11.6408 14.8012 12.0571 14.7399 12.5106ZM6.82936 16.4574C8.16305 16.6378 9.3933 15.6812 9.57723 14.3207C9.76114 12.9604 8.82905 11.7114 7.49536 11.5311C6.16168 11.3508 4.93143 12.3074 4.74752 13.6678C4.56359 15.0282 5.49568 16.2771 6.82936 16.4574Z"
                                             fill="white" />
                                   </g>
                                   <defs>
                                        <clipPath id="clip0_1332_226">
                                             <rect width="17.87" height="20.2527" fill="white"
                                                  transform="translate(3.30371 0.0957031) rotate(7.6993)" />
                                        </clipPath>
                                   </defs>
                              </svg>
                         </div>
                         <div class="ONEAS-speedometer-bars">
                              <svg style="width: 1.2037vh; height: 1.3889vh;" class="ONEAS-speedometer-bars__icon" width="13" height="15" viewBox="0 0 13 15" fill="none"
                                   xmlns="http://www.w3.org/2000/svg">
                                   <path d="M11.587 14.9832L0.605077 5.37234L12.418 0.41333L11.587 14.9832Z" fill="white" />
                              </svg>
                              <svg style="width: 23.4259vh;  height: 10.2778vh;"  class="ONEAS-bars__wash ONEAS-speedometer--bars" width="253" height="111" viewBox="0 0 253 111"
                                   fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path stroke-dasharray="${this.barsValues.wash.dashArray}" stroke-dashoffset="${this.barsValues.wash.dashArray}" 
                                        d="M247.679 1.17207C243.256 30.0024 228.691 56.3085 206.604 75.3587C184.517 94.4089 156.357 104.953 127.19 105.094C98.0228 105.236 69.7622 94.9655 47.4913 76.1304C25.2204 57.2954 10.401 31.1318 5.69848 2.34578"
                                        stroke="#0084BC" stroke-width="10" />
                              </svg>
                              <svg style="width: 23.4259vh;  height: 10.2778vh;" class="ONEAS-bars-bg__wash ONEAS-speedometer--bars-bg" width="253" height="111"
                                   viewBox="0 0 253 111" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path
                                        d="M247.679 1.17207C243.256 30.0024 228.691 56.3085 206.604 75.3587C184.517 94.4089 156.357 104.953 127.19 105.094C98.0228 105.236 69.7622 94.9655 47.4913 76.1304C25.2204 57.2954 10.401 31.1318 5.69848 2.34578"
                                        stroke="white" stroke-opacity="0.3" stroke-width="10" />
                              </svg>
                         </div>
                    </div>
               </div>`;
            const speedometerEl = jsLoader._x1040123.ljfkles(text, "ONEAS-speedometer", (prop, value) => this.onChangeInfo(prop, value));

            this.create(speedometerEl);

            window.__hassleTemplate.interface("Hud").speedometer.tachometer.show = 0;
        },
    },
    speedChanger: {
        data: {
            defaultSpeed: "speed-1",
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
                        id: "speed-1",
                        value: "С тахометром",
                        img: "",
                    },
                    {
                        id: "speed-2",
                        value: "С пробегом",
                        img: "",
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
    init(jslInjected) {
        jsLoader = jslInjected;
        this.hud.init();
        this.speedometer.init();
        this.speedChanger.init();
        jsLoader.showAddedScript(`HUD ${nameMod} v${vol}`, "info");
    },
};

window.openInterface = new Proxy(window.openInterface, {
    apply: (target, thisArg, args) => {
        Reflect.apply(target, thisArg, args)
        
        if (args[0] === "CarsShop") {
            const interval = setInterval(() => {
                
                if (window.__hassleTemplate.interface("CarsShop") !== false) {
                    clearInterval(interval);

                    if (document.querySelector('.cars-shop__cars-list-onboarding-selector')) {
                    
                        const items = document.querySelectorAll('.cars-shop__cars-list .item');
                        if (items[0].classList.contains('active')) {
                            items[0].setAttribute('cars-list-item-active', 'true');
                        }
                    }
                    
                    const nextCar = window.__hassleTemplate.interface("CarsShop").nextCar
                    const prevCar = window.__hassleTemplate.interface("CarsShop").prevCar
                    const goToInspection = window.__hassleTemplate.interface("CarsShop").goToInspection

                    window.__hassleTemplate.interface("CarsShop").nextCar = goToInspection
                    window.__hassleTemplate.interface("CarsShop").prevCar = goToInspection
                    window.__hassleTemplate.interface("CarsShop").goToInspection = nextCar

                    window.addEventListener("keydown", (e) => {
                        if (e.keyCode === 37) {
                            prevCar()
                        }
                    })

                    document.querySelector(".cars-shop").addEventListener("wheel", (event) => {
                        if (event.deltaY < 0) {
                            prevCar();
                        } else if (event.deltaY > 0) {
                            nextCar();
                        }
                    })
                }   
            }, 50)
        }
    }  
})

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

return oneasHud;
})()