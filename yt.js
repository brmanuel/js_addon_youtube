var PATTERN_BLOCK = "*://*.youtube.com/*/block";  // append '/block' to urls of songs you want to block and press enter
var PATTERN_RESET = "*://*.youtube.com/*/reset"; // appent '/reset' to any youtube url in order to reset the list of blocked urls
var YOUTUBE_STARTPAGE = "https://www.youtube.com/";
var ANY_YOUTUBE_ADDRESS = "*://*.youtube.com/*";
var ANY_YOUTUBE_SONG = "*://*.youtube.com/watch?*";

var BlockedUrls = [];
var PageUrls = [];

var request = require('request');
var cheerio = require('cheerio');


function createCookie( value ) {
    var expires;
    var date = new Date();
    date.setTime(date.getTime() + (100 * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
    document.cookie = "BlockedUrls=" + value + expires + "; path=/";
}

function getCookie( cookieName ) {
    if (document.cookie.length > 0) {
        cookieStart = document.cookie.indexOf(cookieName + "=");
        if (cookieStart != -1) {
            cookieStart = cookieStart + cookieName.length + 1;
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            return unescape(document.cookie.substring(cookieStart, cookieEnd));
        }
    }
    return "";
}

function deleteCookie( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getUrlsFromCookie(){
    if (document.cookie) {
	var json_str = getCookie('Urls');
	var arr = JSON.parse(json_str);
	return arr;
    } else  {
	return [];
    }
}

function storeUrlsInCookie( ArrayOfUrls ) {
    var json_str = JSON.stringify(ArrayOfUrls);
    createCookie(json_str);
}

function prepareNextSong( requestDetails ) {

    console.log("Visiting page " + url);
    request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
	var $ = cheerio.load(body);
	var links = $.links;
  });
    
    // request the youtube page of the current song
    /*var xhttp = new XMLHttpRequest();
    xhttp.open("GET", requestDetails.url, true);
    
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
            // create a DOM object from the HTML response
	    var doc = document.implementation.createHTMLDocument("youtubePage");
	    doc.documentElement.innerHTML = xhttp.responseText;
	    
	    // get the links of the current youtube page
	    links = doc.links;
	    pageUrls = [];
	    for(var i = 0; i < links.length; i++) {
		if (~(links[i].indexOf(ANY_YOUTUBE_SONG))){ // is element i of links a link to a youtube song?
		    pageUrls.push(links[i].href);
		}
	    }
        }
    };
    xhttp.send();*/
}

function playRandomNextSong( arrayOfSongLinks ){
    var s = arrayOfSongLinks.length;
    var index = Math.floor(Math.random() * s);
    return arrayOfSongLinks[index];
}

function reqListener () {
  console.log(this.responseText);
}

function update( requestDetails ) {
    BlockedUrls = getUrlsFromCookie();
}

function redirect( requestDetails ) {
    var url = requestDetails.url;
    console.log("Redirecting: " + url);
    var nextUrl = getRandomNextSong( url );
    return {
	redirectUrl: nextUrl
    };
}

function block( requestDetails ){
    var curl = requestDetails.url;
    var url = curl.substring(0, curl.length - 6);
    BlockedUrls.push(url);
    storeUrlsInCookie(BlockedUrls);
    var nextUrl = playRandomNextSong(pageUrls);
    console.log("Redirecting: " + url);
    return {
	redirectUrl: nextUrl
    };
}

function resetUrlList( requestDetails ){
    delete_cookie('Urls');
}

// get the list of blocked urls from storage when starting youtube (on startpage).
browser.webRequest.onBeforeRequest.addListener(
    update,
    {urls:[YOUTUBE_STARTPAGE]}
);

// redirect the requested url to anoter url if this url is blocked
browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls:BlockedUrls},
    ["blocking"]
);

// prepare a song to play in case the next autoplayed song is blocked
browser.webRequest.onCompleted.addListener(
    prepareNextSong,
    {urls:[ANY_YOUTUBE_SONG]}
);

// add a url to the list of blocked urls
browser.webRequest.onBeforeRequest.addListener(
    block,
    {urls:[PATTERN_BLOCK]},
    ["blocking"]
);

// delete the list of all blocked urls.
browser.webRequest.onBeforeRequest.addListener(
    resetUrlList,
    {urls:[PATTERN_RESET]}
);
