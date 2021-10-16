esversion: 6;
// Eksempler på bruk av reduce()

// Eksempel 1: Beregne saldo for en konto

let konto = [
    { "nummer": 1001, "transaksjon": 600 },
    { "nummer": 1002, "transaksjon": 300 },
    { "nummer": 1002, "transaksjon": 700 },
    { "nummer": 1001, "transaksjon": -200 },
    { "nummer": 1001, "transaksjon": -600 },
    { "nummer": 1001, "transaksjon": 6000 }
];

let saldo = konto.filter(x => x.nummer === 1001).map(x => x.transaksjon).reduce((x, y) => x + y);

console.log("Saldo for konto 1001:", saldo);

// Output:
// Saldo for konto 1001: 5800

// Eksempel 2: Funksjon for summering av ukjent antall parametre 
// ved hjelp av spread (...) og reduce()
const summer = (...args) => [...args].reduce((x, y) => x + y);
const summen = summer(3, 4, 6, 45);
console.log("Summen er:", summen); // 58


// Eksempel 3: Funksjon for beregning av produkt av ukjent antall parametre 
// ved hjelp av spread (...) og reduce()
const produkt = (...tall) => [...tall].reduce((x, y) => x * y);
const produktet = produkt(3, 4, 6, 45);
console.log("Produktet er:", produktet); // 3240