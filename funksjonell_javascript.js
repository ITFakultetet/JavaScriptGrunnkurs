// Eksempler på higher order functions i JavaScript: 
// map(), filter(), reduce(), forEach(), sort(), find()


// Et array med dyre-objekter

let dyr = [
  {navn:"Ola",art:"Katt",alder:6},
  {navn:"Petter",art:"Katt",alder:4},
  {navn:"Pan",art:"Hund",alder:8}
];


// 1. Hent deler av objektene med map() og skriv ut som et array
console.log("1. Skrevet ut som array med funksjonen map():");
console.log(dyr.map(x => x.navn+" er en "+x.art));

console.log("-------------------------------------");

// 2. Hent deler av objektene med map() og skriv ut med forEach
console.log("2. Skrevet ut som tekst med forEach():");
dyr.forEach(x => console.log(x.navn+" er en "+x.art));

console.log("-------------------------------------");

// 3. Hent alle katter med filter() og skriv ut som tekst
let katter = dyr.filter(x => x.art=="Katt");

console.log("3. Liste over dyr som er katter, filtrert ut med funksjonen filter():");

katter.forEach(katt => console.log("En katt: "+katt.navn));

console.log("-------------------------------------");

// 4. Hent alle katter som heter Ola, med filter()

console.log("4. Liste over katter som heter Ola, filtrert ut med funksjonen filter():");

let Ola = dyr.filter(x => x.art=="Katt" && x.navn=="Ola");
console.log(Ola);

console.log("-------------------------------------");

// 5. Skriv ut med map() og en funksjon over flere linjer  
console.log("5. Skrevet ut med map() og en funksjon over flere linjer ");


let setning1 = dyr.map(function(x) {
return x.navn+" er en "+x.art;
});

console.log(setning1);

console.log("-------------------------------------");

// 6. Skriv ut med map() og en fat arrow funksjon over flere linjer  
console.log("6. Skrevet ut med map() og en \"fat arrow\" funksjon over flere linjer ");


let setning2 = dyr.map( x => {
  return x.navn+" er en "+x.art
});
console.log(setning2);

console.log("-------------------------------------");

// 7. Beregne sum og produkt at et array med tall med reduce()
console.log("7. Beregne sum og produkt av et array med tall med reduce():\n");

let tall = [1,2,3,4,5,6];

console.log("Summen av "+tall+" er: ",tall.reduce((x, y) => x+y , 0));  // Begynn med null
console.log("Produktet av "+tall+" er: ",tall.reduce((x, y) => x*y, 1)); // Begynn med 1, for å unngå at neste tall ganges med null

console.log("-------------------------------------");

//8. Beregne saldo for en konto med reduce()
console.log("8. Beregne saldo for en konto med reduce()");

let konto = [
  {"nummer":1001,"transaksjon":600},
  {"nummer":1002,"transaksjon":300},
  {"nummer":1002,"transaksjon":700},
  {"nummer":1001,"transaksjon":-200},
  {"nummer":1001,"transaksjon":-600},
  {"nummer":1001,"transaksjon":6000}
  ];
  
  let saldo = konto.filter(x => x.nummer===1001).map(x => x.transaksjon).reduce((x,y) => x+y);
  
  console.log("Saldo for konto 1001:",saldo);
  


// 9. Finn den første transaksjonen til kontonummer 1002 med find() og map()

console.log("Første transaksjon til konto 1002 var:", konto.find( a => a.nummer === 1002).transaksjon);

// 10. Sorter etter størrelsen på transaksjonene

console.log("Sortert etter størrelsen på transaksjonene");

let kontoSortert = konto.sort((a,b) => a.transaksjon > b.transaksjon ? 1 : -1);  // merk bruk av den tredelte operatoren (ternary operator)

console.log(kontoSortert);

// 11. enkel sortering av tall-array
let tall2 = [45,43,456,23,4,2];
console.log("Usorterte tall",tall2);

let tall2Sortert = tall2.sort((a,b)=> a - b); // Gir samme resultat som med tredelt operator, dvs + hvis a > b, - hvis a < b
console.log("Sorterte tall",tall2Sortert);

console.log("Tall sortert som tekst",tall2.sort());


// 12. Beregn og skriv ut snittalderen på dyrene i øvelse 1
console.log("Dyrenes snittalder = ",dyr.map(a => a.alder).reduce((a,b) =>  (a+b) ) / dyr.length );

// 13. Skriv ut dyrenes navn som tabulator-separert liste
console.log("Dyrenes navn som tabulatorseparert liste: ",dyr.map(a=>a.navn).join("\t"));
