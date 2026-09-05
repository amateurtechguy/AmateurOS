const display = document.getElementById("display");
function appendTodisplay(input){
    display.value += input;
}
function ClearDisplay(){
    display.value = "";
}
function calculate(){
    display.value = eval(display.value);
}
