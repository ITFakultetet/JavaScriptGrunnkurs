//Eksempler på strengefunksjoner

// Konverter til store bokstaver med toUpperCase() eller små med to LowerCase() 
const tekst1 = "Dette er en tekst som inneholder æøå";
const storeBokstaver = tekst1.toUpperCase();
console.log(storeBokstaver);

const smaaBokstaver = storeBokstaver.toLowerCase();
console.log(smaaBokstaver);

// Finn antall tegn i en tekst med egenskapen length
console.log("tekst1 inneholder",tekst1.length,"tegn.");

// Søk i tekst med regulære uttrykk og match()
console.log(tekst1.match(/inneholder/));
console.log(tekst1.match(/JavaScript/));
console.log(tekst1.match(/inneholder/).index);
 
// Trimme bort ekstra mellomrum i start og slutt
const tekst2 = "     Tekst med ekstra mellomrom      ";
console.log(tekst2);
console.log(tekst2.trim().replace(" med ", " uten ").toUpperCase());

// Repeter en streng med repeat()
const tekst3 = "Hei ";
console.log(tekst3.repeat(5));

console.log("-".repeat(30));


// Erstatte deler av en tekst med replace()
const gammel = "Dette er en ny tekst".replace("ny", "gammel");
console.log(gammel);


// Regex-erstatning med replace()
let re = /epler/gi;
let str = "Epler er runde og epler er saftige.";
let nystr = str.replace(re, "appelsiner");
let nystr2 = str.replace(/epler/gi, "appelsiner");

console.log(nystr);

console.log(nystr2);

// lag lenke med link()
let str2 = new String("Kursportal");
let URL = "http://www.itfakultetet.no/kurs";
console.log(str2.link( URL ));

// eller lag en lenke direkte:
console.log("Kursportal".link("http://www.itfakultetet.no/kurs"));

// split() og join()

let tegn = "Dette er en setning med bokstaver og mellomrom".split('');
console.log(tegn);

let setningFraTegn = tegn.join('')
console.log(setningFraTegn);

let setningMedSkilletegn = "Dette er en setning".split('').join('-');
console.log(setningMedSkilletegn);


// Skriv en setning baklengs:
let baklengs = "Dette er en setning".split("").reverse().join("");
console.log(baklengs,'\n');

// Finn en bokstavs indeksverdi i en setning
let str3 = "Dette er en setning som har bokstaven å i seg";
console.log(str3,'\n');
let indeksverdi = str3.search("å");
console.log("\"å\" er bokstav nummer:",indeksverdi);


// startsWith(), endsWith() og includes() 

let str4 = "Dette er starten og dette er slutten på teksten";

console.log(str4.startsWith("Dette")); // true
console.log(str4.endsWith("slutten"));  // false
console.log(str4.includes("på"));       // true

console.log("Dette er en setning med bokstaver og mellomrom".split(' ').reverse().join(' '));