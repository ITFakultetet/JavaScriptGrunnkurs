// Eksempel på bruk av fetch til å hente et json-objekt fra en URL

// nb - node-fetch må installeres med npm: npm i node-fetch -g

const fetch = require('node-fetch');

fetch('https://web.itfakultetet.no/dogs.json')
.then(data => data.json())
.then(json => {
console.log("Struktur:\n");

  console.log(json.dogs);
  
console.log("\nBla gjennom med forEach:\n");

json.dogs.forEach(hund => {
  console.log("Navn:",hund.navn,"- Alder:",hund.alder);  
});

}) 
.catch(error => {
        // Process all errors here
        console.error("Noe gikk galt: ",error)
    });