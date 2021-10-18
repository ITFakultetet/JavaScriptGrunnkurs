const person = {
    "fornavn": "Ola",
    "etternavn": "Nordmann",
    "alder": 25,
    "adresse":
    {
        "gateadresse": "Bakken 4",
        "postnummer": 1234,
        "poststed": "Bakkebygrenda"
    },
    "telefonnumre":
        [
            {
                "type": "mobil",
                "nummer": "912 34 567"
            },
            {
                "type": "hjem",
                "nummer": "12 34 56 78"
            },
            {
                "type": "fax",
                "nummer": "87 65 43 21"
            }
        ],
    "initialer": function () {
        return this.fornavn.charAt(0) + "." + this.etternavn.charAt(0) + ".";
    }

}


console.log(person.initialer());


