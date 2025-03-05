// Elements
const knapp1 = document.getElementById("knapp1");
const knapp2 = document.getElementById("knapp2");
const knapp3 = document.getElementById("knapp3");
const div1 = document.getElementById("div1");
const div2 = document.getElementById("div2");
const colorpicker = document.getElementById("colorpicker");
let markert = [];


// Endre bakgrunnsfarge med fargevelger

colorpicker.addEventListener("change", function () {

    console.log("Verdien av fargevelgeren er nå: ", colorpicker.value);

    if (colorpicker.value < "#aaa") {
        document.body.style.color = "white";
    } else {
        document.body.style.color = "black";
    }

    document.body.style.backgroundColor = colorpicker.value

});


// Vis eller skjul bilde

let visBilde = false;

knapp1.addEventListener("click", function () {

    if (visBilde == false) {
        knapp1.innerHTML = "Skjul Bilde";
        div1.innerHTML = '<img id="bilde1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/0020-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%A3%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg/1280px-0020-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%A3%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg">';
        visBilde = true;
    } else {
        knapp1.innerHTML = "Vis Bilde";
        div1.innerHTML = '';
        visBilde = false;
    }

});


// Funksjonalitet for å lage bokser

knapp2.addEventListener("click", function () {
    lagBokser();
});

function lagBokser() {

    div1.innerHTML = ''; // Fjerner listen over markerte bokser
    markert = []; // Fjerner evt tidligere markeringer
 
    let sikker = true;

    const antall = prompt("Hvor mange bokser vil du lage", "Antall bokser");

    if (antall > 1000) {
        sikker = confirm("Er du helt sikker på at du vil lage " + antall + " bokser?");
    }

    if (sikker == true) {

        div2.innerHTML = '';

        for (let i = 1; i <= antall; i++) {

            let box = document.createElement("div");
            box.id = "box" + i;
            box.classList.add("unmarkedbox");
           
            div2.appendChild(box);

            box.appendChild(document.createTextNode(i));

            document.getElementById("box" + i).addEventListener("click", function () {
                markerboks(i);
            });

            document.getElementById("box" + i).addEventListener("dblclick", function () {
                fjernboks(i);
            });

        } // end loop

    } else {
        div2.innerHTML = ''; // fjerner gamle bokser
    } //end if-else

} // end lagbokser


function markerboks(i) {
    const box = document.getElementById("box" + i);
    if (!markert[i]) {
        box.classList.add("markedbox");
        markert[i] = true;
    } else {
        box.classList.remove("markedbox");
        box.classList.add("unmarkedbox");
        markert[i] = false;
    }
    visMarkerte();
}


function visMarkerte() {
    let tekst = "Markert:    ";
    for(boks in markert) {
        markert[boks] ? tekst = tekst + boks + " " : tekst;
    }

    div1.innerHTML = tekst;
}

function fjernboks(i) {
    document.getElementById("box"+i).remove();
    markert[i] = false;
    visMarkerte()
}


// Hent bedrifter fra Brønnøysundregisteret
knapp3.addEventListener("click", hentFirmaInput);

function hentFirmaInput() {
    div1.style.margin = "10px";
    div1.style.visibility = "visible";
    div1.innerHTML = '<label for="brregsok">Søk i enhetsregisteret: </label>' +
        '<input type="text" id="brregsok" placeholder="Søk etter navn eller orgnr">' +
        ' <button id="send">Søk</button>';


    div2.innerHTML = "";
    document.getElementById("brregsok").focus();


    brregsok.addEventListener("keydown", function (e) {
        if (e.key === 'Enter' && brregsok.value != "") {
            hentFirma();
        }
    });

    document.getElementById("send").addEventListener("click", hentFirma);


    function hentFirma() {
        let query = "https://data.brreg.no/enhetsregisteret/api/enheter?navn=" + document.getElementById("brregsok").value;
        //  console.log(query);
        div2.innerHTML = "";
        div2.innerHTML = "<table id='tabell' class='tabell'></table>";
        fetch(query)
            .then(resp => resp.json())
            .then(data => {
                let enheter = data._embedded.enheter;
                console.log(enheter);

                let th = tabell.insertRow();
                let navn = th.insertCell(0);
                navn.innerHTML = "Navn";
                navn.className = "th";
                let orgnr = th.insertCell(1);
                orgnr.innerHTML = "Orgnummer";
                orgnr.className = "th";
                let aktivitet = th.insertCell(2);
                aktivitet.innerHTML = "Aktivitet";
                aktivitet.className = "th";

                return enheter.map(a => {
                    let tr = tabell.insertRow();
                    let navnData = tr.insertCell(0);
                    navnData.innerHTML = a.navn;
                    navnData.className = "td";
                    let orgnrData = tr.insertCell(1);
                    orgnrData.innerHTML = a.organisasjonsnummer;
                    orgnrData.className = "td";
                    let aktivitet = tr.insertCell(2);
                    aktivitet.innerHTML = a.aktivitet;
                    aktivitet.className = "td";

                });

            })

            .catch(function (error) {
                console.error("Noe gikk galt ...", error)
            });

    };

};

