function overSentence(sentence) {
    toggleObject(sentence, "background: #b0cfff;");
    document.getElementById("qtTokens").innerHTML = sentence.getAttribute("data-qtw");
    document.getElementById("qtTokens").title = sentence.getAttribute("data-qtw") + " palavras ( e " + sentence.getAttribute("data-qtt") + " tokens) na sentença";
}

function outSentence(sentence) {
    toggleObject(sentence, "");
}

function overToken(token) {
    toggleObject(token, "font-weight:bold;text-decoration:underline;");
}

function outToken(token) {
    toggleObject(token, "");
}

function toggleObject(obj, style) {
    pairObj = obj.getAttribute('data-pair');
    if (document.getElementById(pairObj) != null) {
        var selected = document.getElementById(pairObj).getAttribute('data-selected');
        if (selected == 'false') {
            document.getElementById(pairObj).style = style;            
        }
    }
}

var selectedWords = [];
var selectedSentences = [];

var markingWords = false;

function markWords(newValue) {

    markingWords = newValue;

    if (newValue) {
        document.getElementById('markWords').style='display:none;';
        document.getElementById('markSentences').style='';
    } else {
        document.getElementById('markWords').style='';
        document.getElementById('markSentences').style='display:none;';
    }
}

function sentenceClick(sentence) {
    if (!markingWords) {
        var selected = sentence.getAttribute('data-selected');
        var pairObj = sentence.getAttribute('data-pair');
        if (selected == 'true') {
            sentence.style = '';
            sentence.setAttribute('data-selected', 'false');
            document.getElementById(pairObj).style = '';
            document.getElementById(pairObj).setAttribute('data-selected', 'false');
            selectedSentences.pop(sentence.id);
        } else {
            sentence.style = 'background: #EDE981;';
            sentence.setAttribute('data-selected', 'true');
            document.getElementById(pairObj).style = 'background: #EDE981;';
            document.getElementById(pairObj).setAttribute('data-selected', 'true');
            selectedSentences.push(sentence.id);
        }
    }
}

function wordClick(word) {
    if (markingWords) {
        var selected = word.getAttribute('data-selected');
        if (selected == 'true') {
            word.style = '';
            word.setAttribute('data-selected', 'false');
            selectedWords.pop(word.id);
        } else {
            word.style = 'background: #EDE981;font-weight: bold;';
            word.setAttribute('data-selected', 'true');
            selectedWords.push(word.id);
        }
    }
}
