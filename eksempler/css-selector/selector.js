    let tittel = document.querySelector("h1");
    tittel.innerHTML = "Velkommen til denne siden";
    tittel.style.backgroundColor = "navy";
    tittel.style.borderRadius = "10px";
    tittel.style.color = "white";
    tittel.style.padding = "10px";
    tittel.style.textAlign = "";

    
    // Velg alle <p>-elementer i det første <section>-elementet under elementet med id=artikkel1,
    // mao alle avsnitt i første seksjon i artikkel 1, og gi dem css-klassen silver
    const parentElement = document.querySelector('#artikkel1>section');
    let allChildren = parentElement.querySelectorAll(":scope > p");
    allChildren.forEach(item => item.classList.add("silver"));

    // Velg første avsnitt i alle seksjoner i alle artikler og gi dem css-klassen silver.
    let avsnitt1 = document.querySelectorAll("article>section>h3+p");
    avsnitt1.forEach(avsnitt => avsnitt.classList.add("silver"));

    // Lag et nytt div-element
    const newDiv = document.createElement("div");

    // Lag litt innhold i en tekstnode
    const newContent = document.createTextNode("Og her kommer en tekst satt inn med javascript!");

    // og legg tekstnoden til det nye div-elementet
    newDiv.appendChild(newContent);

    // og legg det nye div-elementet og dets innhold til i DOM før div2
    const div2 = document.getElementById("div2");
    document.body.insertBefore(newDiv, div2);
