
// Eksempler på bruk av Arrays.

// Eksempel 1: Liste over kursdager

// Lag en enkel liste over kursdager;
let minListe = ["Første kursdag","Andre kursdag","Tredje kursdag"];

console.log("Det er opprinnelig "+minListe.length+" dager i listen:\n");

// Bla gjennom listen og skriv elementene til konsoll med forEach
minListe.forEach(dag => console.log(dag));

console.log();  // lag et linjeskift

minListe.unshift("Dagen før kursstart"); // Legg til et element på begynnelsen av listen
minListe.push("Første dag etter kurset"); // Legg til et element på slutten av listen

console.log("Det er nå "+minListe.length+" dager i listen:\n");

// Bla gjennom listen og skriv elementene til konsoll med forEach
minListe.forEach(function(dag) {
  console.log(dag);
});

console.log();  // lag et linjeskift

// Skriv listen ut som en kommaseparert liste med toString
console.log("Som kommaseparert tekst: "+minListe.toString());

console.log();  // lag et linjeskift

minListe.shift(); // Fjern første på listen
minListe.pop();   // Fjern siste på listen

console.log("Det er nå "+minListe.length+" dager i listen:\n");

// Bla gjennom ilsten og skriv elementene til konsoll med en for-løkke
for (let index = 0; index < minListe.length; index++) {
  console.log(minListe[index]);
}

console.log();  // lag et linjeskift

// Skriv listen ut som en liste adskilt med et gitt tegn ( her tabulator \t):
console.log("Som tabulatorseparert tekst: "+minListe.join("\t"));

// Slett og legg til fra inne i listen med splice()

minListe.splice(1,1) // Fjern Andre kursdag;

console.log("Andre kursdag er slettet: "+minListe.join(" - "));

minListe.splice(1,0,"Andre kursdag") // Legg til Andre kursdag igjen;

console.log("Andre kursdag er lagt til igjen, på riktig sted: "+minListe.join(" - "));

// Skjøte på et array til minListe-arrayet
console.log(minListe.concat(["Ny dag","Enda en ny dag"]));


// Eksempel 2: Telle antall ord i en setning

let setning = "Det var en gang en stor krig i en fremmed verdensdel";

let ord = setning.split(" ");

// Tell antall ord

console.log(setning);
console.log("Antall ord:",ord.length);





