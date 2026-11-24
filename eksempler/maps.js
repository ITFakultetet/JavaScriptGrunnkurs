// Eksempler på bruk av map

let terje = new Map();

// Lagre verdier i map-objektet
terje.set("fornavn","Terje");
terje.set("etternavn","Berg-Hansen");
terje.set("epost",["terje@itfakultetet.no","terje@mongodb.no"]);
terje.set("adresse",{"gate":"Kåsabakken 28","postnr":"3804","poststed":"Bø i Telemark"})

// Hente verdier fra map-objektet
console.log("Terjes eposter som array: ",terje.get("epost"));
console.log("Terjes eposter som tekststreng: ",terje.get("epost").toString());
console.log("Terjes epost 1: ",terje.get("epost")[0]);
console.log("Terjes epost 2: ",terje.get("epost")[1]);

console.log("Terjes adresse som objekt: ",terje.get("adresse"));
console.log("Terjes gateadresse: ",terje.get("adresse").gate);
console.log("Terjes postnummer: ",terje.get("adresse").postnr);
console.log("Terjes poststed: ",terje.get("adresse").poststed);

console.log("-".repeat(40));

// Bla gjennom map-objektet:
terje.forEach((value, key) => {
    console.log(key, value);
});
