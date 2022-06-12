// Eksempel 1 - en funksjon som teller

let  tell = (function () {
    let counter = 0;
    return function () {counter++; return counter}
  })();

console.log(tell());
console.log(tell());
console.log(tell());
console.log(tell());
console.log(tell());



// Eksempel 2

let 
obj1 = {value: 1},
obj2 = {value: 2},
obj3 = {value: 3};

let ValueAccumulator = function () {
    let values = [];
    let accumulate = function (obj) {
        if (obj) {
            values.push(obj.value);
            return values;
        } else {
            return values;
        }
    };
    return accumulate;
};
//This allows us to do this:
let accumulator = ValueAccumulator();
accumulator(obj1);
accumulator(obj2);
accumulator(obj3);
console.log(accumulator());
// Output: [obj1.value, obj2.value, obj3.value]
console.log(accumulator().join(','));
