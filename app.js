"use strict";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CONFIG = {

    maxStages: 5,

    animationDuration: 1800,

    reducedMotion:
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

};


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (selector) =>
    document.querySelector(selector);


const elements = {

    welcomeScene: $("#welcomeScene"),

    growthScene: $("#growthScene"),

    gardenScene: $("#gardenScene"),

    startButton: $("#startButton"),

    loveButton: $("#loveButton"),

    gardenButton: $("#gardenButton"),

    stageNumber: $("#stageNumber"),

    stageMessage: $("#stageMessage"),

    growthDescription: $("#growthDescription"),

    progressText: $("#progressText"),

    progressFill: $("#progressFill"),

    progressBar: $("#progressBar"),

    plantMessage: $("#plantMessage"),

    seedGroup: $("#seedGroup"),

    sproutGroup: $("#sproutGroup"),

    mainStem: $("#mainStem"),

    leftLeaf: $("#leftLeaf"),

    rightLeaf: $("#rightLeaf"),

    budGroup: $("#budGroup"),

    flowerGroup: $("#flowerGroup"),

    backPetals: $("#backPetals"),

    frontPetals: $("#frontPetals"),

    flowerSeeds: $("#flowerSeeds"),

    gardenFlowers: $("#gardenFlowers"),

    gardenMessage: $("#gardenMessage"),

    letterButton: $("#letterButton"),

    letterModal: $("#letterModal"),

    letterClose: $("#letterClose"),

    letterBackdrop: $("#letterBackdrop"),

    petalRain: $("#petalRain"),

    ambientParticles: $("#ambientParticles")

};


/* =========================================================
   ESTADO
========================================================= */

let currentStage = 0;

let isAnimating = false;

let messageTimeout = null;

let lastFocusedElement = null;


/* =========================================================
   MENSAJES DE CRECIMIENTO
========================================================= */

const growthStages = [

    {

        title:
            "Nuestro amor acaba de despertar.",

        description:
            "A veces las cosas más bonitas comienzan sin que nos demos cuenta. Un pequeño momento puede convertirse en el inicio de algo maravilloso.",

        plant:
            "Nuestro primer pequeño brote ♡"

    },

    {

        title:
            "Está creciendo, poquito a poquito.",

        description:
            "Como nosotros. Sin prisas, aprendiendo, creciendo y construyendo algo que poco a poco comenzó a significar muchísimo.",

        plant:
            "Cada vez un poquito más cerca de ti ♡"

    },

    {

        title:
            "Nuestro amor está echando raíces.",

        description:
            "En cada conversación, cada sonrisa y cada abrazo encontramos una nueva razón para seguir creciendo juntos.",

        plant:
            "El amor está en los pequeños detalles ♡"

    },

    {

        title:
            "Algo hermoso está a punto de florecer.",

        description:
            "Llegaste a mi vida y comenzaste a iluminar mis días de una manera que jamás habría imaginado.",

        plant:
            "Solo necesita un último poquito de amor ♡"

    },

    {

        title:
            "Y finalmente floreció para ti.",

        description:
            "Así como acabas de hacer florecer este girasol, tú también has hecho florecer muchísimas cosas bonitas dentro de mí.",

        plant:
            "Porque tú eres mi flor favorita ♡"

    }

];


/* =========================================================
   UTILIDADES
========================================================= */

function delay(milliseconds) {

    return new Promise((resolve) => {

        window.setTimeout(
            resolve,
            CONFIG.reducedMotion
                ? 0
                : milliseconds
        );

    });

}


function random(min, max) {

    return (
        Math.random() *
        (max - min) +
        min
    );

}


function createSvgElement(tagName) {

    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        tagName
    );

}


/* =========================================================
   CAMBIO DE ESCENAS
========================================================= */

function showScene(scene) {

    const scenes = [

        elements.welcomeScene,

        elements.growthScene,

        elements.gardenScene

    ];


    scenes.forEach((item) => {

        item.classList.remove("active");

        item.setAttribute(
            "aria-hidden",
            "true"
        );

        item.inert = true;

    });


    scene.classList.add("active");

    scene.setAttribute(
        "aria-hidden",
        "false"
    );

    scene.inert = false;


    window.scrollTo({

        top: 0,

        behavior: "instant"

    });

}


/* =========================================================
   CREACIÓN DE PÉTALOS

   Cada pétalo tiene un grupo SVG exterior
   que conserva su rotación original.

   Las animaciones no modifican esa rotación.
========================================================= */

