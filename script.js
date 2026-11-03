// ======================================
// VARIABLES GLOBALES
// ======================================

let heartInterval = null;

const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let particles = [];

let lastExplosion = 0;
let animationFrame = null;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let lastFrame = 0;


// ======================================
// CONFIGURACIÓN DEL UNIVERSO
// ======================================

const SETTINGS = {
    starCount: 55,
    explosionInterval: 100,
    maxParticles: 65,
    particleCount: 3,
    particleLife: 450
};


// ======================================
// AJUSTAR CANVAS
// ======================================

function resizeCanvas() {

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();

}

window.addEventListener("resize", resizeCanvas);


// ======================================
// CREAR ESTRELLAS
// ======================================

function createStars() {

    stars = [];

    for (let i = 0; i < SETTINGS.starCount; i++) {

        stars.push({

            x: Math.random() * canvasWidth,

            y: Math.random() * canvasHeight,

            size: 0.5 + Math.random() * 1.5,

            opacity: Math.random(),

            speed: 0.5 + Math.random() * 1.5,

            phase: Math.random() * Math.PI * 2

        });

    }

}


// ======================================
// DIBUJAR ESTRELLAS
// ======================================

function drawStars(time) {

    stars.forEach(star => {

        const brightness =
            0.25 +
            Math.abs(
                Math.sin(time * 0.001 * star.speed + star.phase)
            ) * 0.75;

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255, 220, 240, ${brightness})`;

        ctx.fill();

    });

}


// ======================================
// CREAR EXPLOSIÓN ESTELAR
// ======================================

function createExplosion(x, y) {

    for (
        let i = 0;
        i < SETTINGS.particleCount;
        i++
    ) {

        if (particles.length >= SETTINGS.maxParticles) {
            break;
        }

        const angle =
            Math.random() * Math.PI * 2;

        const speed =
            0.4 + Math.random() * 1.4;

        particles.push({

            x: x,
            y: y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            life: SETTINGS.particleLife,

            maxLife: SETTINGS.particleLife,

            size: 0.8 + Math.random() * 1.5

        });

    }

}


// ======================================
// DIBUJAR PARTÍCULAS
// ======================================

function drawParticles(delta) {

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];

        particle.x += particle.vx * delta * 0.06;
        particle.y += particle.vy * delta * 0.06;

        particle.life -= delta;

        if (particle.life <= 0) {

            particles.splice(i, 1);

            continue;

        }

        const opacity =
            particle.life / particle.maxLife;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255, 180, 220, ${opacity})`;

        ctx.fill();

    }

}


// ======================================
// EXPLOSIÓN CADA 0.10 SEGUNDOS
// ======================================

function updateExplosions(time) {

    if (
        time - lastExplosion >= SETTINGS.explosionInterval
    ) {

        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;

        createExplosion(x, y);

        lastExplosion = time;

    }

}


// ======================================
// ANIMACIÓN PRINCIPAL
// ======================================

function animate(time = 0) {

    if (!canvas || !ctx) return;

    const delta = Math.min(
        time - (lastFrame || time),
        40
    );

    lastFrame = time;

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    // Dibujar estrellas

    drawStars(time);

    // Crear pequeñas explosiones

    updateExplosions(time);

    // Dibujar partículas

    drawParticles(delta);

    animationFrame =
        requestAnimationFrame(animate);

}


// ======================================
// INICIAR UNIVERSO
// ======================================

function startUniverse() {

    if (animationFrame !== null) {
        return;
    }

    lastExplosion = performance.now();

    lastFrame = 0;

    animationFrame =
        requestAnimationFrame(animate);

}


// ======================================
// DETENER UNIVERSO
// ======================================

function stopUniverse() {

    if (animationFrame !== null) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

}


// ======================================
// CAMBIAR DE PANTALLA
// ======================================

function changeScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.remove("active");

    });

    const selectedScreen =
        document.getElementById(screenId);

    if (selectedScreen) {

        selectedScreen.classList.add("active");

    }

}


// ======================================
// BOTÓN DESCUBRIR
// ======================================

function startStory() {

    changeScreen("story");

}


// ======================================
// MOSTRAR PREGUNTA
// ======================================

function showQuestion() {

    changeScreen("question");

}


// ======================================
// RESPUESTA SÍ (con EmailJS)
// ======================================

