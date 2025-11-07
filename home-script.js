
/*

TOGGLE PAGE

*/

const pageList = ["home","explore","collection"];
let control = {}

function setPageControl() {
  pageList.forEach(page => {
    control[page] = document.querySelector(`#${page}-screen`);
  });
  viewPage("home");
}

function viewPage(shown) {
  pageList.forEach(page => {
    const accessControl = control[page];
    if (page === shown) {
      accessControl.classList.remove("hidden");
    } else {
      accessControl.classList.add("hidden");
    };
  });
}
setPageControl();

function setNavigation() {
  pageList.forEach(page => {
    const path = document.querySelectorAll(`.go-${page}`);

    path.forEach(element => {
      element.addEventListener("click", () => {
        viewPage(page)
      });
    });
  });
}

setNavigation();

/*

CREATE ELEMENT

*/

function buildElement({	
  type = "div",	
  className = "",	
  id = "",	
  text = "",	
  parent = ""})
  {
    const element = document.createElement(type);
    if (className) element.className = className;
    if (id) element.id = id;
    if (text) element.textContent = text;
    if (parent) parent.appendChild(element);

    return element;
};

export {
  buildElement,
  control
};