function createPetal(angle, back = false) {

    const group =
        createSvgElement("g");


    group.setAttribute(

        "transform",

        `translate(250 155) rotate(${angle})`

    );


    group.classList.add(
        "flower-petal"
    );


    if (back) {

        group.classList.add(
            "flower-petal--back"
        );

    }


    const petal =
        createSvgElement("path");


    /*
       El pétalo se dibuja en coordenadas locales.

       Su base está en el centro de la flor.

       La rotación se aplica al grupo exterior,
       no al pétalo durante la animación.
    */

    petal.setAttribute(

        "d",

        `
            M 0 -28

            C -18 -43
              -22 -77
              0 -111

            C 22 -77
              18 -43
              0 -28

            Z
        `

    );


    group.appendChild(petal);


    return group;

}


/* =========================================================
   CONSTRUIR GIRASOL
========================================================= */

function createSunflower() {

    const backPetals = [];

    const frontPetals = [];


    /*
       16 pétalos traseros.
    */

    for (
        let index = 0;
        index < 16;
        index += 1
    ) {

        const angle =
            index * 22.5;


        const petal =
            createPetal(angle, true);


        elements.backPetals.appendChild(
            petal
        );


        backPetals.push(petal);

    }


    /*
       16 pétalos delanteros.

       Se desplazan 11.25 grados respecto
       a los traseros para conseguir
       una flor más completa.
    */

    for (
        let index = 0;
        index < 16;
        index += 1
    ) {

        const angle =
            index * 22.5 + 11.25;


        const petal =
            createPetal(angle);


        elements.frontPetals.appendChild(
            petal
        );


        frontPetals.push(petal);

    }


    /*
       Textura del centro.

       Distribución en espiral.
    */

    const totalSeeds = 130;

    const goldenAngle =
        Math.PI * (3 - Math.sqrt(5));


    for (
        let index = 0;
        index < totalSeeds;
        index += 1
    ) {

        const radius =
            4.1 * Math.sqrt(index);


        const angle =
            index * goldenAngle;


        const x =
            250 +
            Math.cos(angle) * radius;


        const y =
            155 +
            Math.sin(angle) * radius;


        const dot =
            createSvgElement("circle");


        dot.setAttribute(
            "cx",
            x.toFixed(2)
        );


        dot.setAttribute(
            "cy",
            y.toFixed(2)
        );


        dot.setAttribute(
            "r",
            index % 4 === 0
                ? "1.8"
                : "1.2"
        );


        dot.setAttribute(
            "fill",
            index % 3 === 0
                ? "#D5A052"
                : "#A97C42"
        );


        dot.setAttribute(
            "opacity",
            ".65"
        );


        elements.flowerSeeds.appendChild(
            dot
        );

    }


    return {

        backPetals,

        frontPetals

    };

}


/* =========================================================
   REFERENCIAS DE PÉTALOS
========================================================= */

const sunflowerPetals =
    createSunflower();


/* =========================================================
   PARTÍCULAS AMBIENTALES
========================================================= */

function createAmbientParticles() {

    const amount =
        window.innerWidth <= 600
            ? 12
            : 24;


    for (
        let index = 0;
        index < amount;
        index += 1
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "ambient-particle";


        particle.style.left =
            `${random(0, 100)}%`;


        particle.style.top =
            `${random(0, 100)}%`;


        particle.style.setProperty(

            "--duration",

            `${random(3, 7)}s`

        );


        particle.style.animationDelay =
            `${random(-5, 0)}s`;


        elements.ambientParticles.appendChild(
            particle
        );

    }

}


/* =========================================================
   ACTUALIZAR PROGRESO
========================================================= */

function updateProgress(stage) {

    const percentage =
        stage * 20;


    elements.progressText.textContent =
        `${percentage}%`;


    elements.progressFill.style.width =
        `${percentage}%`;


    elements.progressBar.setAttribute(

        "aria-valuenow",

        String(percentage)

    );


    elements.stageNumber.textContent =
        String(stage);

}


/* =========================================================
   ACTUALIZAR MENSAJES
========================================================= */

function updateMessages(stage) {

    const data =
        growthStages[stage - 1];


    elements.stageMessage.textContent =
        data.title;


    elements.growthDescription.textContent =
        data.description;


    elements.plantMessage.textContent =
        data.plant;

}


/* =========================================================
   MOSTRAR ELEMENTO SVG
========================================================= */

function showSvg(element) {

    element.classList.remove(
        "svg-hidden"
    );


    element.classList.add(
        "svg-visible"
    );

}


