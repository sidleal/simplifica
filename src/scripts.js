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
    pairObj = obj.getAttribute('data-pair');
    if (document.getElementById(pairObj) != null) {
        document.getElementById(pairObj).style = style;
    }
}
