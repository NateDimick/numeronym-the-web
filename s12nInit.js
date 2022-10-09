/**
 * Mocks how stupid the naming convention of "s12n" is 
 * where 12 is the number if letters between s and n in the name "Schlerpehuizen", for the unaware
 */

 function convert(regularString) {
    // split into 3 parts, leading punc, word, trailing punc
    if (regularString.match(/[0-9\/.]*/)[0] === regularString) {
        return regularString; // ignore numbers and dates
    }
    const leadingPuncRegexp = /^[^a-zA-z0-9]*/;
    const trailingPuncRegexp = /[^a-zA-Z0-9]*$/;
    let leadingPunc = regularString.match(leadingPuncRegexp)[0];
    let trailingPunc = regularString.match(trailingPuncRegexp)[0];
    //console.log(leadingPunc.length, trailingPunc.length);
    let word = regularString.substring(leadingPunc.length, regularString.length - trailingPunc.length);
    if (word.match(/[0-9\/.]*/)[0] === word) {
        return regularString; // ignore numbers and dates
    }
    word = word.replaceAll(/['-]/g, "");
    //console.log(leadingPunc, word, trailingPunc);
    if (word.length > 3) {
        return `${leadingPunc}${word.charAt(0)}${word.length-2}${word.charAt(word.length -1)}${trailingPunc}`;
    } else {
        return regularString;
    }
}

function convertParagraph(paragraph) {
    const rewrittenParagraph = []
    paragraph.split(/\s+/).forEach(word => {
        rewrittenParagraph.push(convert(word));
    });
    return rewrittenParagraph.join(" ");
}

function s12nOn() {
    console.log("turning numeronyms on")
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.textContent = convertParagraph(e.textContent));
}

function s12nOff() {
    console.log("turning numeronyms off")
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.textContent = e.getAttribute("s12noriginaltext"));
}

function preparePageForS12n() {
    const root = document.getElementsByTagName('body')[0];
    prepareNode(root)
}

function prepareNode(node) {
    if (!node.children?.length 
        && node.nodeType === 1 
        && node.textContent !== "" 
        && node.tagName.toLowerCase() !== "script" 
        && node.tagName.toLowerCase() !== "style") {
        node.classList.add("s12n")
        node.setAttribute("s12noriginaltext", node.textContent)
    }
    // recursive case 2: no exclusive text, recurse over children
    else if (node.children?.length) {
        Array.from(node.children).forEach(n => prepareNode(n));
    }
}

preparePageForS12n()

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    console.log(`recieved update message: ${JSON.stringify(msg)}`)
    if (msg.s12n) {
        s12nOn()
    } else {
        s12nOff()
    }
})