function overSentence(sentence) {
     pairSentence = '';
    if (sentence.id.startsWith('f')) {
        pairSentence = 't' + sentence.id.substring(1,sentence.id.length);
    } else {
        pairSentence = 'f' + sentence.id.substring(1,sentence.id.length);
    }
    document.getElementById(pairSentence).style = "background: #b0cfff;"
}

function outSentence(sentence) {
     pairSentence = '';
    if (sentence.id.startsWith('f')) {
        pairSentence = 't' + sentence.id.substring(1,sentence.id.length);
    } else {
        pairSentence = 'f' + sentence.id.substring(1,sentence.id.length);
    }
    document.getElementById(pairSentence).style = ""
}