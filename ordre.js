let fs = require('fs');

let output = fs.readFileSync('ordre.txt','utf8')
.trim()
.split('\n')
.map(linje => linje.split('\t'))
.reduce((kunder,felt) => {
    kunder[felt[0]] = kunder[felt[0]] || []
    kunder[felt[0]].push({
    navn: felt[1],
    antall: felt[2],
    pris:felt[3]
    })
return kunder
}, {});


console.log(JSON.stringify(output,null,2));

fs.writeFileSync('ordre.json',JSON.stringify(output,null,2));
