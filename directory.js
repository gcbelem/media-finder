const mediaType = ["movie", "podcast","book"]

/* 
MEDIA DIRECTORY 
*/
let register = {};
let state = {};

function setMedia() {
    
    register.keyword = "";

    const storedInfo = [
        "bookmark",
        "alreadySeen"
    ];

    storedInfo.forEach(property => {
        Object.defineProperty(register, property, {
                get() {
                    return JSON.parse(localStorage.getItem(property) || "{}");
                }
        });
    });

    mediaType.forEach(type => {
        
        register[type] = {
            counter: 0,
            list: [],
            selectedData: null
        };

        defineMediaGetters(type);   
        setMediaSpecifics(type);
        
        state[type] = {
            hasError: false,
            isLoading: false,
            mustfetchNextMedia: true,
            mustFetchNextList: true
        };
    });
}

function defineMediaGetters(type) {
    Object.defineProperties(register[type], {
    
      selected: {
      get() {
        return this.list?.[this.counter] || null;
      }
    },

    selectedId: {
      get() {
        return this.list?.[this.counter]?.id || null;
      }
    },

    selectedPath: {
      get() {
        const media = this.selectedData ?? {};

        return {
          title: media.title || 
            media.volumeInfo?.title || 
            media.name || 
            null,

          year:
            media.release_date?.split("-")?.[0] ||
            media.volumeInfo?.publishedDate?.split("-")?.[0] ||
            media.release_date?.split("-")?.[0] || 
            null,

          image:
            media.volumeInfo?.imageLinks?.medium ||
            media.volumeInfo?.imageLinks?.large ||
            media.volumeInfo?.imageLinks?.thumbnail ||
            (media.poster_path
              ? `https://image.tmdb.org/t/p/w500/${media.poster_path}`
              : null) ||
            media.images?.[0]?.url ||
            null,

          time: media.runtime || 
            media.volumeInfo?.pageCount ||
            Math.round(media.duration_ms / 60000) ||
            null,

          label:
            media.genres?.[0]?.name ||
            media.volumeInfo?.categories?.[0]?.split("/")?.[0] ||
            media.type ||
            null,

          overview: media.overview || 
            media.volumeInfo?.description || 
            media.description ||
            null,

          link: media.volumeInfo?.infoLink || 
            media.external_urls?.spotify ||
            null
        };
      }
    },

    selectedTitle: {
      get() {
        return this.selectedPath.title;
      }
    },

    selectedYear: {
      get() {
        return this.selectedPath.year;
      }
    },

    selectedImage: {
      get() {
        return this.selectedPath.image;
      }
    },

    selectedTime: {
      get() {
        return this.selectedPath.time;
      }
    },

    selectedLabel: {
      get() {
        return this.selectedPath.label;
      }
    },

    selectedOverview: {
      get() {
        return this.selectedPath.overview;
      }
    },

    externalLink: {
      get() {
        return this.selectedPath.link;
      }
    }
  });
}

function setMediaSpecifics (type) {
    const mediaPath = register[type];

    if (type == "movie") {
        const movieData = {
            page: {
            value: 1, 
              writable: true,
              enumerable: true,
              configurable: true
            } 
        };
        Object.defineProperties(mediaPath, movieData);
    };

        if (type == "podcast") {
        const podcastData = {
            offset: {
              value: 0,
              writable: true,
              enumerable: true,
              configurable: true
            }
        };
        Object.defineProperties(mediaPath, podcastData);
    };

        if (type == "book") {
        const bookData = {
            startIndex: {
            value: 0, 
              writable: true,
              enumerable: true,
              configurable: true
            }
        };
        Object.defineProperties(mediaPath, bookData);
    };
}

// debugging
window.register = register;
window.state = state;

// let {register, state} = setMedia();
setMedia();
export {
    mediaType,
    register, 
    state
};