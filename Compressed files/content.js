setInterval(()=>{const t=document.querySelector(".tw-button--success");if(t){t.click();let c=window.location.pathname.substring(1),e=-1==c.indexOf("/")?c:c.substring(0,c.indexOf("/")),n=0;chrome.storage.local.get("tcpacObj",function(t){(n=null==t.tcpacObj?{}:t.tcpacObj)[e]=null==n[e]?1:n[e]+1,chrome.storage.local.set({tcpacObj:n},function(){})})}},1e3);