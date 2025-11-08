import {
  register,
  state} 
from "./directory.js";

import {
  checkError
}
from "./main.js"

async function handleJSON(type,data) {
  const mediaState = state[type];
  
  if (!data || !data.ok) {
    return mediaState.hasError = true;
  };
    
  const parse = await data.json();
  if (!parse) {
    return mediaState.hasError = true;
  };
  
  mediaState.hasError = false;
  return parse
}

/* 

FETCH MEDIA LIST

*/

// Demo API keys for development and testing purposes.

const tmdbKey = "bedd5be9d96ca9abea707c3af61dd52b";

const googleBooksKey = "AIzaSyAKwOW5az8D5Iy8w5T0JkzCXA1qSZWYZEA";
// Protected by referrer restrictions.

async function fetchList(type) {
  
  
  try {
    
    const mediaRegister = register[type];
    const keyword = register.keyword;
    const mediaState = state[type];

    let apiResponse = null;

    if (type === "movie") {
      const getGenreList = await fetch(
        `https://api.themoviedb.org/3/search/keyword?query=${keyword}&api_key=${tmdbKey}`);
  
      const genreData = await handleJSON(type,getGenreList);
      const keywordResponse = genreData.results[0];

      if (!keywordResponse) {
        return mediaState.hasError = true;
      }
  
      apiResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${mediaRegister.page}&sort_by=popularity.desc&with_keywords=${keywordResponse.id}&api_key=${tmdbKey}`
      );

    } else if (type == "podcast") {

    } else if (type == "book") {
      apiResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${keyword}&startIndex=${mediaRegister.startIndex}&key=${googleBooksKey}`
      );
    }

    const mediaList = await handleJSON (type,apiResponse);
    if (!mediaList) {
        return mediaState.hasError = true;
    }
    const parseMediaList = mediaList.results || mediaList.items;

    if (!parseMediaList || parseMediaList.length === 0) {
      mediaState.hasError = true;
    } 

    mediaRegister.list = parseMediaList;
    return mediaRegister.list;
  }

  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/* 

FETCH SELECTED MEDIA INFO

*/

async function fetchSelection(type) {
  try { 
    let fetchData = null;
    const mediaRegister = register[type];
    const mediaState = state[type];

    if (mediaState.hasError === false) {
      switch (type) {
        case "movie":
          fetchData = await fetch(
            `https://api.themoviedb.org/3/movie/${mediaRegister.selectedId}?api_key=${tmdbKey}`);
          break
        case "podcast":
          fetchData = null;
          break
        case "book":
          fetchData = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${mediaRegister.selectedId}?key=${googleBooksKey}`
          );
          break
      };
      const selectedMedia = await handleJSON (type, fetchData);
      return mediaRegister.selectedData = selectedMedia;
    };
  }

  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/*

UPDATE DISPLAY CARDS

*/

function updateCard(type) {
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
    return checkError(type);
  } else {
    checkError(type);
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
          updateElement.textContent = mediaRegister.selectedTime;
          break
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

export {
  fetchList,
  fetchSelection,
  updateCard
}
