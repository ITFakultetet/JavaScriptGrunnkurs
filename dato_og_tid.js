// Eksempler på Dato og tid med JavaScript

const d = new Date();
console.log("I dag er det den "+(d.getDay())+". dagen  i uka"); 
console.log("Måneden er: "+(d.getMonth()+1));

// Ukedager ved navn:
const ukedager = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
console.log("I dag er ukedagen:",ukedager[d.getDay()]);

const tidsstempel = Date.parse("2021-10-18T13:30:45");
console.log("18. Oktober 2021 kl 13:30:45 var Unix Timstamp :",tidsstempel); 

const tidsstempel2 = Date.now()
console.log("Akkurat nå er Unix Timestamp :",tidsstempel2); 

console.log("Som vil si at det er :",(tidsstempel2-tidsstempel)/(1000*60*60),"timer siden kl 13:30 den 18. oktober 2021");


// Måling av tidlog
let start = Date.now(); // millisekunder fra midnatt 1. Jan 1970

// Gjør noe
let doSomething = 0;
for (let i = 1; i < 100000; i++) {
     doSomething = i * i;
}
console.log("Tallet ble:",doSomething);


setTimeout(() => {
 console.log("Hei, etter 5 sekunder"); 
}, 5000);

let end = Date.now(); // Tiden etter at løkken er gjennomført

console.log( `Løkken tok ${end - start} ms` ); // Regner med heltall, ikke datoer
