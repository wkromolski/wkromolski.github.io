/**
 * Funkcja tworząca kartę produkcji.
 * descriptionLines - tablica ciągów znaków (reszta linii z pliku tekstowego)
 */
function createProductionCard(title, company, time, thumbnail, descriptionLines) {
    const card = document.createElement("div");
    card.classList.add("production-subpanel");

    const img = document.createElement("img");
    img.src = thumbnail;
    img.alt = title;

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("production-details");

    const titleElem = document.createElement("h2");
    titleElem.textContent = title;

    const companyElem = document.createElement("p");
    companyElem.textContent = company;
    companyElem.style.fontWeight = "bold";

    const timeElem = document.createElement("p");
    timeElem.textContent = time;
    timeElem.style.fontStyle = "italic";

    // Dodajemy elementy nagłówka do detailsDiv
    detailsDiv.appendChild(titleElem);
    detailsDiv.appendChild(companyElem);
    detailsDiv.appendChild(timeElem);

    // --- Tworzenie sekcji opisu z obsługą akapitów i list ---
    const descDiv = document.createElement("div");
    descDiv.classList.add("production-description");

    let currentUl = null; // Zmienna pomocnicza do grupowania punktów listy

    descriptionLines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('-')) {
            // Jeśli linia zaczyna się od myślnika, traktujemy to jako element listy
            if (!currentUl) {
                currentUl = document.createElement("ul");
                // Opcjonalnie: stylizacja listy, jeśli nie masz tego w CSS
                // currentUl.style.paddingLeft = "20px";
                // currentUl.style.marginTop = "5px";
                // currentUl.style.marginBottom = "10px";
                descDiv.appendChild(currentUl);
            }
            
            const li = document.createElement("li");
            // Usuwamy myślnik z początku i spacje
            li.textContent = trimmedLine.substring(1).trim(); 
            currentUl.appendChild(li);

        } else {
            // Jeśli to zwykły tekst (nie myślnik), zamykamy poprzednią listę (null)
            currentUl = null; 
            
            const p = document.createElement("p");
            p.textContent = trimmedLine;
            // Opcjonalnie: drobny odstęp między akapitami
            // p.style.marginBottom = "8px"; 
            descDiv.appendChild(p);
        }
    });

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("production-content");
    contentContainer.appendChild(detailsDiv);
    contentContainer.appendChild(descDiv);

    // Łączenie całości w kartę
    card.appendChild(img);
    card.appendChild(contentContainer);

    return card;
}

// Pobieranie i dodawanie kart po załadowaniu DOM
document.addEventListener("DOMContentLoaded", async () => {
    const productionsContainer = document.querySelector(".productions-subpanels");
    if (!productionsContainer) {
        console.error('Productions container not found');
        return;
    }

    try {
        const response = await fetch('../Config/productions.txt');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        // Dzielimy na bloki oddzielone "---"
        const productions = text.split('---').map(prod => prod.trim()).filter(prod => prod);

        const fragment = document.createDocumentFragment();

        productions.forEach((prod, index) => {
            // Dzielimy na linie, usuwamy puste oraz komentarze (zaczynające się od #)
            const lines = prod.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            // Wymagamy minimum 4 linii: Tytuł, Firma, Czas, URL
            if (lines.length >= 4) {
                const title = lines[0];
                const company = lines[1];
                const time = lines[2];
                const thumbnail = lines[3];
                
                // Wszystkie linie od indeksu 4 w górę to treść opisu
                const descriptionBody = lines.slice(4);

                const card = createProductionCard(title, company, time, thumbnail, descriptionBody);
                fragment.appendChild(card);
            } else {
                console.error(`Invalid production data format at index ${index}. Expected at least 4 lines.`, lines);
            }
        });

        productionsContainer.appendChild(fragment);
    } catch (error) {
        console.error('Failed to load productions:', error);
    }
});