const cards = Array.from(document.querySelectorAll('.card'));
let order = [0,1,2];
const positions = ['left','center','right'];
const duration = 0.8;

function updateLayout() {
    cards.forEach((card, i) => {
    const pos = positions[order.indexOf(i)];
    card.className = 'card ' + pos;
    });
}

function shift() {
    order.push(order.shift());
    cards.forEach((card, i) => {
    const pos = positions[order.indexOf(i)];
    const props = { duration: duration, ease: 'power2.inOut' };
    if (pos === 'left') {
        gsap.to(card, { left: 0, top: 15, scale: 1, zIndex: 1, ...props });
    } else if (pos === 'center') {
        gsap.to(card, { left: 160, top: 0, scale: 1.2, zIndex: 2, ...props });
    } else if (pos === 'right') {
        gsap.to(card, { left: 320, top: 15, scale: 1, zIndex: 1, ...props });
    }
    });
}

// init layout
cards.forEach((card, i) => {
    const pos = positions[order.indexOf(i)];
    gsap.set(card, { left: pos === 'left' ? 0 : pos === 'center' ? 160 : 320, top: pos === 'center' ? 0 : 15, scale: pos === 'center' ? 1.2 : 1, zIndex: pos === 'center' ? 2 : 1 });
    card.classList.add(pos);
    card.addEventListener('click', shift);
});

setInterval(shift, 3000);