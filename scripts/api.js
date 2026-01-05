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
  handleSpotifyAuthorization,
  checkValidToken
}
from "./spotify-authorization.js"

export async function parseApiResponse (type, data) {
// parses fetch response & updates error state.

  const mediaState = state[type];
  
  if (!data || !data.ok) {
    mediaState.hasError = true;
    return
  };
    
  const parsedData = await data.json();
  if (!parsedData) {
    mediaState.hasError = true;
    return
  };
  
  mediaState.hasError = false;
  return parsedData;
}

/*

AUTOCOMPLETE

*/

export async function fetchKeywordAutocomplete() {
// fetches and displays autocomplete suggestions based on user input.
  
try {
  const searchText = document.querySelector("#search-input")
  let typedText = searchText.value;

  if (!typedText.length) {
    return
  }

  const response = await fetch(`https://api.datamuse.com/words?sp=*${typedText}*`);
  
  if (!response.ok) {
    return
  }

  const autocompleteList = await response.json();   

  const existingBox = document.querySelector("#autocomplete-box");
  if (existingBox) {
    existingBox.remove();
  }
  
  const autocompleteContainer = buildElement({
    type: "div",
    id: "autocomplete-box",
    parent: document.querySelector("#search-bar")
    })      

  const maxSuggestions = 4;

  for (let i = 0; i < maxSuggestions && i < autocompleteList.length; i++) {
    const addRecommendation = buildElement({
      type: "span",
      className: "autocomplete-text",
      parent: autocompleteContainer
    })
    const word = autocompleteList[i].word
    addRecommendation.textContent = word;

    addRecommendation.addEventListener("click", () => {
      searchText.value = word;
      const autocompleteContainer = document.querySelector("#autocomplete-box");
      autocompleteContainer.remove();
    });
  };
}
  
  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/*

RANDOM KEYWORD 

*/

export async function fetchRandomKeyword() {
// fetches a random keyword.
  try {
    const getKeyword = await fetch("https://random-word-api.vercel.app/api?words=1");
    
    if (!getKeyword.ok) {
      mediaType.forEach(type => {
        const mediaState = state[type];
        mediaState.hasError = true;
        updateMediaCard(type);
      });
    }

    const parsedKeyword = await getKeyword.json();
    const randomKeyword = parsedKeyword[0];

    return randomKeyword;
  }

  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/* 

FETCH MEDIA LIST

*/

// Demo API keys for development and testing purposes.

const tmdbKey = "bedd5be9d96ca9abea707c3af61dd52b";

const googleBooksKey = "AIzaSyAKwOW5az8D5Iy8w5T0JkzCXA1qSZWYZEA";
// Protected by referrer restrictions.

export async function fetchMediaList (type) {
// fetches a list of media item for the active keyword.
  
  try {
    
    const mediaRegister = register[type];
    const mediaState = state[type];

    
    const keyword = register.keyword;
    const encodedKeyword = encodeURIComponent(keyword);

    let apiResponse = null;

    if (type === "movie") {
      const getGenreList = await fetch(
        `https://api.themoviedb.org/3/search/keyword?query=${keyword}&api_key=${tmdbKey}`);
  
      const genreData = await parseApiResponse(type,getGenreList);
      const keywordResponse = genreData.results[0];

      if (!keywordResponse) {
        return mediaState.hasError = true;
      }
  
      apiResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${mediaRegister.page}&sort_by=popularity.desc&with_keywords=${keywordResponse.id}&api_key=${tmdbKey}`
      );

    } else if (type == "podcast") {
      const token = localStorage.getItem("access_token");

      if (!token || !checkValidToken()) {
        await handleSpotifyAuthorization();
      }

      apiResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodedKeyword}&type=episode&market=US&limit=20&offset=${mediaRegister.offset}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    } else if (type == "book") {
      apiResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${keyword}&startIndex=${mediaRegister.startIndex}&key=${googleBooksKey}`
      );
    }

    const mediaList = await parseApiResponse (type,apiResponse);
    if (!mediaList) {
        return mediaState.hasError = true;
    }
    
    let parseMediaList = null;

    switch (type) {
      case "movie":
        parseMediaList = mediaList.results || [];
        break
      case "podcast":
        parseMediaList = mediaList.episodes?.items || [];
        break
      case "book":
        parseMediaList = mediaList.items || [];
        break
    }

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

export async function fetchMediaSelection(type) {
// retrieves detailed data for the currently selected media item.
  try { 
    let fetchData = null;
    const mediaRegister = register[type];
    const mediaState = state[type];

    if (mediaState.hasError === false) {
      if (type === "movie" || type === "book") {
        switch (type) {
          case "movie":
            fetchData = await fetch(
            `https://api.themoviedb.org/3/movie/${mediaRegister.selectedId}?api_key=${tmdbKey}`);
            break
          case "book":
            fetchData = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${mediaRegister.selectedId}?key=${googleBooksKey}`
            );
            break
        }

        const selectedMedia = await parseApiResponse (type, fetchData);
        return mediaRegister.selectedData = selectedMedia;

      } else if (type === "podcast") {
          return mediaRegister.selectedData =
          mediaRegister.list?.[mediaRegister.counter];
      }
    };
  }

  catch (error) {
    console.error('Error fetching data:', error);
  };
}


