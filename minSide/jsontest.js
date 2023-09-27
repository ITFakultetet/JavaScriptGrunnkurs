let dyr = [
    { "navn": "Dagros", "art": "Ku", "alder": 6 },
    { "navn": "Litago", "art": "Ku", "alder": 8 },
    { "navn": "Ferdinand", "art": "Okse", "alder": 4 },
    { "navn": "Fluffykins", "art": "Drage", "alder": 105 },
    { "navn": "Bunny", "art": "Kanin", "alder": 2 }
];

/*
dyr.forEach(d => console.log(d.navn+" er en "+d.art));

let kyr = dyr.filter(k => k.art == "Ku");
console.log(kyr);
kyr.forEach(x => console.log("En ku: "+x.navn));

dyr.filter(a => a.art == "Drage").forEach(a => console.log(a.navn));

dyr.map(a => a.art).sort().reverse().forEach(a => console.log(a));
*/

let konto = [
    { "nummer": 1001, "transaksjon": 600 },
    { "nummer": 1002, "transaksjon": 300 },
    { "nummer": 1002, "transaksjon": 700 },
    { "nummer": 1001, "transaksjon": -200 },
    { "nummer": 1001, "transaksjon": -600 },
    { "nummer": 1001, "transaksjon": 6000 }
];

let saldo = konto.filter(x => x.nummer == 1002).map(x => x.transaksjon).reduce((x, y) => x + y);
console.log("Saldo for konto 1002:", saldo);

console.log("Første transaksjon til konto 1002 var:", konto.find(a => a.nummer == 1002).transaksjon);

let tall = [110, 12, 23, 43, 56, 87, 110, 34];

console.log(tall.reduce((a, b) => a + b) / tall.length);
console.log(tall.sort((a, b) => {
   // gjør noe mer her
    return a - b;
}));