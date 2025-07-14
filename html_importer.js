function includeHTML(callback) {
  const elements = document.querySelectorAll('[w3-include-html]');
  let remaining = elements.length;

  if (remaining === 0 && typeof callback === "function") callback();

  elements.forEach((elmnt) => {
    const file = elmnt.getAttribute('w3-include-html');
    if (!file) return;

    fetch(file)
      .then((response) => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then((html) => {
        elmnt.innerHTML = html;
        elmnt.removeAttribute('w3-include-html');
        executeScripts(elmnt); // ✅ Execute scripts inside injected HTML
        remaining--;
        if (remaining === 0 && typeof callback === "function") callback();
      })
      .catch((err) => {
        elmnt.innerHTML = err.message;
        elmnt.removeAttribute('w3-include-html');
        remaining--;
        if (remaining === 0 && typeof callback === "function") callback();
      });
  });
}

function executeScripts(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script');
    // Copy attributes (e.g. src, type)
    [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
    // If it's inline JS, copy the code too
    if (!oldScript.src) newScript.textContent = oldScript.textContent;
    // Replace the old script tag to execute
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML(() => {
    console.log("All HTML includes loaded and scripts executed.");
  });
});
