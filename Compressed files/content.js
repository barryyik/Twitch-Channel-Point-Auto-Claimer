setInterval(()=>{const a=document.querySelector(".ScCoreButtonSuccess-sc-1qn4ixc-5");if(!a)return;a.click();let b=window.location.pathname.match(/(?<=\/).+?(?=\/|$)/g);chrome.storage.local.get("tcpacObj",a=>{let c=a.tcpacObj??{};c[b[0]]=(c[b[0]]??0)+1,chrome.storage.local.set({tcpacObj:c},()=>{})})},2e3);