setInterval(()=>{let a=document.querySelector(".ScCoreButtonSuccess-sc-1qn4ixc-5")||document.querySelector(".VGQNd")||document.querySelector(".claimable-bonus__icon")?.parentElement?.parentElement?.parentElement||getButtonByArielLabel();if(!a)return;"BUTTON"!=a.nodeName&&(a=getButtonByArielLabel()),a.click();let b=window.location.pathname.match(/(?<=\/).+?(?=\/|$)/)[0];chrome.storage.local.get("tcpacObj",a=>{let c=a.tcpacObj??{};c[b]=(c[b]??0)+1,chrome.storage.local.set({tcpacObj:c},()=>{})})},2e3);function getButtonByArielLabel(){let a=null;return["Claim Bonus","F\xE5 bonus","Bonus einfordern","Reclamar bonificaci\xF3n","Reclamar bono","R\xE9cup\xE9rer un bonus","Riscatta bonus","B\xF3nusz ig\xE9nyl\xE9se","Bonus claimen","Motta bonus","Odbierz bonus","Receber b\xF3nus","Resgatar B\xF4nus","Ob\u021Bine bonusul","Vyzdvihn\xFA\u0165 bonus","Lunasta bonus","H\xE4mta bonus","Nh\u1EADn th\u01B0\u1EDFng","Bonusu al","Vyzvednout bonus","\u0394\u03B9\u03B5\u03BA\u03B4\u03AF\u03BA\u03B7\u03C3\u03B7 \u03BC\u03C0\u03CC\u03BD\u03BF\u03C5\u03C2","\u041F\u043E\u043B\u0443\u0447\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 \u0431\u043E\u043D\u0443\u0441","\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0431\u043E\u043D\u0443\u0441","\u0E40\u0E04\u0E25\u0E21\u0E42\u0E1A\u0E19\u0E31\u0E2A","\u9886\u53D6\u5956\u52B1","\u9818\u53D6\u984D\u5916\u734E\u52F5","\u30DC\u30FC\u30CA\u30B9\u3092\u53D7\u3051\u53D6\u308B","\uBCF4\uB108\uC2A4 \uBC1B\uAE30"].some(b=>!!document.querySelector(`[aria-label="${b}"]`)&&(a=document.querySelector(`[aria-label="${b}"]`),!0)),a}