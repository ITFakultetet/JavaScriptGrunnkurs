// lag et sett med farger
let farger = new Set(['rød', 'grønn', 'blå']);
console.log(farger);

// Legg til en farge
farger.add("gul");
console.log(farger);

//Eller legg til flere farger med en kjede av adds
farger.add('hvit').add('svart').add('rød').add('lilla');

console.log(farger);
// Legg merke til at rød ikke blir lagt til en gang til

// bla gjennom set
for (let farge of farger) {
    console.log("Farge:", farge);
}

// konverter set til Array med spread (...)
let fargeArr = [...farger];

// skriv ut arrayet
console.log("Farger som array:", fargeArr);

// skriv ut med join
console.log("Farger som array skrevet ut med join:", fargeArr.join(' - '));

// Tell antall unike ord i en setning
let unikeOrd = new Set();

ord = "Dette er en setning som er en test".split(" ");

ord.map(x => unikeOrd.add(x));

console.log("Antall unike ord:", unikeOrd.size);