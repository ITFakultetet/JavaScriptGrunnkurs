// A Functor implements map()
// A Monad implements map() and flatMap()

// En functor må kunne bevare strukturen til det som 'mappes'
// En functor returnerer en ny functor - så vi kan mappe flere ganger etter hverandre (kjede) 

// Eksempel 1
// Pluss på 3 for hvert tall i arrayet
console.log("[1, 3, 5, 4, 60, 7].map(a => a + 3).forEach(a => console.log(a))");

[1, 3, 5, 4, 60, 7].map(a => a + 3).forEach(a => console.log(a));

console.log("---------------------------------------");

//Eksempel 2
// endre strukturen på et array med objekter

const objekter = [
    { key: 1, value: 10 },
    { key: 2, value: 20 },
    { key: 3, value: 30 },
];


objekter.forEach(a => console.log(a.key, "har verdi", a.value));

objekter2 = objekter.flatMap(obj => {
    let rObj = {};
    rObj[obj.key] = obj.value;
    return rObj;
});

console.log(objekter2);

objekter2.forEach(a => console.log(a));

// Eksempel 3
// "Flate ut" et flerdimensjonalt array med flat() og flatMap()

const tall = [[1,2,3],[4,5,6],[7,8,9]];

const tall2 = [["en","to","tre"],["fire","fem","seks"],["syv","åtte","ni"]];

console.log("tall skrevet ut \"as is\"");

console.log(tall);
console.log("----------------------------------");

console.log("tall - skrevet it med tall.flat()");
console.log(tall.flat());

console.log("----------------------------------");

console.log("tall2 skrevet ut \"as is\"");

console.log(tall2);
console.log("----------------------------------");


console.log("console.log(tall.map((val,index) => [val , tall2[index]]));");

console.log(tall.map((val,index) => [val , tall2[index]]));

console.log("console.log(tall.flatMap((val,index) => [val , tall2[index]]));");

console.log(tall.flatMap((val,index) => [val , tall2[index]]));

console.log("console.log(tall.flat().map((val,index) => [val , tall2.flat()[index]]));");

console.log(tall.flat().map((val,index) => [val , tall2.flat()[index]]));

console.log("console.log(tall.flat().flatMap((val,index) => [val , tall2.flat()[index]]));");

console.log(tall.flat().flatMap((val,index) => [val , tall2.flat()[index]]));



