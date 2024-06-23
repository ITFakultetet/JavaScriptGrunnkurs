
// Eksempel 1: Funksjon for summering av ukjent antall parametre 
// ved hjelp av spread (...) og reduce()
const summer = (...tall) => [...tall].reduce((x, y) => x + y,0);
const summen = summer(3,45,65,78);
console.log("Summen er:", summen); // 191


// Eksempel 2: Funksjon for beregning av produkt av ukjent antall parametre 
// ved hjelp av spread (...) og reduce()
const produkt = (...tall) => [...tall].reduce((x, y) => x * y,1);
const produktet = produkt(3, 4, 6, 45);
console.log("Produktet er:", produktet); // 3240

//Eksempel 3
// spread (...) for å slå sammen to arrays og lage et JSON objekt av dem
const biler1 = ['Volvo','Mercedes','Honda'];
const biler2 = ['Nissan','Volkswagen','Renault'];
const biler = [...biler1,...biler2];
console.log(biler);   // [ 'Volvo', 'Mercedes', 'Honda', 'Nissan', 'Volkswagen', 'Renault' ]

const biler_objekt = {...biler};
console.log(biler_objekt); 
// {
//     '0': 'Volvo',
//     '1': 'Mercedes',
//     '2': 'Honda',
//     '3': 'Nissan',
//     '4': 'Volkswagen',
//     '5': 'Renault'
//   }
  

