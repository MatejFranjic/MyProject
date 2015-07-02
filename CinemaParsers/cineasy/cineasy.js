
//BOILERPLATE
var cheerio = require('cheerio');

var orderTypes = {
  none: 0,
  reservation: 1 << 0,
  purchase: 1 << 1
};

var paymentTypes = {
  none: 0,
  creditCards: 1 << 0,
  paypal: 1 << 1,
  cinemaCard: 1 << 2
};

var utils = {
  session_tags: {
  },
  last_response: {
  }
};

var temp = {};

var getSeatInfo = function () {

  var returnValue;

  var seatInfoEnd = {
    name: 'screenDataLoaded',
    params: '',
    action: 'break',
    return_type: '',
    return_save_location: ''
  };

  returnValue = upute_screen.concat(seatInfoEnd);

  return returnValue;
};

var fetchConfirmationScreen = function(orderType) {

  var returnValue;

  var instructionsEnd = {
    name: 'confirmationScreenLoaded',
    params: '',
    action: 'break',
    return_type: '',
    return_save_location: ''
  };

  var uputeForOrderType;

  if (orderType == orderTypes.reservation) {
    uputeForOrderType = upute_rezervacija;
  } else if (orderType == orderTypes.purchase) {
    uputeForOrderType = upute_payment;
  }

  var seatSelectionDisabled = utils.session_tags['selectionDisabled'];

  if (seatSelectionDisabled == true) {

    returnValue = uputeForOrderType.slice().concat(instructionsEnd);

    for (var i = 0; i < returnValue.length; i++) {
      var uputa = returnValue[i];

      if (uputa.name == 'changeSeat_request' || uputa.name == 'changeSeatPayment_request') {

        returnValue.splice(i, 1);
      }

    };

  } else {
    returnValue = uputeForOrderType.concat(instructionsEnd);
  }

  return returnValue;
};

var confirmBooking = function(orderType, paymentType) {

  var returnValue;

  var confirmEnd = {
    name: 'bookingFinished',
    params: '',
    action: 'break',
    return_type: '',
    return_save_location: ''
  };

  var uputeForOrderAndPaymentType;

  if (orderType == orderTypes.reservation) {
    uputeForOrderAndPaymentType = upute_rezervacija_confirmation;
  } else if (orderType == orderTypes.purchase) {
    if (paymentType == paymentTypes.creditCards) {
      //CREDIT CARDS TO DO - NIJE JOŠ PODRŽANO. ZATO ŠTO VJEROJATNO 3D SECURE ZA KINOPOLIS (A TIME MOŽDA I ZA OSTALA KINA)
    } else if (paymentType == paymentTypes.paypal) {
      uputeForOrderAndPaymentType = upute_payment_confirmation.concat(upute_payment_confirmation_paypal);
    }
  }

  returnValue = uputeForOrderAndPaymentType.concat(confirmEnd);

  return returnValue;
};

var reloadSeatInfo = function(didAttemptContinue, didAttemptConfirm, didChangeTickets) {

  var returnValue;

  var reloadSeatEnd = {
    name: 'didReloadSeatInfo',
    params: '',
    action: 'break',
    return_type: '',
    return_save_location: ''
  };

  if (didAttemptContinue == true || didAttemptConfirm == true) {

    returnValue = upute_cancel_session.concat(upute_screen).concat(reloadSeatEnd);

  } else {
    returnValue = [reloadSeatEnd];
  }

  return returnValue;
}

var convenienceFee = function(totalPrice, numberOfTickets) {

  return numberOfTickets * 0.5;

}

var cancelSession = function() {

  var returnValue;

  var cancelSessionEnd = {
    name: 'didCancelSession',
    params: '',
    action: 'break',
    return_type: '',
    return_save_location: ''
  };

  returnValue = upute_cancel_session.concat(cancelSessionEnd);

  return returnValue;
};

