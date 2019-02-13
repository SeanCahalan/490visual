var data = {};
var update = {};

var sampleCode = `
# Attempts to correct a sentence, given a string of sentence(s), and a correction prompt.
# Lat and long will be used to determine which regexer file to use, or will call the system to dynamically create one
# UUID used to reference another regex file containing calendar items and contact names
# Annotated lists are sent to replace_entity, with the response stuffed into a JSON body.
def correct_sentence(_context, _correction, location_rules="", uuid_rules=""):
    # if region(lat, long) dne: create_clean_regex_file(new_location, rules/location.txt)
    # if UUID dne: create_new_UUID(

    dprint(location_rules)
    with CoreNLP() as nlp:
        response = {}
        regex_rule_paths = location_rules + "," + uuid_rules
        if regex_rule_paths[0] == ',':
            regex_rule_paths = regex_rule_paths[1:]
        dprint(regex_rule_paths)
        context = nlp.annotate(_context, regex_rule_paths)
        correction = nlp.annotate(remove_command_prefix(_correction), regex_rule_paths)

        details = get_replacement_detail_ner(context, correction)
        if details:
            corrected = _context[:details['context_offset_begin']] + details['correction_text'] + \
                        _context[details['context_offset_end']:]
            response['corrected_ner'] = details['corrected_ner']
        else:  # No change able to be done
            corrected = _context
            response['corrected_ner'] = ''

        response['context'] = _context
        if correction['sentences']:
            response['correctionNerData'] = get_ner(correction['sentences'][0]['tokens'])
        response['correction'] = _correction
        response['correctedText'] = corrected
        finished = nlp.annotate(corrected, regex_rule_paths)
        # Case where no correction is found
        if not finished['sentences']:
            return {}
        response['nerData'] = get_ner(finished['sentences'][0]['tokens'])
        return response
`

var colorMap = (tag) => {
    switch(tag){
        case "MONEY":
            return 'green';
        case "PERSON":
            return 'blue';
        case "CITY":
        case "LOCATION":
        case "STATE_OR_PROVINCE":
            return 'yellow';
        case "DATE":
            return 'red';
        default:
            return 'plain';
    }
}



var displayText = function(data){
    
    let anchor = document.querySelector('#code');
    anchor.innerHTML = sampleCode;
    window.Prism.highlightAll();


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

    let taggedCorrection = document.createElement("div")
    taggedCorrection.classList.add('row', 'tagged-sentence');
    let correctionNerData = data.correctionNerData;
    correctionNerData.forEach( (pair, i) => {
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

        taggedCorrection.appendChild(node)
    })

    display.appendChild(taggedCorrection)

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