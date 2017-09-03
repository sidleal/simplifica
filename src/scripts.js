function overSentence(sentence) {
    toggleObject(sentence, "background: #b0cfff;");
    document.getElementById("qtTokens").innerHTML = sentence.getAttribute("data-qtw");
    document.getElementById("qtTokens").title = sentence.getAttribute("data-qtw") + " palavras ( e " + sentence.getAttribute("data-qtt") + " tokens) na sentença";
    $("#sentenceOperations").html(sentence.getAttribute('data-operations'));
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

function sentenceClick(sentence) {
    if (!markingWords) {
        var selected = sentence.getAttribute('data-selected');
        if (selected == 'true') {
            // sentence.style = '';
            // sentence.setAttribute('data-selected', 'false');
            // document.getElementById(pairObj).style = '';
            // document.getElementById(pairObj).setAttribute('data-selected', 'false');
            selectSentence(sentence, '', 'false');
            selectedSentences.splice(selectedSentences.indexOf(sentence.id), 1);
            $("#sentenceOperations").html('');
        } else {
            // sentence.style = 'background: #EDE981;';
            // sentence.setAttribute('data-selected', 'true');
            // document.getElementById(pairObj).style = 'background: #EDE981;';
            // document.getElementById(pairObj).setAttribute('data-selected', 'true');
            selectSentence(sentence, 'background: #EDE981;', 'true');
            selectedSentences.push(sentence.id);
            $("#sentenceOperations").html(sentence.getAttribute('data-operations'));
        }
    }

    // var sentenceList = 'Selected Sentences: <br/>';
    // selectedSentences.forEach(s => {
    //     sentenceList += s + '<br/>';
    // });
    // $("#alinhamentosS").html(sentenceList);
    
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
    // var wordList = 'Selected Words: <br/>';
    // selectedWords.forEach(w => {
    //     wordList += w + '<br/>';
    // });
    // $("#alinhamentosW").html(wordList);

}


function doOperation(type) {
    var sentenceList = '';
    selectedSentences.forEach(s => {
        sentenceList += s + ',';
    });
    if (sentenceList.length > 1) {
        sentenceList = sentenceList.substring(0, sentenceList.length - 1);
    }

    var operations = $("#sentenceOperations").html(); 
    operations +=  ' ' + type + '(' + sentenceList + ');';
    $("#sentenceOperations").html(operations);

    selectedSentences.forEach(s => {
        document.getElementById(s).setAttribute('data-operations', operations);
    });

    rewriteTextTo(type);
}

function rewriteTextTo(type) {

    console.log(type);
    selectedSentences.forEach(s => {
        console.log(s);
    });

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
    sentences.forEach(s => {
        selectedSentences.forEach( ss => {
            if (s.indexOf(ss) > 0) {
                htmlUnion += s;
                var regexp = /<span[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
                var match = regexp.exec(s);
                pairUnion += match[1] + ',';
                qttUnion += parseInt(match[2]);
                qtwUnion += parseInt(match[3]);
                idsUnion += match[4] + '|';
                contentUnion += match[5];
            }
        });
    });
    if (contentUnion.length > 0) {
        var newHtml = "<span _ngcontent-c3=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"false\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;\"> {content}</span>";
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
            var regexp = /<span[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
            var match = regexp.exec(s);
            var pair = match[1];
            var qtt = parseInt(match[2]);
            var qtw = parseInt(match[3]);
            var id = match[4];
            var content = match[5];
            
            var newHtml = "<span _ngcontent-c3=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"false\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;\"> {content}</span>";
            newHtml = newHtml.replace("{id}", id + '_new');
            newHtml = newHtml.replace("{pair}", pair);
            newHtml = newHtml.replace("{qtt}", qtt);
            newHtml = newHtml.replace("{qtw}", qtw);
            newHtml = newHtml.replace("{content}", content);
            
            $("#divTextTo").html($("#divTextTo").html().replace(s, newHtml + s));
            document.getElementById(selectedSentences[0]).style = '';
            document.getElementById(selectedSentences[0]).setAttribute('data-selected', 'false');
            document.getElementById(selectedSentences[0]).setAttribute('data-pair', id + ',' + id + "_new");
            
            document.getElementById(id).style = 'font-weight: bold;';
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