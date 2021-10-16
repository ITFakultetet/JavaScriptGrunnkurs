window.onload = function() {

        let area1 = document.getElementById('area1');
        let bakgrunn = false;

          // Endre bakgrunnsfarge med fargevelger
        document.getElementById('background-color').addEventListener("change",
            function() {
                document.body.style.backgroundColor = document.getElementById("background-color").value;
            });


            // sett bakgrunsfargen til lyseblå
        document.getElementById('knapp')
            .addEventListener('click', function() {
                if (!bakgrunn) {
                    let y = confirm('Vil du ha lyseblå bakgrunn?');
                    if (y) {
                        document.body.style.backgroundColor = "";
                        document.body.className = "lyseBlaa";
                        bakgrunn = true;
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
            .addEventListener('click', function() {
                area1.innerHTML = '<img id="bilde1" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBgvOmQuoS70nXrE18HJCGBV4mTnnV_E5EYu2po-NQV6qisTyQ">';
                area1.style.background = "#000";
                area1.style.width = "40%";
                area1.style.height = "300px";
                area1.style.display = "flex";
                area1.style.cssFloat = "left";
                area1.style.padding = "10px";
                area1.style.marginTop = "5px";
                area1.style.marginLeft = "5px";
                let bilde = document.getElementById('bilde1');
                bilde.style.border = "solid 10px red";
                bilde.style.margin = "auto";

                if (visBilde == false) {
                    document.getElementById('knapp3').innerHTML = "Skjul bilde";
                    document.getElementById("area1").style.visibility = "visible";

                    visBilde = true;
                } else {
                    document.getElementById('knapp3').innerHTML = "Vis bilde";
                    // document.getElementById("area1").style.visibility = "hidden";
                    area1.innerHTML = "";
                    area1.style.width = "0";
                    area1.style.height = "0";
                    area1.style.padding = "0";
                    area1.style.margin = "0";

                    visBilde = false;
                }
            });




        // Lag bokser
        document.getElementById('knapp4')
            .addEventListener('click', function() {
                lagBokser('bokser');
            });

        // Lag "tegneprogram"
        document.getElementById('knapp5')
            .addEventListener('click', function() {
                lagBokser('tegneprogram');
            });



        function lagBokser(bokstype) {

            let antall = prompt("Hvor mange bokser vil du lage?", "Antall bokser");

            for (let i = 1; i <= antall; i++) {

                let box = document.createElement("div");
                box.id = "box" + i;
              
                if (bokstype=='bokser') {
                   
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
                document.body.appendChild(box);
    

                if (bokstype=='tegneprogram') {
                    document.getElementById("box" + i).addEventListener("mouseover",
                    function() {
                        markerBoks(i);
                    });    

                } else {

                    box.appendChild(document.createTextNode(i));
                   
                    document.getElementById("box" + i).addEventListener("click",
                    function() {
                        markerBoks(i);
                    });
    
                    document.getElementById("box" + i).addEventListener("dblclick",
                    function() {
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
        .addEventListener('click', function() {
            area1.innerHTML = '<label for="brregsok">Søk i enhetsregisteret: </label>' +
                '<input type="text" id="brregsok" placeholder="Søk etter navn eller orgnr">' +
                ' <button id="send">Søk</button>';
            document.getElementById("send").addEventListener("click",
                function() {
                    let query = "https://hotell.difi.no/api/json/brreg/enhetsregisteret?query=" + document.getElementById("brregsok").value;
                    console.log(query);
                    let radDiv = document.createElement('div');
                    let radHTML = "";
                    area1.appendChild(radDiv);
                    radDiv.classList.add("rad");
                    fetch(query)
                        .then(resp => resp.json())
                        .then(data => {
                            let enheter = data.entries;
                            return enheter.map(a => {
                               radHTML+= `<span class="feltNavn">${a.navn}</span><span class="feltOrgnr">${a.orgnr}</span>`;
                            });

                        })
                        .catch(function() {
                            console.error("Noe gikk galt ...")
                        });
                });

        });




    } // end window.onload()