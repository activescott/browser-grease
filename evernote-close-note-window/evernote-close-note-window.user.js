// ==UserScript==
// @name        evernote-close-note-window
// @description When an evernote note is opened with a web link (https://...) AND the note is subsequently opened in an installed desktop evernote application, this script will close the browser window that evernote otherwise leaves open.
// @homepageURL https://github.com/activescott/browser-grease
// @supportURL  https://github.com/activescott/browser-grease/issues
// @license     Apache-2.0
// @namespace   activescott
// @include     https://www.evernote.com/shard/*
// @version     1.1
// @grant       none
// @run-at document-idle
// ==/UserScript==
function isEvernoteAppInstalled() {
    return window.__EVERNOTE_ACTIONBEAN__.appInstalled && !window.__EVERNOTE_ACTIONBEAN__.appNotInstalled;
}

function isItTimeToClose() {
    return document.readyState === 'complete';
}

function closeIt() {
    // it appears that so long as evernote scripts think the app is installed, evernote open's the app ASAP. So we wait on the doc and all scripts to completely load and close this window

    // by waiting on document.readyState we shouldn't need a long setTimeout delay. If this ever stops the note from opening in the app, increase the delay setTimeout should fix it.
    const delay = 100;
    console.log('closing after ', delay, 'ms...');
    setTimeout(() => { console.log('closing!'); window.close(); }, delay);
}

function main() {
    console.log('evernote-close-note-window GM script running at document.readyState=', document.readyState, 'isEvernoteAppInstalled=', isEvernoteAppInstalled(), 'isItTimeToClose=', isItTimeToClose());

    if (isEvernoteAppInstalled()) {
        // if app is installed close it as soon as we think evernote launched the app. If not installed, don't close it.
        if (isItTimeToClose()) {
            closeIt();
        }
        else {
            // if we're not ready yet, lets wait on the doc to complete loading everything (and thus evernote's script to launch app)...
            console.log('doc not ready (', document.readyState, '), registering onreadystatechange handler...');
            document.onreadystatechange = function() {
                console.log('onreadystatechange:', document.readyState);
                document.readyState === 'complete' && main();
            }
        }
    }
}

main();
