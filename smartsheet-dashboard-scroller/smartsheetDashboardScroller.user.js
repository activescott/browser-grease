// ==UserScript==
// @name        Smartsheet Dashboard Scroller
// @description Create a Kiosk or information radiator out of Smartsheet Dashboards. This script adds a new toolbar button to Smartsheet Dashboards to add an auto-scrolling feature that scrolls to each Title widget and pauses for one minute.
// @icon        https://github.com/activescott/browser-grease/raw/master/smartsheet-dashboard-scroller/icon.png
// @homepageURL https://github.com/activescott/browser-grease
// @supportURL  https://github.com/activescott/browser-grease/issues
// @license     Apache-2.0
// @namespace   activescott
// @version     1.1
// @grant       none
// @run-at document-idle
// @match       https://app.smartsheet.com/dashboards/*
// ==/UserScript==

Promise.delay = n => new Promise(resolve => setTimeout(resolve, n))

function getDashboardTitleWidgets() {
  return Array.from(
    document.querySelectorAll(".clsDashboardTitleWidget")
  ).filter(t => t.innerText)
}

function uniqBy(array, mapper) {
  let dict = {}
  array.forEach(item => (dict[mapper(item)] = item))
  return Object.values(dict)
}

function scrollerThunk() {
  let titles = getDashboardTitleWidgets()
  console.log(`found ${titles.length} titles`, titles)
  titles = uniqBy(titles, title => title.getBoundingClientRect().top)
  titles.sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
  )
  console.log(`found ${titles.length} unique titles:`, titles)
  let seconds = 60
  let result = window.prompt(
    "How many seconds should it pause on each title widget?",
    seconds.toString()
  )
  seconds = Number.isNaN(Number.parseFloat(result))
    ? seconds
    : Number.parseFloat(result)
  console.log("result seconds:", seconds)
  let scroller = async () => {
    while (true) {
      for (let t of titles) {
        if (!window.activeScroller) {
          console.log("aborting scroller; No activeScroller.")
          return
        }
        if (getDashboardTitleWidgets().length == 0) {
          console.log("aborting scroller; No active title widgets.")
          return
        }
        console.log(
          "scrolling to title:",
          t.innerText,
          t.getBoundingClientRect().top
        )
        let scrollOptions = {
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        }
        t.scrollIntoView(scrollOptions)
        await Promise.delay(seconds * 1000)
      }
    }
  }
  return scroller
}

function toggleScroller() {
  const button = document.querySelector("#dashboardScrollerButton")
  if (window.activeScroller) {
    window.activeScroller = null
    button.style.setProperty("border-style", "")
    button.style.setProperty("border-width", "1px")
  } else {
    window.activeScroller = scrollerThunk()
    window.activeScroller()
    button.style.setProperty("border-style", "inset")
    button.style.setProperty("border-width", "3px")
  }
}

async function addScrollButton() {
  if (document.querySelector("#dashboardScrollerButton")) {
    return
  }
  console.log("addScrollButton waiting for toolbar to init...")
  await Promise.delay(2000)

  let button = document.createElement("div")
  button.setAttribute("id", "dashboardScrollerButton")
  button.className =
    "clsBorderBox clsButton clsTertiaryLightActionButton clsDashboardToolbarButton"
  button.style.cssText =
    "position: relative; width: 39px; height: 30px; display: block;"

  const buttonContent = document.createElement("div")
  buttonContent.className = "clsButtonContent"
  buttonContent.style.cssText =
    "position: relative; width: 100%; height: 100%; flex-direction: row-reverse;"

  const span = document.createElement("span")
  span.className = "clsImageRenderingOptimization"
  span.style.cssText = "overflow: hidden; font-size: x-large;"
  span.innerText = "🎬"

  buttonContent.appendChild(span)
  button.appendChild(buttonContent)

  const toolbar = document.querySelector(
    "div.clsDashboardEditorToolbar > div.clsFlexContainer"
  )
  if (toolbar) {
    console.log("Dashboard scroller toolbar exists!")
    toolbar.appendChild(button)
    button.addEventListener("click", toggleScroller)
  } else {
    console.log("Dashboard scroller toolbar not found!")
  }
}

if (document.readyState === "loading") {
  // Loading hasn't finished yet
  console.log("Dashboard scroller listening...")
  document.addEventListener("DOMContentLoaded", addScrollButton)
} else {
  // `DOMContentLoaded` has already fired
  addScrollButton()
}
