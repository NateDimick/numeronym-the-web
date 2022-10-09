function getS12nState() {
    return new Promise((resolve, reject) => {
        try {
            console.log("query storage for full state")
            chrome.storage.local.get("s12n", result => {
                console.log(`storage fetch result: ${JSON.stringify(result)}`)
                resolve(result.s12n || {})
            })
        } catch (error) {
            console.log(`storage error: ${error}`)
            reject({})
        }
    })
}

async function toggleS12n(tab) {
    let key = `${tab.id}`
    console.log(`action clicked on tab ${key}`)
    let s12nState = await getS12nState()
    let on = s12nState[key] === true
    console.log(`s12n state for tab ${key}: ${on}`)
    console.log(`full s12n state: ${JSON.stringify(s12nState)}`)
    if (on) {
        console.log("will turn s12n off")
    } else {
        console.log("will turn s12n on")
    }
    chrome.tabs.sendMessage(tab.id, {s12n: !on}, (resp) => {
        console.log(`updating storage state after content script response: ${JSON.stringify(resp)}`)
        s12nState[key] = resp.s12n
        chrome.storage.local.set({s12n: s12nState}, () => {console.log("set value - script update")})
    })
}

chrome.action.onClicked.addListener(toggleS12n)

chrome.commands.onCommand.addListener((command) => {
    if (command === "s12nToggle") {
      console.log("keyboard shortcut toggle")
      chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        toggleS12n(tabs[0])
      })
    }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    console.log(`tab ${tabId} updated - s12n state must be reset`)
    if (changeInfo.status == "complete") {
        let s12nState = await getS12nState()
        s12nState[`${tabId}`] = false
        chrome.storage.local.set({s12n: s12nState}, () => {console.log("set value - tab update")})
    }
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    console.log(`tab ${tabId} closed - removing s12n state for that tab`)
    let s12nState = await getS12nState()
    delete s12nState[`${tabId}`]
    chrome.storage.local.set({s12n: s12nState}, () => {console.log("set value - tab closed")})
})