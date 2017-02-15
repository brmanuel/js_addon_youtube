var patternBlock = "*://*.youtube.com/*/block";  // append '/block' to urls of songs you want to block and press enter
var patternReset = "*://*.youtube.com/*/reset"; // appent '/reset' to any youtube url in order to reset the list of blocked urls
var startUrl = "https://www.youtube.com/";
var URLS = [];


function createCookie(value) {
    var expires;
    var date = new Date();
    date.setTime(date.getTime() + (100 * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
    document.cookie = "URLS=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function delete_cookie( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getUrls(){
    if (document.cookie) {
	var json_str = getCookie('Urls');
	var arr = JSON.parse(json_str);
	return arr;
    } else  {
	return [];
    }
}

function storeUrls( urls ) {
    var json_str = JSON.stringify(urls);
    createCookie(json_str);
}

function getAllLinks( url ) {
    // request the youtube page of the current song
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    
    // create a DOM object from the HTML response
    var doc = document.implementation.createHTMLDocument("youtubePage");
    doc.documentElement.innerHTML = xhttp.responseText;

    // get the links of the current youtube page
    links = doc.links;
    var arr = [];
    for(var i = 0; i < links.length; i++) {
	if (~(links[i].indexOf(startUrl.concat("*")))){
	    arr.push(links[i].href);
	}
    }
    return arr;
}

function getRandomNextSong( url ){
    var links = getAllLinks( url );
    var s = links.length;
    var index = Math.floor(Math.random() * s);
    return links[index];
}

function reqListener () {
  console.log(this.responseText);
}

function update(requestDetails) {
    URLS = getUrls();
}

function redirect(requestDetails) {
    var url = requestDetails.url;
    console.log("Redirecting: " + url);
    var nextUrl = getRandomNextSong( url );
    return {
	redirectUrl: nextUrl
    };
}


function block(requestDetails){
    var curl = requestDetails.url;
    var url = curl.substring(0, curl.length - 6);
    URLS.push(url);
    storeUrls(URLS);
    var nextUrl = getRandomNextSong( url );
    console.log("Redirecting: " + url);
    return {
	redirectUrl: nextUrl
    };
}

function resetUrlList(requestDetails){
    delete_cookie('Urls');
}

browser.webRequest.onBeforeRequest.addListener(
    update,
    {urls:[startUrl]}
);

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls:URLS},
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    block,
    {urls:[patternBlock]},
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    resetUrlList,
    {urls:[patternReset]}
);
