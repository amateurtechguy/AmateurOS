function updateClock(){
    const now=new Date();
    const hours=now.getHours().toString().padStart(2,"0");
    const minutes=now.getMinutes().toString().padStart(2,"0");
    document.getElementById("clock").textContent=`${hours}:${minutes}`;
}
updateClock();
setInterval(updateClock,1000);
let highestZIndex=100;
function bringToFront(w){
    w.style.zIndex=++highestZIndex;
    document.querySelectorAll(".window").forEach(x=>x.classList.remove("active"));
    w.classList.add("active");
}
function makeWindowDraggable(w){
    const header=w.querySelector(".window-header");
    let dragging=false;
    let offsetX=0;
    let offsetY=0;
    header.addEventListener("pointerdown",e=>{
        if(e.target.closest(".window-buttons")||w.classList.contains("maximized"))return;
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
            if(w.classList.contains("maximized")||w.classList.contains("minimized"))return;
            e.preventDefault();
            e.stopPropagation();
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
                w.style.left=`${left}px`;
                w.style.top=`${top}px`;
                w.style.width=`${width}px`;
                w.style.height=`${height}px`;
            };
            const stop=()=>{
                removeEventListener("pointermove",resize);
                removeEventListener("pointerup",stop);
            };
            addEventListener("pointermove",resize);
            addEventListener("pointerup",stop);
            bringToFront(w);
        });
    });
}
function addResizeHandles(w){
    ["n","s","e","w","ne","nw","se","sw"].forEach(direction=>{
        const handle=document.createElement("div");
        handle.className=`resize-handle resize-${direction}`;
        w.appendChild(handle);
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
    addResizeHandles(w);
    const windowCount=document.querySelectorAll(".window").length;
    const offset=windowCount*30;
    w.style.left=`${150+offset}px`;
    w.style.top=`${160+offset}px`;
    document.querySelector(".desktopcontent").appendChild(w);
    makeWindowDraggable(w);
    makeWindowResizable(w);
    bringToFront(w);
    w.querySelector(".minimize").addEventListener("click",e=>{
        e.stopPropagation();
        w.classList.toggle("minimized");
        bringToFront(w);
    });
    w.querySelector(".maximize").addEventListener("click",e=>{
        e.stopPropagation();
        w.classList.toggle("maximized");
        w.querySelector(".maximize").textContent=
            w.classList.contains("maximized")?"❐":"□";
        bringToFront(w);
    });
    w.querySelector(".close").addEventListener("click",e=>{
        e.stopPropagation();
        w.remove();
    });
    return w;
}
const initialWindow=document.getElementById("homeWindow");
if(initialWindow){
    addResizeHandles(initialWindow);
    makeWindowDraggable(initialWindow);
    makeWindowResizable(initialWindow);
    bringToFront(initialWindow);
}
document.getElementById("appsButton").addEventListener("click",()=>{
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
    const calculatorLauncher=appsWindow.querySelector("#calculatorLauncher");
    if(calculatorLauncher){
        calculatorLauncher.addEventListener("click",()=>{
            createWindow(
                "Calculator",
                `<iframe src="calculator.html" class="calculatorframe"></iframe>`
            );
        });
    }
});
document.getElementById("filesButton").addEventListener("click",()=>{
    createWindow(
        "Files",
        `
        <h1>Files</h1>
        <p>Your files and folders will appear here, if only the creator wasn't saving that feature for ship 2..</p>
        `
    );
});
document.getElementById("settingsButton").addEventListener("click",()=>{
    createWindow(
        "Settings",
        `
        <h1>Settings</h1>
        <p>AmateurOS system settings, still in progress:(</p>
        `
    );
});
const calculatorApp=document.getElementById("calculatorApp");
if(calculatorApp){
    calculatorApp.addEventListener("dblclick",()=>{
        createWindow(
            "Calculator",
            `<iframe src="calculator.html" class="calculatorframe"></iframe>`
        );
    });
}
document.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    const windows=document.querySelectorAll(".window");
    if(windows.length===0)return;
    let activeWindow=null;
    let highest=-1;
    windows.forEach(w=>{
        const z=parseInt(w.style.zIndex)||0;
        if(z>highest){
            highest=z;
            activeWindow=w;
        }
    });
    if(activeWindow)activeWindow.remove();
});
