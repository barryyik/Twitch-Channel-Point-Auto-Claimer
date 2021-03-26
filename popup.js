document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    document.getElementById('creditDiv').insertAdjacentHTML("beforeend", `<p>(Version: ${chrome.runtime.getManifest().version})</p>`);
});

const initializeTable = () => {
    const tcpacDisplayDiv = document.getElementById('tcpacDisplayDiv');
    // clear table
    tcpacDisplayDiv.innerHTML = "";
    tcpacDisplayDiv.insertAdjacentHTML("afterbegin", `<table><tr id="tcpacTableRow0"><th>${chrome.i18n.getMessage("channel")}</th><th>${chrome.i18n.getMessage("claimedcount")}</th><th>${chrome.i18n.getMessage("clearrecord")}</th></tr></table>`);
    chrome.storage.local.get('tcpacObj', result => {
        let tcpacObj = result.tcpacObj ?? {},
            tableFirstRow = document.getElementById('tcpacTableRow0');
        if(Object.keys(tcpacObj).length > 0) {
            for(var key in tcpacObj) {
                tableFirstRow.insertAdjacentHTML("afterend", `<tr id='tcpacTableRow${key}'><td><a id='tcpacTableKey${key}' href='https://www.twitch.tv/${key}' target='_blank'>${key}</a></td><td>${tcpacObj[key]} (${(tcpacObj[key]*50)})</td><td><button class='tcpacDelBtn' id='tcpacDelBtn${key}'>${chrome.i18n.getMessage('clear')}</button></td></tr>`);
                tableFirstRow = document.getElementById('tcpacTableRow'+key);
            }
        }
        else {
            tableFirstRow.insertAdjacentHTML("afterend", `<tr id='tcpacTableRow1'><td>N/A</td><td>N/A</td><td>N/A</td></tr>`);
            tableFirstRow = document.getElementById('tcpacTableRow1');
        }
        // button
        tableFirstRow.insertAdjacentHTML("afterend", `<tr id='tcpacTableRowLast'><td></td><td></td><td><button  class='tcpacDelBtn' id='tcpacResetBtn'>${chrome.i18n.getMessage('clearall')}</button></td></tr>`);
        // add event listener
        tcpacDisplayDiv.addEventListener("click", delFunction = (e) => {
            if(e.toElement.nodeName !== 'BUTTON') return;
            if(e.target.id === 'tcpacResetBtn') return chrome.storage.local.remove('tcpacObj',() => {tcpacDisplayDiv.removeEventListener("click", delFunction); initializeTable()});
            chrome.storage.local.get('tcpacObj', resultNew => {
                let tcpacObjNew = resultNew.tcpacObj;
                delete tcpacObjNew[e.target.id.substring(11)];
                chrome.storage.local.set({tcpacObj: tcpacObjNew}, () => {tcpacDisplayDiv.removeEventListener("click", delFunction); initializeTable()});
            });
        });
    });
}