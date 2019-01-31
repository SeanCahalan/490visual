var data = {};
var update = {};

var colorMap = (tag) => {
    switch(tag){
        case "PERSON":
            return 'green';
        case "CITY":
        case "LOCATION":
            return 'yellow';
        default:
            return 'plain';
    }
}

var displayText = function(data){
    
    let display = document.querySelector('#annotate-display');
    display.innerHTML = '';

    let taggedContext = document.createElement("div")
    taggedContext.classList.add('row', 'tagged-sentence');

    let h3 = document.createElement('h3');
    h3.innerHTML="Annotated Context Sentence"
    display.appendChild(h3);

    display.appendChild(taggedContext);

    let nerData = data.nerData;
    console.log(data);
    nerData.forEach( (pair, i) => {
        let node = document.createElement("div");
        node.classList.add('col');

        let wrapper = document.createElement("div");
        wrapper.classList.add('curly-wrapper');

        let entity = document.createElement("p");
        let text = document.createTextNode(pair[0]);
        entity.classList.add(colorMap(pair[1]))
        entity.appendChild(text);
        wrapper.appendChild(entity)
        
        let bracket = document.createElement("div");
        bracket.classList.add("bracket");
        wrapper.appendChild(bracket);
        
        node.appendChild(wrapper);

        let tag = document.createElement("p");
        text = document.createTextNode(pair[1]);
        tag.appendChild(text);
        tag.classList.add('tag');
        node.appendChild(tag);

        taggedContext.appendChild(node)
    })
}

var displayCorrection = function(data){
    let display = document.querySelector('#correction-display');
    display.innerHTML = '';

    let h3 = document.createElement('h3');
    h3.innerHTML="Correction"
    display.appendChild(h3);

    let h4_1 = document.createElement('h4');
    h4_1.innerHTML="Correction Statement"
    display.appendChild(h4_1);

    let correction = document.createElement('p');
    correction.innerHTML=data.correction;
    display.appendChild(correction);

    let h4_2 = document.createElement('h4');
    h4_2.innerHTML="Corrected Sentence"
    display.appendChild(h4_2);

    let taggedCorrected = document.createElement("div")
    taggedCorrected.classList.add('row', 'tagged-sentence');

    display.appendChild(taggedCorrected)

    let nerData = data.nerData;
    console.log(data);
    nerData.forEach( (pair, i) => {
        let node = document.createElement("div");
        node.classList.add('col');

        let wrapper = document.createElement("div");
        wrapper.classList.add('curly-wrapper');

        let entity = document.createElement("p");
        let text = document.createTextNode(pair[0]);
        entity.classList.add(colorMap(pair[1]))
        entity.appendChild(text);
        wrapper.appendChild(entity)
        
        let bracket = document.createElement("div");
        bracket.classList.add("bracket");
        wrapper.appendChild(bracket);
        
        node.appendChild(wrapper);

        let tag = document.createElement("p");
        text = document.createTextNode(pair[1]);
        tag.appendChild(text);
        tag.classList.add('tag');
        node.appendChild(tag);

        taggedCorrected.appendChild(node)
    })
}