import {
  setMedia
}
from "./directory.js"

import {
  buildExploreUI,
  initializeSearch,
  initializeRandomKeyword,
  initializeAutocomplete
}
from "./explore-ui.js"

import {
  loadBookmarksFromStorage
}
from "./bookmark-ui.js"

/*

TOGGLE PAGE

*/

const pageList = ["home","explore","collection"];
export let pageScreens = {};

function registerPageScreens() {
  pageList.forEach(page => {
    pageScreens[page] = document.querySelector(`#${page}`);
  });
  showPage("home");
}

function showPage(pageName) {
  pageList.forEach(page => {
    const accessControl = pageScreens[page];
    if (page === pageName) {
      accessControl.classList.remove("is-hidden");
    } else {
      accessControl.classList.add("is-hidden");
    };
  });
}

function initializeNavigation() {
  pageList.forEach(page => {
    const link = document.querySelectorAll(`.js-go-${page}`);

    link.forEach(element => {
      element.addEventListener("click", () => {
        showPage(page)
      });
    });
  });
}

/*

HAMBURGUER MENU

*/

function setupHamburguerMenu() {
  const hamburguerIcon = document.querySelector("#menu-toggle");
  const navigationMenu = document.querySelector("nav");

  hamburguerIcon.addEventListener("click", () => {
    navigationMenu.classList.toggle("is-hidden");
  });
}

/*

BOOTSTRAP UI

*/

function bootstrapUI() {
  setMedia();
  registerPageScreens();
  initializeNavigation();
  setupHamburguerMenu();
  buildExploreUI();
  initializeSearch();
  initializeRandomKeyword();
  loadBookmarksFromStorage();
  initializeAutocomplete();
}

document.addEventListener("DOMContentLoaded", bootstrapUI);