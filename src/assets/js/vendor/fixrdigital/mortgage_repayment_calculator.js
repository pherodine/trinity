var init = function () {

    // Main function to setup up calculator and initialise JQuery UI components goes here

    // Set slide defaults
    var theMortgageAmount = 100000;
    var theYearsAmount = 20;
    var theInterestAmount = 5.5;


    // Cash
    $('#mortgage').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 1000000,
        value: theMortgageAmount,
        step: 10000,

        create: function (event, ui) {

            $("#mortgage > a.ui-slider-handle").text(theMortgageAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#mortgage > a.ui-slider-handle").text(sliderCharacter);
            $("#mortgage-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#mortgage-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#mortgage").slider('option', 'value', parseInt($(this).val()));
        $("#mortgage > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#mortgage-amount").val($("#mortgage").slider("value"));

    // Years
    $('#years').slider({
        orientation: "horizontal",
        range: false,
        min: 1,
        max: 35,
        value: theYearsAmount,
        step: 1,

        create: function (event, ui) {

            $("#years > a.ui-slider-handle").text(theYearsAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;

            $("#years > a.ui-slider-handle").text(sliderCharacter);
            $("#years-amount").val(ui.value);

        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#years-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#years").slider('option', 'value', parseInt($(this).val()));
        $("#years > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#years-amount").val($("#years").slider("value"));

    // Inflation
    $('#interest').slider({
        orientation: "horizontal",
        range: false,
        min: 0.25,
        max: 10,
        value: theInterestAmount,
        step: 0.25,

        create: function (event, ui) {

            $("#interest > a.ui-slider-handle").text(theInterestAmount);
            calculateMortgage();

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#interest > a.ui-slider-handle").text(sliderCharacter);
            $("#interest-amount").val(ui.value);

        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#interest-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#interest").slider('option', 'value', parseInt($(this).val()));
        $("#interest > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#interest-amount").val($("#interest").slider("value"));

    calculateMortgage();

};

// Calculation
function calculateMortgage() {
    var mortgageamount = parseFloat(document.getElementById("mortgage-amount").value);
    var mortgageyears = parseFloat(document.getElementById("years-amount").value);
    var monthlyinterest = parseFloat(document.getElementById("interest-amount").value) / 12 / 100;
    var monthlypay = (monthlyinterest * mortgageamount) / (1 - (Math.pow((1 + monthlyinterest), (mortgageyears * -12))));
    var monthlypayinterest = (monthlyinterest * mortgageamount);

    var total = document.getElementById("total").innerHTML = "<span class=\"small-text\">(Repayment)</span>&pound;" + parseInt(monthlypay * 100) / 100 + "<span class=\"small-text\">(Interest Only)</span><br/>&pound;" + parseInt(monthlypayinterest * 100) / 100;


    document.getElementById("summary").innerHTML = "For a mortgage of <span class=\"highlight-amount\">&pound;" + addCommas(mortgageamount) + "</span> repaid over <span class=\"highlight-amount\">" + addCommas(mortgageyears) + "</span> years and with an interest rate of <span class=\"highlight-amount\">" + addCommas($("#interest-amount").val()) + "%</span> - Your monthly repayments would be <span class=\"highlight-amount\">&pound;" + parseInt(monthlypay * 100) / 100 + " </span>(Repayment) or <span class=\"highlight-amount\">&pound;" + parseInt(monthlypayinterest * 100) / 100 + " </span>(Interest only)";


}


function toPowerOf(intRate, numPayments) {

    var addOne = 1 + intRate;
    var pow = Math.pow(addOne, numPayments);
    return pow;

}

function stripformats(field) {

    // Remove formatting from input
    var fieldinput;
    fieldinput = document.getElementById(field).value;

    fieldinput = fieldinput.replace(/,/g, "");
    fieldinput = fieldinput.replace(/√Ç¬£/g, "");
    fieldinput = fieldinput.replace(/$/g, "");
    fieldinput = fieldinput.replace(/%/g, "");

    if (fieldinput == "") {

        fieldinput = 0;

    }

    document.getElementById(field).value = fieldinput;
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

init();