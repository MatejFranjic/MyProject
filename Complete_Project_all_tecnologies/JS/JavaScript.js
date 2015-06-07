//globalni dio
var myApp = angular.module('memoryApp', []);


var prviClick;
var drugiClick;
var bodovi = 0;
var vrijeme = 0;

myApp.controller('theGame', ['$scope', '$log', function ($scope, $log) {

    //na početku sakriti board s kartama dok korisnik ne odabere razinu težine i klikne start btn
    $('div:nth-of-type(3)').hide();
    $('div:last-of-type > p').hide();
    $('#btnStartTime').hide();
    $('#btnStop').hide();    
    
    var tezina;

    //povući val iz odabranog gumba, klikom na start pojavljuju se divovi unutra
    //to preko for petlje
    $('#btnStart').on('click', function () {
        $scope.radioValue = $('input[type=radio]:checked').attr('value');

        //ako nista nije odabrano
        if ($scope.radioValue == undefined || $scope.radioValue == '') {
            alert('Niste označili niti jednu težinu, molim odaberite težinu igre!');
            return;
        }

        tezina = $scope.radioValue; //ubacujem odabranu težinu igre u varijablu tezina

        var difficulty = promjena($scope.radioValue); //pretvaram težinu igre u broj preko funkcije promjena()

        //check
        $log.info($scope.radioValue);
        $log.info(difficulty);
        $log.info(typeof ($scope.radioValue));

        //moving out the rules and start button and fadeIn the game board
        $('body > div:first-child, body > div:nth-child(2), #btnStart').fadeOut(); //upute i težina nestaju
        $('div:nth-of-type(3)').addClass($scope.radioValue).fadeIn();
        $('div:last-of-type > p, #btnStop, #btnStartTime').fadeIn();        


        var gameDiv = $('.' + $scope.radioValue);
        //po odabranoj razini težine stavljam divove unutar html-a
        for (var i = 0; i < difficulty; i++) {
            //pozivam funkciju addDiv() -> kojom appendam divove s obzirom na težinu igre
            //svakom tom divu dodajem i ID

            var div = addDiv($scope.radioValue);
            div.attr('value', i);

            gameDiv.append(div);

            //sad treba tom DIV-u dodat i background color, ali koja se otkriva tek na klik
            //znači preko css-a mu dodajem to svojstvo, ali treba spremiti u varijablu
            //kako se nebi mijenjalo svakim klikom već da se mijenja samo nakon početka igre            
        }

        //ovo radi, boje su unutar polja
        var colorArray = new Array();
        for (var i = 0; i < (difficulty / 2) ; i++) {
            var color = getRandomColor();
            colorArray.push(color);
        }

        //duplanje podataka u polju colorArray
        for (var z = 0; z < (difficulty / 2) ; z++) {
            colorArray.push(colorArray[z]);
        }

        $log.log(colorArray); //provjera sadržaja colorArray

        var brojac = 0;
        var nesto = $('#gameBoard > #' + $scope.radioValue);

        //alert(nesto.length);
        var divovi = document.getElementById('gameBoard');


        var broj = 1;
        for (var i = 0; i < colorArray.length; i++) {
            //$(nesto).removeClass('picture'); //za lakšu provjeru
            divovi.children[i].setAttribute('style', 'background-color:' + colorArray[i]);
        }

        //klik event ide unutar jer se događa NAKON TOG KLIKA
        $('#easy, #hard, #brutal').on('click', usporedba);
        //završetak klika u kliku (#easy ...)

    }); //kraj click eventa

    //function inside because of closures
    function usporedba() {
        if ($(this).attr('id') != $('input[type=radio]:checked').attr('value') || $(this).attr('value') == 'x') {
            return;
        }

        if (prviClick != undefined && drugiClick != undefined) {
            $(prviClick).addClass('picture');
            $(drugiClick).addClass('picture');
            prviClick = undefined;
            drugiClick = undefined;
        }

        //mičem klasu prilikom klika i prikaže mi se background-color
        $(this).removeClass('picture');
        
        //prvi klik
        if (prviClick == undefined) {
            prviClick = $(this);
        } else {
            drugiClick = $(this); //drugi klik

            //ovo je kad kliknem na istoga 2x
            if (prviClick.attr('value') == drugiClick.attr('value')) {
                drugiClick = undefined;
                return;
            }

            //if AKO POGODIMO
            if ($(prviClick).css('background-color') == $(drugiClick).css('background-color')) {                
                $(prviClick).css('background-color', 'white');
                $(drugiClick).css('background-color', 'white');
                $(prviClick).attr('value', 'x');
                $(drugiClick).attr('value', 'x');
                prviClick = undefined;
                drugiClick = undefined;
                $('span').text(++bodovi);                
            }            
        }


        if (bodovi == (promjena(tezina)) / 2) {
            if (vrijeme > 0) {
                alert('Čestitam! Ostvarili ste: ' + bodovi + ' bodova!\nA vaše vrijeme je: ' + vrijeme + ' s\nAko želite ponovno odigrati, nakon OK, stisnite F5');
            } else {
                alert('Čestitam! Ostvarili ste ' + bodovi + ' bodova!\nAko želite ponovno igrati, nakon OK stisnite F5');
            }            
        } 

    }//kraj function usporedba

}]); //kraj theGame controllera



//novi kontroler za vrijeme
myApp.controller('stopWatchController', ['$scope', '$timeout', function ($scope, $timeout) {    
    $scope.value = 0;

    function countdown() {
        vrijeme++;
        $scope.value++; //povećavam za 1
        $scope.timeout = $timeout(countdown, 1000); //pozivam tu istu funkciju svake sekunde
    }

    //literalom start pozivam funkciju countdown
    $scope.start = function () {
        countdown();
    }

    $scope.stop = function () {
        $timeout.cancel($scope.timeout);
    }

    $('#btnStartTime').on('click', function () {
        $(this).attr('disabled', 'disabled');
        $("#btnStop").removeAttr('disabled');
    });

    $('#btnStop').on('click', function () {
        $("#btnStartTime").removeAttr('disabled');
        $(this).attr('disabled', 'disabled');
    });        

}]);


//functions
function promjena(value) {
    switch (value) {
        case 'easy':
            return 6;
            break;
        case 'hard':
            return 10;
            break;
        case 'brutal':
            return 18;
            break;
    }
}

function addDiv(level) {
    var div = $(document.createElement('div'));
    div.attr('id', level);
    div.addClass('picture');
    return div;
}

//function for colors
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
