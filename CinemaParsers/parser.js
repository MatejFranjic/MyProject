
//CINEMA SPECIFIC CHANGE BEFORE RUNNING
var localParsingLink = './cineasy/cineasy.js';
var ticket_link = 'https://www.kinopolis-ticketshop.de/center/Mathaeser-Muenchen/bp/ticketselection.htm?performance=34A55000023BWDJVCF&date=20150701';
var cinema_id = '1081';

var instructionsURL = 'http://cinematic-api.herokuapp.com/api/v20/tickets/instructions/' + cinema_id;

var screenObject = {};
var screenInfo;
var userInfo;
var instNum;
var instToLoad;

var orderType;
var paymentType;

var userSelectedSeats;

var prompt = require('prompt');
var request = require('request');
//require('request').debug = true
var vm = require('vm');
var fs = require('fs');

if (localParsingLink == '') { 

  request(instructionsURL, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      var jsonResponse = JSON.parse(body);
      var legacy = jsonResponse.legacy;

      if (legacy == false) { 

        request(jsonResponse.instructions_link, function(error, response, body) {

          if (!error && response.statusCode == 200) {

            evaluateInstructions(body);

          } else {
            console.log(error);
          }

          });

      }

    } else {
      console.log(error);
    }

  });

} else {

  //SINCE THE localParsingLink IS SET WE LOAD THE INSTRUCTIONS JS FROM DISK

        fs.readFile(localParsingLink, function(error, data) {
          if (!error) {

            evaluateInstructions(data.toString());

          } else {
            console.log(error);
          }
        });

}

var evaluateInstructions = function (instructions) {

	//THIS RUNS THE JAVASCRIPT DOWNLOADED FROM THE SERVER AND ADDS THE VARIABLES TO THE CONTEXT
  //(BUG) IF INSTRUCTION FILE CONTAINS REQUIRE THEN IN TERMINAL RUN node < parser.js NOT node parser.js
  //(BUG) IF node < parser.js THEN PROMPT DOESN'T WORK SO USE node --eval "$(cat parser.js)"


	vm.runInThisContext(instructions);

  //SETAJ NEKE DEFAULTE
  utils.session_tags['userAgent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A365 Safari/600.1.4';

  instNum = 0;
  instToLoad = getSeatInfo();

  runCurrentInstruction();

}

var runCurrentInstruction = function() {

  var instructionsForSegment = eval(instToLoad);

  var instruction = instructionsForSegment[instNum];

  if (!instruction) {
    console.log('no further instrucions');
    return;
  }

  switch(instruction.action) {
        case 'native_http_request':
          runNativeHttpRequest(instruction.name, instruction.params, instruction.return_type, instruction.return_save_location);
          break;
        case 'js_parse':

          var functionForName = eval(instruction.name);
          var params = eval(instruction.params);

          var returnType = instruction.return_type;
          var saveLocation = instruction.return_save_location.split(':');

          var objectToSave = functionForName(params);
          
          runSave(functionForName, params, returnType, saveLocation, objectToSave);

          //MOVE THE COUNTER AND GO TO NEXT STEP
          instNum++;
          runCurrentInstruction();

          break;
        case 'native_method':
          runNativeMethod(instruction.name, instruction.params, instruction.return_type, instruction.return_save_location);

          break;
        case 'break':
          runBreakMethod(instruction.name, instruction.params, instruction.return_type, instruction.return_save_location);

          break;
        default:
          console.log('instruction action not found');
    }

}

var runNativeHttpRequest = function (name, params, return_type, save_location) {

  var functionForName = eval(name);
  var params = eval(params);

  var requestParams = functionForName(params);

  var options = {
      url: requestParams.url,
      method: requestParams.type,
      headers: requestParams.headers,
      followAllRedirects: true,
      gzip: true,
      jar: true
    };

  if (requestParams.type == 'POST') {

    var contentTypeHeader = options.headers['Content-Type'];

    if (contentTypeHeader.indexOf("json") > -1) {

      options.json = requestParams.body;

    } else {
      options.form = requestParams.body;
    }

  }

  request(options, function(error, response, body) {

    if (!error && response.statusCode == 200) {

      var returnType = return_type;
      var saveLocation = save_location.split(':');
      var objectToSave = {'headers': response.headers, 'href': response.request.uri.href, 'body': body};

      runSave(functionForName, params, returnType, saveLocation, objectToSave);

      console.log('request', name);

      //MOVE THE COUNTER AND GO TO NEXT STEP
      instNum++;
      runCurrentInstruction();

    } else {
      console.log('error', error);
      console.log('response', response.statusCode);
    }

  });

}


var runSave = function(functionForName, params, returnType, saveLocation, objectToSave) {

  //TO DO OVDJE BI TREBAO BITI CHECK DA LI SE SAVE VARIJABLA ZA NATIVE ZOVE DRUGAČIJE OD ONOG PREDVIĐENOG U OBJECTIVE C KODU

  var saveLocationPath = saveLocation[1];
  var position = saveLocationPath.lastIndexOf('.');

  var pathToParam = saveLocationPath.slice(0, position);
  var paramName = saveLocationPath.slice(position + 1);

  if (saveLocation[0] == 'JSContext') {

    if (returnType == 'Object') {

      for (var key in objectToSave) {
        var obj = objectToSave[key];
        eval(pathToParam)[paramName][key] = obj;
      }

    } else if (returnType == 'String') {
      eval(pathToParam)[paramName] = objectToSave;
    } else {
      //TO DO - DA LI IMA POTREBE PODRŽATI ARRAY, FLOAT, INTEGER, BOOLEAN?
    }

  } else if (saveLocation[0] == 'Native'){

    eval(screenObject)[saveLocationPath] = objectToSave;

  }

}

var runBreakMethod = function (name, params, return_type, save_location) {

  var functionForName = eval(name);

  functionForName();

}

var runNativeMethod = function (name, params, return_type, save_location) {

  var functionForName = eval(name);

  functionForName();

  //MOVE THE COUNTER AND GO TO NEXT STEP
  instNum++;
  runCurrentInstruction();

}

//NATIVE METHODS INSIDE APPS

var screenDataLoaded = function () {

  console.log('screenObject', screenObject);

  var screenPath = 'http://cinematic-api.herokuapp.com/api/v20/tickets/screens/' + cinema_id + '/' + screenObject.cinemaScreenId;

  request(screenPath, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      screenInfo = JSON.parse(body);

      console.log(screenInfo.cinema_name);

      setTimeout(simulate_user_interaction_selectSeats, 100);

    } else {
      console.log('error fetching cinema screen from our server for link', screenPath);
    }

  });

};

