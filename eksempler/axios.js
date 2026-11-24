
// fetch med Axios (npm install axios)

const axios = require("axios");

const url =  "https://maps.googleapis.com/maps/api/geocode/json?address=Oslo";

axios
  .get(url)
  .then(response => {
    console.log(
      `By: ${response.data.results[0].formatted_address} -`,
      `Lengdegrad: ${response.data.results[0].geometry.location.lat} -`,
      `Breddegrad: ${response.data.results[0].geometry.location.lng}`
    );
  })
  .catch(error => {
    console.error("Noe gikk galt: ",error);
  });