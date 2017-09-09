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
    division: 'Divisão de Sentença'
}


function sentenceClick(sentence) {
    if (!markingWords) {
        var selected = sentence.getAttribute('data-selected');
        if (selected == 'true') {
            selectSentence(sentence, '', 'false');
            selectedSentences.splice(selectedSentences.indexOf(sentence.id), 1);
            document.getElementById("qtSelectedTokens").innerHTML = '';
            document.getElementById("qtSelectedTokens").title = "Quantidade de palavras da sentença";
            $("#sentenceOperations").html('');
        } else {
            var operationsHtml = '';
            selectSentence(sentence, 'background: #EDE981;', 'true');
            selectedSentences.push(sentence.id);
            document.getElementById("qtSelectedTokens").innerHTML = sentence.getAttribute("data-qtw");
            document.getElementById("qtSelectedTokens").title = sentence.getAttribute("data-qtw") + " palavras ( e " + sentence.getAttribute("data-qtt") + " tokens) na sentença";
            var operations = sentence.getAttribute('data-operations');
            if (operations != '') {
                var operationsList = operations.split(";");
                operationsList.forEach( op => {
                    if (op != '') {
                        var opKey = op.split('(')[0];
                        var opDesc = operationsMap[opKey];
                        operationsHtml += "<li>" + opDesc + " <i class=\"fa fa-trash-o inline-inner-button\" data-toggle=\"tooltip\" title=\"Excluir\" onclick=\"alert('excluir');\"></i>"
                    }
                });
            }
            $("#sentenceOperations").html(operationsHtml);
        }
    }    
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
            word.style = '';
            word.setAttribute('data-selected', 'false');
            selectedWords.splice(selectedWords.indexOf(word.id), 1);
        } else {
            word.style = 'background: #EDE981;font-weight: bold;';
            word.setAttribute('data-selected', 'true');
            selectedWords.push(word.id);
        }
    }
}


function doOperation(type) {
    var sentenceList = '';
    selectedSentences.forEach(s => {
        sentenceList += s + ',';
    });
    if (sentenceList.length > 1) {
        sentenceList = sentenceList.substring(0, sentenceList.length - 1);
    }

    selectedSentences.forEach(s => {
        var operations = document.getElementById(s).getAttribute('data-operations');
        operations += type + '(' + sentenceList + ');';
        document.getElementById(s).setAttribute('data-operations', operations);
    });

    rewriteTextTo(type);
}

function rewriteTextTo(type) {

    // console.log(type);
    // selectedSentences.forEach(s => {
    //     console.log(s);
    // });

    var textToHTML = document.getElementById("divTextTo").innerHTML;
    textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.indexOf("</p></div>")+4);
    textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
    var paragraphs = textToHTML.split("|||");
    paragraphs.forEach(p => {
        p = p.substring(p.indexOf("<span "), p.indexOf("</span></p>")+7);
        p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
        var sentences = p.split("|||");
    
        switch (type) {
            case 'union':
                doUnion(sentences); break;
            case 'division':
                doDivision(sentences); break;
            case 'remotion':
                doRemotion(sentences); break;
            case 'inclusion':
                doInclusion(sentences); break;
            case 'rewrite':
                doRewrite(sentences); break;
        }

    });
    selectedSentences = [];
}

function doUnion(sentences) {
    var contentUnion = '';
    var htmlUnion = '';
    var idsUnion = '';
    var pairUnion = '';
    var qttUnion = 0;
    var qtwUnion = 0;
    var ngContent = '';
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                htmlUnion += s;
                var regexp = /<span.*ngcontent-(.*)=[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
                var match = regexp.exec(s);
                ngContent = match[1];
                pairUnion += match[2] + ',';
                qttUnion += parseInt(match[3]);
                qtwUnion += parseInt(match[4]);
                idsUnion += match[5] + '|';
                contentUnion += match[6];
            }
        });
    });
    if (contentUnion.length > 0) {
        var newHtml = "<span _ngcontent-" + ngContent + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"false\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;\"> {content}</span>";
        newHtml = newHtml.replace("{id}", idsUnion);
        newHtml = newHtml.replace("{pair}", pairUnion);
        newHtml = newHtml.replace("{qtt}", qttUnion);
        newHtml = newHtml.replace("{qtw}", qtwUnion);
        newHtml = newHtml.replace("{content}", contentUnion);
        
        $("#divTextTo").html($("#divTextTo").html().replace(htmlUnion, newHtml));
        selectedSentences.forEach( ss => {
            document.getElementById(ss).style = '';
            document.getElementById(ss).setAttribute('data-selected', 'false');
            document.getElementById(ss).setAttribute('data-pair', idsUnion);
        });
    }
}

