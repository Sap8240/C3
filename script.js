document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thank you for contacting us!');
    this.reset();
});

VANTA.NET({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    color: '#ffffff',             // white nodes
    backgroundColor: 0x000000,   // black bg
    points: 14.00,
    maxDistance: 22.00,
    spacing: 18.00
});
