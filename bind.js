// Eksempler på bruk av bind

// Eksempel 1

let dog = {
 sound: "voff",
 talk: function() {
     console.log(this.sound);
 }

}

dog.talk();  // voff

let talkFunction = dog.talk;

talkFunction(); // undefined, fordi:

// det er det samme som dette :
// talkFunction = function() {
//     console.log(this.sound);   // this peker ikke til dog.sound lenger    
// }

let boundFunction = talkFunction.bind(dog);

boundFunction(); // voff, fordi talkFunction er nå bundet til dog


// eller bruk bind direkte: 

talkFunction2 = dog.talk.bind(dog); // bind talk direkte til dog

talkFunction2(); // voff


// Eksempel 2

function talk() { 
    console.log(this.sound) 
};

let boromir = {
    sound: "One does not simply walk into Mordor!"
}

let talkBoundToBoromir = talk.bind(boromir);

talkBoundToBoromir();  // One does not simply walk into Mordor!

talk(); // undefined -- fordi this.sound ikke er bundet til noe som kan logges til console

let boromir2 = {
    speak: talk,
    sound: "One does not simply walk into Mordor!"
}
 
boromir2.speak(); // One does not simply walk into Mordor!, fordi this.sound nå er kalt inne fra objektet boromir2.

let blabber = boromir2.speak;

blabber(); // udefined

let blabber2 = boromir2.speak.bind(boromir2);

blabber2(); // One does not simply walk into Mordor!
  
  