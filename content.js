setInterval(() => {
    const button = document.querySelector('.tw-button--success')
    if (!button)
        return
    button.click()
    let address = window.location.pathname.match(/(?<=\/).+?(?=\/|$)/g)
    chrome.storage.local.get('tcpacObj', result => {
        let tcpacObj = result.tcpacObj ?? {}
        tcpacObj[address[0]] = (tcpacObj[address[0]] ?? 0) + 1
        chrome.storage.local.set({tcpacObj: tcpacObj}, () => {})
    })
}, 2000)