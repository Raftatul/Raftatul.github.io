// Click an image inside a project page to view it full screen.
// Close with the X button, a click on the empty space around the image, or Escape.

document.addEventListener("DOMContentLoaded", () => {
    const images = [...document.querySelectorAll(".content img")]
        .filter((img) => !img.closest("#move")); // skip the Tween easter egg

    if (images.length === 0) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image viewer");
    overlay.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <figure class="lightbox-figure">
            <img class="lightbox-image" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>`;
    document.body.appendChild(overlay);

    const bigImage = overlay.querySelector(".lightbox-image");
    const caption = overlay.querySelector(".lightbox-caption");
    const closeButton = overlay.querySelector(".lightbox-close");
    let lastFocused = null;

    // Scale the image up or down to the largest size that fits the screen.
    function fit() {
        if (!bigImage.naturalWidth) {
            return;
        }
        const style = getComputedStyle(overlay);
        const captionSpace = caption.hidden ? 0 : caption.offsetHeight + 12;
        const maxWidth = overlay.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const maxHeight = overlay.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - captionSpace;
        const ratio = bigImage.naturalWidth / bigImage.naturalHeight;
        bigImage.style.width = Math.min(maxWidth, maxHeight * ratio) + "px";
    }

    bigImage.addEventListener("load", fit);
    window.addEventListener("resize", () => {
        if (overlay.classList.contains("open")) {
            fit();
        }
    });

    function open(img) {
        lastFocused = img;
        bigImage.style.width = "";
        bigImage.src = img.currentSrc || img.src;
        bigImage.alt = img.alt;
        caption.textContent = img.alt;
        caption.hidden = !img.alt;
        overlay.classList.add("open");
        document.body.classList.add("lightbox-lock");
        fit(); // already cached images don't fire "load" again
        closeButton.focus();
    }

    function close() {
        overlay.classList.remove("open");
        document.body.classList.remove("lightbox-lock");
        if (lastFocused) {
            lastFocused.focus({ preventScroll: true });
        }
    }

    for (const img of images) {
        img.classList.add("zoomable");
        img.tabIndex = 0;
        img.addEventListener("click", () => open(img));
        img.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open(img);
            }
        });
    }

    closeButton.addEventListener("click", close);

    // A click anywhere closes the viewer, the image included.
    overlay.addEventListener("click", close);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("open")) {
            close();
        }
    });
});
