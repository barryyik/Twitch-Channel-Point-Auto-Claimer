setInterval(() => {
    const button = document.querySelector('.tw-button--success');
    if (button) {
        button.click();
        let addressTemp = window.location.pathname.substring(1);
        let address = (addressTemp.indexOf('/') == -1) ? addressTemp : addressTemp.substring(0, addressTemp.indexOf('/'));
        let tcpacObj = 0;
        chrome.storage.local.get('tcpacObj', function (result) {
            tcpacObj = (result.tcpacObj == undefined) ? {} : result.tcpacObj;
            tcpacObj[address] = (tcpacObj[address] == undefined) ? 1 : (tcpacObj[address] + 1);
            chrome.storage.local.set({tcpacObj: tcpacObj}, function() {});
        });
    }
}, 1000);
