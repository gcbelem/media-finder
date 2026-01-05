import {
  mediaType,
  register,
  state} 
from "./directory.js";

import { 
  buildElement 
} 
from "./utilities.js";

import {
  bookmarkMedia,  
  discardMedia,  
  exploreMedia,  
  handleRandomKeyword,  
  showNextMedia,
  resetAllMediaState
} 
from "./media-controller.js";

import { 
  throttleAction,
  debounceAction 
} 
from "./utilities.js";

import {
  advanceMedia,
  renderMediaErrorState
}
from "./media-controller.js";

import {
  fetchMediaList,
  fetchKeywordAutocomplete
}
from "./api.js";

/*

ADDING ELEMENTS

*/

export function buildExploreUI() {
  
  const mediaArea = document.querySelector("#media-area");

  mediaType.forEach (mediaType => {
    
    const mediaContainer = buildElement({
      type: "div", 
      className: "media-container hidden",
      id: `${mediaType}-container`,
      parent: mediaArea}
    );
    
    const mediaCard = buildElement({
      className: "media-card", 
      id: `${mediaType}-card`, 
      parent: mediaContainer}
    );

    buildElement({
      type: "h3", 
      id: `${mediaType}-title`,
      parent: mediaCard
    });
    
    buildElement({
      type: "span", 
      className: "media-year", 
      id: `${mediaType}-year`,
      parent: mediaCard
    });

    const mediaCover = buildElement({
      className: "media-cover", 
      id: `${mediaType}-cover`,
      parent: mediaCard
    });

    buildElement({
      type: "img", 
      className: "media-image", 
      id: `${mediaType}-image`, 
      parent: mediaCover});

    const mediaButtons = buildElement({
      className: "media-buttons", 
      id: `${mediaType}-buttons`, 
      parent: mediaCover
    });

    buildExploreButtons(mediaButtons, mediaType);

    const mediaInfo = buildElement({
      className: "media-info",
      parent: mediaCard
    });

    const mediaTime = buildElement({
      className: "media-time", 
      id: `${mediaType}-time`, 
      parent: mediaInfo
    });

    buildElement({
      type: "span", 
      className: "material-symbols-outlined", 
      text: "schedule", 
      parent: mediaTime
    });

    buildElement({
      type: "span", 
      id: `import-${mediaType}-time`, 
      parent: mediaTime
    });

    const mediaLabel = buildElement({
      className: "media-label", 
      id: `${mediaType}-label`, 
      parent: mediaInfo
    });

    buildElement ({type: "span", 
      id: `import-${mediaType}-label`, 
      parent: mediaLabel
    });

    buildElement({type: "span", 
      className: "material-symbols-outlined", 
      text: "sell", 
      parent: mediaLabel});
    
    const mediaOverview = 
    buildElement({
      type: "details", 
      className: "media-overview",
      parent: mediaCard
    });

    buildElement({
      type: "summary", 
      text: "summary", 
      parent: mediaOverview
    });

    buildElement({
      type: "p", 
      id: `${mediaType}-overview`, 
      parent: mediaOverview
    });
  });
};

/*

UPDATE DISPLAY CARDS

*/

export function updateMediaCard (type) {
// updates the media display card.

  const mediaRegister = register[type];
  const mediaState = state[type];
  const domPath = {
      title: `#${type}-title`,
      year: `#${type}-year`,
      image: `#${type}-image`,
      time: `#import-${type}-time`,
      label: `#import-${type}-label`,
      overview: `#${type}-overview`
  };

  if (mediaState.hasError === true) {
    return renderMediaErrorState(type);
  } else {
    renderMediaErrorState(type);
    
    Object.entries(domPath).forEach(([apiItem, path]) => {
      const updateElement = document.querySelector(path);
  
      switch (apiItem) {
        case "title":
          updateElement.textContent = mediaRegister.selectedTitle;
          break
        case "year":
          updateElement.textContent = mediaRegister.selectedYear;
          break
        case "image":
          const safeImage = mediaRegister.selectedImage.replace(/^http:/, "https:");
          updateElement.setAttribute("src", safeImage);
          break
        case "time":
          if (type === "book") {
            return updateElement.textContent = `${mediaRegister.selectedTime} pages`;
          } else {
              return updateElement.textContent = `${mediaRegister.selectedTime} minutes`;
          };
        case "label":
          updateElement.textContent = mediaRegister.selectedLabel;
          break
        case "overview":
          updateElement.textContent = mediaRegister.selectedOverview;
          break
      };
    });
  };
};

/*

SEARCH BAR

*/

export function initializeSearch() {
  const findButton = document.querySelector("#find-button");
  
  findButton.addEventListener("click", () => {
    const userInput = document.querySelector("input").value;

    if (!userInput) {
      return window.alert ("No keyword!")
    };

    const currentInput = register.keyword;
    
    if (userInput !== currentInput) {
      resetAllMediaState();
      register.keyword = userInput;
    };

    startMediaExplorer();
  });
}

export async function startMediaExplorer () {
  for (const type of mediaType) {
    const container = document.querySelector(`#${type}-container`);
    container.classList.remove("hidden");
    await fetchMediaList(type);
    advanceMedia(type);
  };
}

export function initializeRandomKeyword() {
  const randomSearchButton = document.querySelector("#random-input");

  randomSearchButton.addEventListener("click",() => {
    handleRandomKeyword();
  });
}

/*

AUTOCOMPLETE

*/

export async function initializeAutocomplete() {
  const searchInput = document.querySelector("#search-input");
  const debounceAutocomplete = debounceAction(fetchKeywordAutocomplete);
  
  searchInput.addEventListener("input", () => {
    const autocompleteContainer = document.querySelector("#autocomplete-box");
    if (autocompleteContainer)
      autocompleteContainer.remove();
  
    if (searchInput.value != null)
     debounceAutocomplete();
  });
}


/*

MEDIA EXPLORATION BUTTONS

*/

const explorationButtons = {
  bookmark: { icon: "favorite", action: (type) => throttleAction(() => bookmarkMedia(type)) },
  discard: { icon: "delete", action: (type) => throttleAction(() => discardMedia(type)) },
  shuffle: { icon: "autorenew", action: (type) => throttleAction(() => showNextMedia(type)) },
  explore: { icon: "open_in_new", action: exploreMedia }
}

function buildExploreButtons (parent, mediaType) {

  Object.entries(explorationButtons).forEach(([name, info]) => {
    const button = buildElement({
      type: "button",
      className: name,
      id: `${name}-${mediaType}`,
      parent: parent
    });
  
    buildElement({
      type: "span",
      className: "material-symbols-outlined",
      text: info.icon,
      parent: button
    });
  
    button.addEventListener("click", () => {
      info.action(mediaType)();
   });
  });
}