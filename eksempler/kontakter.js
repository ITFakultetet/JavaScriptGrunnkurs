let kontakter = [
    { fornavn: "Nils", etternavn: "Berg", kjønn: "M", alder: 133 },
    { fornavn: "Ola", etternavn: "Aamodt", kjønn: "M", alder: 45 },
    { fornavn: "Kari", etternavn: "Jensen", kjønn: "K", alder: 29 }
];

let menn = kontakter.filter(x => x.kjønn == "M").map(x => x.fornavn+ " " + x.etternavn).join(", ");

// console.log(menn);

function snittalder (alder)  { 
    return alder.reduce((a,b)=>a+b)/alder.length 
}

// console.log("Snittalder på kontaktene er: "+ snittalder(kontakter.map(a => a.alder)).toFixed(2)+" år");

kontakter.toSorted((a,b) => a.alder - b.alder).forEach(a => console.log(a));
console.log("-".repeat(50));
kontakter.toSorted((a,b) => a.etternavn.localeCompare(b.etternavn,'nb')).forEach(a => console.log(a));