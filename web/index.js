const div1 = document.getElementById("div1");
const div2 = document.getElementById("div2");
const knapp1 = document.getElementById("knapp1");
const knapp2 = document.getElementById("knapp2");
const knapp3 = document.getElementById("knapp3");

let markert = [];


// Endre bakgrunnsfarge med fargevelger
document.getElementById('background-color').addEventListener("change", function () {
    document.body.style.backgroundColor = document.getElementById("background-color").value;
    //  console.log(document.getElementById("background-color").value);
    if (document.getElementById("background-color").value < '#aaaaaa') {
        document.getElementById("mainheading").style.color = "white";
        document.querySelector("div").style.color = "white";
    } else {
        document.getElementById("mainheading").style.color = "black";
        document.querySelector("div").style.color = "black";
    }
});


// Vis eller skjul bilde
let visBilde = false;
knapp1.addEventListener("click", () => {
    div1.innerHTML = '<img id="bilde1" src="https://akamai.vgc.no/v2/images/e873e2d9-6e72-42e3-b5e9-b83423ae36f9?fit=crop&format=auto&h=1267&w=1900&s=ce31bdc24caad0e4a4b38b36d7c445a4c22073f4">';
    div1.style.marginTop = "10px";

    if (visBilde == false) {
        knapp1.innerHTML = "Skjul Bilde";
        div1.style.visibility = "visible";
        visBilde = true
    } else {
        knapp1.innerHTML = "Vis Bilde"
        div1.style.visibility = "hidden";
        div1.innerHTML = "";
        visBilde = false
    }

});


knapp2.addEventListener("click", function () {
    lagBokser();
});


function lagBokser() {

    div2.innerHTML = "";
    let antall = prompt("Hvor mange bokser vil du lage?", "Antall bokser");

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

        document.getElementById("box" + i).addEventListener("click",
            function () {
                markerBoks(i);
            });

        document.getElementById("box" + i).addEventListener("dblclick",
            function () {
                fjernBoks(i);
            });


    } // end loop
} // end lagBokser


function markerBoks(i) {
    let boks = document.getElementById("box" + i);
    if (!markert[i]) {
        boks.style.backgroundColor = "#333";
        boks.style.color = "white";
        markert[i] = true;
    } else {
        boks.style.backgroundColor = "#efefef"
        boks.style.color = "black";
        markert[i] = false;

    }
    visMarkerte(); 
}

function visMarkerte() {
let tekst = "Markert:   ";
 for(boks in markert ) {
    markert[boks]==true? tekst = tekst + boks+" " : tekst; 
}
 div1.innerHTML=tekst;  
}


function fjernBoks(i) {
    document.getElementById("box" + i).remove();
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
        let query = "https://hotell.difi.no/api/json/brreg/enhetsregisteret?query=" + document.getElementById("brregsok").value;
        //  console.log(query);
        div2.innerHTML = "";
        div2.innerHTML = "<table id='tabell' class='tabell'></table>";
        fetch(query)
            .then(resp => resp.json())
            .then(data => {
                let enheter = data.entries;
                console.log(enheter);

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
                console.error("Noe gikk galt ...", error)
            });

    };

};

