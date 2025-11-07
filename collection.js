import {
    buildElement
}
from "./home-script.js"

function createBookmark (keyword) {
    const collectionScreen = document.querySelector("#collection-screen");
    
    if (!document.querySelector(`#collection-${keyword}`)) {
        const newBookmark = buildElement({
            type: "div",
            className: "collection-container",
            id: `collection-${keyword}`,
            parent: collectionScreen
        });
    
        const overview = buildElement({
            type: "div",
            className: "bookmark-overview",
            parent: newBookmark
        });
    
        buildElement({
            type: "h3",
            text: keyword,
            className: "bookmark-title",
            parent: overview
        });
    
        const expandButton = buildElement({
            type: "button",
            className: "expand-button",
            id: `${keyword}-expand`,
            parent: overview
        });
    
        const showAction = buildElement({
            type: "span",
            className: "material-symbols-outlined",
            text: "keyboard_arrow_down",
            parent: expandButton
        });

        const itemInfo = buildElement({
            type: "div",
            id: `${keyword}-info`,
            className: "collection-info",
            parent: newBookmark
        });

        showAction.addEventListener("click",() => {
            itemInfo.classList.toggle("hidden");
        });
    };
}

function checkEmptyCollections() {
    const collectionList = document.querySelectorAll(".collection-container");
    const displayEmptyCollection = document.querySelector("#empty-collection");
    if (collectionList.length === 1) {
        displayEmptyCollection.classList.remove("hidden");
    } else {
        displayEmptyCollection.classList.add("hidden");
    };
}

checkEmptyCollections();

function removeBookmark (keyword, index) {
    const bookmarkList = JSON.parse(localStorage.getItem("bookmark"));
    const entry = bookmarkList[keyword]
    entry.splice(index,1);
    reloadBookmark();
    
    if (entry.length === 0) {
        const deleteDiv = document.querySelector(`#collection-${keyword}`);
        deleteDiv.remove();
    };
    
    localStorage.setItem("bookmark", JSON.stringify(bookmarkList));
    checkEmptyCollections();
}

function loadBookmark(keyword) {
    const bookmarkList = JSON.parse(localStorage.getItem("bookmark"));
    const entry = bookmarkList[keyword];

    const assignedCollection = document.querySelector(`#${keyword}-info`,);
        
    entry.forEach((item, index) => {
        if (!document.querySelector(`#bookmark-${keyword}-${index}`)) {
                        
            const entryDiv = buildElement({
            type: "div",
            className: "bookmark-entry",
            id: `bookmark-${keyword}-${index}`,
            parent: assignedCollection
            });

            const typeIcon = buildElement({
                type: "span",
                className: "material-symbols-outlined",
                parent: entryDiv
            });

            switch (item.type) {
                case "movie":
                    typeIcon.textContent = "movie"
                    break
                case "podcast":
                    typeIcon.textContent = "podcasts"
                    break
                case "book":
                    typeIcon.textContent = "book_2"
                    break
            };

            buildElement({
                type: "h4",
                className: "bookmark-entry-title",
                text: item.data.title 
                || item.data.volumeInfo.title,
                parent: entryDiv
            });

            const buttonIconName = ["delete","open_in_new"]
            const entryButton = buildElement({
                type: "div",
                className: "entry-button",
                parent: entryDiv
            })

            buttonIconName.forEach (action => {
                const button = buildElement({
                    type: "button",
                    className: "material-symbols-outlined",
                    text: action,
                    parent: entryButton
                });

                button.addEventListener("click", () => {
                    if (action === "delete") {
                        removeBookmark(keyword,index);
                        entryDiv.remove();
                    } else {
                        let link = null;
                        if (item.data.imdb_id) {
                            link = `https://www.imdb.com/title/${item.data.imdb_id}/`
                        } else if (item.data.volumeInfo.infoLink) {
                            link = item.data.volumeInfo.infoLink
                        }
                        window.open(link, "_blank")
                    }
                });
            });
        };
    });
};

function updateBookmark (keyword) {
    createBookmark(keyword);
    loadBookmark(keyword);
    checkEmptyCollections()
};

function reloadBookmark() {
    const bookmarkList = JSON.parse(localStorage.getItem("bookmark"));
    if (bookmarkList) {
        const keywordList = Object.entries(bookmarkList);
        keywordList.forEach(([keyword,value]) => {
            if (bookmarkList[keyword].length !== 0) {
            updateBookmark(keyword);
            };
        });
    };
};

reloadBookmark();

export {
    updateBookmark
};