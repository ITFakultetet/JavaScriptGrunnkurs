
let kontakter = [
    { fornavn: "Nils", etternavn: "Berg", kjønn: "M", alder: 33 },
    { fornavn: "Ola", etternavn: "Aamodt", kjønn: "M", alder: 45 },
    { fornavn: "Kari", etternavn: "Jensen", kjønn: "K", alder: 29 }
];

// Filtrer ut alle menn med filter(), formater resultatet med en map() og en join() 
let menn = kontakter.filter(x => x.kjønn === "M")
    .map(x => x.fornavn + ' ' + x.etternavn).join('\n');

console.log(menn);

const snittalder = liste => liste.map(l => l.alder).reduce((a, b) => a + b) / liste.length

console.log("Snittalder på kontaktene er:", snittalder(kontakter).toFixed(2), "år.");

//sortere kun alder
kontakter.map(a => a.alder).sort().forEach(a => console.log(a));

console.log(kontakter);
console.log("-".repeat(40));

//sortert etter alder, synkende
kontakter.toSorted((a, b) => a.alder - b.alder).forEach(a => console.log(a));
console.log("-".repeat(40));
//sortert etter alder, sstigende
kontakter.toSorted((a, b) => b.alder - a.alder).forEach(a => console.log(a));
console.log("-".repeat(40));

//sortere etter etternavn på norsk
kontakter.toSorted((a,b) => a.etternavn.localeCompare(b.etternavn,'nb')).forEach(a => console.log(a));
console.log("-".repeat(40));

//sortere etter etternavn på engelsk
kontakter.toSorted((a,b) => a.etternavn.localeCompare(b.etternavn,'en')).forEach(a => console.log(a));
console.log("-".repeat(40));


console.log(kontakter);

