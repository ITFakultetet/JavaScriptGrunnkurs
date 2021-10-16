window.onload = function () {

    let area1 = document.getElementById('area1');
    let bakgrunn = false;


    // Endre bakgrunnsfarge med fargevelger
    document.getElementById('background-color').addEventListener("change",
        function () {
            document.body.style.backgroundColor = document.getElementById("background-color").value;
        });


    // sett bakgrunsfargen til lyseblå
    document.getElementById('knapp')
        .addEventListener('click', function () {
            if (!bakgrunn) {
                let y = confirm('Vil du ha lyseblå bakgrunn?');
                if (y) {
                    document.body.style.backgroundColor = "";
                    document.body.className = "lyseBlaa";
                    bakgrunn = true;
                    document.getElementById("knapp").innerHTML="Tilbakestill farge";
                }

            } else {
                let y = confirm('Tilbakestill bakgrunnsfarge?');
                if (y) {
                    document.body.style.backgroundColor = "";
                    document.body.className = "";
                    bakgrunn = false;
                }

            }

        });


    // vis og skjul bilde fra internett
    let visBilde = false;
    document.getElementById('knapp3')
        .addEventListener('click', function () {
            bildeBox.innerHTML = '<img id="bilde1" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBgvOmQuoS70nXrE18HJCGBV4mTnnV_E5EYu2po-NQV6qisTyQ">';
            bildeBox.style.background = "#000";
            bildeBox.style.width = "40%";
            bildeBox.style.height = "300px";
            bildeBox.style.display = "flex";
            bildeBox.style.cssFloat = "left";
            bildeBox.style.padding = "10px";
            bildeBox.style.marginTop = "5px";
            bildeBox.style.marginLeft = "5px";
            let bilde = document.getElementById('bilde1');
            bilde.style.border = "solid 10px red";
            bilde.style.margin = "auto";

            if (visBilde == false) {
                knapp3.innerHTML = "Skjul bilde";
                bildeBox.style.visibility = "visible";

                visBilde = true;
            } else {
                knapp3.innerHTML = "Vis bilde";
                bildeBox.style.visibility = "hidden";
                bildeBox.style.height = 0;
                bildeBox.style.width = 0;

                visBilde = false;
            }
        });




    // Lag bokser
    document.getElementById('knapp4')
        .addEventListener('click', function () {
            lagBokser('bokser');
        });

    // Lag "tegneprogram"
    document.getElementById('knapp5')
        .addEventListener('click', function () {
            lagBokser('tegneprogram');
        });



    function lagBokser(bokstype) {

        area2.innerHTML = "";
        area1.innerHTML = "";
        let antall = prompt("Hvor mange bokser vil du lage?", "Antall bokser");

        for (let i = 1; i <= antall; i++) {

            let box = document.createElement("div");
            box.id = "box" + i;

            if (bokstype == 'bokser') {

                box.style.width = "40px";
                box.style.height = "40px";
                box.style.marginLeft = "5px";
                box.style.marginTop = "5px";
                box.style.padding = "10px";
                box.style.border = "solid 1px silver";


            } else if (bokstype == 'tegneprogram') {

                box.style.width = "2px";
                box.style.height = "2px";
                box.style.marginLeft = "0px";
                box.style.marginTop = "0px";
                box.style.padding = "2px";


            }


            box.style.cssFloat = "left";

            box.style.backgroundColor = "#efefef";
            area2.appendChild(box);


            if (bokstype == 'tegneprogram') {
                document.getElementById("box" + i).addEventListener("mouseover",
                    function () {
                        markerBoks(i);
                    });

            } else {

                box.appendChild(document.createTextNode(i));

                document.getElementById("box" + i).addEventListener("click",
                    function () {
                        markerBoks(i);
                    });

                document.getElementById("box" + i).addEventListener("dblclick",
                    function () {
                        fjernBoks(i);
                    });



            }

        } // end loop
    } // end lagBokser

    function fjernBoks(i) {
        document.getElementById("box" + i).remove();
    }

    function markerBoks(i) {
        let boks = document.getElementById("box" + i);
        boks.style.backgroundColor = "#333";
        boks.style.color = "white";

    }


    // Hent navn og orgnummer på bedrifter fra enhetsregisteret
    document.getElementById('knapp6')
        .addEventListener('click', function () {
            area2.innerHTML = "";
            area1.innerHTML = '<label for="brregsok">Søk i enhetsregisteret: </label>' +
                '<input type="text" id="brregsok" placeholder="Søk etter navn eller orgnr">' +
                ' <button id="send">Søk</button>';
                document.getElementById("brregsok").focus();
            //  area2.style.height = "1000px"; 
            document.getElementById("send").addEventListener("click",
                function () {
                    let query = "https://hotell.difi.no/api/json/brreg/enhetsregisteret?query=" + document.getElementById("brregsok").value;
                    console.log(query);
                    area2.innerHTML = "";
                    area2.innerHTML = "<table id='tabell' class='tabell'></table>";
                    fetch(query)
                        .then(resp => resp.json())
                        .then(data => {
                            let enheter = data.entries;
                            console.log(enheter);
                            let th = tabell.insertRow();
                            let navn = th.insertCell(0);
                            navn.innerHTML = "Navn";
                            navn.className="th";
                            let orgnr = th.insertCell(1);
                            orgnr.innerHTML = "Orgnummer";
                            orgnr.className="th";

                            return enheter.map(a => {
                                let tr = tabell.insertRow();
                                let navnData = tr.insertCell(0);
                                navnData.innerHTML = a.navn;
                                navnData.className="td";
                                let orgnrData = tr.insertCell(1);
                                orgnrData.innerHTML = a.orgnr;
                                orgnrData.className="td";

                            });

                        })

                        .catch(function () {
                            console.error("Noe gikk galt ...")
                        });


                });

        });




} // end window.onload()