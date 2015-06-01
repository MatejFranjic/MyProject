function Osoba() {
    this.ime = "";
    this.prezime = "";
    this.modelBicikla = "";
    this.datumKupnje = "";
    this.predenoKilometara = "";    
}

//provjeravam koliko je bicikl star
Osoba.prototype.Starost = function () {
    //splitam i okrećem
    var datumKupljen = this.datumKupnje.split(".");
    dkDan = Number(datumKupljen[0]);
    dkMjesec = Number(datumKupljen[1]);
    dkGodina = Number(datumKupljen[2]);
    datumKupljen = Number(dkMjesec) + '.' + Number(dkDan) + '.' + Number(dkGodina);
    datumKupljen = new Date(datumKupljen);

    var danas = new Date();
    danasDan = danas.getDate();
    danasMjesec = danas.getMonth();
    danasGodina = danas.getFullYear();
    danas = Number(danasMjesec + 1) + '.' + Number(danasDan) + '.' + Number(danasGodina);
    danas = new Date(danas);

    var razlika = ((danas - datumKupljen) /1000 /60 /60 /24);
    return Math.round(razlika);
}

Osoba.prototype.kilometraza = function () {    
    var kilometraza = this.predenoKilometara / this.Starost();
    return kilometraza.toFixed(2);
}

//formiram kako će to izgledati
Osoba.prototype.toString = function () {    
    return "Osoba: " + this.ime + ' ' + this.prezime +
        "\nDatum kupnje bicikla: " + this.datumKupnje +
        "\nPređeno kilometara: " + this.predenoKilometara + "km" +
        "\nProsječno po danu: " + this.kilometraza()+"km" +
        "\nStarost bicikla u danima: " + this.Starost()+
        "\n----------------\n";
}

function upis() {
    var a = new Osoba();
    a.ime = prompt("Vaše ime:");
    a.prezime = prompt("Vaše prezime:");
    a.modelBicikla = prompt("Model bicikla:");
    a.datumKupnje = prompt("Kojega datuma ste kupili bicikl:");
    a.predenoKilometara = Number(prompt("Koliko ste kilometara prešli svojim biciklom:"));
    return a;
}

//priprema polja
var polje = [];

do {
    polje.push(upis());
} while (confirm("Želite li unijeti još podataka?"));

var ispis = "";
for (var i = 0; i < polje.length; i++) {
    ispis += polje[i].toString();
}

alert(ispis);
