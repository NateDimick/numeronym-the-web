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

function convertMixedNode(node) {
    Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
            n.textContent = convertParagraph(n.textContent)
        }
    })
}

function revertMixedNode(node) {
    let originalTexts = JSON.parse(node.getAttribute("s12noriginaltext"))
    Array.from(node.childNodes).forEach((n, i) => {
        if (n.nodeType === 3) {
            n.textContent = originalTexts[i]
        }
    })
}

function s12nOn() {
    console.log("turning numeronyms on")
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.textContent = convertParagraph(e.textContent))
    Array.from(document.getElementsByClassName("s12n-mixed")).forEach(e => convertMixedNode(e))
}

function s12nOff() {
    console.log("turning numeronyms off")
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.textContent = e.getAttribute("s12noriginaltext"))
    Array.from(document.getElementsByClassName("s12n-mixed")).forEach(e => revertMixedNode(e))
}

function preparePageForS12n() {
    const root = document.getElementsByTagName('body')[0];
    prepareNode(root)
}

function prepareNode(node) {
    if (!node.children?.length  // no inner element - this is a leaf element
        && node.nodeType === 1  // not a text node (3)
        && node.textContent !== "" // not empty
        && node.tagName.toLowerCase() !== "script" // do not want to edit script
        && node.tagName.toLowerCase() !== "style") { // do not want to edit style
        node.classList.add("s12n")
        node.setAttribute("s12noriginaltext", node.textContent)
    }
    // recursive case 1:
    else if (hasMixedChildNodes(node)) {
        node.classList.add("s12n-mixed")
        let inBetweenText = []
        Array.from(node.childNodes).forEach(n => {
            if (n.nodeType === 3) {
                inBetweenText.push(n.textContent)
            }
        })
        node.setAttribute("s12noriginaltext", JSON.stringify(inBetweenText))
    }
    // recursive case 2: no exclusive text, recurse over children
    if (node.children?.length) {
        Array.from(node.children).forEach(n => prepareNode(n));
    }
}

function hasMixedChildNodes(node) {
    let elementChildren = false;
    let nonEmptyTextChildren = false;
    Array.from(node.childNodes).forEach(n => {
        if (n.nodeType == 1) {
            elementChildren = true;
        } else if (n.nodeType === 3 && n.textContent.trim() !== "") {
            nonEmptyTextChildren = true;
        }
    })
    return elementChildren && nonEmptyTextChildren;
}

preparePageForS12n()

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    console.log(`received update message: ${JSON.stringify(msg)}`)
    if (msg.s12n) {
        s12nOn()
    } else {
        s12nOff()
    }
    respond({s12n: msg.s12n})
})