const max_angle = 50;
const angle_force = 10;
const offset_x = 50;
const offset_y = -100;
const distance_to_clamp = 20.0

document.addEventListener("DOMContentLoaded", () => {
    const move = document.getElementById("move");
    const rotate = document.getElementById("rotate");

    let last_x_pos = 0.0;
    let last_y_pos = 0.0;
    
    document.body.onpointermove = event => {
        if (move == null || rotate == null){
            return;
        }

        const { clientX, clientY } = event;

        const vel_x = last_x_pos - clientX;
        const vel_y = last_y_pos - clientY;

        const angle_x = Math.max(-max_angle, Math.min(vel_x * angle_force, max_angle));
        const angle_y = Math.max(-max_angle, Math.min(vel_y * angle_force, max_angle));

        let offset_side = 1.0;
        let offset_height = 1.0;

        last_x_pos = clientX;
        last_y_pos = clientY;

        move.animate({
            left: `${clientX + offset_x * offset_side}px`,
            top: `${clientY + offset_y * offset_height}px`,
        
        }, {duration: 1000, fill: "forwards"})

        
        rotate.animate({
            transform: `rotateY(${-angle_x}deg) rotateX(${angle_y}deg)`,
        
        }, {duration: 1000, fill: "forwards"})
    };
});

let click_count = 0;

function easter_egg() {
    click_count += 1;

    if (click_count > 10){
        document.getElementById("move").style.display = "block";
    }
};