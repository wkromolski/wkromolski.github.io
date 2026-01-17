function addSkillsAndSoftware() {
    const softwareContainer = document.querySelector('.skills-panel .software-tag-container:first-of-type');
    const skillsContainer = document.querySelector('.skills-panel .software-tag-container:last-of-type');

    // 1. Tutaj zdefiniuj ścieżki do ikon dla poszczególnych programów
    // Upewnij się, że klucze (np. "Blender") są identyczne jak w pliku software.txt
    const softwareIcons = {
        "Blender": "../Resources/Icons/blender.png",
        /* "3ds Max": "../Resources/Icons/3dsmax.svg", */
        "Affinity": "../Resources/Icons/affinity.png",
        "Substance 3D Painter": "../Resources/Icons/substancepainter.png",
        "Marmoset Toolbag": "../Resources/Icons/marmoset.png",
        "Unity": "../Resources/Icons/unity.png",
        "Unreal Engine 5": "../Resources/Icons/unreal.png"
    };

    const fetchAndPopulate = async (url, container, useIcons = false) => {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const itemsArray = text.split('\n').map(item => item.trim()).filter(item => item);

            const fragment = document.createDocumentFragment();

            itemsArray.forEach(item => {
                const span = document.createElement("span");
                span.className = "software-tag";

                // Sprawdź, czy mamy używać ikon i czy ikona istnieje dla tego elementu
                if (useIcons && softwareIcons[item]) {
                    const img = document.createElement("img");
                    img.src = softwareIcons[item];
                    img.alt = item;
                    img.className = "software-icon"; // Klasa do stylizacji w CSS
                    span.appendChild(img);
                }

                // Dodaj tekst (nazwę programu)
                // Dodajemy spację przed tekstem dla odstępu, jeśli jest ikona
                const textNode = document.createTextNode((useIcons && softwareIcons[item] ? " " : "") + item);
                span.appendChild(textNode);
                
                fragment.appendChild(span);
            });

            container.appendChild(fragment);
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
        }
    };

    // 2. Przekazujemy 'true' jako trzeci argument tylko dla software, żeby dodać ikony
    fetchAndPopulate('../Config/software.txt', softwareContainer, true);
    
    // Dla skills nie chcemy ikon (lub nie zdefiniowaliśmy ich), więc zostawiamy standardowo
    fetchAndPopulate('../Config/skills.txt', skillsContainer, false);
}

document.addEventListener("DOMContentLoaded", addSkillsAndSoftware);