window.onload = function () {

    let tittel = document.querySelector("h1");
    tittel.innerHTML = "Velkommen til denne siden";
    tittel.style.backgroundColor = "navy";
    tittel.style.color = "white";
    tittel.style.padding = "10px";
    tittel.style.textAlign = ""

    document.querySelector("h3+p").style.backgroundColor = "silver";

    // create a new div element
    const newDiv = document.createElement("div");

    // and give it some content
    const newContent = document.createTextNode("Og her kommer enda mer tekst!");

    // add the text node to the newly created div
    newDiv.appendChild(newContent);

    // add the newly created element and its content into the DOM
    const currentDiv = document.getElementById("div1");
    document.body.insertBefore(newDiv, currentDiv);


}