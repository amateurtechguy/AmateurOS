function updateClock(){
    const now=new Date();
    const hours=now.getHours().toString().padStart(2,"0");
    const minutes=now.getMinutes().toString().padStart(2,"0");
    const clock=document.getElementById("clock");
    if(clock){
        clock.textContent=`${hours}:${minutes}`;
    }
}
updateClock();
setInterval(updateClock,1000);
let highestZIndex=100;
function updateDateTime(){
    const now=new Date();
    const time=now.toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
    });
    const date=now.toLocaleDateString([],{
        day:"2-digit",
        month:"2-digit",
        year:"numeric"
    });
    const timeElement=document.querySelector(".time");
    const dateElement=document.querySelector(".date");
    if(timeElement){
        timeElement.textContent=time;
    }
    if(dateElement){
        dateElement.textContent=date;
    }
}
updateDateTime();
setInterval(updateDateTime,1000);
function bringToFront(w){
    if(!w||!document.body.contains(w)){
        return;
    }
    w.style.zIndex=++highestZIndex;
    document.querySelectorAll(".window").forEach(x=>{
        x.classList.remove("active");
    });
    w.classList.add("active");
}
function makeWindowDraggable(w){
    const header=w.querySelector(".window-header");
    if(!header){
        return;
    }
    let dragging=false;
    let offsetX=0;
    let offsetY=0;
    header.addEventListener("pointerdown",e=>{
        if(
            e.target.closest(".window-buttons")||
            e.target.closest(".resize-handle")||
            w.classList.contains("maximized")
        ){
            return;
        }
        const r=w.getBoundingClientRect();
        dragging=true;
        offsetX=e.clientX-r.left;
        offsetY=e.clientY-r.top;
        header.setPointerCapture(e.pointerId);
        bringToFront(w);
    });
    header.addEventListener("pointermove",e=>{
        if(!dragging){
            return;
        }
        let x=e.clientX-offsetX;
        let y=e.clientY-offsetY;
        x=Math.max(0,Math.min(x,window.innerWidth-w.offsetWidth));
        y=Math.max(0,Math.min(y,window.innerHeight-w.offsetHeight));
        w.style.left=x+"px";
        w.style.top=y+"px";
    });
    header.addEventListener("pointerup",e=>{
        dragging=false;
        if(header.hasPointerCapture(e.pointerId)){
            header.releasePointerCapture(e.pointerId);
        }
    });
    header.addEventListener("pointercancel",()=>{
        dragging=false;
    });
}
function makeWindowResizable(w){
    w.querySelectorAll(".resize-handle").forEach(handle=>{
        handle.addEventListener("pointerdown",e=>{
            if(
                w.classList.contains("maximized")||
                w.classList.contains("minimized")
            ){
                return;
            }
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
                if(direction.includes("e")){
                    width=startWidth+dx;
                }
                if(direction.includes("w")){
                    width=startWidth-dx;
                    left=startLeft+dx;
                }
                if(direction.includes("s")){
                    height=startHeight+dy;
                }
                if(direction.includes("n")){
                    height=startHeight-dy;
                    top=startTop+dy;
                }
                if(width<300){
                    if(direction.includes("w")){
                        left=startLeft+startWidth-300;
                    }
                    width=300;
                }
                if(height<180){
                    if(direction.includes("n")){
                        top=startTop+startHeight-180;
                    }
                    height=180;
                }
                left=Math.max(0,left);
                top=Math.max(0,top);
                width=Math.min(width,window.innerWidth-left);
                height=Math.min(height,window.innerHeight-top);
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
    if(w.querySelector(".resize-handle")){
        return;
    }
    [
        "n",
        "s",
        "e",
        "w",
        "ne",
        "nw",
        "se",
        "sw"
    ].forEach(direction=>{
        const handle=document.createElement("div");
        handle.className=`resize-handle resize-${direction}`;
        w.appendChild(handle);
    });
}
function saveWindowState(w){
    if(w.classList.contains("maximized")){
        return;
    }
    const r=w.getBoundingClientRect();
    w.dataset.normalLeft=r.left;
    w.dataset.normalTop=r.top;
    w.dataset.normalWidth=r.width;
    w.dataset.normalHeight=r.height;
}
function restoreWindowState(w){
    if(w.dataset.normalLeft){
        w.style.left=w.dataset.normalLeft+"px";
    }
    if(w.dataset.normalTop){
        w.style.top=w.dataset.normalTop+"px";
    }
    if(w.dataset.normalWidth){
        w.style.width=w.dataset.normalWidth+"px";
    }
    if(w.dataset.normalHeight){
        w.style.height=w.dataset.normalHeight+"px";
    }
}
function minimizeWindow(w){
    const content=w.querySelector(".windowcontent");
    const header=w.querySelector(".window-header");
    if(w.classList.contains("minimized")){
        w.classList.remove("minimized");
        if(content){
            content.style.display="";
        }
        w.style.removeProperty("height");
        w.style.removeProperty("min-height");
        w.style.removeProperty("max-height");
        w.style.removeProperty("overflow");
        restoreWindowState(w);
        const maximizeButton=w.querySelector(".maximize");
        if(maximizeButton){
            maximizeButton.textContent=w.classList.contains("maximized")?"❐":"□";
        }
        bringToFront(w);
        return;
    }
    if(w.classList.contains("maximized")){
        w.classList.remove("maximized");
        restoreWindowState(w);
    }
    saveWindowState(w);
    w.classList.add("minimized");
    if(content){
        content.style.setProperty("display","none","important");
    }
    if(header){
        const headerHeight=header.getBoundingClientRect().height;
        w.style.setProperty("height",headerHeight+"px","important");
        w.style.setProperty("min-height","0px","important");
        w.style.setProperty("max-height",headerHeight+"px","important");
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
    const maximizeButton=w.querySelector(".maximize");
    if(maximizeButton){
        maximizeButton.textContent=w.classList.contains("maximized")?"❐":"□";
    }
    bringToFront(w);
}
function closeWindow(w){
    if(!w){
        return;
    }
    w.remove();
}
function setupWindowButtons(w){
    const minimizeButton=w.querySelector(".minimize");
    const maximizeButton=w.querySelector(".maximize");
    const closeButton=w.querySelector(".close");
    if(minimizeButton){
        minimizeButton.addEventListener("click",e=>{
            e.preventDefault();
            e.stopPropagation();
            minimizeWindow(w);
        });
    }
    if(maximizeButton){
        maximizeButton.addEventListener("click",e=>{
            e.preventDefault();
            e.stopPropagation();
            maximizeWindow(w);
        });
    }
    if(closeButton){
        closeButton.addEventListener("click",e=>{
            e.preventDefault();
            e.stopPropagation();
            closeWindow(w);
        });
    }
}
function setupWindow(w){
    addResizeHandles(w);
    makeWindowDraggable(w);
    makeWindowResizable(w);
    setupWindowButtons(w);
    bringToFront(w);
    w.addEventListener("pointerdown",()=>{
        bringToFront(w);
    });
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
        <div class="windowcontent">
            ${content}
        </div>
    `;
    const windowCount=document.querySelectorAll(".window").length;
    const offset=windowCount*30;
    w.style.left=`${150+offset}px`;
    w.style.top=`${160+offset}px`;
    document.querySelector(".desktopcontent").appendChild(w);
    setupWindow(w);
    return w;
}
const initialWindow=document.getElementById("homeWindow");
if(initialWindow){
    setupWindow(initialWindow);
}
function openCalculator(){
    createWindow(
        "Calculator",
        `
        <iframe
            src="calculator.html"
            class="calculatorframe"
        ></iframe>
        `
    );
}
function openJournal(){
    createWindow(
        "Journal",
        `
        <iframe
            src="journal.html"
            class="journalframe"
        ></iframe>
        `
    );
}
function openNews(){
    createWindow(
        "News",
        `
        <iframe
            src="https://time.com/"
            class="newsframe"
        ></iframe>
        `
    );
}
const appsButton=document.getElementById("appsButton");
if(appsButton){
    appsButton.addEventListener("click",()=>{
        const appsWindow=createWindow(
            "Apps",
            `
            <h1>Apps</h1>
            <div class="app-list">
                <button class="app-launcher" id="calculatorLauncher">
                    <img src="Pictures/calculator.png" alt="Calculator">
                    <span>Calculator</span>
                </button>
                <button class="app-launcher" id="journalLauncher">
                    <img src="Pictures/journal.jpg" alt="Journal">
                    <span>Journal</span>
                </button>
                <button class="app-launcher" id="newsLauncher">
                    <img src="Pictures/IMG_1699.jpg" alt="News">
                    <span>News</span>
                </button>
            </div>
            `
        );
        appsWindow.querySelector("#calculatorLauncher").addEventListener("click",openCalculator);
        appsWindow.querySelector("#journalLauncher").addEventListener("click",openJournal);
        appsWindow.querySelector("#newsLauncher").addEventListener("click",openNews);
    });
}
const filesButton=document.getElementById("filesButton");
if(filesButton){
    filesButton.addEventListener("click",()=>{
        createWindow(
            "Files",
            `
            <iframe
                src="files.html"
                class="filesframe"
                title="Files"
            ></iframe>
            `
        );
    });
}
const defaultSettings={
    accent:"#ff2222",
    theme:"dark",
    wallpaper:"Pictures/background1.jpg",
    scale:"100",
    volume:80,
    muted:false,
    notifications:true,
    clock24:true
};
function getSettings(){
    try{
        return{
            ...defaultSettings,
            ...JSON.parse(localStorage.getItem("amateurOSSettings")||"{}")
        };
    }catch{
        return{
            ...defaultSettings
        };
    }
}
function saveSettings(settings){
    localStorage.setItem(
        "amateurOSSettings",
        JSON.stringify(settings)
    );
}
function applySettings(){
    const settings=getSettings();
    document.documentElement.style.setProperty("--os-accent",settings.accent);
    document.documentElement.style.setProperty("--os-accent-rgb",hexToRGB(settings.accent));
    document.documentElement.style.setProperty("--os-scale",`${settings.scale}%`);
    document.body.classList.toggle("light-theme",settings.theme==="light");
    document.body.style.setProperty("--os-bg",settings.theme==="light"?"#eeeeee":"#050505");
    document.body.style.setProperty("--os-panel",settings.theme==="light"?"#ffffff":"#0c0c0c");
    document.body.style.setProperty("--os-panel2",settings.theme==="light"?"#e5e5e5":"#141414");
    document.body.style.setProperty("--os-text",settings.theme==="light"?"#111111":"#eeeeee");
    document.body.style.setProperty("--os-muted",settings.theme==="light"?"#555555":"#aaaaaa");
    const desktop=document.querySelector(".desktop");
    if(desktop){desktop.style.backgroundImage=`url("${settings.wallpaper}")`;}
}
function hexToRGB(hex){
    const value=hex.replace("#","");
    const r=parseInt(value.substring(0,2),16);
    const g=parseInt(value.substring(2,4),16);
    const b=parseInt(value.substring(4,6),16);
    return `${r},${g},${b}`;
}
function createSettingsWindow(){
    const settings=getSettings();
    const w=createWindow(
        "Settings",
        `
        <div class="settings-app">
            <aside class="settings-sidebar">
                <div class="settings-brand">
                    <div class="settings-brand-icon">A</div>
                    <div>
                        <strong>AmateurOS</strong>
                        <small>System Settings</small>
                    </div>
                </div>
                <button class="settings-nav active" data-section="appearance">🎨 Appearance</button>
                <button class="settings-nav" data-section="display">🖥 Display</button>
                <button class="settings-nav" data-section="sound">🔊 Sound</button>
                <button class="settings-nav" data-section="notifications">🔔 Notifications</button>
                <button class="settings-nav" data-section="privacy">🔒 Privacy</button>
                <button class="settings-nav" data-section="datetime">🕐 Date & Time</button>
                <button class="settings-nav" data-section="system">💻 System</button>
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
                            <button class="accent-option red" data-color="#ff2222"></button>
                            <button class="accent-option orange" data-color="#ff6600"></button>
                            <button class="accent-option blue" data-color="#2299ff"></button>
                            <button class="accent-option purple" data-color="#a855f7"></button>
                            <button class="accent-option green" data-color="#22dd88"></button>
                        </div>
                    </div>
                    <div class="settings-card">
                        <h3>Wallpaper</h3>
                        <div class="wallpaper-options">
                            <button data-wallpaper="Pictures/background1.jpg">Default</button>
                            <button data-wallpaper="Pictures/background2.jpg">Wallpaper 2</button>
                            <button data-wallpaper="Pictures/background3.jpeg">Wallpaper 3</button>
                            <button data-wallpaper="Pictures/background4.png">Wallpaper 4</button>
                        </div>
                    </div>
                </section>
                <section class="settings-section" data-panel="display">
                    <h1>Display</h1>
                    <p class="settings-description">Adjust how AmateurOS appears on your screen.</p>
                    <div class="settings-card">
                        <h3>Interface Scale</h3>
                        <select id="osScale">
                            ${[80,90,100,110,125,150].map(x=>`
                                <option value="${x}" ${settings.scale==x?"selected":""}>
                                    ${x}%
                                </option>
                            `).join("")}
                        </select>
                    </div>
                </section>
                <section class="settings-section" data-panel="sound">
                    <h1>Sound</h1>
                    <p class="settings-description">Control AmateurOS audio settings.</p>
                    <div class="settings-card">
                        <div class="setting-row">
                            <span>🔊 Volume</span>
                            <input
                                id="volumeSlider"
                                type="range"
                                min="0"
                                max="100"
                                value="${settings.volume}"
                            >
                            <span id="volumeValue">${settings.volume}%</span>
                        </div>
                        <label class="setting-toggle">
                            <input
                                id="muteToggle"
                                type="checkbox"
                                ${settings.muted?"checked":""}
                            >
                            <span>Mute system sounds</span>
                        </label>
                    </div>
                </section>
                <section class="settings-section" data-panel="notifications">
                    <h1>Notifications</h1>
                    <p class="settings-description">Control notifications from AmateurOS applications.</p>
                    <div class="settings-card">
                        <label class="setting-toggle">
                            <input
                                id="notificationToggle"
                                type="checkbox"
                                ${settings.notifications?"checked":""}
                            >
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
                        <button class="danger-button" id="clearOSData">
                            Clear AmateurOS Data
                        </button>
                    </div>
                </section>
                <section class="settings-section" data-panel="datetime">
                    <h1>Date & Time</h1>
                    <p class="settings-description">Configure how the system clock is displayed.</p>
                    <div class="settings-card">
                        <label class="setting-toggle">
                            <input
                                id="clock24Toggle"
                                type="checkbox"
                                ${settings.clock24?"checked":""}
                            >
                            <span>Use 24-hour clock</span>
                        </label>
                    </div>
                </section>
                <section class="settings-section" data-panel="system">
                    <h1>System</h1>
                    <p class="settings-description">Information about this AmateurOS installation.</p>
                    <div class="settings-card system-info">
                        <div>
                            <span>Operating System</span>
                            <strong>AmateurOS</strong>
                        </div>
                        <div>
                            <span>Version</span>
                            <strong>1.1.0</strong>
                        </div>
                        <div>
                            <span>Environment</span>
                            <strong>Web Browser</strong>
                        </div>
                        <div>
                            <span>Storage</span>
                            <strong>LocalStorage</strong>
                        </div>
                    </div>
                    <button class="reset-button" id="resetOSSettings">
                        Reset All Settings
                    </button>
                </section>
            </main>
        </div>
        `
    );
    w.style.width=Math.min(850,innerWidth-40)+"px";
    w.style.height=Math.min(600,innerHeight-80)+"px";
    const q=selector=>w.querySelector(selector);
    const qa=selector=>w.querySelectorAll(selector);
    qa(".settings-nav").forEach(button=>{
        button.addEventListener("click",()=>{
            qa(".settings-nav").forEach(x=>{
                x.classList.remove("active");
            });
            qa(".settings-section").forEach(x=>{
                x.classList.remove("active");
            });
            button.classList.add("active");
            q(
                `[data-panel="${button.dataset.section}"]`
            ).classList.add("active");
        });
    });
    qa(".theme-option").forEach(button=>{
        button.addEventListener("click",()=>{
            settings.theme=button.dataset.theme;
            saveSettings(settings);
            applySettings();
            qa(".theme-option").forEach(x=>{
                x.classList.toggle(
                    "selected",
                    x===button
                );
            });
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
    q("#osScale").addEventListener("change",e=>{
        settings.scale=e.target.value;
        saveSettings(settings);
        applySettings();
    });
    q("#volumeSlider").addEventListener("input",e=>{
        settings.volume=Number(e.target.value);
        q("#volumeValue").textContent=settings.volume+"%";
        saveSettings(settings);
    });
    q("#muteToggle").addEventListener("change",e=>{
        settings.muted=e.target.checked;
        saveSettings(settings);
    });
    q("#notificationToggle").addEventListener("change",e=>{
        settings.notifications=e.target.checked;
        saveSettings(settings);
    });
    q("#clock24Toggle").addEventListener("change",e=>{
        settings.clock24=e.target.checked;
        saveSettings(settings);
    });
    q("#clearOSData").addEventListener("click",()=>{
        if(confirm("Clear all AmateurOS saved data?")){
            localStorage.removeItem("amateurOSSettings");
            applySettings();
            alert("AmateurOS settings have been cleared.");
        }
    });
    q("#resetOSSettings").addEventListener("click",()=>{
        if(confirm("Reset all AmateurOS settings?")){
            localStorage.removeItem("amateurOSSettings");
            applySettings();
            w.remove();
        }
    });
    return w;
}
applySettings();
const settingsButton=document.getElementById("settingsButton");
if(settingsButton){
    settingsButton.addEventListener("click",()=>{
        createSettingsWindow();
    });
}
const calculatorApp=document.getElementById("calculatorApp");
if(calculatorApp){
    calculatorApp.addEventListener("dblclick",()=>{
        openCalculator();
    });
}
document.addEventListener("keydown",event=>{
    if(event.key!=="Escape"){
        return;
    }
    const windows=document.querySelectorAll(".window");
    if(!windows.length){
        return;
    }
    let activeWindow=null;
    let highest=-1;
    windows.forEach(w=>{
        const z=parseInt(w.style.zIndex)||0;
        if(z>highest){
            highest=z;
            activeWindow=w;
        }
    });
    if(activeWindow){
        closeWindow(activeWindow);
    }
});
document.querySelectorAll(".app-icon,.desktop-app").forEach(app=>{
    app.style.pointerEvents="auto";
    app.addEventListener("dblclick",e=>{
        e.preventDefault();
        e.stopPropagation();
        const id=(app.id||"").toLowerCase();
        const appName=(app.dataset.app||"").toLowerCase();
        if(
            id==="calculatorapp"||
            appName==="calculator"
        ){
            openCalculator();
        }else if(
            id==="journalapp"||
            appName==="journal"
        ){
            openJournal();
        }else if(
            id==="newsapp"||
            appName==="news"
        ){
            openNews();
        }
    });
});
const desktopSearch=document.getElementById("desktopSearch");
if(desktopSearch){
    desktopSearch.addEventListener("keydown",event=>{
        if(event.key!=="Enter"){
            return;
        }
        const query=desktopSearch.value.trim();
        if(!query){
            return;
        }
        openSearchWindow(query);
        desktopSearch.value="";
        desktopSearch.blur();
    });
}
function openSearchWindow(query){
    const googleURL=
        "https://www.google.com/search?igu=1&q="+
        encodeURIComponent(query);
    createWindow(
        "Search",
        `
        <iframe
            class="searchframe"
            src="${googleURL}"
            title="Google Search"
        ></iframe>
        `
    );
}
function escapeHTML(text){
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}
