
function overSentence(sentence) {
    toggleObject(sentence, "background: #b0cfff;");
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
    pairObjList.forEach( pairObjId => {
        pairObj = document.getElementById(pairObjId);
        if (pairObj != null) {
            var selected = pairObj.getAttribute('data-selected');
            if (selected == 'false') {
                pairObj.style = style;
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
        document.getElementById('markWords').style='';
        document.getElementById('markSentences').style='display:none;';
    } else {
        document.getElementById('markWords').style='display:none;';
        document.getElementById('markSentences').style='';
    }
}

var operationsMap = {
    union: 'União de Sentença',
    division: 'Divisão de Sentença',
    remotion: 'Remoção de Sentença',
    inclusion: 'Inclusão de Sentença',
    rewrite: 'Reescrita de Sentença',
    lexicalSubst: 'Substituição Lexical',
    synonymListElab: 'Elaboração com lista de sinônimos',
    explainPhraseElab: 'Elaboração com oração explicativa',
    verbalTenseSubst: 'Substituição de tempo verbal',
    numericExprSimpl: 'Simplificação de expressão numérica',
    partRemotion: 'Remoção de parte da sentença',
    passiveVoiceChange: 'Mudança de voz passiva para voz ativa',
    phraseOrderChange: 'Mudança da ordem das orações',
    svoChange: 'Mudança da ordem dos constituintes para SVO',
    advAdjOrderChange: 'Mudança da ordem de adjunto adverbial',
    pronounToNoun: 'Substituição de pronome por nome',
    nounSintReduc: 'Redução de sintagma nominal',
    discMarkerChange: 'Substituição de marcador discursivo',
    notMapped: 'Operação Não Mapeada'
}


function sentenceClick(sentence) {
    if (!markingWords) {
        var selected = sentence.getAttribute('data-selected');
        
        clearSelection();

        if (selected == 'false') {
            selectSentence(sentence, 'background: #EDE981;', 'true');
            selectedSentences.push(sentence.id);
        
            var qtTokensPair = [];
            pairObjList = sentence.getAttribute('data-pair').split(',');
            pairObjList.forEach( pairObjId => {
                pairObj = document.getElementById(pairObjId);
                if (pairObj != null) {
                    qtTokensPair.push(pairObj.getAttribute("data-qtw"));
                }    
            });
            document.getElementById("qtSelectedTokens").innerHTML = sentence.getAttribute("data-qtw") + " -> " + qtTokensPair.toString();
            document.getElementById("qtSelectedTokens").title = sentence.getAttribute("data-qtw") + " palavras ( e " + sentence.getAttribute("data-qtt") + " tokens) na sentença de origem, destino: " + qtTokensPair.toString();
            updateOperationsList(sentence);
        }
        $("#selectedSentences").val(selectedSentences.toString());
    }    
}

function clearSelection() {

    clearSentenceSelection();

    selectedWords.forEach(w => {
        word = document.getElementById(w);
        word.style = '';
        word.setAttribute('data-selected', 'false');
    });
    selectedWords = [];
    $("#selectedWords").val('');
}

function clearSentenceSelection() {
    selectedSentences.forEach( s => {
        selectSentence(document.getElementById(s), '', 'false');
        document.getElementById("qtSelectedTokens").innerHTML = '';
        document.getElementById("qtSelectedTokens").title = "Quantidade de palavras da sentença";
        updateOperationsList(null);
    });
    selectedSentences = []
    $("#selectedSentences").val('');
    $("#sentenceOperations").html('');


    var textToHTML = document.getElementById("divTextTo").innerHTML;
    textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.lastIndexOf("</p>")+4);
    textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
    var paragraphs = textToHTML.split("|||");

    paragraphs.forEach(p => {
        p = p.substring(p.indexOf("<span "), p.lastIndexOf("</span>")+7);
        p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
        var sentences = p.split("|||");

        sentences.forEach(s => {
            var newS = s.replace(/style=".*?"/g, 'style=""')
            jQuery("#divTextTo").html(jQuery("#divTextTo").html().replace(s, newS));
        });
      
    });


}

function updateOperationsList(sentence) {
    var operationsHtml = '';
    if (sentence != null) {    
        var operations = sentence.getAttribute('data-operations');
        if (operations != '') {
            var operationsList = operations.split(";");
            operationsList.forEach( op => {
                if (op != '') {
                    var opKey = op.split('(')[0];
                    var opDesc = operationsMap[opKey];
                    var details = '';                    

                    var substOps = ['lexicalSubst', 'synonymListElab', 'explainPhraseElab', 'verbalTenseSubst', 'numericExprSimpl', 'pronounToNoun', 'passiveVoiceChange', 'phraseOrderChange', 'svoChange', 'advAdjOrderChange', 'discMarkerChange', 'doNounSintReduc'];
                    if (substOps.indexOf(opKey) >= 0) {
                        var match = /\((.*)\|(.*)\|(.*)\)/g.exec(op);
                        if (match) {
                        details = match[2] + ' --> ' + match[3];
                        }
                    } else if (opKey == 'partRemotion') {
                        var match = /\((.*)\|(.*)\)/g.exec(op);
                        if (match) {
                        details = match[2];
                        }              
                    } else if (opKey == 'notMapped') {
                        var match = /\((.*)\|(.*)\|(.*)\|(.*)\)/g.exec(op);
                        if (match) {
                          details = match[4] + ': ' + match[2] + ' --> ' + match[3];
                        }              
                    }
                   
                    operationsHtml += "<li data-toggle=\"tooltip\" title=\"" + details + "\">" + opDesc + " <i class=\"fa fa-trash-o \" data-toggle=\"tooltip\" title=\"Excluir\" onclick=\"window.dispatchEvent(new CustomEvent('undoOperation', { bubbles: true, detail: '" + op + "' }));\" onMouseOver=\"this.style='cursor:pointer;color:red;';\" onMouseOut=\"this.style='cursor:pointer;';\"></i>"
                    
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

function wordClick(word, right) {
    
    if (markingWords || right) {

        clearSentenceSelection();
        
        var selected = word.getAttribute('data-selected');
        if (selected == 'true') {
            selectedWords.forEach(w => {
                selectWord(document.getElementById(w), '', 'false');
            });
            selectedWords = [];
            $("#selectedWords").val('');
        } else {
            if (selectedWords.length > 0) {
                var firstWordIdx = document.getElementById(selectedWords[0]).getAttribute('data-idx');
                var lastWordIdx = word.getAttribute('data-idx');
                for (var i = parseInt(firstWordIdx); i < parseInt(lastWordIdx);i++) {
                    var midWordId = getTokenIdFromIdx(i);
                    if (selectedWords.indexOf(midWordId) < 0) {
                        var midWord = document.getElementById(midWordId);
                        selectWord(midWord, 'background: #edb65d;font-weight: bold;', 'true');    
                    }
                }
            }
            selectWord(word, 'background: #edb65d;font-weight: bold;', 'true');
            
        }
    }
}

function selectWord(word, style, selected) {
    word.style = style;
    word.setAttribute('data-selected', selected);
    if (selected == 'true') {
        selectedWords.push(word.id);
    }
    $("#selectedWords").val(selectedWords.toString());
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