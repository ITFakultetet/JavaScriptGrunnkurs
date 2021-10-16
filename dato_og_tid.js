// Eksempler på Dato og tid med JavaScript

const d = new Date();
console.log("I dag er det den "+d.getDay()+". dagen  i uka"); 
console.log("Måneden er: "+(d.getMonth()+1);


// Måling av tid
let start = Date.now(); // millisekunder fra midnatt 1. Jan 1970

// Gjør noe
for (let i = 0; i < 1000000; i++) {
  let doSomething = i * i * i;
}

let end = Date.now(); // Tiden etter at løkken er gjennomført

console.log( `Løkken tok ${end - start} ms` ); // Regner med heltall, ikke datoer