const fargevelger = document.getElementById('background-color');
// const mainheading = document.getElementById("mainheading");
// const knapp1 = document.getElementById("knapp1");
// const knapp2 = document.getElementById("knapp2");
// const knapp3 = document.getElementById("knapp3");
// const div1 = document.getElementById("div1");
// const div2 = document.getElementById("div2");
// const div3 = document.getElementById("div3");


fargevelger.value = "#ffffff";

// Endre bakgrunnsfarge med fargevelger
fargevelger.addEventListener("change", function () {

    document.body.style.backgroundColor = fargevelger.value;

    // console.log(document.getElementById('background-color').value);

    if (fargevelger.value < '#aaaaaa') {
        mainheading.style.color = "white";
        div1.style.color = "white";
    } else {
        mainheading.style.color = "black";
        div1.style.color = "black";
    }

});


// Knapp som viser eller skjuler ett bilde på siden
let visBilde = false;

knapp1.addEventListener("click", () => {
    // window.alert("Du klikket knapp1");
    div1.innerHTML = '<img id="bilde1" src="https://www.travelandleisure.com/thmb/AXJBQCP3vdF3UbrM3mStE5iI2as=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/maui-hawaii-MAUITG0221-50725a14980e4a3382eab85f50339099.jpg">';
    div1.style.marginTop = "10px";

    if (visBilde == false) {
        knapp1.innerHTML = "Skjul bilde";
        visBilde = true;
    } else {
        knapp1.innerHTML = "Vis bilde";
        div1.innerHTML = "";
        visBilde = false;
    }

});


// Lag bokser på siden

knapp2.addEventListener("click", () => {
    lagBokser();
});


function lagBokser() {
    div2.innerHTML = "";
    let antall = prompt("Hvor mange bokser vil du lage?", "Antall bokser");
    // console.log("Valgt antall bokser: " + antall);

    for (let i = 1; i <= antall; i++) {

        let box = document.createElement("div");
        box.id = "box" + i;
        box.style.width = "40px";
        box.style.height = "40px";
        box.style.marginLeft = "5px";
        box.style.marginTop = "5px";
        box.style.padding = "10px";
        box.style.border = "solid 1px silver";
        box.style.cssFloat = "left";
        box.style.backgroundColor = "#efefef";
        div2.appendChild(box);

        box.appendChild(document.createTextNode(i));

        document.getElementById("box" + i).addEventListener("click", () => {
            markerBoks(i);
        });

        document.getElementById("box" + i).addEventListener("dblclick", () => {
            fjernBoks(i);
        });



    } // end for loop

} // end lagBokser

let markert = [];

function markerBoks(i) {
    let boks = document.getElementById("box" + i);

    if (!markert[i]) {
        boks.style.backgroundColor = "#333";
        boks.style.color = "#fff";
        markert[i] = true;
    } else {
        boks.style.backgroundColor = "#efefef";
        boks.style.color = "#000";
        markert[i] = false;
    }

    visMarkerte();

} // end markerBoks(i)

function visMarkerte() {
    let tekst = "Markert:   ";
    for (b in markert) {
        markert[b] ? tekst = tekst + b + " " : tekst;
    }
    div1.style.padding = "5px";
    div1.innerHTML = tekst;
}

function fjernBoks(i) {
    document.getElementById("box" + i).remove();
    markert[i] = false;
    visMarkerte();
}

// Hent firma fra brreg.

knapp3.addEventListener("click", hentFirmaInput);

function hentFirmaInput() {
    div1.style.margin = "10px";
    div1.innerHTML = '<label for="brregsok">Søk i enhetsregisteret: </label>' +
        '<input type="text" id="brregsok" placeholder="Søk etter navn eller orgnr">' +
        ' <button id="send">Søk</button>';

    document.getElementById("brregsok").focus();

    brregsok.addEventListener("keydown", function (e) {
        if (e.key === 'Enter' && brregsok.value != "") {
            hentFirma();
        }

    });

    document.getElementById("send").addEventListener("click", () => {
        if (brregsok.value != "") {
            hentFirma();
        }
    });

    function hentFirma() {
        let query = "https://hotell.difi.no/api/json/brreg/enhetsregisteret?query=" + document.getElementById("brregsok").value;

        div2.innerHTML = "<table id='tabell' class='tabell'>  </table>";

        fetch(query)
            .then(resp => resp.json())
            .then(data => {
                let enheter = data.entries;
                // console.log(enheter);

                let th = tabell.insertRow();
                let navn = th.insertCell(0);
                navn.innerHTML = "Navn";
                navn.className = "th";
                let orgnr = th.insertCell(1);
                orgnr.innerHTML = "Orgnummer";
                orgnr.className = "th";

                return enheter.map(a => {
                    let tr = tabell.insertRow();
                    let navnData = tr.insertCell(0);
                    navnData.innerHTML = a.navn;
                    navnData.className = "td";
                    let orgnrData = tr.insertCell(1);
                    orgnrData.innerHTML = a.orgnr;
                    orgnrData.className = "td";
                });

            })
            .catch(function (error) {
                console.error("Noe gikk galt...:", error);
                div3.innerHTML = "Noe gikk galt...: " + error;
            });

    }

}