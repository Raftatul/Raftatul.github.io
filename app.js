document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll('.effect');

    projectsPreview = document.querySelectorAll('.project-preview');

    const navButtons = document.querySelectorAll('.nav-selected')

    window.addEventListener('scroll', checkProjects);

    checkProjects();

    function checkProjects(){
        const triggerBottom = window.innerHeight / 5 * 4;

        projects.forEach((project)=>{
            const topProject = project.getBoundingClientRect().top;

            if(topProject < triggerBottom){
                project.classList.add('show');
            }
        })
    }
}); 

var lastSelectedNav = null;

function setDefaultNav(navItem) {
    // Remove nav-selected class from last selected nav item
    if (lastSelectedNav != null && lastSelectedNav !== navItem) {
        lastSelectedNav.classList.remove("nav-selected");
    }

    // Add nav-selected class to default nav item
    navItem.classList.add("nav-selected");
    lastSelectedNav = navItem;
}

function highlightNav(navItem) {
    // Add nav-selected class to hovered nav item
    navItem.classList.add("nav-selected");

    // Remove nav-selected class from last selected nav item
    if (lastSelectedNav != null && lastSelectedNav !== navItem) {
        lastSelectedNav.classList.remove("nav-selected");
    }
}

function unhighlightNav(navItem) {
    navItem.classList.remove("nav-selected")
    
    // Remove nav-selected class from last selected nav item
    if (lastSelectedNav != null) {
        lastSelectedNav.classList.add("nav-selected");
    }
}

window.addEventListener('scroll', function() {
    var hiddenElement = document.getElementById('hiddenElement');
    var scrollPosition = window.scrollY;
    var navbar = this.document.getElementById('navbar');

    var navbarColorPercent = clamp(scrollPosition / window.innerHeight, 0.0, 1.0);

    console.log(lerp(0.0, 0.75, navbarColorPercent));

    navbar.style.backgroundColor = `rgba(33, 37, 41, ${lerp(0.0, 0.75, navbarColorPercent)})`;

    if (scrollPosition < window.innerHeight * 0.6) {
        hiddenElement.classList.remove('hidden');
    } else {
        hiddenElement.classList.add('hidden');
    }
});

var previewIndex = 0;
var startX = 0;

document.addEventListener('DOMContentLoaded', function () {
    var touchOverlay = document.querySelector('.touch-overlay');

    // Add touch event listeners to the touch overlay
    touchOverlay.addEventListener('touchstart', handleTouchStart, { passive: true });
    touchOverlay.addEventListener('touchmove', handleTouchMove, { passive: true });
    touchOverlay.addEventListener('touchend', handleTouchEnd, { passive: true });
});

function handleTouchStart(event) {
    startX = event.touches[0].clientX;
}

function handleTouchMove(event) {
  event.preventDefault();
}

function handleTouchEnd(event) {
  const endX = event.changedTouches[0].clientX;
  const deltaX = startX - endX;

  console.log(deltaX);
  // Determine swipe direction and call appropriate handler
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
        handleLeftAction();
    } else {
        handleRightAction();
    }
  }
}

function handleLeftAction() {
  updatePreviewIndex(1);
  projectsPreview[previewIndex].setAttribute('data-status', 'inactive right');

  updatePreviewIndex(-1);
  projectsPreview[previewIndex].setAttribute('data-status', 'inactive left');

  updatePreviewIndex(-1);
  projectsPreview[previewIndex].setAttribute('data-status', 'active');
}

function handleRightAction() {
  updatePreviewIndex(-1);
  projectsPreview[previewIndex].setAttribute('data-status', 'inactive left');

  updatePreviewIndex(1);
  projectsPreview[previewIndex].setAttribute('data-status', 'inactive right');

  updatePreviewIndex(1);
  projectsPreview[previewIndex].setAttribute('data-status', 'active');
}

function updatePreviewIndex(value) {
  previewIndex += value;

  if (previewIndex < 0) {
    previewIndex = projectsPreview.length - 1;
  } else if (previewIndex == projectsPreview.length) {
    previewIndex = 0;
  }

  console.log(previewIndex);
}

function lerp(a, b, alpha ) {
    return a + alpha * (b - a);
}

function clamp( val, min, max ) {
    return Math.min(Math.max(val, min ), max);
}