//UPUTE
var upute_screen = [
  {
    name: 'deleteCookies',
    params: '',
    action: 'native_method',
    return_type: '',
    return_save_location: ''
  },
  {
    name: 'first_request',
    params: 'ticket_link',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'redirectUrl_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'first_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'screenName_parse',
    params: '',
    action: 'js_parse',
    return_type: 'String',
    return_save_location: 'Native:cinemaScreenId'
  },
  {
    name: 'areaType_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'Native:areaTypes'
  },
  {
    name: 'ticketType_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Array',
    return_save_location: 'Native:ticketTypes'
  },
  {
    name: 'unavailableSeats_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Array',
    return_save_location: 'Native:unavailableSeats'
  },
  {
    name: 'selectedSeats_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Array',
    return_save_location: 'Native:selectedSeats'
  },
  {
    name: 'reservationDisabled_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Boolean',
    return_save_location: 'Native:showtimeOptions.reservationDisabled'
  },
  {
    name: 'seatSelectionDisabled_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Boolean',
    return_save_location: 'Native:showtimeOptions.seatSelectionDisabled'
  }
];

var upute_rezervacija = [
  {
    name: 'changeModeToReservation_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'changePriceCategory_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'changeSeat_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'addToCart_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'cartSubmission',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  }
];

var upute_rezervacija_confirmation = [
  {
    name: 'loginGuest_request',
    params: 'userInfo',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'preReservationConfirmation_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'finalReservationConfirmation_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'bookingCodeReservation_parse',
    params: '',
    action: 'js_parse',
    return_type: 'String',
    return_save_location: 'Native:bookingID'
  }
];


var upute_payment = [
  {
    name: 'changeModeToPayment_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'changePriceCatPayment_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'changeSeatPayment_request',
    params: 'userSelectedSeats',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'addToCartPayment_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'cartSubmissionPayment',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  }
];

var upute_payment_confirmation = [
  {
    name: 'loginGuestPayment_request',
    params: 'userInfo',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
];

var upute_payment_confirmation_paypal = [
  {
    name: 'paymentSelectionPaypal_request',
    params: 'userInfo',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'overviewPaymentPaypal_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'paypalLink_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'expressCheckoutPaypal_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'expressResponse_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'merchantFormFirst_request',
    params: 'userInfo',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'merchantFormFirst_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'merchantFormSecond_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'merchantFormSecond_parse',
    params: '',
    action: 'js_parse',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.session_tags'
  },
  {
    name: 'confirmationPaypal_request',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  },
  {
    name: 'bookingCodePayment_parse',
    params: '',
    action: 'js_parse',
    return_type: 'String',
    return_save_location: 'Native:bookingID'
  }
];

var upute_cancel_session = [
  {
    name: 'killTicket',
    params: '',
    action: 'native_http_request',
    return_type: 'Object',
    return_save_location: 'JSContext:utils.last_response'
  }
];


//NETWORK REQUESTS

//GET SCREEN INFORMATION

var first_request = function(ticket_link) {

  //OVDJE SADA PRVO OD URL MAKNUTI &cooac=1 AKO IMA JER OD TOGA ON MISLI DA NEMAŠ UKLJUČENE COOKIE I NE DOBIJEŠ DOBAR RESPONSE

  var fullURL = ticket_link;

  var cooacPosition = fullURL.indexOf('&cooac');

  if (cooacPosition != -1) {
    fullURL = fullURL.substr(0, cooacPosition) + fullURL.substr(cooacPosition + 8);
  }

  var protocolPosition = fullURL.indexOf('://');
  var hostPathPosition = fullURL.indexOf('/', protocolPosition + 3);
  var hostPath = fullURL.slice(protocolPosition + 3, hostPathPosition);

  utils.session_tags['hostPath'] = hostPath;

  rv = {
    type: 'GET',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: {

    }
  };
  return rv;
};

//RESERVATION

var changeModeToReservation_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: {
      'action': 'changemode',
      'reservation': true,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': [{'priceCatId': 'all', 'quantity': userSelectedSeats.length}]
    }
  };
  return rv;
};

var changePriceCategory_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: {
      'action': 'changepricecat',
      'reservation': true,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': [{'priceCatId': 'all', 'quantity': userSelectedSeats.length}]
    }
  };
  return rv;
};

