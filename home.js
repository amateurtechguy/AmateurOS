function updateClock() {
    const now = new Date();

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    document.getElementById("clock").textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);


let highestZIndex = 100;


function bringToFront(windowElement) {
    highestZIndex++;

    windowElement.style.zIndex = highestZIndex;

    document.querySelectorAll(".window").forEach((win) => {
        win.classList.remove("active");
    });

    windowElement.classList.add("active");
}


function makeWindowDraggable(windowElement) {

    const header = windowElement.querySelector(".window-header");
    const minimizeButton = windowElement.querySelector(".minimize");
    const maximizeButton = windowElement.querySelector(".maximize");
    const closeButton = windowElement.querySelector(".close");

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;


    header.addEventListener("pointerdown", (event) => {

        if (event.target.closest(".window-button")) {
            return;
        }

        if (windowElement.classList.contains("maximized")) {
            return;
        }

        dragging = true;

        const rect = windowElement.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        header.setPointerCapture(event.pointerId);

        bringToFront(windowElement);
    });


    header.addEventListener("pointermove", (event) => {

        if (!dragging) {
            return;
        }

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;


        const maxX =
            window.innerWidth - windowElement.offsetWidth;

        const maxY =
            window.innerHeight - windowElement.offsetHeight;


        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));


        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
    });


    header.addEventListener("pointerup", (event) => {

        dragging = false;

        if (header.hasPointerCapture(event.pointerId)) {
            header.releasePointerCapture(event.pointerId);
        }
    });


    header.addEventListener("pointercancel", () => {
        dragging = false;
    });


    minimizeButton.addEventListener("click", (event) => {

        event.stopPropagation();

        windowElement.classList.toggle("minimized");

        bringToFront(windowElement);
    });


    maximizeButton.addEventListener("click", (event) => {

        event.stopPropagation();

        windowElement.classList.toggle("maximized");


        if (windowElement.classList.contains("maximized")) {

            maximizeButton.textContent = "❐";

        } else {

            maximizeButton.textContent = "□";
        }


        bringToFront(windowElement);
    });


    closeButton.addEventListener("click", (event) => {

        event.stopPropagation();

        windowElement.remove();
    });


    windowElement.addEventListener("pointerdown", () => {
        bringToFront(windowElement);
    });
}



function createWindow(title, content) {

    const windowElement =
        document.createElement("div");

    windowElement.className = "window";


    windowElement.innerHTML = `
        <div class="window-header">

            <div class="window-title">
                <span class="window-icon">A</span>
                <span>${title}</span>
            </div>

            <div class="window-buttons">

                <button class="window-button minimize">
                    −
                </button>

                <button class="window-button maximize">
                    □
                </button>

                <button class="window-button close">
                    ×
                </button>

            </div>

        </div>

        <div class="window-content">
            ${content}
        </div>
    `;


    const windowCount =
        document.querySelectorAll(".window").length;


    const offset =
        windowCount * 30;


    windowElement.style.left =
        `${150 + offset}px`;

    windowElement.style.top =
        `${160 + offset}px`;


    document
        .querySelector(".desktop-content")
        .appendChild(windowElement);


    makeWindowDraggable(windowElement);

    bringToFront(windowElement);


    return windowElement;
}



const initialWindow =
    document.getElementById("homeWindow");


if (initialWindow) {

    makeWindowDraggable(initialWindow);

    bringToFront(initialWindow);
}



document
    .getElementById("appsButton")
    .addEventListener("click", () => {

        const calculatorWindow =
            createWindow(
                "Calculator",

                `
                <div class="calculator">

                    <div
                        class="calculator-display"
                        id="calculatorDisplay"
                    >
                        0
                    </div>

                    <div class="calculator-buttons">

                        <button
                            class="calc-button clear"
                            data-action="clear"
                        >
                            C
                        </button>

                        <button
                            class="calc-button"
                            data-action="backspace"
                        >
                            ⌫
                        </button>

                        <button
                            class="calc-button operator"
                            data-value="%"
                        >
                            %
                        </button>

                        <button
                            class="calc-button operator"
                            data-value="/"
                        >
                            ÷
                        </button>


                        <button
                            class="calc-button"
                            data-value="7"
                        >
                            7
                        </button>

                        <button
                            class="calc-button"
                            data-value="8"
                        >
                            8
                        </button>

                        <button
                            class="calc-button"
                            data-value="9"
                        >
                            9
                        </button>

                        <button
                            class="calc-button operator"
                            data-value="*"
                        >
                            ×
                        </button>


                        <button
                            class="calc-button"
                            data-value="4"
                        >
                            4
                        </button>

                        <button
                            class="calc-button"
                            data-value="5"
                        >
                            5
                        </button>

                        <button
                            class="calc-button"
                            data-value="6"
                        >
                            6
                        </button>

                        <button
                            class="calc-button operator"
                            data-value="-"
                        >
                            −
                        </button>


                        <button
                            class="calc-button"
                            data-value="1"
                        >
                            1
                        </button>

                        <button
                            class="calc-button"
                            data-value="2"
                        >
                            2
                        </button>

                        <button
                            class="calc-button"
                            data-value="3"
                        >
                            3
                        </button>

                        <button
                            class="calc-button operator"
                            data-value="+"
                        >
                            +
                        </button>


                        <button
                            class="calc-button zero"
                            data-value="0"
                        >
                            0
                        </button>

                        <button
                            class="calc-button"
                            data-value="."
                        >
                            .
                        </button>

                        <button
                            class="calc-button equals"
                            data-action="equals"
                        >
                            =
                        </button>

                    </div>

                </div>
                `
            );


        setupCalculator(calculatorWindow);
    });