function hideSvg(element) {

    element.classList.remove(
        "svg-visible"
    );


    element.classList.add(
        "svg-hidden"
    );

}


/* =========================================================
   ETAPA 1: GERMINACIÓN
========================================================= */

async function growStageOne() {

    hideSvg(
        elements.seedGroup
    );


    await delay(250);


    showSvg(
        elements.sproutGroup
    );


    await delay(1100);

}


/* =========================================================
   ETAPA 2: CRECIMIENTO DEL TALLO
========================================================= */

async function growStageTwo() {

    hideSvg(
        elements.sproutGroup
    );


    await delay(200);


    elements.mainStem.classList.add(
        "is-grown"
    );


    await delay(1600);

}


/* =========================================================
   ETAPA 3: DESARROLLO DE HOJAS
========================================================= */

async function growStageThree() {

    showSvg(
        elements.leftLeaf
    );


    await delay(350);


    showSvg(
        elements.rightLeaf
    );


    await delay(1000);

}


/* =========================================================
   ETAPA 4: FORMACIÓN DEL CAPULLO
========================================================= */

async function growStageFour() {

    showSvg(
        elements.budGroup
    );


    await delay(1400);

}


/* =========================================================
   ETAPA 5: FLORACIÓN
========================================================= */

async function growStageFive() {

    hideSvg(
        elements.budGroup
    );


    await delay(350);


    /*
       Mostramos primero el grupo completo.

       Los pétalos siguen invisibles
       porque cada uno tiene su propia clase.
    */

    showSvg(
        elements.flowerGroup
    );


    await delay(150);


    /*
       Abrimos los pétalos traseros.
    */

    sunflowerPetals.backPetals.forEach(
        (petal, index) => {

            window.setTimeout(() => {

                petal.classList.add(
                    "is-visible"
                );

            }, index * 45);

        }
    );


    await delay(450);


    /*
       Abrimos los pétalos delanteros.
    */

    sunflowerPetals.frontPetals.forEach(
        (petal, index) => {

            window.setTimeout(() => {

                petal.classList.add(
                    "is-visible"
                );

            }, index * 45);

        }
    );


    await delay(1600);


    elements.flowerGroup.classList.add(
        "is-bloomed"
    );


    createPetalRain();


    elements.loveButton.classList.add(
        "hidden"
    );


    elements.gardenButton.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CONTROL DE CRECIMIENTO
========================================================= */

async function growPlant() {

    if (
        isAnimating ||
        currentStage >= CONFIG.maxStages
    ) {

        return;

    }


    isAnimating = true;


    elements.loveButton.disabled = true;


    currentStage += 1;


    updateProgress(
        currentStage
    );


    updateMessages(
        currentStage
    );


    switch (currentStage) {

        case 1:

            await growStageOne();

            break;


        case 2:

            await growStageTwo();

            break;


        case 3:

            await growStageThree();

            break;


        case 4:

            await growStageFour();

            break;


        case 5:

            await growStageFive();

            break;

    }


    isAnimating = false;


    if (
        currentStage < CONFIG.maxStages
    ) {

        elements.loveButton.disabled = false;

    }

}


/* =========================================================
   LLUVIA DE PÉTALOS
========================================================= */

function createPetalRain() {

    const amount =
        window.innerWidth <= 600
            ? 22
            : 40;


    for (
        let index = 0;
        index < amount;
        index += 1
    ) {

        const petal =
            document.createElement("span");


        petal.className =
            "falling-petal";


        const duration =
            random(3, 6);


        petal.style.left =
            `${random(0, 100)}%`;


        petal.style.setProperty(

            "--duration",

            `${duration}s`

        );


        petal.style.setProperty(

            "--move-x",

            `${random(-120, 120)}px`

        );


        petal.style.animationDelay =
            `${random(0, 1)}s`;


        elements.petalRain.appendChild(
            petal
        );


        window.setTimeout(() => {

            petal.remove();

        }, (duration + 1.5) * 1000);

    }

}


/* =========================================================
   MENSAJES DEL JARDÍN
========================================================= */

const gardenMessages = [

    "Eres mi lugar favorito.",

    "Contigo quiero todas mis primaveras.",

    "Gracias por hacer mis días más bonitos.",

    "Volvería a elegirte una y mil veces.",

    "Mi parte favorita del día siempre eres tú.",

    "Quiero seguir creando recuerdos contigo.",

    "Gracias por llegar a mi vida.",

    "Te amo más de lo que puedo expresar."

];


/* =========================================================
   CREAR FLORES DEL JARDÍN
========================================================= */

function createGardenFlowers() {

    const flowerMarkup = `

        <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
        >

            <defs>

                <radialGradient id="gardenCenter">

                    <stop
                        offset="0%"
                        stop-color="#80512C"
                    />

                    <stop
                        offset="100%"
                        stop-color="#38231A"
                    />

                </radialGradient>

            </defs>

            <g class="garden-petals"></g>

            <circle
                cx="50"
                cy="50"
                r="21"
                fill="url(#gardenCenter)"
            />

            <circle
                cx="50"
                cy="50"
                r="15"
                fill="none"
                stroke="#A77A43"
                stroke-width="1"
                stroke-dasharray="2 3"
            />

        </svg>

    `;


    gardenMessages.forEach(
        (message, index) => {

            const button =
                document.createElement("button");


            button.type = "button";


            button.className =
                "garden-flower";


            button.setAttribute(

                "aria-label",

                `Descubrir mensaje de la flor ${index + 1}`

            );


            button.style.setProperty(

                "--delay",

                `${index * 0.1}s`

            );


            button.innerHTML =
                flowerMarkup;


            const petalsContainer =
                button.querySelector(
                    ".garden-petals"
                );


            /*
               Generamos los pétalos dentro
               de un SVG independiente.
            */

            for (
                let petalIndex = 0;
                petalIndex < 16;
                petalIndex += 1
            ) {

                const petal =
                    createSvgElement("path");


                const angle =
                    petalIndex * 22.5;


                petal.setAttribute(

                    "d",

                    `
                        M50 37
                        Q39 19 50 2
                        Q61 19 50 37
                        Z
                    `

                );


                petal.setAttribute(

                    "transform",

                    `rotate(${angle} 50 50)`

                );


                petal.setAttribute(

                    "fill",

                    petalIndex % 2 === 0
                        ? "#FFCA45"
                        : "#F2B933"

                );


                petalsContainer.appendChild(
                    petal
                );

            }


            button.addEventListener(
                "click",
                () => {

                    showGardenMessage(
                        message
                    );

                }
            );


            elements.gardenFlowers.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   MOSTRAR MENSAJE DEL JARDÍN
========================================================= */

function showGardenMessage(message) {

    window.clearTimeout(
        messageTimeout
    );


    elements.gardenMessage.textContent =
        message;


    elements.gardenMessage.animate(

        [

            {

                opacity: 0,

                transform:
                    "translateY(8px)"

            },

            {

                opacity: 1,

                transform:
                    "translateY(0)"

            }

        ],

        {

            duration: 400,

            easing: "ease-out"

        }

    );


    messageTimeout =
        window.setTimeout(() => {

            elements.gardenMessage.textContent =
                "";

        }, 4000);

}


/* =========================================================
   CARTA
========================================================= */

function openLetter() {

    lastFocusedElement =
        document.activeElement;


    elements.letterModal.classList.add(
        "open"
    );


    elements.letterModal.setAttribute(

        "aria-hidden",

        "false"

    );


    document.body.style.overflow =
        "hidden";


    elements.letterClose.focus();

}


function closeLetter() {

    elements.letterModal.classList.remove(
        "open"
    );


    elements.letterModal.setAttribute(

        "aria-hidden",

        "true"

    );


    document.body.style.overflow =
        "";


    if (lastFocusedElement) {

        lastFocusedElement.focus();

    }

}


/* =========================================================
   EVENTOS
========================================================= */

elements.startButton.addEventListener(

    "click",

    () => {

        showScene(
            elements.growthScene
        );

    }

);


elements.loveButton.addEventListener(

    "click",

    growPlant

);


elements.gardenButton.addEventListener(

    "click",

    () => {

        showScene(
            elements.gardenScene
        );

        createPetalRain();

    }

);


elements.letterButton.addEventListener(

    "click",

    openLetter

);


elements.letterClose.addEventListener(

    "click",

    closeLetter

);


elements.letterBackdrop.addEventListener(

    "click",

    closeLetter

);


document.addEventListener(

    "keydown",

    (event) => {

        if (
            event.key === "Escape" &&
            elements.letterModal.classList.contains(
                "open"
            )
        ) {

            closeLetter();

        }

    }

);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

function init() {

    createAmbientParticles();

    createGardenFlowers();


    showScene(
        elements.welcomeScene
    );


    updateProgress(0);

}


init();