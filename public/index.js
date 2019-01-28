var data = {};
var update = {};

var colorMap = (tag) => {
    switch(tag){
        case "PERSON":
            return 'green';
        case "LOCATION":
            return 'yellow';
        default:
            return 'plain';
    }
}

var displayText = function(data){
    let textDisplay = document.querySelector('#text-display');
    textDisplay.innerHTML = data.text;
}

var displayCorrection = function(data){
    let display = document.querySelector('#correction-display');
    let nerData = data.nerData;
    console.log(data);
    nerData.forEach( (pair, i) => {
        let node = document.createElement("p");
        let text = document.createTextNode(pair[0]);
        node.classList.add(colorMap(pair[1]))
        node.appendChild(text);
        display.appendChild(node)
        if(i < nerData.length - 1 ) display.appendChild( document.createTextNode( '\u00A0' ) );

    })
    //display.innerHTML = data.correctedText;
}