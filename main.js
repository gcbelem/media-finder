import { 
  fetchList, 
  fetchSelection, 
  updateCard} 
from "./api.js";

import {
  mediaType,
  register,
  state} 
from "./directory.js";

import {
  updateBookmark
}
from "./collection.js"
import { buildElement } from "./home-script.js";

/*

BOOMARK ACTION

*/

function addToStorage (type,list) {
  const mediaRegister = register[type];
  const keyword = register.keyword;
  const current = mediaRegister.selectedData;

  const store = JSON.parse(localStorage.getItem(list) || "{}");

  if (!store[keyword]) {
    store[keyword] = [];
  }

  store[keyword].push({
    type: type,
    data: current
  });
  localStorage.setItem(list,JSON.stringify(store));
}

function alreadySeen (type) {
  const id = register[type].selectedId;
  const store = JSON.parse(localStorage.getItem("alreadySeen") || "[]");
  store.push(id);
  localStorage.setItem("alreadySeen", JSON.stringify(store));
};

function bookmarkMedia(type) {
  addToStorage(type, "bookmark");
  updateBookmark(register.keyword);
  alreadySeen(type);
  loadMedia(type);
}

/*

DISCARD ACTION 

*/

function discardMedia(type) {
  alreadySeen(type);
  loadMedia(type);
}

/*

LINK TO EXTERNAL MEDIA PAGE

*/

function exploreMedia(type) {
  const mediaRegister = register[type];
  const link = mediaRegister.externalLink;
  window.open(link, "_blank") // add link attributes
}

/*

CHECKING

*/

function checkDuplicate (type) {

  const mediaRegister = register[type];
  let id = register[type].selectedId;
  let attemptCount = 0;
  const maxAttempts = 50;

  const store = JSON.parse(localStorage.getItem("alreadySeen") || "[]");

  while (store.includes(id) && attemptCount < maxAttempts) {
    mediaRegister.counter++;
    checkCounter(type);
    id = register[type].selectedId;
    attemptCount++;
  };
  
  if (attemptCount >= maxAttempts) {
    state[type].hasError = true;
    return checkError(type);
  };
  return false;
};

function checkCounter(type) {
  const mediaRegister = register[type];
  const mediaState = state[type];

  if (mediaRegister.counter === mediaRegister.list.length) {
    mediaRegister.counter = 0;
    mediaState.mustFetchNextList = true;
    
    switch (type) {
      case "movie":
        return mediaRegister.page++;
      case "podcast":
        return null;
      case "book":
        return mediaRegister.startIndex += 10
    };

    fetchList(type);

  };
}

function checkKeyword (type) {
  const mediaRegister = register[type];
  const mediaState = state[type];
  const inputValue = document.querySelector("input").value

  if (inputValue !== register.keyword) {
    register.keyword = inputValue;
    mediaRegister.counter = 0;
    mediaState.hasError = false;
    mediaState.mustFetchNextList = true;

    switch (type) {
      case "movie":
        mediaRegister.page = 1;
        break
      case "podcast":
        //;
        break
      case "book":
        mediaRegister.startIndex = 0;
        break
    };
  };
}

/*

LOAD MEDIA

*/

async function loadMedia(type) {

  const mediaState = state[type];

  checkKeyword(type);

  if (mediaState.mustFetchNextList === true) {
    await fetchList(type);
    mediaState.mustFetchNextList = false;
  }

  if (checkDuplicate(type) === true) {
    return mediaState.hasError = true;
  };

  await fetchSelection(type);
  updateCard(type);
}

function checkError(type) {
  const mediaState = state[type];
  const mediaCard = document.querySelector(`#${type}-card`);

  if (mediaState.hasError === true) {
    mediaCard.classList.add("hidden");
    
    const errorCard = buildElement ({
      type: "div",
      id: `error-${type}`,
      className: "error-card",
      parent: document.querySelector(`#${type}-container`)
    });

    buildElement({
      type: "span",
      className: "material-symbols-outlined",
      text: "error",
      parent: errorCard
    });

    buildElement({
      type: "p",
      text: `No ${type}s to display.`,
      parent: errorCard
    });

      buildElement({
      type: "p",
      text: `Try a different search.`,
      parent: errorCard
    });
  } else {
      if (document.querySelector(`#error-${type}`)) {
        document.querySelector(`#error-${type}`).remove();
        mediaCard.classList.remove("hidden");
      };
  };  
}

/* SEARCH BAR */

const findButton = document.querySelector("#find-button");

findButton.addEventListener("click", () => {

  let findInput = document.querySelector("input").value;

  if (!findInput) {
    window.alert("No keyword")
  } else {
    mediaType.forEach(type => {
      const container = document.querySelector(`#${type}-container`);
      container.classList.remove("hidden");
      loadMedia(type);
      checkError(type);
    });
  };
})

export {
  bookmarkMedia,
  discardMedia,
  loadMedia,
  exploreMedia,
  checkError}