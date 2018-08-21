// Eksempler på rekursjon

// EKsempel 1
// Tell ned fra 10
console.log("Tell ned fra 10\n");

let tellNed = num => {
  if(num == 0) return;
  console.log(num);
  tellNed(num-1);
}

tellNed(10);


// Eksempel 2
// Fibonacci-tallrekke

console.log("Fibonacci-tall fra 1 til 30\n");

let fibo = tall => {
	if (tall<=2)  return 1;
	return fibo(tall-1)+fibo(tall-2);
	}

for(let n=1;n<31;n++) {
	console.log(fibo(n));
}

// Eksempel 3
// Fibonacci med smartere rekursjon

let fib = (a, b, n) => { if(n) return fib(b, a + b, n - 1); else return a }


for(let n=1;n<31;n++) {
	console.log(fib(0,1,n));
}


// Eksempel 4
// Rekursiv faktoral

const fact = n => (n === 0 ? 1 : n * fact(n - 1));

console.log(fact(10));

// Forklaring: Hvis n er 0 så returner 1, hvis ikke returner tallet ganger faktoralen for n-1, dvs fortsett til null.

//
// Faktoraler fra 1 - 10;
//

for (let i=1;i<11;i++) {

console.log("Faktoralen til "+i+" er",fact(i));
}
