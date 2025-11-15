import { 
  fetchList, 
  fetchSelection, 
  fetchKeyword,
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

import { 
  buildElement 
} 
from "./home-script.js";

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

async function resetMedia() {
  mediaType.forEach(type => {
    const mediaRegister = register[type];
    const mediaState = state[type];
   
    mediaRegister.list = [];
    mediaRegister.counter = 0;
    mediaState.hasError = false;
  
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
  });
}

async function checkDuplicate(type) {

  let id = register[type].selectedId;
  let attemptCount = 0;
  const maxAttempts = 50;

  const store = JSON.parse(localStorage.getItem("alreadySeen") || "[]");

  while (store.includes(id) && attemptCount < maxAttempts) {
    await checkCounter(type);
    id = register[type].selectedId;
    attemptCount++;
  };
  
  if (attemptCount >= maxAttempts) {
    state[type].hasError = true;
    return true;
  };
  return false;
};

function checkCounter(type) {
  const mediaRegister = register[type];
  const mediaState = state[type];

  mediaRegister.counter++;

  if (mediaRegister.counter >= mediaRegister.list.length) {
    mediaState.mustFetchNextList = true;
    };
};

/*

LOAD MEDIA

*/

async function loadMedia(type) {

  const mediaRegister = register[type];
  const mediaState = state[type];
  
  if (await checkDuplicate(type) === true) {
    return mediaState.hasError = true;
  };

  if (mediaState.mustFetchNextList === true) {
    mediaRegister.counter = 0;

    switch (type) {
      case "movie":
        mediaRegister.page++;
        break
      case "podcast":
        null;
        break
      case "book":
        mediaRegister.startIndex += 10
        break
    };
    await fetchList(type);
    mediaState.mustFetchNextList = false;
  }

  await fetchSelection(type);
  updateCard(type);

}

function checkError(type) {
  const mediaState = state[type];
  const mediaCard = document.querySelector(`#${type}-card`);
  const container = document.querySelector(`#${type}-container`);
  const existingError = document.querySelector(`#error-${type}`);

  if (mediaState.hasError === true) {
    mediaCard.classList.add("hidden");

    if (!existingError) {
      const errorCard = buildElement({
        type: "div",
        id: `error-${type}`,
        className: "error-card",
        parent: container
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
    };

  } else {
    const errorCard = document.querySelector(`#error-${type}`);
    if (errorCard) {
      errorCard.remove();
    }
    mediaCard.classList.remove("hidden");
  }
}
  
/* SEARCH BAR */

async function startExplorer () {
  for (const type of mediaType) {
    const container = document.querySelector(`#${type}-container`);
    container.classList.remove("hidden");
    await fetchList(type);
    loadMedia(type)
  };
}


const findButton = document.querySelector("#find-button");

findButton.addEventListener("click", () => {

  const userInput = document.querySelector("input").value;

  if (!userInput) {
    return window.alert ("No keyword!")
  };

  const currentInput = register.keyword;
  
  if (userInput !== currentInput) {
    resetMedia();
    register.keyword = userInput;
  };

  startExplorer();
});

const randomButton = document.querySelector("#random-input")

randomButton.addEventListener("click",() => {
  fetchKeyword();
})

/* THROTTLING */

function throttleQuery (action) {
  let cooldown = null;
  const delay = 750;

  return (...args) => {
    if (!cooldown) {
      action (...args);
      cooldown = setTimeout(() => {
        cooldown = null
      }, delay);
    };
  };
}

/* DEBOUNCING */

// TO BE ADDED

export {
  resetMedia,
  bookmarkMedia,
  discardMedia,
  loadMedia,
  exploreMedia,
  throttleQuery,
  startExplorer,
  checkError}