document
    .getElementById("filesButton")
    .addEventListener("click", () => {

        createWindow(
            "Files",

            `
            <h1>Files</h1>
            <p>Your files and folders will appear here, if only the creator wasn't saving that feature for ship 2..</p>
            `
        );
    });



document
    .getElementById("settingsButton")
    .addEventListener("click", () => {

        createWindow(
            "Settings",

            `
            <h1>Settings</h1>
            <p>AmateurOS system settings, still in progress:( </p>
            `
        );
    });



function setupCalculator(calculatorWindow) {

    const display =
        calculatorWindow.querySelector(
            ".calculator-display"
        );


    const buttons =
        calculatorWindow.querySelectorAll(
            ".calc-button"
        );


    let currentValue = "0";
    let previousValue = null;
    let operator = null;
    let waitingForValue = false;


    function updateDisplay() {

        display.textContent =
            currentValue;
    }


    function calculate(
        first,
        second,
        operation
    ) {

        first = Number(first);
        second = Number(second);


        switch (operation) {

            case "+":
                return first + second;

            case "-":
                return first - second;

            case "*":
                return first * second;

            case "/":

                if (second === 0) {
                    return "Error";
                }

                return first / second;

            case "%":
                return first % second;

            default:
                return second;
        }
    }



    function inputNumber(number) {

        if (currentValue === "Error") {

            currentValue = number;

            waitingForValue = false;

            updateDisplay();

            return;
        }


        if (waitingForValue) {

            currentValue = number;

            waitingForValue = false;

        } else {

            if (currentValue === "0") {

                currentValue = number;

            } else {

                currentValue += number;
            }
        }


        updateDisplay();
    }



    function inputDecimal() {

        if (waitingForValue) {

            currentValue = "0.";

            waitingForValue = false;

            updateDisplay();

            return;
        }


        if (!currentValue.includes(".")) {

            currentValue += ".";
        }


        updateDisplay();
    }



    function chooseOperator(nextOperator) {

        if (currentValue === "Error") {
            return;
        }


        if (
            operator &&
            !waitingForValue
        ) {

            const result =
                calculate(
                    previousValue,
                    currentValue,
                    operator
                );


            currentValue =
                String(result);
        }


        previousValue =
            currentValue;


        operator =
            nextOperator;


        waitingForValue =
            true;


        updateDisplay();
    }



    function equals() {

        if (
            !operator ||
            previousValue === null
        ) {
            return;
        }


        const result =
            calculate(
                previousValue,
                currentValue,
                operator
            );


        currentValue =
            String(result);


        previousValue =
            null;


        operator =
            null;


        waitingForValue =
            true;


        updateDisplay();
    }



    function clear() {

        currentValue =
            "0";


        previousValue =
            null;


        operator =
            null;


        waitingForValue =
            false;


        updateDisplay();
    }



    function backspace() {

        if (
            waitingForValue ||
            currentValue === "Error"
        ) {
            return;
        }


        if (
            currentValue.length === 1
        ) {

            currentValue =
                "0";

        } else {

            currentValue =
                currentValue.slice(
                    0,
                    -1
                );
        }


        updateDisplay();
    }



    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.value;

                const action =
                    button.dataset.action;


                if (
                    value !== undefined
                ) {

                    if (!isNaN(value)) {
                        inputNumber(value);
                    }


                    if (value === ".") {
                        inputDecimal();
                    }


                    if (
                        value === "+" ||
                        value === "-" ||
                        value === "*" ||
                        value === "/" ||
                        value === "%"
                    ) {

                        chooseOperator(
                            value
                        );
                    }


                    return;
                }


                if (
                    action === "clear"
                ) {
                    clear();
                }


                if (
                    action === "backspace"
                ) {
                    backspace();
                }


                if (
                    action === "equals"
                ) {
                    equals();
                }

            }
        );

    });



    calculatorWindow.tabIndex = 0;

    calculatorWindow.focus();



    calculatorWindow.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key >= "0" &&
                event.key <= "9"
            ) {

                inputNumber(
                    event.key
                );
            }


            if (event.key === ".") {
                inputDecimal();
            }


            if (
                event.key === "+" ||
                event.key === "-" ||
                event.key === "*" ||
                event.key === "/" ||
                event.key === "%"
            ) {

                chooseOperator(
                    event.key
                );
            }


            if (
                event.key === "Enter" ||
                event.key === "="
            ) {

                equals();
            }


            if (
                event.key === "Backspace"
            ) {

                backspace();
            }


            if (
                event.key === "Escape"
            ) {

                clear();
            }

        }
    );


    updateDisplay();
}



document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        const windows =
            document.querySelectorAll(
                ".window"
            );


        if (windows.length === 0) {
            return;
        }


        let activeWindow = null;
        let highest = -1;


        windows.forEach(
            (windowElement) => {

                const zIndex =
                    parseInt(
                        windowElement.style.zIndex
                    ) || 0;


                if (
                    zIndex > highest
                ) {

                    highest =
                        zIndex;

                    activeWindow =
                        windowElement;
                }

            }
        );


        if (activeWindow) {
            activeWindow.remove();
        }

    }
);