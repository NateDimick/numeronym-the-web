function s12nOn() {
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.style.display = e.tagName === "SPAN" ? "inline" : "block");
    Array.from(document.getElementsByClassName("not-s12n")).forEach(e => e.style.display = "none");    
}

function s12nOff() {
    Array.from(document.getElementsByClassName("s12n")).forEach(e => e.style.display = "none");
    Array.from(document.getElementsByClassName("not-s12n")).forEach(e => e.style.display = e.tagName === "SPAN" ? "inline" : "block");
}

async function toggleS12n(tab) {
    let on
    await chrome.storage.local.get(tab.id, (result) => {
        on = result
    })
    let onBool = on === "true" 
    let f = onBool ? s12nOff : s12nOn
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: f
    })
    chrome.storage.local.set({`${tab.id}`: `${onBool}`}, () => {console.log("set value")})
}

chrome.action.onClicked.addListener(toggleS12n)