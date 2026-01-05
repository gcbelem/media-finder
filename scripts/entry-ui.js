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
    pageScreens[page] = document.querySelector(`#${page}-screen`);
  });
  showPage("home");
}

function showPage(pageName) {
  pageList.forEach(page => {
    const accessControl = pageScreens[page];
    if (page === pageName) {
      accessControl.classList.remove("hidden");
    } else {
      accessControl.classList.add("hidden");
    };
  });
}

function initializeNavigation() {
  pageList.forEach(page => {
    const link = document.querySelectorAll(`.go-${page}`);

    link.forEach(element => {
      element.addEventListener("click", () => {
        showPage(page)
      });
    });
  });
}

/*

DROPDOWN MENU

*/

function setupDropdownMenu() {
  const dropdownIcon = document.querySelector("#dropdown-menu");
  const navigationMenu = document.querySelector("#navlinks");

  dropdownIcon.addEventListener("click", () => {
    navigationMenu.classList.toggle("hidden");
  });
}

/*

BOOTSTRAP UI

*/

function bootstrapUI() {
  setMedia();
  registerPageScreens();
  initializeNavigation();
  setupDropdownMenu();
  buildExploreUI();
  initializeSearch();
  initializeRandomKeyword();
  loadBookmarksFromStorage();
  initializeAutocomplete();
}

document.addEventListener("DOMContentLoaded", bootstrapUI);