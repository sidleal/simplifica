
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
    pairObjList = obj.getAttribute('data-pair').split(',');
    pairObjList.forEach( pairObj => {
        if (document.getElementById(pairObj) != null) {
            var selected = document.getElementById(pairObj).getAttribute('data-selected');
            if (selected == 'false') {
                document.getElementById(pairObj).style = style;            
            }
        }    
    });
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

var operationsMap = {
    union: 'União de Sentença',
    division: 'Divisão de Sentença',
    remotion: 'Remoção de Sentença',
    inclusion: 'Inclusão de Sentença',
    rewrite: 'Reescrita de Sentença'
}


function sentenceClick(sentence) {
    if (!markingWords) {
        var selected = sentence.getAttribute('data-selected');
        
        clearSelection();

        if (selected == 'false') {
            selectSentence(sentence, 'background: #EDE981;', 'true');
            selectedSentences.push(sentence.id);
            document.getElementById("qtSelectedTokens").innerHTML = sentence.getAttribute("data-qtw");
            document.getElementById("qtSelectedTokens").title = sentence.getAttribute("data-qtw") + " palavras ( e " + sentence.getAttribute("data-qtt") + " tokens) na sentença";
            updateOperationsList(sentence);
        }
        $("#selectedSentences").val(selectedSentences.toString());
    }    
}

function clearSelection() {

    selectedSentences.forEach( s => {
        selectSentence(document.getElementById(s), '', 'false');
        document.getElementById("qtSelectedTokens").innerHTML = '';
        document.getElementById("qtSelectedTokens").title = "Quantidade de palavras da sentença";
        $("#sentenceOperations").html('');
        updateOperationsList(null);
    });
    selectedSentences = []

    selectedWords.forEach(w => {
        word = document.getElementById(w);
        word.style = '';
        word.setAttribute('data-selected', 'false');
    });
    selectedWords = [];    
}

function updateOperationsList(sentence) {
    var operationsHtml = '';
    if (sentence != null) {    
        var operations = sentence.getAttribute('data-operations');
        if (operations != '') {
            var operationsList = operations.split(",");
            operationsList.forEach( op => {
                if (op != '') {
                    var opDesc = operationsMap[op];
                    operationsHtml += "<li>" + opDesc + " <i class=\"fa fa-trash-o \" data-toggle=\"tooltip\" title=\"Excluir\" onclick=\"alert('excluir');\" onMouseOver=\"this.style='cursor:pointer;color:red;';\" onMouseOut=\"this.style='cursor:pointer;';\"></i>"
                }
            });
        }
    }
    $("#sentenceOperations").html(operationsHtml);
}


function selectSentence(sentence, style, selected) {
    sentence.style = style;
    sentence.setAttribute('data-selected', selected);

    pairObjList = sentence.getAttribute('data-pair').split(',');
    pairObjList.forEach( pairObj => {
        if (document.getElementById(pairObj) != null) {
            document.getElementById(pairObj).style = style;
            document.getElementById(pairObj).setAttribute('data-selected', selected);
        }    
    });

}

function wordClick(word) {
    if (markingWords) {
        var selected = word.getAttribute('data-selected');
        if (selected == 'true') {
            selectedWords.forEach(w => {
                selectWord(document.getElementById(w), '', 'false');
            });
            selectedWords = [];
        } else {
            if (selectedWords.length > 0) {
                var firstWordIdx = document.getElementById(selectedWords[0]).getAttribute('data-idx');
                var lastWordIdx = word.getAttribute('data-idx');
                for (var i = parseInt(firstWordIdx); i < parseInt(lastWordIdx);i++) {
                    var midWord = document.getElementById(getTokenIdFromIdx(i));
                    selectWord(midWord, 'background: #EDE981;font-weight: bold;', 'true');
                    selectedWords.push(midWord.id);
                }
            }
            selectWord(word, 'background: #EDE981;font-weight: bold;', 'true');
            selectedWords.push(word.id);
        }
    }
}

function selectWord(word, style, selected) {
    word.style = style;
    word.setAttribute('data-selected', selected);
}


function doOperation(type) {
    selectedSentences.forEach(s => {
        var operations = document.getElementById(s).getAttribute('data-operations');
        operations += type + '(' + selectedSentences.toString() + ');';
        document.getElementById(s).setAttribute('data-operations', operations);
        updateOperationsList(document.getElementById(s));
    });

    rewriteTextTo(type);
}

function rewriteTextTo(type) {

    var textToHTML = document.getElementById("divTextTo").innerHTML;
    textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.indexOf("</p></div>")+4);
    textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
    var paragraphs = textToHTML.split("|||");
    paragraphs.forEach(p => {
        p = p.substring(p.indexOf("<span "), p.indexOf("</span></p>")+7);
        p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
        var sentences = p.split("|||");
    
        switch (type) {
            // case 'union':
            //     doUnion(sentences); break;
            // case 'division':
            //     doDivision(sentences); break;
            case 'remotion':
                doRemotion(sentences); break;
            // case 'inclusion':
            //     doInclusion(sentences); break;
            case 'rewrite':
                doRewrite(sentences); break;
        }

    });
    selectedSentences = [];
}

function doRemotion(sentences) {
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                $("#divTextTo").html($("#divTextTo").html().replace(s, ''));
                // document.getElementById(ss).style = '';
                // document.getElementById(ss).setAttribute('data-selected', 'false');
                document.getElementById(ss).setAttribute('data-pair', '');
            }
        });
    });
}


function doRewrite(sentences) {
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                var regexp = /<span[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
                var match = regexp.exec(s);
                var id = match[4];
                
                // document.getElementById(ss).style = '';
                // document.getElementById(ss).setAttribute('data-selected', 'false');
                
                // document.getElementById(id).style = '';
                // document.getElementById(id).setAttribute('data-selected', 'false');

                document.getElementById(id).style = 'font-weight: bold;background: #EDE981;';
            }
        });
    });
}


function getTokenIdFromIdx(idx) {
    var ret = '';
    var tokens = $('#tokenList').val().split('|/|');
    tokens.forEach(t => {
        var items = t.split('||');
        if (parseInt(items[0]) == parseInt(idx)) {
            ret = items[2];
        }
    });
    return ret;
}

function getTokenIdxFromId(id) {
    var ret = '';
    var tokens = $('#tokenList').val().split('|/|');
    tokens.forEach(t => {
        var items = t.split('||');
        if (parseInt(items[2]) == parseInt(id)) {
            ret = items[0];
        }
    });
    return ret;
}