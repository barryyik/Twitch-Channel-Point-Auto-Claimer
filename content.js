setInterval(() => {
    const button = document.querySelector('.tw-button--success');
    if (!button) return;
    button.click();
    let addressTemp = window.location.pathname.substring(1),
        address = (addressTemp.indexOf('/') == -1) ? addressTemp : addressTemp.substring(0, addressTemp.indexOf('/')),
        tcpacObj;
    chrome.storage.local.get('tcpacObj', result => {
        tcpacObj = result.tcpacObj ?? {};
        tcpacObj[address] = (tcpacObj[address] ?? 0) + 1;
        chrome.storage.local.set({tcpacObj: tcpacObj}, () => {});
    });
}, 2000);