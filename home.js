function updateClock(){
    const now=new Date();
    const hours=now.getHours().toString().padStart(2,"0");
    const minutes=now.getMinutes().toString().padStart(2,"0");
    document.getElementById("clock").textContent=`${hours}:${minutes}`;
}
updateClock();
setInterval(updateClock,1000);
let highestZIndex=100;
function bringToFront(windowElement){
    highestZIndex++;
    windowElement.style.zIndex=highestZIndex;
    document.querySelectorAll(".window").forEach((win)=>{
        win.classList.remove("active");
    });
    windowElement.classList.add("active");
}
function makeWindowDraggable(windowElement){
    const header=windowElement.querySelector(".window-header");
    const minimizeButton=windowElement.querySelector(".minimize");
    const maximizeButton=windowElement.querySelector(".maximize");
    const closeButton=windowElement.querySelector(".close");
    let dragging=false;
    let offsetX=0;
    let offsetY=0;
    header.addEventListener("pointerdown",(event)=>{
        if(event.target.closest(".window-buttons")){
            return;
        }
        if(windowElement.classList.contains("maximized")){
            return;
        }
        dragging=true;
        const rect=windowElement.getBoundingClientRect();
        offsetX=event.clientX-rect.left;
        offsetY=event.clientY-rect.top;
        header.setPointerCapture(event.pointerId);
        bringToFront(windowElement);
    });
    header.addEventListener("pointermove",(event)=>{
        if(!dragging){
            return;
        }
        let x=event.clientX-offsetX;
        let y=event.clientY-offsetY;
        const maxX=window.innerWidth-windowElement.offsetWidth;
        const maxY=window.innerHeight-windowElement.offsetHeight;
        x=Math.max(0,Math.min(x,maxX));
        y=Math.max(0,Math.min(y,maxY));
        windowElement.style.left=`${x}px`;
        windowElement.style.top=`${y}px`;
    });
    header.addEventListener("pointerup",(event)=>{
        dragging=false;
        if(header.hasPointerCapture(event.pointerId)){
            header.releasePointerCapture(event.pointerId);
        }
    });
    header.addEventListener("pointercancel",()=>{
        dragging=false;
    });
    if(minimizeButton){
        minimizeButton.addEventListener("click",(event)=>{
            event.stopPropagation();
            windowElement.classList.toggle("minimized");
            bringToFront(windowElement);
        });
    }
    if(maximizeButton){
        maximizeButton.addEventListener("click",(event)=>{
            event.stopPropagation();
            windowElement.classList.toggle("maximized");
            maximizeButton.textContent=windowElement.classList.contains("maximized")?"❐":"□";
            bringToFront(windowElement);
        });
    }
    if(closeButton){
        closeButton.addEventListener("click",(event)=>{
            event.stopPropagation();
            windowElement.remove();
        });
    }
    windowElement.addEventListener("pointerdown",()=>{
        bringToFront(windowElement);
    });
}
function createWindow(title,content){
    const windowElement=document.createElement("div");
    windowElement.className="window";
    windowElement.innerHTML=`
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
    windowElement.style.left=`${150+offset}px`;
    windowElement.style.top=`${160+offset}px`;
    document.querySelector(".desktopcontent").appendChild(windowElement);
    makeWindowDraggable(windowElement);
    bringToFront(windowElement);
    return windowElement;
}
const initialWindow=document.getElementById("homeWindow");
if(initialWindow){
    makeWindowDraggable(initialWindow);
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
                `<iframe src="calculator.html" class="calculator-frame"></iframe>`
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
        <p>AmateurOS system settings, still in progress:( bugs will be fixed in the second ship so leave your reviews!</p>
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
document.addEventListener("keydown",(event)=>{
    if(event.key!=="Escape"){
        return;
    }
    const windows=document.querySelectorAll(".window");
    if(windows.length===0){
        return;
    }
    let activeWindow=null;
    let highest=-1;
    windows.forEach((windowElement)=>{
        const zIndex=parseInt(windowElement.style.zIndex)||0;
        if(zIndex>highest){
            highest=zIndex;
            activeWindow=windowElement;
        }
    });
    if(activeWindow){
        activeWindow.remove();
    }
});
