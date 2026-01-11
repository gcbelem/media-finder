import {
    register
}
from "./directory.js"

import {
    buildElement
}
from "./utilities.js"

function createBookmarkSection (keyword) {
// creates a boomark collection section.
    const collectionScreen = document.querySelector("#collection");
    
    if (!document.querySelector(`#collection-${keyword}`)) {
        const newBookmarkCollection = buildElement({
            type: "div",
            className: "collection-container",
            id: `collection-${keyword}`,
            parent: collectionScreen
        });
    
        const overview = buildElement({
            type: "div",
            className: "bookmark-overview",
            parent: newBookmarkCollection
        });
    
        const bookmarkHeader = buildElement({
            type: "div",
            className: "bookmark-header",
            parent: overview
        })
        
        buildElement({
            type: "h3",
            text: keyword,
            className: "bookmark-title",
            parent: bookmarkHeader
        });

        const bookmarkList = getBookmarks();
        const entryListLength = bookmarkList[keyword].length;
        let entryCountText = null;

        (entryListLength > 1)
            ? entryCountText = "saved items"
            : entryCountText = "saved item"

        buildElement({
            type: "span",
            text: `${entryListLength} ${entryCountText}`,
            parent: bookmarkHeader
        })
    
        const expandButton = buildElement({
            type: "button",
            className: "expand-button",
            id: `${keyword}-expand`,
            parent: overview
        });
    
        const showEntriesButton = buildElement({
            type: "span",
            className: "material-symbols-outlined",
            text: "keyboard_arrow_down",
            parent: expandButton
        });

        const entryInfo = buildElement({
            type: "div",
            id: `${keyword}-info`,
            className: "collection-info",
            parent: newBookmarkCollection
        });

        showEntriesButton.addEventListener("click",() => {
            entryInfo.classList.toggle("is-hidden");
        });
    };
}

window.createBookmarkSection = createBookmarkSection

function toggleEmptyCollectionsMessage() {
// hides or displays an empty collection message.
    const collectionList = document.querySelectorAll(".collection-container");
    const displayEmptyCollection = document.querySelector("#collection-empty-state");
    if (collectionList.length === 0) {
        displayEmptyCollection.classList.remove("is-hidden");
    } else {
        displayEmptyCollection.classList.add("is-hidden");
    };
}

function getBookmarks() {
// retrieves the bookmark object from localStorage or returns an empty object.
    return JSON.parse(localStorage.getItem("bookmark") || "{}");
}

function saveBookmarks(data) {
// adds the bookmark object to localStorage.
    localStorage.setItem("bookmark", JSON.stringify(data));
}

function deleteBookmarkItem (keyword, index) {
// removes a bookmarked entry and updates UI accordingly.
    const bookmarkList = getBookmarks()
    const entry = bookmarkList[keyword]
    entry.splice(index, 1);

    loadBookmarksFromStorage();
    saveBookmarks(bookmarkList);
    
    if (entry.length === 0) {
        const emptyCollection = document.querySelector(`#collection-${keyword}`);
        emptyCollection.remove();
        toggleEmptyCollectionsMessage();
    };
}

function populateBookmarkEntries (keyword) {
// shows all bookmarked entries associated with a given keyword.
    const bookmarkList = getBookmarks();
    const entry = bookmarkList[keyword];

    const assignedCollection = document.querySelector(`#${keyword}-info`,);
        
    entry.forEach((item, index) => {
        if (!document.querySelector(`#bookmark-${keyword}-${index}`)) {
                        
            const bookmarkEntryContainer = buildElement({
                type: "div",
                className: "bookmark-entry",
                id: `bookmark-${keyword}-${index}`,
                parent: assignedCollection
            });

            const bookmarkEntryTop = buildElement({
            type: "div",
            className: "bookmark-top",
            parent: bookmarkEntryContainer
            });

            const typeIcon = buildElement({
                type: "span",
                className: "material-symbols-outlined",
                parent: bookmarkEntryTop
            });

            switch (item.type) {
                case "movie":
                    typeIcon.textContent = "movie";
                    break
                case "podcast":
                    typeIcon.textContent = "podcasts";
                    break
                case "book":
                    typeIcon.textContent = "book_2";
                    break
            };

            const bookmarkEntryHeader = buildElement({
                type: "div",
                className: "bookmark-entry-header",
                parent: bookmarkEntryTop
            })
            
            buildElement({
                type: "h4",
                className: "bookmark-entry-title",
                text: item.title,
                parent: bookmarkEntryHeader
            });
            
            createEntryOverview(bookmarkEntryContainer,item);  

            const buttonContainer = buildElement({
                type: "div",
                className: "entry-button",
                parent: bookmarkEntryContainer
            })


            const buttonIconList = ["open_in_new", "delete"];
    
            buttonIconList.forEach (action => {
                const button = buildElement({
                    type: "button",
                    className: "material-symbols-outlined",
                    text: action,
                    parent: buttonContainer
                });
    
                button.addEventListener("click", () => {
                    if (action === "delete") {
                        deleteBookmarkItem(keyword, index);
                        bookmarkEntryContainer.remove();
                    } else if (action === "open_in_new") {
                        const link = item.link;
                        window.open(link, "_blank");
                    }
                });
            });
        };
    });
};

function createEntryOverview (parent,entry) {
// builds an overview paragraph with expand/collapse behavior.

    const wrapper = buildElement({
        type: "span",
        className: "bookmark-entry-overview",
        parent
    });

    const entryText = document.createElement("span");
    wrapper.appendChild(entryText);

    const fullOverview = entry.overview;
    const words = fullOverview.trim().split(/\s+/);
    const maxOverviewLength = 30;

    if (words.length <= maxOverviewLength) {
        entryText.textContent = fullOverview;
        return;
    }

    const truncatedOverview = words.slice(0, maxOverviewLength).join(" ") + "...";
    entryText.textContent = truncatedOverview;

    const expandButton = buildElement({
        type: "button",
        className: "expand-entry-overview",
        text: "Show More",
        parent: wrapper
    });

    let isExpanded = false;

    expandButton.addEventListener("click", () => {
        isExpanded = !isExpanded;
        entryText.textContent = isExpanded ? fullOverview : truncatedOverview;
        expandButton.textContent = isExpanded ? "Show Less" : "Show More";
    });
}

export function renderBookmarkCollection (keyword) {
// ensures a bookmarked keyword and entries are rendered after user input.

    createBookmarkSection(keyword);
    populateBookmarkEntries(keyword);
    toggleEmptyCollectionsMessage();
};

export function loadBookmarksFromStorage() {
// updates all bookmarked objects from localStorage.
    const bookmarkList = getBookmarks();
    if (bookmarkList) {
        const keywordList = Object.entries(bookmarkList);
        keywordList.forEach(([keyword,value]) => {
            if (bookmarkList[keyword].length !== 0) {
            renderBookmarkCollection (keyword);
            };
        });
    };
};
