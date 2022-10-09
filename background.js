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
    s12nState[key] = !on
    chrome.tabs.sendMessage(tab.id, {s12n: on})
    
    chrome.storage.local.set({s12n: s12nState}, () => {console.log("set value")})
}

chrome.action.onClicked.addListener(toggleS12n)

chrome.commands.onCommand.addListener((command) => {
    if (command === "s12nToggle") {
      console.log("keyboard shortcut not supported yet")
      // todo: get active tab
    }
  })