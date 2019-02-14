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
def call_counter(func):
    def helper(*args, **kwargs):
        helper.calls += 1
        return func(*args, **kwargs)

    helper.calls = 0
    helper.__name__ = func.__name__
    return helper


def memoize(func):
    global mem

    def memoizer(*args, **kwargs):
        key = str(args) + str(kwargs)
        if key not in mem:
            mem[key] = func(*args, **kwargs)
        return mem[key]

    return memoizer


def clear_mem():
    global mem
    mem = {}


# Distances ARE case sensitive
def get_corrections(sentence):
    min_distance = len(sentence)
    script_dir = os.path.dirname(__file__)
    # TODO: Optimize this, so the file is not opened as many damn times
    with open(os.path.join(script_dir, "../../rules/kingston.txt")) as file:
        print("Open file")
        result = []
        for line in file:
            term = line.split('\t')[0]
            dist = lev(sentence, term)
            if dist < min_distance:
                min_distance = dist
                result = [term]
            elif dist == min_distance:
                result.append(term)
    # Automatically cast as a tuple
    return min_distance, result


def find_entities(sentence, window_size=4):
    clear_mem()
    sentence = sentence.split(" ")
    result = []
    for size in range(1, window_size + 1):
        if size <= len(sentence):
            for index in range(len(sentence) - size + 1):
                a = ' '.join(sentence[index:index + size])
                res = get_corrections(a)
                if res[1]:
                    result.append((*res, a))
    result = sorted(result)
    return result


# Calculates the Levenshtein distance dynamically,
# currently using a substitution distance of 2.
# Since types are dynamic, works for both strings
# as well as arrays of elements
@call_counter
@memoize
def lev(a, b):
    a_len = len(a)
    b_len = len(b)
    if a_len == 0:
        return b_len
    elif b_len == 0:
        return a_len
    elif a[a_len - 1] == b[b_len - 1]:
        cost = 0
    else:
        cost = 2

    return min(lev(a, b[:(b_len - 1)]) + 1,
               lev(a[:(a_len - 1)], b) + 1,
               lev(a[:(a_len - 1)], b[:(b_len - 1)]) + cost)
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
    anchor.innerHTML = sampleCode;
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
    anchor.innerHTML = sampleCode2;
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