    let tittel = document.querySelector("h1");
    tittel.innerHTML = "Velkommen til denne siden";
    tittel.style.backgroundColor = "navy";
    tittel.style.borderRadius = "10px";
    tittel.style.color = "white";
    tittel.style.padding = "10px";
    tittel.style.textAlign = "";

    
    // Velg alle <p>-elementer i det første <section>-elementet under elementet med id=artikkel1,
    // mao alle avsnitt i første seksjon i artikkel 1.
    const parentElement = document.querySelector('#artikkel1>section');
    let allChildren = parentElement.querySelectorAll(":scope > p");
    allChildren.forEach(item => item.classList.add("silver"));
    
    let avsnitt1 = document.querySelectorAll("article>section>h3+p");
    avsnitt1.forEach(avsnitt => avsnitt.classList.add("silver"));

    // create a new div element
    const newDiv = document.createElement("div");

    // and give it some content
    const newContent = document.createTextNode("Og her kommer en tekst satt inn med javascript!");

    // add the text node to the newly created div
    newDiv.appendChild(newContent);

    // add the newly created element and its content into the DOM
    const currentDiv = document.getElementById("div2");
    document.body.insertBefore(newDiv, currentDiv);
