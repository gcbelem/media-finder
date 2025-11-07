import {
  mediaType} 
from "./directory.js";

import {
  buildElement
}
from "./home-script.js"

import {
  bookmarkMedia,  
  discardMedia,  
  exploreMedia,  
  loadMedia} 
from "./main.js";

/*

ADDING ELEMENTS

*/

function addExploreElements() {
  
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

    /*
    const loadingCard = buildElement({
      className: "loading-card", 
      id:`${mediaType}-loading`, 
      parent: mediaContainer
    });
    buildElement({
      className: "loading-circle", 
      parent: loadingCard
    });
    */

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
    addButtons(mediaButtons, buttonAction, mediaType);

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
    // mediaTime and mediaLabel can be done with a single function
    
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

window.addEventListener("DOMContentLoaded", () => {
  addExploreElements()
});

/*

ADDING BUTTONS

*/

const buttonAction = [
    "bookmark",
    "discard", 
    "shuffle",
    "explore"
  ];

const assignedFunctions = {
  "bookmark": bookmarkMedia,
  "discard": discardMedia,
  "shuffle": loadMedia,
  "explore": exploreMedia
}

function addButtons(mediaButtons, actions, type) {

  const buttonIconName = [
    "favorite",
    "delete", 
    "autorenew",
    "open_in_new"
  ];

  actions.forEach((action, index) => {
    const button = buildElement({
      type: "button",
      className: `${action}`,
      id: `${action}-${type}`,
      parent: mediaButtons
    });

    buildElement({
      type: "span",
      className: "material-symbols-outlined",
      text: buttonIconName[index],
      parent: button
    });

    button.addEventListener("click", () => {
      assignedFunctions[action]
      ? assignedFunctions[action](type)
      : window.alert("error")
    });
  });
}

/*

LOADING

*/

export {
  addExploreElements,
  assignedFunctions
}