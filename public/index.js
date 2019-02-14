var data = {};
var update = {};

var log = function(msg, data){
    console.log(msg, data)
}




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

var sampleCode2 = `
class CoreNLP:
    base_props = {'annotators': 'tokenize,ssplit,lemma,ner,regexner',
                  'ner.applyFineGrained': 'false',
                  'regexner.backgroundSymbol': 'ORGANIZATION,PERSON,O',
                  'ner.model': 'edu/stanford/nlp/models/ner/english.all.3class.distsim.crf.ser.gz',
                  'pipelineLanguage': 'en',
                  'ner.buildEntityMentions': 'true',
                  'outputFormat': 'json'}

    def __init__(self, _host='http://localhost', _port=nlp_server_port):
        self.nlp = StanfordCoreNLP(_host, port=_port)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.nlp.close()

    def annotate(self, _text, regexner_mapping=""):
        full_props = self.base_props
        if len(regexner_mapping) < 2:
            regexner_mapping = rules_dir + "/default.txt"
        full_props['regexner.mapping'] = regexner_mapping
        return json.loads(self.nlp.annotate(_text, full_props))


# Given a list of lists, return a merged list that
# groups items with the same nested second index.
# For [[word, ner], [word, ner]], common ner groups are merged
def merge_tags_in_list(tagged_list):
    token_buffer = ''
    entity = ''
    merged_list = []
    start_offset = 0
    end_offset = 0
    for token in tagged_list:
        # Continuation
        if token[1] == entity:
            # This operates under the assumption that two
            # consecutive entities are separated by a space
            token_buffer += " " + token[0]
            end_offset = token[3]
        else:
            if token_buffer != '':
                merged_list.append((token_buffer, entity, start_offset, end_offset))
            token_buffer = token[0]
            entity = token[1]
            start_offset = token[2]
            end_offset = token[3]
    merged_list.append((token_buffer, entity, start_offset, end_offset))
    return merged_list
`

var colorMap = (tag) => {
    switch(tag){
        case "MONEY":
            return 'green';
        case "PERSON":
            return 'red';
        case "CITY":
        case "LOCATION":
        case "STATE_OR_PROVINCE":
            return 'blue';
        case "DATE":
            return 'magenta';
        default:
            return 'plain';
    }
}



var displayText = function(data){
    
    let anchor = document.querySelector('#code');
    anchor.innerHTML = sampleCode2;
    window.Prism.highlightAll();

    let display = document.querySelector('#annotate-display');

    let taggedContext = document.createElement("div")
    taggedContext.classList.add('row', 'tagged-sentence');



    display.appendChild(taggedContext);

    let nerData = data.nerData;
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

    let container = document.querySelector('.container.annotate');
    setTimeout(()=>{
        container.scrollTop = container.scrollHeight;
    }, 200)
    
}

var displayCorrection = function(data){
    let display = document.querySelector('#correction-display');

    let anchor = document.querySelector('#code');
    anchor.innerHTML = sampleCode;
    window.Prism.highlightAll();

    let taggedCorrected = document.createElement("div")
    taggedCorrected.classList.add('row', 'tagged-sentence');

    display.appendChild(taggedCorrected)

    let nerData = data.nerData;
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

    let container = document.querySelector('.container.correct');
    setTimeout(()=>{
        container.scrollTop = container.scrollHeight;
    }, 200)
}