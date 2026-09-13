const defaultSettings={
    accent:"#ff2222",
    theme:"dark",
    wallpaper:"Pictures/background1.jpg",
    scale:"100",
    volume:80,
    muted:false,
    notifications:true,
    clock24:false
};
let highestZIndex=100;
function getSettings(){
    try{
        return{...defaultSettings,...JSON.parse(localStorage.getItem("amateurOSSettings")||"{}")};
    }catch{
        return{...defaultSettings};
    }
}
function saveSettings(settings){
    localStorage.setItem("amateurOSSettings",JSON.stringify(settings));
}
function updateSystemClock(){
    const now=new Date();
    const settings=getSettings();
    const time=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!settings.clock24});
    const date=now.toLocaleDateString([],{day:"2-digit",month:"2-digit",year:"numeric"});
    const clock=document.getElementById("clock");
    const timeElement=document.querySelector(".time");
    const dateElement=document.querySelector(".date");
    if(clock)clock.textContent=time;
    if(timeElement)timeElement.textContent=time;
    if(dateElement)dateElement.textContent=date;
}
updateSystemClock();
setInterval(updateSystemClock,1000);
function bringToFront(w){
    if(!w||!document.body.contains(w))return;
    w.style.zIndex=++highestZIndex;
    document.querySelectorAll(".window").forEach(x=>x.classList.remove("active"));
    w.classList.add("active");
}
function makeWindowDraggable(w){
    const header=w.querySelector(".window-header");
    if(!header)return;
    let dragging=false;
    let offsetX=0;
    let offsetY=0;
    header.addEventListener("pointerdown",e=>{
        if(e.target.closest(".window-buttons")||e.target.closest(".resize-handle")||w.classList.contains("maximized"))return;
        const r=w.getBoundingClientRect();
        dragging=true;
        offsetX=e.clientX-r.left;
        offsetY=e.clientY-r.top;
        header.setPointerCapture(e.pointerId);
        bringToFront(w);
    });
    header.addEventListener("pointermove",e=>{
        if(!dragging)return;
        let x=e.clientX-offsetX;
        let y=e.clientY-offsetY;
        x=Math.max(0,Math.min(x,innerWidth-w.offsetWidth));
        y=Math.max(0,Math.min(y,innerHeight-w.offsetHeight));
        w.style.left=x+"px";
        w.style.top=y+"px";
    });
    header.addEventListener("pointerup",e=>{
        dragging=false;
        if(header.hasPointerCapture(e.pointerId))header.releasePointerCapture(e.pointerId);
    });
    header.addEventListener("pointercancel",()=>dragging=false);
}
function makeWindowResizable(w){
    w.querySelectorAll(".resize-handle").forEach(handle=>{
        handle.addEventListener("pointerdown",e=>{
            if(w.classList.contains("maximized")||w.classList.contains("minimized"))return;
            e.preventDefault();
            e.stopPropagation();
            bringToFront(w);
            const r=w.getBoundingClientRect();
            const startX=e.clientX;
            const startY=e.clientY;
            const startWidth=r.width;
            const startHeight=r.height;
            const startLeft=r.left;
            const startTop=r.top;
            const direction=[...handle.classList].find(x=>x.startsWith("resize-"));
            const resize=e=>{
                const dx=e.clientX-startX;
                const dy=e.clientY-startY;
                let width=startWidth;
                let height=startHeight;
                let left=startLeft;
                let top=startTop;
                if(direction.includes("e"))width=startWidth+dx;
                if(direction.includes("w")){
                    width=startWidth-dx;
                    left=startLeft+dx;
                }
                if(direction.includes("s"))height=startHeight+dy;
                if(direction.includes("n")){
                    height=startHeight-dy;
                    top=startTop+dy;
                }
                if(width<300){
                    if(direction.includes("w"))left=startLeft+startWidth-300;
                    width=300;
                }
                if(height<180){
                    if(direction.includes("n"))top=startTop+startHeight-180;
                    height=180;
                }
                left=Math.max(0,left);
                top=Math.max(0,top);
                width=Math.min(width,innerWidth-left);
                height=Math.min(height,innerHeight-top);
                w.style.left=left+"px";
                w.style.top=top+"px";
                w.style.width=width+"px";
                w.style.height=height+"px";
            };
            const stop=()=>{
                removeEventListener("pointermove",resize);
                removeEventListener("pointerup",stop);
                removeEventListener("pointercancel",stop);
            };
            addEventListener("pointermove",resize);
            addEventListener("pointerup",stop);
            addEventListener("pointercancel",stop);
        });
    });
}
function addResizeHandles(w){
    if(w.querySelector(".resize-handle"))return;
    ["n","s","e","w","ne","nw","se","sw"].forEach(direction=>{
        const handle=document.createElement("div");
        handle.className=`resize-handle resize-${direction}`;
        w.appendChild(handle);
    });
}
function saveWindowState(w){
    if(w.classList.contains("maximized"))return;
    const r=w.getBoundingClientRect();
    w.dataset.normalLeft=r.left;
    w.dataset.normalTop=r.top;
    w.dataset.normalWidth=r.width;
    w.dataset.normalHeight=r.height;
}
function restoreWindowState(w){
    ["Left","Top","Width","Height"].forEach(type=>{
        const value=w.dataset["normal"+type];
        if(value)w.style[type.toLowerCase()]=value+"px";
    });
}
function minimizeWindow(w){
    const content=w.querySelector(".windowcontent");
    const header=w.querySelector(".window-header");
    const maximizeButton=w.querySelector(".maximize");
    if(w.classList.contains("minimized")){
        w.classList.remove("minimized");
        if(content)content.style.display="";
        ["height","min-height","max-height","overflow"].forEach(x=>w.style.removeProperty(x));
        restoreWindowState(w);
        if(maximizeButton)maximizeButton.textContent=w.classList.contains("maximized")?"❐":"□";
        bringToFront(w);
        return;
    }
    if(w.classList.contains("maximized")){
        w.classList.remove("maximized");
        restoreWindowState(w);
    }
    saveWindowState(w);
    w.classList.add("minimized");
    if(content)content.style.setProperty("display","none","important");
    if(header){
        const height=header.getBoundingClientRect().height;
        w.style.setProperty("height",height+"px","important");
        w.style.setProperty("min-height","0px","important");
        w.style.setProperty("max-height",height+"px","important");
        w.style.setProperty("overflow","hidden","important");
    }
    bringToFront(w);
}
function maximizeWindow(w){
    if(w.classList.contains("minimized")){
        w.classList.remove("minimized");
        restoreWindowState(w);
    }
    if(!w.classList.contains("maximized")){
        saveWindowState(w);
        w.classList.add("maximized");
        w.style.left="0px";
        w.style.top="0px";
        w.style.width="100vw";
        w.style.height="100vh";
    }else{
        w.classList.remove("maximized");
        restoreWindowState(w);
    }
    const button=w.querySelector(".maximize");
    if(button)button.textContent=w.classList.contains("maximized")?"❐":"□";
    bringToFront(w);
}
function closeWindow(w){
    if(w)w.remove();
}
function setupWindowButtons(w){
    [[".minimize",minimizeWindow],[".maximize",maximizeWindow],[".close",closeWindow]].forEach(([selector,action])=>{
        const button=w.querySelector(selector);
        if(button){
            button.addEventListener("click",e=>{
                e.preventDefault();
                e.stopPropagation();
                action(w);
            });
        }
    });
}
function setupWindow(w){
    addResizeHandles(w);
    makeWindowDraggable(w);
    makeWindowResizable(w);
    setupWindowButtons(w);
    bringToFront(w);
    w.addEventListener("pointerdown",()=>bringToFront(w));
}
function createWindow(title,content){
    const w=document.createElement("div");
    w.className="window";
    w.innerHTML=`
        <div class="window-header">
            <div class="window-title">
                <span class="window-icon">A</span>
                <span>${title}</span>
            </div>
            <div class="window-buttons">
                <button class="minimize">−</button>
                <button class="maximize">□</button>
                <button class="close">×</button>
            </div>
        </div>
        <div class="windowcontent">${content}</div>
    `;
    const offset=document.querySelectorAll(".window").length*30;
    const desktopContent=document.querySelector(".desktopcontent");
    if(!desktopContent){
        console.error("AmateurOS: .desktopcontent was not found.");
        return null;
    }
    w.style.left=`${150+offset}px`;
    w.style.top=`${160+offset}px`;
    desktopContent.appendChild(w);
    setupWindow(w);
    return w;
}
const initialWindow=document.getElementById("homeWindow");
if(initialWindow)setupWindow(initialWindow);
const appData={
    Calculator:["calculator.html","calculatorframe"],
    Journal:["journal.html","journalframe"],
    News:["https://time.com/","newsframe"],
    Weather:["weather.html","weatherframe"],
    Snake:["snake.html","snakeframe"],
    "File Manager":["files.html","filesframe"]
};
function openApp(name){
    const [src,className]=appData[name];
    createWindow(name,`<iframe src="${src}" class="${className}" title="${name}"></iframe>`);
}
function openCalculator(){openApp("Calculator")}
function openJournal(){openApp("Journal")}
function openNews(){openApp("News")}
function openWeather(){openApp("Weather")}
function openSnake(){openApp("Snake")}
const appsButton=document.getElementById("appsButton");
if(appsButton){
    appsButton.addEventListener("click",()=>{
        const appsWindow=createWindow("Apps",`
            <h1>Apps</h1>
            <div class="app-list">
                <button class="app-launcher" id="calculatorLauncher">
                    <img src="Pictures/calculator.png" alt="Calculator" data-app-icon="calculator">
                    <span>Calculator</span>
                </button>
                <button class="app-launcher" id="journalLauncher">
                    <img src="Pictures/journal.jpg" alt="Journal" data-app-icon="journal">
                    <span>Journal</span>
                </button>
                <button class="app-launcher" id="newsLauncher">
                    <img src="Pictures/IMG_1699.jpg" alt="News" data-app-icon="news">
                    <span>News</span>
                </button>
                <button class="app-launcher" id="weatherLauncher">
                    <img src="Pictures/weather.jpg" alt="Weather" data-app-icon="weather">
                    <span>Weather</span>
                </button>
                <button class="app-launcher" id="snakeLauncher">
                <img src="Pictures/snake.png" alt="snake" data-app-icon="snake">
                    <span>Snake</span>
                </button>
            </div>
        `);
        if(!appsWindow)return;
        const launchers={
            calculator:openCalculator,
            journal:openJournal,
            news:openNews,
            weather:openWeather,
            snake:openSnake
        };
        Object.entries(launchers).forEach(([name,action])=>{
            appsWindow.querySelector(`#${name}Launcher`).addEventListener("click",action);
        });
        updateAppIcons();
    });
}
const filesButton=document.getElementById("filesButton");
if(filesButton){
    filesButton.addEventListener("click",()=>openApp("File Manager"));
}
function hexToRGB(hex){
    const value=hex.replace("#","");
    return[
        parseInt(value.substring(0,2),16),
        parseInt(value.substring(2,4),16),
        parseInt(value.substring(4,6),16)
    ].join(",");
}
const icons={
    calculator:{
        dark:"Pictures/calculator.png",
        light:"Pictures/lightcalculator.png"
    },
    journal:{
        dark:"Pictures/journal.jpg",
        light:"Pictures/lightjournal.png"
    },
    news:{
        dark:"Pictures/IMG_1699.jpg",
        light:"Pictures/lightnews.png"
    },
    weather:{
        dark:"Pictures/weather.jpg",
        light:"Pictures/lightweather.png"
    },
    snake:{
        dark:"Pictures/snake.png",
        light:"Pictures/lightsnake.png"
    }
};
function updateAppIcons(){
    const light=document.body.classList.contains("light-theme");
    document.querySelectorAll(".app-icon,.desktop-app").forEach(app=>{
        const id=(app.id||"").toLowerCase();
        const appName=(app.dataset.app||"").toLowerCase();
        const type=Object.keys(icons).find(x=>id===x+"app"||appName===x);
        if(!type)return;
        const img=app.querySelector("img");
        if(img)img.src=icons[type][light?"light":"dark"];
    });
    document.querySelectorAll("[data-app-icon]").forEach(img=>{
        const type=img.dataset.appIcon;
        if(icons[type])img.src=icons[type][light?"light":"dark"];
    });
}
function applySettings(){
    const settings=getSettings();
    const light=settings.theme==="light";
    document.documentElement.style.setProperty("--os-accent",settings.accent);
    document.documentElement.style.setProperty("--os-accent-rgb",hexToRGB(settings.accent));
    document.body.style.zoom=`${settings.scale}%`;
    document.body.classList.toggle("light-theme",light);
    const colors={
        "--os-bg":light?"#eeeeee":"#050505",
        "--os-panel":light?"#ffffff":"#0c0c0c",
        "--os-panel2":light?"#e5e5e5":"#141414",
        "--os-text":light?"#111111":"#eeeeee",
        "--os-muted":light?"#555555":"#aaaaaa"
    };
    Object.entries(colors).forEach(([name,value])=>document.body.style.setProperty(name,value));
    const desktop=document.querySelector(".desktop");
    if(desktop)desktop.style.backgroundImage=`url("${settings.wallpaper}")`;
    updateAppIcons();
    updateSystemClock();
}
function createSettingsWindow(){
    const settings=getSettings();
    const w=createWindow("Settings",`
        <div class="settings-app">
            <aside class="settings-sidebar">
                <div class="settings-brand">
                    <div class="settings-brand-icon">A</div>
                    <div>
                        <strong>AmateurOS</strong>
                        <small>System Settings</small>
                    </div>
                </div>
                ${[
                    ["appearance","🎨 Appearance"],
                    ["display","🖥 Display"],
                    ["sound","🔊 Sound"],
                    ["notifications","🔔 Notifications"],
                    ["privacy","🔒 Privacy"],
                    ["datetime","🕐 Date & Time"],
                    ["system","💻 System"]
                ].map((x,i)=>`
                    <button class="settings-nav${i?"":" active"}" data-section="${x[0]}">${x[1]}</button>
                `).join("")}
            </aside>
            <main class="settings-main">
                <section class="settings-section active" data-panel="appearance">
                    <h1>Appearance</h1>
                    <p class="settings-description">Customize the look and feel of AmateurOS.</p>
                    <div class="settings-card">
                        <h3>Theme</h3>
                        <div class="settings-options">
                            <button class="theme-option ${settings.theme==="dark"?"selected":""}" data-theme="dark">🌑 Dark</button>
                            <button class="theme-option ${settings.theme==="light"?"selected":""}" data-theme="light">☀️ Light</button>
                        </div>
                    </div>
                    <div class="settings-card">
                        <h3>Accent Color</h3>
                        <div class="accent-options">
                            ${["red:#ff2222","orange:#ff6600","blue:#2299ff","purple:#a855f7","green:#22dd88"].map(x=>{const[a,b]=x.split(":");return`<button class="accent-option ${a}" data-color="${b}"></button>`}).join("")}
                        </div>
                    </div>
                    <div class="settings-card">
                        <h3>Wallpaper</h3>
                        <div class="wallpaper-options">
                            ${[
                                ["Pictures/background1.jpg","Default"],
                                ["Pictures/background2.jpg","Wallpaper 2"],
                                ["Pictures/background3.jpeg","Wallpaper 3"],
                                ["Pictures/background4.png","Wallpaper 4"],
                                ["Pictures/background5.jpg","Wallpaper 5"]
                            ].map(x=>`<button data-wallpaper="${x[0]}">${x[1]}</button>`).join("")}
                        </div>
                    </div>
                </section>
                <section class="settings-section" data-panel="display">
                    <h1>Display</h1>
                    <p class="settings-description">Adjust how AmateurOS appears on your screen.</p>
                    <div class="settings-card">
                        <h3>Interface Scale</h3>
                        <select id="osScale">
                            ${[80,90,100,110,125,150].map(x=>`<option value="${x}" ${settings.scale==x?"selected":""}>${x}%</option>`).join("")}
                        </select>
                    </div>
                </section>
                <section class="settings-section" data-panel="sound">
                    <h1>Sound</h1>
                    <p class="settings-description">Control AmateurOS audio settings.</p>
                    <div class="settings-card">
                        <div class="setting-row">
                            <span>🔊 Volume</span>
                            <input id="volumeSlider" type="range" min="0" max="100" value="${settings.volume}">
                            <span id="volumeValue">${settings.volume}%</span>
                        </div>
                        <label class="setting-toggle">
                            <input id="muteToggle" type="checkbox" ${settings.muted?"checked":""}>
                            <span>Mute system sounds</span>
                        </label>
                    </div>
                </section>
                <section class="settings-section" data-panel="notifications">
                    <h1>Notifications</h1>
                    <p class="settings-description">Control notifications from AmateurOS applications.</p>
                    <div class="settings-card">
                        <label class="setting-toggle">
                            <input id="notificationToggle" type="checkbox" ${settings.notifications?"checked":""}>
                            <span>Enable notifications</span>
                        </label>
                    </div>
                </section>
                <section class="settings-section" data-panel="privacy">
                    <h1>Privacy & Security</h1>
                    <p class="settings-description">Manage local AmateurOS privacy settings.</p>
                    <div class="settings-card">
                        <h3>Local Storage</h3>
                        <p>AmateurOS stores your preferences locally in your browser.</p>
                        <button class="danger-button" id="clearOSData">Clear AmateurOS Data</button>
                    </div>
                </section>
                <section class="settings-section" data-panel="datetime">
                    <h1>Date & Time</h1>
                    <p class="settings-description">Configure how the system clock is displayed.</p>
                    <div class="settings-card">
                        <label class="setting-toggle">
                            <input id="clock24Toggle" type="checkbox" ${settings.clock24?"checked":""}>
                            <span>Use 24-hour clock</span>
                        </label>
                    </div>
                </section>
                <section class="settings-section" data-panel="system">
                    <h1>System</h1>
                    <p class="settings-description">Information about this AmateurOS installation.</p>
                    <div class="settings-card system-info">
                        <div><span>Operating System</span><strong>AmateurOS</strong></div>
                        <div><span>Version</span><strong>1.1.0</strong></div>
                        <div><span>Environment</span><strong>Web Browser</strong></div>
                        <div><span>Storage</span><strong>LocalStorage</strong></div>
                    </div>
                    <button class="reset-button" id="resetOSSettings">Reset All Settings</button>
                </section>
            </main>
        </div>
    `);
    if(!w)return null;
    w.style.width=Math.min(850,innerWidth-40)+"px";
    w.style.height=Math.min(600,innerHeight-80)+"px";
    const q=selector=>w.querySelector(selector);
    const qa=selector=>w.querySelectorAll(selector);
    qa(".settings-nav").forEach(button=>{
        button.addEventListener("click",()=>{
            qa(".settings-nav").forEach(x=>x.classList.remove("active"));
            qa(".settings-section").forEach(x=>x.classList.remove("active"));
            button.classList.add("active");
            const panel=q(`[data-panel="${button.dataset.section}"]`);
            if(panel)panel.classList.add("active");
        });
    });
    qa(".theme-option").forEach(button=>{
        button.addEventListener("click",()=>{
            settings.theme=button.dataset.theme;
            saveSettings(settings);
            applySettings();
            qa(".theme-option").forEach(x=>x.classList.toggle("selected",x===button));
        });
    });
    qa(".accent-option").forEach(button=>{
        button.addEventListener("click",()=>{
            settings.accent=button.dataset.color;
            saveSettings(settings);
            applySettings();
        });
    });
    qa("[data-wallpaper]").forEach(button=>{
        button.addEventListener("click",()=>{
            settings.wallpaper=button.dataset.wallpaper;
            saveSettings(settings);
            applySettings();
        });
    });
    const scale=q("#osScale");
    if(scale){
        scale.addEventListener("change",e=>{
            settings.scale=e.target.value;
            saveSettings(settings);
            applySettings();
        });
    }
    const volumeSlider=q("#volumeSlider");
    if(volumeSlider){
        volumeSlider.addEventListener("input",e=>{
            settings.volume=Number(e.target.value);
            q("#volumeValue").textContent=settings.volume+"%";
            saveSettings(settings);
        });
    }
    const muteToggle=q("#muteToggle");
    if(muteToggle){
        muteToggle.addEventListener("change",e=>{
            settings.muted=e.target.checked;
            saveSettings(settings);
        });
    }
    const notificationToggle=q("#notificationToggle");
    if(notificationToggle){
        notificationToggle.addEventListener("change",e=>{
            settings.notifications=e.target.checked;
            saveSettings(settings);
        });
    }
    const clock24Toggle=q("#clock24Toggle");
    if(clock24Toggle){
        clock24Toggle.addEventListener("change",e=>{
            settings.clock24=e.target.checked;
            saveSettings(settings);
            updateSystemClock();
        });
    }
    const clearOSData=q("#clearOSData");
    if(clearOSData){
        clearOSData.addEventListener("click",()=>{
            if(confirm("Clear all AmateurOS saved data?")){
                localStorage.removeItem("amateurOSSettings");
                applySettings();
                alert("AmateurOS settings have been cleared.");
            }
        });
    }
    const resetOSSettings=q("#resetOSSettings");
    if(resetOSSettings){
        resetOSSettings.addEventListener("click",()=>{
            if(confirm("Reset all AmateurOS settings?")){
                localStorage.removeItem("amateurOSSettings");
                applySettings();
                w.remove();
            }
        });
    }
    return w;
}
applySettings();
const settingsButton=document.getElementById("settingsButton");
if(settingsButton){
    settingsButton.addEventListener("click",createSettingsWindow);
}
const calculatorApp=document.getElementById("calculatorApp");
if(calculatorApp){
    calculatorApp.addEventListener("dblclick",openCalculator);
}
document.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    const windows=document.querySelectorAll(".window");
    if(!windows.length)return;
    let activeWindow=null;
    let highest=-1;
    windows.forEach(w=>{
        const z=parseInt(w.style.zIndex)||0;
        if(z>highest){
            highest=z;
            activeWindow=w;
        }
    });
    if(activeWindow)closeWindow(activeWindow);
});
const appOpeners={
    calculator:openCalculator,
    journal:openJournal,
    news:openNews,
    weather:openWeather,
    snake:openSnake
};
document.querySelectorAll(".app-icon,.desktop-app").forEach(app=>{
    app.style.pointerEvents="auto";
    app.addEventListener("dblclick",e=>{
        e.preventDefault();
        e.stopPropagation();
        const id=(app.id||"").toLowerCase();
        const appName=(app.dataset.app||"").toLowerCase();
        const type=Object.keys(appOpeners).find(x=>id===x+"app"||appName===x);
        if(type)appOpeners[type]();
    });
});
const desktopSearch=document.getElementById("desktopSearch");
if(desktopSearch){
    desktopSearch.addEventListener("keydown",event=>{
        if(event.key!=="Enter")return;
        const query=desktopSearch.value.trim();
        if(!query)return;
        openSearchWindow(query);
        desktopSearch.value="";
        desktopSearch.blur();
    });
}
function openSearchWindow(query){
    const googleURL="https://www.google.com/search?igu=1&q="+encodeURIComponent(query);
    createWindow("Search",`<iframe class="searchframe" src="${googleURL}" title="Google Search"></iframe>`);
}
function escapeHTML(text){
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}
