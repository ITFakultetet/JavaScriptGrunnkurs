// Eksempler på sortering med ulike språk. 

// For å bruke med node:
// Installer full-icu: npm i full-icu  (International Components for Unicode)
// Kjør med kommandoen: 
// node --icu-data-dir=node_modules/full-icu sortering_norsk.js 
// eller legg inn som env/bash - variabel:
// env NODE_ICU_DATA=/some/directory node  (windows)
// NODE_ICU_DATA="node_modules/full-icu"; export NODE_ICU_DATA; (linux)
// MERK: full-icu trengs ikke for sortering via netllesere.


require('full-icu');

const hasFullICU = (() => {
    try {
      const january = new Date(9e8);
      const spanish = new Intl.DateTimeFormat('es', { month: 'long' });
      return spanish.format(january) === 'enero';
    } catch (err) {
      return false;
    }
  })();


 
 // Sjekk om full-icu er installert - returnerer true eller false 
 console.log("full-icu er installert?: "+hasFullICU);
  

let folk = ["Åge","Mikkel","Kari","Jens","Øivind","Ola"];

console.log("Usortert\n");

console.log(folk);

console.log("\nDefault sortering\n");

console.log(folk.sort());

console.log("\nNorsk sortering\n");

console.log(folk.sort((a, b) => a.localeCompare(b, "nb")));


// med norsk som en egen funksjon
let norskSort = (a, b) => a.localeCompare(b, "nb");

console.log("\nNorsk sortering - egen funksjon\n");

console.log(folk.sort(norskSort));