var changeSeat_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  var newSeatPosition = Math.round((userSelectedSeats.length - 1) / 2.0);
  var newSeat = userSelectedSeats[newSeatPosition].cinema_seat_id;
  var newSeatW = userSelectedSeats[0].cinema_seat_id;
  var newSeatE = userSelectedSeats[(userSelectedSeats.length - 1)].cinema_seat_id;

  var body = {
      'action': 'changeseat',
      'reservation': true,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': [{'priceCatId': 'all', 'quantity': userSelectedSeats.length}],
      'newSeatNo': newSeat,
      'newSeatNoW': newSeatW,
      'newSeatNoE': newSeatE
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var addToCart_request = function() {

  var fullURL = utils.session_tags.linkPath + '/cart.htm?ciid=' + utils.session_tags.ciid;

  var body = {
      'action': 'DO_RESERVATION',
      'actionMethod': 'RESERVATION',
      'csrf': utils.session_tags.csrf
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var cartSubmission = function() {

  var fullURL = utils.session_tags.linkPath + '/cart.htm';

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.CartController_SUBMISSION',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = utils.session_tags.linkPath + '/cart.htm?ciid=' + utils.session_tags.ciid;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

//RESERVATION CONFIRMATION

var loginGuest_request = function(userInfo) {

  var fullURL = utils.session_tags.linkPath + '/login.htm';

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.LoginController_SUBMISSION',
      'authMethod': 'AUTHENTICATION_GUEST',
      'passwordStrength': 0,
      'salutation': 2,
      'firstname': userInfo.firstName,
      'lastname': userInfo.lastName,
      'email': userInfo.email,
      'transactionalTermsAndConditionsAcc': true,
      '_transactionalTermsAndConditionsAcc': 'on',
      '_newsletterSubscribed': 'on',
      '_registerAsNewCustomer': 'on',
      '_clientTermsAndConditionsAcc': 'on',
      'password': '',
      'passwordConfirm': '',
      'bpLoginGuest': '+Weiter+',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = fullURL;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var preReservationConfirmation_request = function() {

  var fullURL = utils.session_tags.linkPath + '/reservationConfirmation.htm';

  var body = {

    };

  var refererURL = utils.session_tags.linkPath + '/login.htm';

  rv = {
    type: 'GET',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var finalReservationConfirmation_request = function() {

  var fullURL = utils.session_tags.linkPath + '/reservationConfirmation.htm';

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.ReservationConfirmationController_SUBMISSION',
      'changeAddress': false,
      '_newsletterSubscribed': 'on',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = fullURL;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

//PAYMENT

var changeModeToPayment_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  var selectedAreaCode;
  var priceCat = {};

  for (var i = 0; i < userSelectedSeats.length; i++) {
    var seat = userSelectedSeats[i];

    selectedAreaCode = seat['area_code'];

    var dataTicketCode = seat.ticketType.dataTicketCode;
    var numberOfTicketsForCode = priceCat[dataTicketCode] || 0;

    priceCat[dataTicketCode] = ++numberOfTicketsForCode;

  }

  var priceCatSelections = [];

  for (var i = 0; i < temp['tempTicketTypes'].length; i++) {
    var ticketType = temp['tempTicketTypes'][i];

    if (ticketType.dataAreaCode == selectedAreaCode) {

      var numberOfTickets = (priceCat[ticketType.dataTicketCode]) ? priceCat[ticketType.dataTicketCode] : 0;

      var objectToAdd = {
        'priceCatId': ticketType.dataTicketCode,
        'quantity': numberOfTickets
      };

      priceCatSelections.push(objectToAdd);

    }
  }

  var body = {
      'action': 'changemode',
      'reservation': false,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': priceCatSelections
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;
};


var changePriceCatPayment_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  var selectedAreaCode;
  var priceCat = {};

  for (var i = 0; i < userSelectedSeats.length; i++) {
    var seat = userSelectedSeats[i];

    selectedAreaCode = seat['area_code'];

    var dataTicketCode = seat.ticketType.dataTicketCode;
    var numberOfTicketsForCode = priceCat[dataTicketCode] || 0;

    priceCat[dataTicketCode] = ++numberOfTicketsForCode;

  }

  var priceCatSelections = [];

  for (var i = 0; i < temp['tempTicketTypes'].length; i++) {
    var ticketType = temp['tempTicketTypes'][i];

    if (ticketType.dataAreaCode == selectedAreaCode) {

      var numberOfTickets = (priceCat[ticketType.dataTicketCode]) ? priceCat[ticketType.dataTicketCode] : 0;

      var objectToAdd = {
        'priceCatId': ticketType.dataTicketCode,
        'quantity': numberOfTickets
      };

      priceCatSelections.push(objectToAdd);

    }
  }

  var body = {
      'action': 'changepricecat',
      'reservation': false,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': priceCatSelections
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;
};


var changeSeatPayment_request = function(userSelectedSeats) {

  var fullURL = utils.session_tags.linkPath + '/tssa.htm';

  var selectedAreaCode;
  var priceCat = {};

  for (var i = 0; i < userSelectedSeats.length; i++) {
    var seat = userSelectedSeats[i];

    selectedAreaCode = seat['area_code'];

    var dataTicketCode = seat.ticketType.dataTicketCode;
    var numberOfTicketsForCode = priceCat[dataTicketCode] || 0;

    priceCat[dataTicketCode] = ++numberOfTicketsForCode;

  }

  var priceCatSelections = [];

  for (var i = 0; i < temp['tempTicketTypes'].length; i++) {
    var ticketType = temp['tempTicketTypes'][i];

    if (ticketType.dataAreaCode == selectedAreaCode) {

      var numberOfTickets = (priceCat[ticketType.dataTicketCode]) ? priceCat[ticketType.dataTicketCode] : 0;

      var objectToAdd = {
        'priceCatId': ticketType.dataTicketCode,
        'quantity': numberOfTickets
      };

      priceCatSelections.push(objectToAdd);

    }
  }

  var newSeatPosition = Math.round((userSelectedSeats.length - 1) / 2.0);
  var newSeat = userSelectedSeats[newSeatPosition].cinema_seat_id;
  var newSeatW = userSelectedSeats[0].cinema_seat_id;
  var newSeatE = userSelectedSeats[(userSelectedSeats.length - 1)].cinema_seat_id;

  var body = {
      'action': 'changeseat',
      'reservation': false,
      'ciid': utils.session_tags.ciid,
      'priceCatSelections': priceCatSelections,
      'newSeatNo': newSeat,
      'newSeatNoW': newSeatW,
      'newSeatNoE': newSeatE
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'X-csrf': utils.session_tags.csrf,
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };

  return rv;
};


var addToCartPayment_request = function() {

  var fullURL = utils.session_tags.linkPath + '/cart.htm?ciid=' + utils.session_tags.ciid;

  var body = {
      'action': 'ADD_TO_CART',
      'actionMethod': 'BUYING',
      'csrf': utils.session_tags.csrf
    };

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


var cartSubmissionPayment = function() {

  var fullURL = utils.session_tags.linkPath + '/cart.htm';

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.CartController_SUBMISSION',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = utils.session_tags.linkPath + '/cart.htm?ciid=' + utils.session_tags.ciid;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


var loginGuestPayment_request = function(userInfo) {

  var fullURL = utils.session_tags.linkPath + '/login.htm';

  var randomDay = Math.floor(Math.random() * 28) + 1;
  randomDay = (randomDay < 10) ? ('0' + randomDay) : randomDay;

  var randomMonth = Math.floor(Math.random() * 12) + 1;
  randomMonth = (randomMonth < 10) ? ('0' + randomMonth) : randomMonth;

  var randomYear = Math.floor(Math.random() * 50) + 1945;

  var randomBirthday = randomDay + '.' + randomMonth + '.' + randomYear;

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.LoginController_SUBMISSION',
      'authMethod': 'AUTHENTICATION_GUEST',
      'passwordStrength': 0,
      'salutation': 2,
      'firstname': userInfo.firstName,
      'lastname': userInfo.lastName,
      'street': userInfo.accountConnection.address,
      'houseNo': userInfo.accountConnection.address_number,
      'zip': userInfo.accountConnection.post_code,
      'city': userInfo.accountConnection.city,
      'birthday': randomBirthday,
      'email': userInfo.email,
      'transactionalTermsAndConditionsAcc': true,
      '_transactionalTermsAndConditionsAcc': 'on',
      '_newsletterSubscribed': 'on',
      '_registerAsNewCustomer': 'on',
      '_clientTermsAndConditionsAcc': 'on',
      'password': '',
      'passwordConfirm': '',
      'bpLoginGuest': '+Weiter+',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = fullURL;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var paymentSelectionPaypal_request = function(userInfo) {

  var fullURL = utils.session_tags.linkPath + '/paymentselection.htm';

  var fullName = userInfo.firstName + userInfo.lastName;

  var today = new Date();
  var year = today.getFullYear();

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.PaymentSelectionController_SUBMISSION',
      'elvAccountNumber': '',
      'elvBankcode': '',
      'IBAN': '',
      'BIC': '',
      'cardType': 'VISA',
      'creditCardNumber': '',
      'creditCardHolder': fullName,
      'expiryMonth': 1,
      'expiryYear': year,
      'cardValidationNumberHelper': '',
      'bankCodeOrBic': '',
      'bankAccountOrIban': '',
      'customerCardNo': '',
      'customerCardPin': '',
      'paymentMethod': 'PAYMENT_PAYPAL',
      'submit': 'Weiter',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = fullURL;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


var overviewPaymentPaypal_request = function() {

  var fullURL = utils.session_tags.linkPath + '/overview.htm';

  var body = {
      'submissionKey': 'net.atrada.ticketshop.web.shop.OverviewController_SUBMISSION',
      '_newsletterSubscribed': 'on',
      'next': 'Jetzt kaufen',
      'csrf': utils.session_tags.csrf
    };

  var refererURL = fullURL;

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


var expressCheckoutPaypal_request = function() {

  var fullURL = utils.session_tags['paypalLink'] + '&force_sa=true&fallback=1';

  var body = {
      'submit': 'Weiter'
    };

  var refererURL = utils.last_response['href'];

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': 'www.paypal.com',
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': utils.session_tags.origin,
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};

var merchantFormFirst_request = function(userInfo) {

  var fullURL = utils.session_tags['merchantFormFirst'];

  var cacheBuster = '';
  for (var i = 0; i < 16; i++) {
    cacheBuster += Math.floor(Math.random() * 10);
  }

  var body = {
      'cmd': '_flow',
      'pageState': 'login',
      'currentSession': '',
      'CONTEXT': utils.session_tags['contextCGI'],
      'login_email': userInfo.paypalCredentials.username,
      'login_password': userInfo.paypalCredentials.password,
      'login.x': 1,
      'auth': utils.session_tags['auth'],
      'form_charset': 'UTF-8',
      'view_requested': 'MiniPage',
      'cache_buster': cacheBuster
    };

  var refererURL = utils.last_response['href'];

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': 'www.paypal.com',
      'Accept': '*/*',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.paypal.com',
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };

  return rv;

};


var merchantFormSecond_request = function() {

  var fullURL = utils.session_tags['merchantFormSecond'];

  var cacheBuster = '';
  for (var i = 0; i < 16; i++) {
    cacheBuster += Math.floor(Math.random() * 10);
  }

  var body = {
      'cmd': '_flow',
      'CONTEXT': utils.session_tags['contextCGI'],
      'currentSession': utils.session_tags['currentSession'],
      'pageState': 'review',
      'funding': utils.session_tags['funding'],
      'continue': 1,
      'auth': utils.session_tags['auth'],
      'form_charset': 'UTF-8',
      'view_requested': 'MiniPage',
      'cache_buster': cacheBuster
    };

  var refererURL = utils.last_response['href'];

  rv = {
    type: 'POST',
    url: fullURL,
    headers: {
      'Host': 'www.paypal.com',
      'Accept': '*/*',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'de-de',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.paypal.com',
      'Referer': refererURL,
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


var confirmationPaypal_request = function() {

  var fullURL = utils.session_tags['confirmationURL'];

  var body = {
    };

  rv = {
    type: 'GET',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-de',
      'Referer': utils.session_tags['paypalLink'],
      'Connection': 'keep-alive',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};


//CANCEL SESSION

var killTicket = function() {

  var locationLastPathComponent = utils.session_tags.linkPath.lastIndexOf('/');
  var urlFirstPart = utils.session_tags.linkPath.slice(0, locationLastPathComponent);

  var fullURL = urlFirstPart + '/ajax.htm?ciid=' + utils.session_tags.ciid + '&action=killTicket';

  var body = {
    };

  rv = {
    type: 'GET',
    url: fullURL,
    headers: {
      'Host': utils.session_tags['hostPath'],
      'Proxy-Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate',
      'Accept': '*/*',
      'Accept-Language': 'de-de',
      'Referer': utils.session_tags.ticket_link,
      'Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': utils.session_tags['userAgent']
    },
    body: body
  };
  return rv;

};



//PARSE

var redirectUrl_parse = function() {

  console.time("redirectUrl_parse");

  var fullURL = utils.last_response['href'];

  var linkPathPosition = fullURL.indexOf('/ticketselection');
  var linkPath = fullURL.slice(0, linkPathPosition);

  //OVDJE IPAK JOŠ JEDNOM NAPRAVITI PARSE ZA HOST

  var protocolPosition = fullURL.indexOf('://');
  var protocol = fullURL.slice(0, protocolPosition);
  var originPathPosition = fullURL.indexOf('/', protocolPosition + 3);
  var originPath = fullURL.slice(0, originPathPosition);

  console.timeEnd("redirectUrl_parse");

  return {'ticket_link': fullURL, 'linkPath': linkPath, 'protocol': protocol, 'origin': originPath};

};

var first_parse = function() {

  console.time("first_parse");

  $ = cheerio.load(utils.last_response['body']);

  var csrf = $('form#addToCartFromInfoBoxForm input[name="csrf"]').val();
  var ciid = $('div#seatingPlan').attr('data-ciid');

  console.timeEnd("first_parse");

  return {'csrf': csrf, 'ciid': ciid};

};

var screenName_parse = function () {

  console.time("screenName_parse");

  $ = cheerio.load(utils.last_response['body']);

  var screenNameString = $('select#selectedPerformance option:selected').text();

  var kinoLocation = screenNameString.indexOf('Kino');

  var screeName = screenNameString.slice(kinoLocation).trim();

  if (screeName == '') { 

    //EXCEPTION - IF A CINEMA HAS ONLY ONE SCREEN IT CAN ME NAMED WIHTOUT THE Kino PREFIX
    var nameLocation = screenNameString.lastIndexOf('-') + 1;
    screeName = screenNameString.slice(nameLocation).trim();

  }
  
  console.timeEnd("screenName_parse");

  return screeName;


};

var areaType_parse = function () {

  console.time("areaType_parse");

  $ = cheerio.load(utils.last_response['body']);

  var priceData = $('div#seatingPlan').attr('data-pricedata');
  var seatingPlanJSON = JSON.parse(priceData);

  var areaTypes = {};
  var tempTicketTypes = [];

  for (var i = 0; i < seatingPlanJSON.length; i++) {

    var dataAreaDict = seatingPlanJSON[i];

    var dataAreaID = dataAreaDict.id;
    var dataAreaName = dataAreaDict.name;

    areaTypes[dataAreaID] = {'dataAreaName': dataAreaName};

    //WHILE HERE CALCULATE TICKET_TYPES AND SAVE IN TEMP VARIABLE TO SPEED UP
    var buyCategories = dataAreaDict.buycategories;

    if (buyCategories) {

      for (var j = 0; j < buyCategories.length; j++) {

        var ticketDict = buyCategories[j];

        var ticketType = {
          'dataAreaCode': dataAreaID,
          'dataTicketCode': ticketDict.id,
          'index': i,
          'price': ticketDict.price,
          'ticketLabel': ticketDict.name
        };

        tempTicketTypes.push(ticketType);

      };

    }

  };

  temp['tempTicketTypes'] = tempTicketTypes;

  console.timeEnd("areaType_parse");

  return areaTypes;

};

var ticketType_parse = function () {

  console.time("ticketType_parse");

  console.timeEnd("ticketType_parse");

  return temp['tempTicketTypes'];

};

var unavailableSeats_parse = function () {

  console.time("unavailableSeats_parse");

  $ = cheerio.load(utils.last_response['body']);

  var seatData = $('div#async_seatingplan_data').attr('data-jsonseatingstatbuy');

  var unavailable = [];

  if (seatData) {

    var seatDataJSON = JSON.parse(seatData);

    var disabled = seatDataJSON.disabled;
    var occupied = seatDataJSON.occupied;

    unavailable = (disabled + ',' + occupied).split(',');

    //WHILE HERE CALCULATE SELECTED TO SPEED UP
    temp['selected'] = seatDataJSON.selected;

  }

  console.timeEnd("unavailableSeats_parse");

  return unavailable;

};

var selectedSeats_parse = function () {

  console.time("selectedSeats_parse");

  var tempSelected = temp['selected'];

  var selected = [];

  if (tempSelected) {

    for (var i = 0; i < tempSelected.length; i++) {

      var selectedSeatID = tempSelected[i];

      selected.push({'seatCinemaID': selectedSeatID});

    };

  }

  console.timeEnd("selectedSeats_parse");

  return selected;

};

var reservationDisabled_parse = function () {

  console.time("reservationDisabled_parse");

  $ = cheerio.load(utils.last_response['body']);

  var reservationDisabled = $('input#actionMethodReserverRB').attr('disabled');

  console.timeEnd("reservationDisabled_parse");

  return (reservationDisabled == 'disabled') ? true : false;

};

var seatSelectionDisabled_parse = function () {

  console.time("seatSelectionDisabled_parse");

  $ = cheerio.load(utils.last_response['body']);

  var seatSelectionText = $('div#payingarea').next().text();

  var selectionDisabled = false;

  if (seatSelectionText && seatSelectionText.indexOf("KEINE Platzkarten") > -1) {

    selectionDisabled = true;
    utils.session_tags['selectionDisabled'] = true;

  }

  console.timeEnd("seatSelectionDisabled_parse");

  return selectionDisabled;

};

var paypalLink_parse = function() {

  console.time("paypalLink_parse");

  $ = cheerio.load(utils.last_response['body']);

  var paypalLink = $('form#toexpay').attr('action');

  console.timeEnd("paypalLink_parse");

  return {'paypalLink': paypalLink};
};

var expressResponse_parse = function() {

  console.time("expressResponse_parse");

  $ = cheerio.load(utils.last_response['body']);

  var contextCGI = $('input#CONTEXT_CGI_VAR').val();
  var auth = $('input[name="auth"]').val();
  var merchantFormFirst = $('form#merchant_form').attr('action');

  console.timeEnd("expressResponse_parse");

  return {'contextCGI': contextCGI, 'auth': auth, 'merchantFormFirst': merchantFormFirst};
};


var merchantFormFirst_parse = function() {

  console.time("merchantFormFirst_parse");

  var jsonStart = utils.last_response['body'].indexOf('{');
  var jsonEnd = utils.last_response['body'].lastIndexOf('}');

  var jsonString = utils.last_response['body'].slice(jsonStart, jsonEnd + 1);

  var jsonObj= JSON.parse(jsonString);

  var htmlString = jsonObj['html'];

  $ = cheerio.load(htmlString);

  var funding = $('input[name="funding"]').val();
  var currentSession = $('input#currentSession').val();
  var auth = $('input[name="auth"]').val();
  var merchantFormSecond = $('form#merchant_form').attr('action');

  console.timeEnd("merchantFormFirst_parse");

  return {'funding': funding, 'currentSession': currentSession, 'auth': auth, 'merchantFormSecond': merchantFormSecond};
};



var merchantFormSecond_parse = function() {

  console.time("merchantFormSecond_parse");

  var jsonStart = utils.last_response['body'].indexOf('{');
  var jsonEnd = utils.last_response['body'].lastIndexOf('}');

  var jsonString = utils.last_response['body'].slice(jsonStart, jsonEnd + 1);

  var jsonObj= JSON.parse(jsonString);

  var confirmationURL = jsonObj['url'];

  console.timeEnd("merchantFormSecond_parse");

  return {'confirmationURL': confirmationURL};
};


var bookingCodePayment_parse = function() {

  console.time("bookingPayment_parse");

  $ = cheerio.load(utils.last_response['body']);

  var bookingID = $('div.kts-barcode').text().trim();

  console.timeEnd("bookingPayment_parse");

  return bookingID;

};


var bookingCodeReservation_parse = function() {

  console.time("bookingCodeReservation_parse");

  $ = cheerio.load(utils.last_response['body']);

    var bookingID;
    var cartdata = $('table.cartdata strong span').first();

    if (cartdata.text().indexOf("Reservierungsnummer") > -1) {

      bookingID = cartdata.next().text();

    }

  console.timeEnd("bookingCodeReservation_parse");

  return bookingID;

};





