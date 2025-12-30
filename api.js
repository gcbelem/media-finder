import {
  mediaType,
  register,
  state} 
from "./directory.js";

import {
  checkError,
  resetMedia,
  startExplorer
}
from "./main.js"

import { 
  buildElement 
} from "./home-script.js";

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
  return parse;
}

/*

AUTOCOMPLETE

*/

async function fetchAutocomplete() {
  try {
    const searchText = document.querySelector("#search-input")
    let typedText = searchText.value;

    if (typedText.length === 0)
      return

    const getAutocompleteList = await fetch(`https://api.datamuse.com/words?sp=*${typedText}*`);
    if (!getAutocompleteList.ok)
      return

    const autocompleteList = await getAutocompleteList.json();   

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
      if (autocompleteContainer)
       autocompleteContainer.remove();
      })
    };
  }
  
  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/*

RANDOM KEYWORD 

*/

async function fetchKeyword() {
  try {

    const getKeyword = await fetch("https://random-word-api.vercel.app/api?words=1");
    if (!getKeyword.ok) {
      mediaType.forEach(type => {
        const mediaState = state[type];
        mediaState.hasError = true;
        return updateCard(type);
      });
    }

    const parsedKeyword = await getKeyword.json();
    const randomKeyword = parsedKeyword[0];

    resetMedia();
    register.keyword = randomKeyword;
    const searchText = document.querySelector("#search-input");
    searchText.value = randomKeyword;
    startExplorer();
  }

  catch (error) {
    console.error('Error fetching data:', error);
  };
}

/*

SPOTIFY AUTHORIZATION 

*/  

async function handleSpotifyAuthorization() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  
  const clientId = "e470d39d401c43719bbcddbef6ea1d01";

  if (checkValidToken() === true) {
    return;
  }

  if (localStorage.getItem("refresh_token")) {
    await refreshToken(clientId);
    return;
  }

  if (code) {
    await getToken(code, clientId);
    return;
  }

  await getAuthorization(clientId);
};

async function getAuthorization(clientId) {
  const codeVerifier = generateRandomString(64);
  const hashed = await encodeString(codeVerifier);
  const codeChallenge = base64Encode(hashed);

  localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: "http://127.0.0.1:5500/index.html",
    scope: "user-read-private user-read-email user-read-playback-position",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = authUrl.toString();
}
  
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

async function encodeString(plain) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
};

function base64Encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};
  
function checkValidToken() {
  const token = localStorage.getItem("access_token");
  const expiresAt = localStorage.getItem("expires_at");

  if (!token || !expiresAt) {
    return false;
  }

  return Date.now() < Number(expiresAt);
}

async function getToken(code, clientId) {
  const codeVerifier = localStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const redirectUri = 'http://127.0.0.1:5500/index.html';

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(url, payload);
  const response = await body.json();

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);
  localStorage.setItem(
    "expires_at",
    Date.now() + response.expires_in * 1000
  );
};

async function refreshToken(clientId) {
  const refreshToken = localStorage.getItem('refresh_token');
  const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem(
      "expires_at",
      Date.now() + response.expires_in * 1000
    );

    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    };
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
    const mediaState = state[type];

    
    const keyword = register.keyword;
    const encondedKeyword = encodeURIComponent(keyword);

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
      const token = localStorage.getItem("access_token");

      if (!token || !checkValidToken()) {
        await handleSpotifyAuthorization();
        return; 
      }

        apiResponse = await fetch(`https://api.spotify.com/v1/search?q=${encondedKeyword}&type=episode&market=US&limit=20&offset=${mediaRegister.offset}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
    });

    } else if (type == "book") {
      apiResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${keyword}&startIndex=${mediaRegister.startIndex}&key=${googleBooksKey}`
      );
    }

    const mediaList = await handleJSON (type,apiResponse);
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

async function fetchSelection(type) {
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

        const selectedMedia = await handleJSON (type, fetchData);
        return mediaRegister.selectedData = selectedMedia;

      } else if (type === "podcast") {
          return mediaRegister.selectedData =
          mediaRegister.list?.[mediaRegister.counter]
      }
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

export {
  fetchList,
  fetchSelection,
  fetchKeyword,
  fetchAutocomplete,
  updateCard
}
