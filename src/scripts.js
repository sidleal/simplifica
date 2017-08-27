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
    pairObj = '';
    if (obj.id.startsWith('f')) {
        pairObj = 't' + obj.id.substring(1,obj.id.length);
    } else {
        pairObj = 'f' + obj.id.substring(1,obj.id.length);
    }
    if (document.getElementById(pairObj) != null) {
        document.getElementById(pairObj).style = style;
    }
}
