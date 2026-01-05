import { 
  fetchMediaList, 
  fetchMediaSelection,
  fetchKeywordAutocomplete, 
  fetchRandomKeyword
} 
from "./api.js";

import {
  mediaType,
  register,
  state} 
from "./directory.js";

import {
  renderBookmarkCollection
}
from "./bookmark-ui.js"

import { 
  buildElement 
} 
from "./utilities.js";

import {
  startMediaExplorer,
  updateMediaCard
}
from "./explore-ui.js";

/*

BOOMARK ACTION

*/

function saveToStorage(type, storageKey) {
// stores the currently selected media under the active keyword.

  const media = register[type];
  const keyword = register.keyword;
  const currentMedia = media.selectedData;

  const store = JSON.parse(localStorage.getItem(storageKey) || "{}");

  if (!store[keyword]) {
    store[keyword] = [];
  }

  store[keyword].push({
    type: type,
    data: currentMedia
  });
  localStorage.setItem(storageKey, JSON.stringify(store));
}

function markAsSeen(type) {
// tracks media IDs to prevent duplicates.

  const id = register[type].selectedId;
  const seenIds = JSON.parse(localStorage.getItem("markAsSeen") || "[]");
  seenIds.push(id);
  localStorage.setItem("markAsSeen", JSON.stringify(seenIds));
};

export function bookmarkMedia(type) {
// saves bookmarked media object and moves to the next item.

  saveToStorage(type, "bookmark");
  renderBookmarkCollection(register.keyword);
  markAsSeen(type);
  advanceMedia(type);
}

/*

DISCARD ACTION 

*/

export function discardMedia(type) {
// skips current media and saves ID to avoid repetition.

  markAsSeen(type);
  advanceMedia(type);
}

/*

LINK TO EXTERNAL MEDIA PAGE

*/

export function exploreMedia(type) {
// opens the external media source in a new tab.

  const mediaRegister = register[type];
  const link = mediaRegister.externalLink;
  window.open(link, "_blank") // add link attributes
}

/*

DISPLAY NEXT

*/

export function showNextMedia (type) {
// advances to the next media item, fetching more if needed.

  advanceMediaCounter(type);
  advanceMedia(type);
}

/*

RESET MEDIA STATE

*/

export async function resetAllMediaState() {
// resets every media list for a new search.

  mediaType.forEach(type => {
    const media = register[type];
    const mediaState = state[type];
   
    media.list = [];
    media.counter = 0;
    mediaState.hasError = false;
  
    switch (type) {
      case "movie":
        media.page = 1;
        break
      case "podcast":
        media.offset = 0;
        break
      case "book":
        media.startIndex = 0;
        break
    };
  });
}

/*

SKIP DUPLICATES & SHOW NEW MEDIA ITEM

*/

async function skipIfDuplicate(type) {
// skips media already seen by the user.

  let id = register[type].selectedId;
  let attemptCount = 0;
  const maxAttempts = 50;

  const store = JSON.parse(localStorage.getItem("markAsSeen") || "[]");

  while (store.includes(id) && attemptCount < maxAttempts) {
    await advanceMediaCounter(type);
    id = register[type].selectedId;
    attemptCount++;
  };
  
  if (attemptCount >= maxAttempts) {
    state[type].hasError = true;
    return true;
  };
  return false;
};

function advanceMediaCounter(type) {
// increments media index and flag when a new list must be fetched.

  const media = register[type];
  const mediaState = state[type];

  media.counter++;

  if (media.counter >= media.list.length) {
    mediaState.mustFetchNextList = true;
    };
};

/*

DISPLAY NEW MEDIA

*/

export async function advanceMedia(type) {
// fetches and displays the next media item for a given type.

  const media = register[type];
  const mediaState = state[type];
  
  if (await skipIfDuplicate(type) === true) {
    return mediaState.hasError = true;
  };

  if (mediaState.mustFetchNextList === true) {
    media.counter = 0;

    switch (type) {
      case "movie":
        media.page++;
        break
      case "podcast":
        media.offset += 20;
        break
      case "book":
        media.startIndex += 10
        break
    };
    await fetchMediaList(type);
    mediaState.mustFetchNextList = false;
  };

  await fetchMediaSelection(type);
  updateMediaCard(type);
}

export function renderMediaErrorState(type) {
// shows or removes the error UI based on media state.
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

/*

RANDOM KEYWORD 

*/

export async function handleRandomKeyword() {
// triggers new search using a random keyword.
  resetAllMediaState();
  
  register.keyword = await fetchRandomKeyword();
  startMediaExplorer();
  
  
  fetchRandomKeyword();
}
