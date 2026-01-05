export const mediaType = ["movie", "podcast","book"]

/* 

MEDIA DIRECTORY 

*/

export let register = {};
// store & manage API data.

export let state = {};
// control flow & dictate UI state.

export function setMedia() {
// initializes the media registry and UI state for all supported media types.
    
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
            mustFetchNextList: true
        };
    });
}

function defineMediaGetters(type) {
// defines getters that normalize media data across different APIs.

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
            "Title unavailable.",

          year:
            media.release_date?.split("-")?.[0] ||
            media.volumeInfo?.publishedDate?.split("-")?.[0] ||
            media.release_date?.split("-")?.[0] || 
            "-",

          image:
            media.volumeInfo?.imageLinks?.medium ||
            media.volumeInfo?.imageLinks?.large ||
            media.volumeInfo?.imageLinks?.thumbnail ||
            media.images?.[0]?.url ||
            `https://image.tmdb.org/t/p/w500/${media.poster_path}` ||
            null,

          time: media.runtime || 
            media.volumeInfo?.pageCount ||
            Math.round(media.duration_ms / 60000) ||
            "-",

          label:
            media.genres?.[0]?.name ||
            media.volumeInfo?.categories?.[0]?.split("/")?.[0] ||
            media.type ||
            "-",

          overview: media.overview || 
            media.volumeInfo?.description || 
            media.description ||
            "Summary unavailable.",

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
// handles pagination properties specific to each media type.
    
  const media = register[type];
  const startFrom = {
    movie: {page: 1},
    podcast: {offset: 0},
    book: {startIndex: 0}
  };

  const setPagination = startFrom[type];

  const descriptors = Object.fromEntries(
    Object.entries(setPagination).map(([key, value]) => [
      key, 
      {
        value,
        writable: true,
        enumerable: true,
        configurable: true
      }
    ])
  );

    Object.defineProperties(media, descriptors);
}
// initializes media registry and state objects.