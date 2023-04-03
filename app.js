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

    if (scrollPosition < 700) {
        hiddenElement.classList.remove('hidden');
    } else {
        hiddenElement.classList.add('hidden');
    }
});

var previewIndex = 0;

function handleLeftClick(){
    updatePreviewIndex(1);
    projectsPreview[previewIndex].setAttribute('data-status', 'inactive right');

    updatePreviewIndex(-1);
    projectsPreview[previewIndex].setAttribute('data-status', 'inactive left');

    updatePreviewIndex(-1);
    projectsPreview[previewIndex].setAttribute('data-status', 'active');
}

function handleRightClick(){
    updatePreviewIndex(-1);
    projectsPreview[previewIndex].setAttribute('data-status', 'inactive left');

    updatePreviewIndex(1);
    projectsPreview[previewIndex].setAttribute('data-status', 'inactive right');

    updatePreviewIndex(1);
    projectsPreview[previewIndex].setAttribute('data-status', 'active');
}

function updatePreviewIndex(value){
    previewIndex += value;

    if(previewIndex < 0){
        previewIndex = projectsPreview.length - 1;
    }
    else if(previewIndex == projectsPreview.length){
        previewIndex = 0;
    }

    console.log(previewIndex)
}