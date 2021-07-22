setInterval(() => {
    let button = document.querySelector('.ScCoreButtonSuccess-sc-1qn4ixc-5') || document.querySelector('.VGQNd') || document.querySelector('.claimable-bonus__icon')?.parentElement?.parentElement?.parentElement || getButtonByArielLabel()
    if (!button)
        return
    if (button.nodeName != 'BUTTON')
        button = getButtonByArielLabel()
    button.click()
    let address = (window.location.pathname.match(/(?<=\/).+?(?=\/|$)/))[0]
    chrome.storage.local.get('tcpacObj', result => {
        let tcpacObj = result.tcpacObj ?? {}
        tcpacObj[address] = (tcpacObj[address] ?? 0) + 1
        chrome.storage.local.set({tcpacObj: tcpacObj}, () => {})
    })
}, 2000)

function getButtonByArielLabel() {
    const arr = [
        "Claim Bonus",
        "Få bonus",
        "Bonus einfordern",
        "Reclamar bonificación",
        "Reclamar bono",
        "Récupérer un bonus",
        "Riscatta bonus",
        "Bónusz igénylése",
        "Bonus claimen",
        "Motta bonus",
        "Odbierz bonus",
        "Receber bónus",
        "Resgatar Bônus",
        "Obține bonusul",
        "Vyzdvihnúť bonus",
        "Lunasta bonus",
        "Hämta bonus",
        "Nhận thưởng",
        "Bonusu al",
        "Vyzvednout bonus",
        "Διεκδίκηση μπόνους",
        "Получаване на бонус",
        "Получить бонус",
        "เคลมโบนัส",
        "领取奖励",
        "領取額外獎勵",
        "ボーナスを受け取る",
        "보너스 받기"
    ]
    let buttonElement = null
    arr.some(labelText => {
        if (!document.querySelector(`[aria-label="${labelText}"]`))
            return false
        buttonElement = document.querySelector(`[aria-label="${labelText}"]`)
        return true
    })
    return buttonElement
}