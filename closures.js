// Eksempel 1 - en funksjon som teller

let tell = (() => {
    let counter = 0;
    return () => {
        counter++;
        return counter;
    }
})();

console.log(tell());
console.log(tell());
console.log(tell());
console.log(tell());
console.log(tell());



// Eksempel 2

let obj1 = { value: 1 }, obj2 = { value: 2 }, obj3 = { value: 3 };

let ValueAccumulator = () => {
    let values = [];
    let accumulate = obj => {
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

let acc2 = ValueAccumulator();
acc2(obj2);
acc2(obj1);

console.log(accumulator());
// Output: [obj1.value, obj2.value, obj3.value]
console.log(accumulator().join(','));

console.log(acc2());

