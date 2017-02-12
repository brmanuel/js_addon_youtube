var pattern = "*://*.youtube.com/*";   //"*://*.youtube.com/*/block";  // append '/block' to urls of songs you want to block and press enter
var ss = require("sdk/simple-storage");

function redirect(requestDetails) {
  console.log("Redirecting: " + requestDetails.url);
  return {
    redirectUrl: "https://www.google.ch/"
  };
}

function block(requestDetails){
    var curl = requestDetails.url;
    console.log("Redirecting: " + curl);
    var arr = ss.storage.toBlock;
    arr.push(curl.substring(0, curl.length - 6));
    ss.storage.toBlock = arr;
    redirect(requestDetails);
}
    

browser.webRequest.onBeforeSendHeaders.addListener(
    redirect,
    //{urls:ss.storage.toBlock},
    {urls:[pattern]},
    ["blocking"]
);

/*browser.webRequest.onBeforeSendHeaders.addListener(
    block,
    {urls:[pattern]},
    ["blocking"]
);*/