var confirmationScreenLoaded = function () {
  //TU MOŽDA NAPRAVITI DA SE ULOGIRAŠ SA NEKIM KORISNIKOM I OD NJEGA UZMEŠ PODATKE, SAD JE HARDKODIRANO
  //TO DO FALE PODACI ZA KREDITNU KARTICU - TE SENSITIVE PODATKE MOŽDA PROMPT NAPRAVITI

  userInfo = {
    firstName: 'Eubrahim',
    lastName: 'Oppeheimmer',
    email: 'damir.tester2@gmail.com',
    paypalCredentials: {
      username: 'info@virtualni-atelier.hr',
      password: 'Akali.Shen.Ryze-92;'
    },
    accountConnection: {
      address: 'Torstrasse',
      address_number: '26',
      city: 'Berlin',
      country: 'de',
      post_code: 10179
    }
  }

  setTimeout(simulate_user_interaction_pressConfirm, 100);

};

var bookingFinished = function () {

  console.log('BookingSuccesfull, bookingCode:', screenObject['bookingID']);

};

var deleteCookies = function() {

  console.log('TO DO deleteCookies');

};

var didCancelSession = function() {

  console.log('Did cancel session');
};


//SIMULATIONS OF USER INTERACTION

var simulate_user_interaction_selectSeats = function () { 

  var description = 'Enter order Type. Reserve, Buy or Cancel';
  var pattern = /^.*\b(Reserve|Buy|Cancel)\b.*$/i;
  var message = 'Type Reserve, Buy or Cancel';

  if (screenObject['showtimeOptions.reservationDisabled'] == true) {

    description = 'Enter order Type. Buy or Cancel'
    pattern = /^.*\b(Buy|Cancel)\b.*$/i;
    message = 'Only Buy and Cancel is available. Reservations are disabled';

  }

  var schema = {
    properties: {
      orderType: {
        description: description,
        type: 'string',
        pattern: pattern,
        message: message,
        required: true
      }
    }
  };

  prompt.start();

  prompt.get(schema, function (err, result) {

    console.log('Simulating user interaction for Seat Selection');

    var seats = screenInfo.seats;
    var userSeats = seats.filter(function(seat){return seat.cinema_seat_id == screenObject['selectedSeats'][0]['seatCinemaID'] || seat.cinema_seat_id == screenObject['selectedSeats'][1]['seatCinemaID']});

    for (var i = 0; i < userSeats.length; i++) {

      var seatSelected = userSeats[i];

      var ticketTypesForAreaCode = screenObject['ticketTypes'].filter(function(ticketType, seatSelected) {return ticketType.dataAreCode == seatSelected.area_code;});

      seatSelected['ticketType'] = ticketTypesForAreaCode[0];

    }

    userSelectedSeats = userSeats;


    //TO DO - MAKE RELOAD FUNCTION HERE DEPENDING IF USER CHANGED SEATS OR CLICKED BOOK/BUY OR CONFIRM 
    //TO DO - ADD A WAY USER CAN GO BACK OR CHANGE SEATS IN THIS TESTING ENVIROMENT

    if (result.orderType.toLowerCase() == 'reserve') {
      orderType = orderTypes.reservation;
      instToLoad = fetchConfirmationScreen(orderType);
    } else if (result.orderType.toLowerCase() == 'buy') {
      orderType = orderTypes.purchase;
      instToLoad = fetchConfirmationScreen(orderType);
    } else if (result.orderType.toLowerCase() == 'cancel') {
      instToLoad = cancelSession();
    }

    instNum = 0;
    runCurrentInstruction();

  });

};


var simulate_user_interaction_pressConfirm = function() {

  var schema = {
    properties: {
      confirmationType: {
        description: 'Confirm order. Confirm or Cancel',
        type: 'string',
        pattern: /^.*\b(Confirm|Cancel)\b.*$/i,
        message: 'Type either Confirm or Cancel',
        required: true
      }
    }
  };

  prompt.start();

  prompt.get(schema, function (err, result) {

    if (result.confirmationType.toLowerCase() == 'confirm') {

      if (orderType == orderTypes.reservation) {
        paymentType = paymentTypes.none;
      } else if (orderType == orderTypes.purchase) {
        paymentType = paymentTypes.paypal;
      }

      instToLoad = confirmBooking(orderType, paymentType);

    } else if (result.confirmationType.toLowerCase() == 'cancel') {

      instToLoad = cancelSession;
    }

    instNum = 0;
    runCurrentInstruction();

  });

};





