const initializeTable = () => {
    tcpacDisplayDiv.innerHTML = ""
    tcpacDisplayDiv.insertAdjacentHTML("afterbegin",`<table><tr id="tcpacTableRow0"><th>${chrome.i18n.getMessage("channel")}</th><th>${chrome.i18n.getMessage("claimedcount")}</th><th>${chrome.i18n.getMessage("clearrecord")}</th></tr><tr id='tcpacTableRowLast'><td></td><td></td><td><button  class='tcpacDelBtn' id='tcpacResetBtn'>${chrome.i18n.getMessage('clearall')}</button></td></tr></table>`)
    chrome.storage.local.get('tcpacObj', result => {
        let tcpacObj = result.tcpacObj ?? {},
            tableLastRow = document.getElementById('tcpacTableRowLast')
        if (Object.keys(tcpacObj).length == 0)
            return tableLastRow.insertAdjacentHTML("beforebegin", `<tr id='tcpacTableRow1'><td>N/A</td><td>N/A</td><td>N/A</td></tr>`)
        for (var key in tcpacObj) {
            tableLastRow.insertAdjacentHTML("beforebegin", `<tr id='tcpacTableRow${key}'><td><a id='tcpacTableKey${key}' href='https://www.twitch.tv/${key}' target='_blank'>${key}</a></td><td>${tcpacObj[key]} (${(tcpacObj[key]*50)})</td><td><button class='tcpacDelBtn' id='tcpacDelBtn${key}'>${chrome.i18n.getMessage('clear')}</button></td></tr>`)
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const tcpacDisplayDiv = document.querySelector('#tcpacDisplayDiv')
    initializeTable()
    document.querySelector('#creditDiv').insertAdjacentHTML("beforeend", `<p>(Version: ${chrome.runtime.getManifest().version})</p>`)
    tcpacDisplayDiv.addEventListener("click", e => {
        if (e.toElement.nodeName !== 'BUTTON')
            return
        if (e.target.id === 'tcpacResetBtn')
            return chrome.storage.local.remove('tcpacObj', () => initializeTable())
        chrome.storage.local.get('tcpacObj', resultNew => {
            let tcpacObjNew = resultNew.tcpacObj
            delete tcpacObjNew[e.target.id.substring(11)]
            chrome.storage.local.set({tcpacObj: tcpacObjNew}, () => initializeTable())
        })
    })
})