function doDivision(sentences) {
    sentences.forEach(s => {
        if (s.indexOf(selectedSentences[0]) > 0) {
            var regexp = /<span.*ngcontent-(.*)=[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;

            var match = regexp.exec(s);
            var ngContent = match[1]; 
            var pair = match[2];
            var qtt = parseInt(match[3]);
            var qtw = parseInt(match[4]);
            var id = match[5];
            var content = match[6];
            
            var newHtml = "<span _ngcontent-" + ngContent + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"false\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;\"> {content}</span>";
            newHtml = newHtml.replace("{id}", id + '_new');
            newHtml = newHtml.replace("{pair}", pair);
            newHtml = newHtml.replace("{qtt}", qtt);
            newHtml = newHtml.replace("{qtw}", qtw);
            newHtml = newHtml.replace("{content}", content);
            
            $("#divTextTo").html($("#divTextTo").html().replace(s, newHtml + s));
            document.getElementById(selectedSentences[0]).style = '';
            document.getElementById(selectedSentences[0]).setAttribute('data-selected', 'false');
            document.getElementById(selectedSentences[0]).setAttribute('data-pair', id + ',' + id + "_new");
            
            document.getElementById(id).style = '';
            document.getElementById(id).setAttribute('data-selected', 'false');
    
        }
    });
}


function doRemotion(sentences) {
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                $("#divTextTo").html($("#divTextTo").html().replace(s, ''));
                document.getElementById(ss).style = '';
                document.getElementById(ss).setAttribute('data-selected', 'false');
                document.getElementById(ss).setAttribute('data-pair', '');
            }
        });
    });
}


function doInclusion(sentences) {
    sentences.forEach(s => {
        if (s.indexOf(selectedSentences[0]) > 0) {
            var regexp = /<span.*ngcontent-(.*)=[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
            var match = regexp.exec(s);
            var ngContent = match[1];
            var id = match[5];
            
            var newHtml = "<span _ngcontent-" + ngContent + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"false\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;\"> {content}</span>";
            newHtml = newHtml.replace("{id}", id + '_new_b4');
            newHtml = newHtml.replace("{pair}", '');
            newHtml = newHtml.replace("{qtt}", 0);
            newHtml = newHtml.replace("{qtw}", 0);
            newHtml = newHtml.replace("{content}", "[Sentença nova aqui].");
            
            $("#divTextTo").html($("#divTextTo").html().replace(s, newHtml + s));
            document.getElementById(selectedSentences[0]).style = '';
            document.getElementById(selectedSentences[0]).setAttribute('data-selected', 'false');
            document.getElementById(selectedSentences[0]).setAttribute('data-pair', id + ',' + id + "_new");
            
            document.getElementById(id).style = '';
            document.getElementById(id).setAttribute('data-selected', 'false');

            document.getElementById(id + '_new_b4').style = 'font-weight: bold;';
        }
    });
}


function doRewrite(sentences) {
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                var regexp = /<span[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
                var match = regexp.exec(s);
                var id = match[4];
                
                document.getElementById(ss).style = '';
                document.getElementById(ss).setAttribute('data-selected', 'false');
                
                document.getElementById(id).style = '';
                document.getElementById(id).setAttribute('data-selected', 'false');

                document.getElementById(id).style = 'font-weight: bold;';
            }
        });
    });
}
