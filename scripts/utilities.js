/*

BUILD ELEMENT

*/

export function buildElement({	
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

/* THROTTLING */

export function throttleAction (action) {
  let cooldown = null;
  const delay = 750;

  return (...args) => {
    if (!cooldown) {
      action (...args);
      cooldown = setTimeout(() => {
        cooldown = null
      }, delay);
    };
  };
}

/* DEBOUNCING */

export function debounceAction(action){
  let time = null;
  const delay = 750;
  
  return (...args) => {
    clearTimeout(time);
    time = setTimeout(() => {
      action(...args)
    }, delay);
  };
}