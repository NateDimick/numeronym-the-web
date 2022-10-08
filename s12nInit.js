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

function convertNode2(node) {
    // base case - node is an element with no children - it's contents are either empty or just text
    if (!node.children?.length && node.nodeType === 1) {
        if (!node.classList.contains("s12n") 
            && !node.classList.contains("not-s12n") 
            && !node.classList.contains("s12n-protected") 
            && node.textContent.trim() !== "") {
            let s12nCopy = node.cloneNode();
            s12nCopy.textContent = convertParagraph(node.textContent);
            s12nCopy.classList.add("s12n");
            if (node.id) {
                s12nCopy.id = node.id + "-s12n";
            }
            node.classList.add("not-s12n");
            node.parentNode.insertBefore(s12nCopy, node);
        }
    }    
    //recursive case 1: node has mixed children
    if (hasMixedChildNodes(node)) {
        // must do special construction
        let s12nCopy = node.cloneNode();
        s12nCopy.innerHTML = node.innerHTML;
        convertNodeInPlace(s12nCopy);
        node.classList.add("not-s12n");
        node.parentNode.insertBefore(s12nCopy, node);
    }
    // recursive case 2: no exclusive text, recurse over children
    else if (node.children) {
        Array.from(node.children).forEach(n => convertNode2(n));
    }
}

function convertNodeInPlace(node) {
    if (node.nodeType === 1) {
        node.classList.add("s12n");
        if (node.id) {
            node.id = node.id + "-s12n";
        }
        Array.from(node.childNodes).forEach(n => convertNodeInPlace(n));
    }
    else if (node.nodeType === 3) {
        node.textContent = convertParagraph(node.textContent);
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

function convertPage() {
    const root = document.getElementsByTagName('body')[0];
    convertNode2(root);
}

function toggles12n(event) {
    const on = event.target.checked;
    if (on) {
        Array.from(document.getElementsByClassName("s12n")).forEach(e => e.style.display = e.tagName === "SPAN" ? "inline" : "block");
        Array.from(document.getElementsByClassName("not-s12n")).forEach(e => e.style.display = "none");
    } else {
        Array.from(document.getElementsByClassName("s12n")).forEach(e => e.style.display = "none");
        Array.from(document.getElementsByClassName("not-s12n")).forEach(e => e.style.display = e.tagName === "SPAN" ? "inline" : "block");
    }
}

function traverseBody2(node, tabs) {
    console.log(`${"\t".repeat(tabs)} ${node.nodeType} ${node.tagName} ${node.children?.length} ${node.childNodes.length} ${hasMixedChildNodes(node)}`);
    if (node.nodeType == 3) {
        console.log(`${"\t".repeat(tabs)} ${node.textContent}`);
        const match = node.textContent.match(/\s+/);
        if (match) {
            console.log("text is only whitespace", match[0] === node.textContent);
        }
        
    }
    Array.from(node.childNodes).forEach(e => traverseBody2(e, tabs +1))
}

// ["Montpelier", "Exclamation!", "Interrobang?!?!", ">>>>>bicycle", "\"quote\""].forEach(w => {
//     let i = convert(w);
//     console.log(i);
// })

convertPage();
