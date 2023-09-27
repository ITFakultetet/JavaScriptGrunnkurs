window.onload = function () {

    const fargevelger = document.getElementById('bakgrunnsfarge');
    const knapp1 = document.getElementById("knapp1");
    const div1 = document.getElementById("div1");


    // Endre bakgrunnsfarge med fargevelger
    fargevelger.addEventListener("change", function () {
        document.body.style.backgroundColor = fargevelger.value;

    });

    // Vis eller skjul bilde
    let visBilde = false;

    knapp1.addEventListener("click", function () {

        div1.style.marginTop = "10px";

        if (visBilde == false) {
            knapp1.innerHTML = "Skjul Bilde";
            div1.style.visibility = "visible";
            div1.innerHTML = '<img id="bilde1" src="https://dynaimage.cdn.cnn.com/cnn/q_auto,w_1100,c_fill,g_auto,h_619,ar_16:9/http%3A%2F%2Fcdn.cnn.com%2Fcnnnext%2Fdam%2Fassets%2F201230100452-10-2021-travel-destinations-hawaii.jpg" width="600">';
            visBilde = true;
        } else {
            knapp1.innerHTML = "Vis Bilde";
            div1.style.visibility = "hidden";
            div1.innerHTML = "";
            visBilde = false;
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

    let markert = [];
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
    }

    function fjernBoks(i) {
        document.getElementById("box" + i).remove();
    }



    //Hent firma fra enhetsregisteret til Brreg

    //Lag eventhandler til knapp3
    document.getElementById("knapp3").addEventListener("click", hentFirmaInput);

    function hentFirmaInput() {

        div1.style.margin = "10px";
        div1.style.visibility = "visible";
        div1.innerHTML = '<label for="brregsok">Søk i enhetsregisteret</label> ' +
            '<input type="text" id="brregsok" placeholder="Søk etter firma">' +
            ' <button id="send">Søk</button>';
        // sett markøren inn i inputfeltet slik at brukeren kan begynne å skrive søkeord
        document.getElementById("brregsok").focus();

        //Lag eventhandler til send-knappen
        document.getElementById("send").addEventListener("click", hentFirma);

        // Lag eventhandler for Enter-tasten
        document.getElementById("brregsok").addEventListener("keypress", function(e) {
            if(e.key === 'Enter') {
                hentFirma();
            }
        });


        //Funksjon som henter data fra Brregs API
        function hentFirma() {
            let query = "https://hotell.difi.no/api/json/brreg/enhetsregisteret?query=" + document.getElementById("brregsok").value;
            console.log(query);

            div2.innerHTML = '<table id="tabell" class="tabell"></table>';
            fetch(query)
                .then(resp => resp.json())
                .then(data => {
                    let enheter = data.entries;
                    // Lag tabell-header
                    let th = tabell.insertRow();
                    let navn = th.insertCell(0);
                    navn.innerHTML = "Firmanavn";
                    navn.className = "th";
                    let orgnr = th.insertCell(1);
                    orgnr.innerHTML = "Orgnummer";
                    orgnr.className = "th";
                    // Hent firma og lag en rad med data for hvert firma

                    return enheter.map(a => {
                        let tr = tabell.insertRow();
                        let navnData = tr.insertCell(0);
                        navnData.innerHTML = a.navn;
                        navnData.className = "td";
                        let orgnrData = tr.insertCell(1);
                        orgnrData.innerHTML = a.orgnr;
                        orgnrData.className = "td";


                    })

                        .catch(function (error) {
                            console.error("Noe gikk galt...", error);
                        })


                });





        } // slutt på hentFirma

    } // slutt på hentFirmaInput



} // slutt på scriptet

