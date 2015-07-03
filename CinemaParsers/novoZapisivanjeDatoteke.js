//funkcije
function citamIzDatoteke(datoteka, broj){	
	try{
		podaciKojeCuUpisati += fs.readFileSync(datoteka);
	} catch(error){
		console.log(error);
	}
}

//globalni dio
var temp = require('temp');
var fs = require('fs');

//dok ne nađem bolje rješenje mora ići ovako
var brojFileova = 3+1; //mora biti hardkodirano dok ne nađem bolju metodu, BROJ DATOTEKA +1 (ZBOG FOR PETLJE)

//varijabla koja će sadržavati sve upisane podatke u obliku stringa
var podaciKojeCuUpisati = '';

//sad prvo idem čitati iz datoteke
var imeDatoteke;

for (var i = 1; i < brojFileova; i++) {
	imeDatoteke = 'vjezba'+i+'.js'; //tu mijenjam nazive file-ova
	citamIzDatoteke(imeDatoteke);
};

console.log('Ovaj tekst: '+podaciKojeCuUpisati);


var sviFileovi = 'nekoProizvojnoIme.js'; //OVAJ DIO ĆE SE MOĆI PROMIJENITI SVOJEVOLJNO

temp.open(sviFileovi, function(error, info){ //ime datoteke kako će se zvati na disku, callback funkcija
					//koja sadržava parametre error i info(info je vezan uz datoteku)

	//ako nema errora zapiši u datoteku
	if(!error){
		fs.write(info.fd, podaciKojeCuUpisati); //Write buffer to the file specified by fd
		//uzima parametar info i varijablu koja sadrži podatke koje ću upisati u NOVOPEČENI FILE file

		//ispis poruke ako je datoteka uspješno napravljena
		console.log('Datoteka je napravljena! Wohooo');		
	} else{
		console.log('Došlo je do greške!\n' + error);
	}

});
