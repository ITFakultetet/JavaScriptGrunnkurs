//Eksempler på tallfunksjoner

// Avrunding
let num = new Number(7.987654);
console.log(num.toPrecision(3)); // 7.99

console.log(num.toPrecision(2)); // 8.0

console.log(num.toFixed(1)); // 8.0    
console.log(num.toPrecision(1)); // 8    

console.log(Math.round(num)); // 8 

console.log(Math.abs(num)); // 7.987654
console.log(Math.ceil(num)); // 8 
console.log(Math.floor(num)); // 7 
console.log(Math.sign(num)); // 1 = positivt tall 
console.log(Math.trunc(num)); // 7 

// Tilfeldige nummer
console.log(Math.random()); // tilfeldig desimal-tall mellom 0 og 1  

// min og max
console.log(Math.max(3,5,76,5,12,4)); // 76 
console.log(Math.min(3,5,76,5,12,4)); // 3 

// Snitt (med reduce-funksjon)
let avg = (array) => array.reduce((a, b) => a + b) / array.length;
console.log(avg([1,2,3,4,5,6,7,7])); // 4.375

