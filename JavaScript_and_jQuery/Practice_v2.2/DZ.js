//funkcija za random color zaglavlja (div-a)
function slucajnaBoja() {
    var red = Math.round(Math.random() * 256);
    var green = Math.round(Math.random() * 256);
    var blue = Math.round(Math.random() * 256);

    return "#" + red.toString(16) + green.toString(16) + blue.toString(16); 
}

$(function () {
    $("div > div:first-child").attr("id", "divZaglavlje");

    $("ul > li:first-child > a").attr("id", "idOnama");
    $("ul > li:nth-child(2) > a").attr("id", "Proizvodi");
    $("ul > li:last-child > a").attr("id", "Kontakt");

    $("#Proizvodi, #Kontakt").click(function (event) {
        var naslovLinka = $(this).attr("id");
        event.preventDefault();
        $("#divZaglavlje").css({ "background-color": slucajnaBoja(), "color": "white" });
        $('*').removeClass();
        $(this).addClass("link");
        $("h2").text(naslovLinka);

        var pBroj = $("p").length;
        if (naslovLinka == 'Proizvodi') {

            for (var i = 0; i < pBroj; i++) {
                if (i == 0) {
                    var p1 = naslovLinka + " generički tekst paragrafa " + (i + 1);
                }
                else {
                    var p2 = naslovLinka + " generički tekst paragrafa " + (i + 1);
                }
            }

            $("p:first-of-type").text(p1);
            $("p:nth-of-type(2)").text(p2);

        } else {
            for (var i = 0; i < pBroj; i++) {
                if (i == 0) {
                    var p1 = naslovLinka + " generički tekst paragrafa " + (i + 1);
                }
                else {
                    var p2 = naslovLinka + " generički tekst paragrafa " + (i + 1);
                }
            }

            $("p:first-of-type").html(p1);
            $("p:nth-of-type(2)").text(p2);
        }
    });

});


window.onload = function() {
    
    var prviLink = document.getElementsByTagName('a')[0];

    prviLink.onclick = function (e) {
        e.preventDefault();
        var atribut = document.getElementById("idOnama").getAttribute("id");

        var divZaglavlje = document.getElementById("divZaglavlje");
        divZaglavlje.style.color = "white";
        divZaglavlje.style.backgroundColor = slucajnaBoja();

        var h2 = document.getElementsByTagName("h2")[0];
        h2.innerHTML = 'O nama';

        var parBroj = document.getElementsByTagName("p").length;
        for (var i = 0; i < parBroj; i++) {
            document.getElementsByTagName("p")[i].innerText = h2.innerHTML + " generički tekst paragrafa " + (i + 1);
        }

        var brojLinkova = document.getElementsByTagName("a").length;
        for (var i = 0; i < brojLinkova; i++) {
            document.getElementsByTagName("a")[i].removeAttribute("class");
        }

        document.getElementById("idOnama").setAttribute("class", "link");
    };
}

