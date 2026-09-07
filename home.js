function updateClock(){
    const now=new Date();
    const hours=now.getHours().toString().padStart(2,"0");
    const minutes=now.getMinutes().toString().padStart(2,"0");
    document.getElementById("clock").textContent=`${hours}:${minutes}`;
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
    if(!w || !document.body.contains(w)) return;
    w.style.zIndex=++highestZIndex;
    document.querySelectorAll(".window").forEach(x=>{
        x.classList.remove("active");
    });

    w.classList.add("active");
}
function makeWindowDraggable(w){
    const header=w.querySelector(".window-header");
    if(!header) return;
    let dragging=false;
    let offsetX=0;
    let offsetY=0;
    header.addEventListener("pointerdown",e=>{
        if(
            e.target.closest(".window-buttons") ||
            e.target.closest(".resize-handle") ||
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
        if(!dragging) return;
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
                w.classList.contains("maximized") ||
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
            maximizeButton.textContent=
                w.classList.contains("maximized") ? "❐" : "□";
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
        w.style.setProperty(
            "height",
            headerHeight+"px",
            "important"
        );
        w.style.setProperty(
            "min-height",
            "0px",
            "important"
        );
        w.style.setProperty(
            "max-height",
            headerHeight+"px",
            "important"
        );
        w.style.setProperty(
            "overflow",
            "hidden",
            "important"
        );
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
        maximizeButton.textContent=
            w.classList.contains("maximized") ? "❐" : "□";
    }
    bringToFront(w);
}
function closeWindow(w){
    if(!w) return;
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
            </div>
            `
        );
        const calculatorLauncher=
            appsWindow.querySelector("#calculatorLauncher");
        if(calculatorLauncher){
            calculatorLauncher.addEventListener("click",()=>{
                createWindow(
                    "Calculator",
                    `
                    <iframe
                        src="calculator.html"
                        class="calculatorframe"
                    ></iframe>
                    `
                );
            });
        }
    });
}
const filesButton=document.getElementById("filesButton");
if(filesButton){
    filesButton.addEventListener("click",()=>{
        createWindow(
            "Files",
            `
            <h1>Files</h1>

            <p>
                Your files and folders will appear here, if only the creator
                wasn't saving that feature for ship 2..
            </p>
            `
        );
    });
}
const settingsButton=document.getElementById("settingsButton");
if(settingsButton){
    settingsButton.addEventListener("click",()=>{
        createWindow(
            "Settings",
            `
            <h1>Settings</h1>

            <p>
                AmateurOS system settings, still in progress:(
            </p>
            `
        );
    });
}
const calculatorApp=document.getElementById("calculatorApp");
if(calculatorApp){
    calculatorApp.addEventListener("dblclick",()=>{
        createWindow(
            "Calculator",
            `
            <iframe
                src="calculator.html"
                class="calculatorframe"
            ></iframe>
            `
        );
    });
}
document.addEventListener("keydown",event=>{
    if(event.key!=="Escape"){
        return;
    }
    const windows=document.querySelectorAll(".window");
    if(windows.length===0){
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