function sayYes() {

    const yesBtn = document.querySelector(".yes-button");
    const noBtn = document.querySelector(".no-button");

    if (yesBtn) yesBtn.disabled = true;
    if (noBtn) noBtn.disabled = true;

    const fechaLocal = new Date().toLocaleString("es-ES", {
        dateStyle: "full",
        timeStyle: "medium"
    });

    emailjs.send(
        "[proyecto_X]",
        "[template_0zua44s]",
        {
            respuesta: "SÍ ❤️",
            fecha: fechaLocal
        }
    )
    .then(() => {
        // Solo avanzamos cuando EmailJS confirma el éxito
        changeScreen("finalScreen");
        createHearts();
    })
    .catch((error) => {
        console.error("Error al enviar la respuesta:", error);
        // Permitir reintento
        if (yesBtn) yesBtn.disabled = false;
        if (noBtn) noBtn.disabled = false;
    });

}


// ======================================
// RESPUESTA NO (con EmailJS)
// ======================================

function sayNo() {

    const yesBtn = document.querySelector(".yes-button");
    const noBtn = document.querySelector(".no-button");

    if (yesBtn) yesBtn.disabled = true;
    if (noBtn) noBtn.disabled = true;

    const fechaLocal = new Date().toLocaleString("es-ES", {
        dateStyle: "full",
        timeStyle: "medium"
    });

    emailjs.send(
        "[PEGAR AQUÍ MI SERVICE ID]",
        "[PEGAR AQUÍ MI TEMPLATE ID]",
        {
            respuesta: "NO 💔",
            fecha: fechaLocal
        }
    )
    .then(() => {
        // Solo avanzamos cuando EmailJS confirma el éxito
        stopHearts();
        changeScreen("noScreen");
    })
    .catch((error) => {
        console.error("Error al enviar la respuesta:", error);
        // Permitir reintento
        if (yesBtn) yesBtn.disabled = false;
        if (noBtn) noBtn.disabled = false;
    });

}


// ======================================
// CORAZONES FLOTANTES SVG
// ======================================

function createHearts() {

    stopHearts();

    for (let i = 0; i < 8; i++) {

        createSingleHeart(
            Math.random() * 100,
            Math.random() * 2
        );

    }

    heartInterval = setInterval(() => {

        // Limitar corazones simultáneos

        if (
            document.querySelectorAll(".floating-heart").length < 14
        ) {

            createSingleHeart(
                Math.random() * 100,
                0
            );

        }

    }, 600);

}


// ======================================
// CREAR UN CORAZÓN
// ======================================

function createSingleHeart(position, delay) {

    const heart = document.createElement("div");

    heart.classList.add("floating-heart");

    heart.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="26"
             height="26"
             viewBox="0 0 24 24"
             fill="#ff6b9a"
             stroke="#ffb6d5"
             stroke-width="1.2">

            <path d="
                M20.8 4.6
                a5.5 5.5 0 0 0-7.8 0
                L12 5.7
                l-1.1-1.1
                a5.5 5.5 0 0 0-7.8 7.8
                l1.1 1.1
                L12 21
                l7.8-7.5
                1.1-1.1
                a5.5 5.5 0 0 0-.1-7.8Z
            "/>

        </svg>
    `;

    heart.style.left = position + "vw";

    heart.style.animationDuration =
        (4 + Math.random() * 3) + "s";

    heart.style.animationDelay = delay + "s";

    document.body.appendChild(heart);

    setTimeout(() => {

        heart.remove();

    }, 8000);

}


// ======================================
// DETENER CORAZONES
// ======================================

function stopHearts() {

    if (heartInterval !== null) {

        clearInterval(heartInterval);

        heartInterval = null;

    }

    document.querySelectorAll(".floating-heart").forEach(heart => {

        heart.remove();

    });

}


// ======================================
// VOLVER A EMPEZAR
// ======================================

function restartStory() {

    stopHearts();

    particles = [];

    lastExplosion = performance.now();

    changeScreen("welcome");

}


// ======================================
// VISIBILIDAD DE LA PÁGINA
// ======================================

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        stopUniverse();

    } else {

        startUniverse();

    }

});


// ======================================
// INICIALIZAR TODO
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    // Inicializar iconos
    if (window.lucide) {
        lucide.createIcons();
    }

    // Inicializar EmailJS (solo Public Key)
    if (window.emailjs) {
        emailjs.init("[9FMK-Q4maWX-EDOb-]");
    }

    // Preparar universo
    resizeCanvas();
    startUniverse();

});