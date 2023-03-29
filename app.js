document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll('.effect');

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