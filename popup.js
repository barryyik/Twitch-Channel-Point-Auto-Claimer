document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    document.getElementById('creditDiv').insertAdjacentHTML("beforeend", '<p>(Version: '+chrome.runtime.getManifest().version+')</p>');
});

function initializeTable() {
    const tcpacDisplayDiv = document.getElementById('tcpacDisplayDiv');
    tcpacDisplayDiv.insertAdjacentHTML("afterbegin", '<table><tr id="tcpacTableRow0"><th>'+chrome.i18n.getMessage("channel")+'</th><th>'+chrome.i18n.getMessage("claimedcount")+'</th><th>'+chrome.i18n.getMessage("clearrecord")+'</th></tr></table>');
    chrome.storage.local.get('tcpacObj', function (result) {
        let tcpacObj = (result.tcpacObj == undefined) ? {} : result.tcpacObj;
        let tableRowNum = 0;
        let tableFirstRow = document.getElementById('tcpacTableRow'+tableRowNum);
        if(Object.keys(tcpacObj).length > 0) {
            for(var key in tcpacObj) {
                tableFirstRow.insertAdjacentHTML("afterend", "<tr id='tcpacTableRow"+(tableRowNum+1)+"'><td><a id='tcpacTableKey"+(tableRowNum+1)+"' href='https://www.twitch.tv/"+key+"' target='_blank'>"+key+"</a></td><td>"+tcpacObj[key]+" ("+(tcpacObj[key]*50)+")</td><td><button class='tcpacDelBtn' id='tcpacDelBtn"+(tableRowNum+1)+"'>"+chrome.i18n.getMessage('clear')+"</button></td></tr>");
                tableRowNum += 1;
                tableFirstRow = document.getElementById('tcpacTableRow'+tableRowNum);
            }
            // add event listener
            var tcpacDelBtnClass = document.getElementsByClassName('tcpacDelBtn');
            for(let i = 0; i < tcpacDelBtnClass.length; i++) {
                tcpacDelBtnClass[i].addEventListener("click", function() {
                    let keyToDel = document.getElementById('tcpacTableKey'+(i+1)).innerHTML;
                    // Delete Entry
                    chrome.storage.local.get('tcpacObj', function (resultNew) {
                        let tcpacObjNew = resultNew.tcpacObj;
                        delete tcpacObjNew[keyToDel];
                        chrome.storage.local.set({tcpacObj: tcpacObjNew}, function() {
                            // clear table
                            document.getElementById('tcpacDisplayDiv').innerHTML = "";
                            // reconstruct table
                            initializeTable();
                        });
                    });
                })
            }
        }
        else {
            tableFirstRow.insertAdjacentHTML("afterend", "<tr id='tcpacTableRow"+(tableRowNum+1)+"'><td>N/A</td><td>N/A</td><td>N/A</td></tr>");
            tableRowNum += 1;
            tableFirstRow = document.getElementById('tcpacTableRow'+tableRowNum);
        }
        // button
        tableFirstRow.insertAdjacentHTML("afterend", "<tr id='tcpacTableRowLast'><td></td><td></td><td><button id='tcpacRestBtn'>"+chrome.i18n.getMessage('clearall')+"</button></td></tr>");
        const deleteBtn = document.getElementById('tcpacRestBtn');
        deleteBtn.addEventListener('click', function() {
            chrome.storage.local.remove('tcpacObj', function(){
                // clear table
                document.getElementById('tcpacDisplayDiv').innerHTML = "";
                // reconstruct table
                initializeTable();
            });
        });
    });
}