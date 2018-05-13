var init = function () {

    // Main function to setup up calculator and initialise JQuery UI components goes here

    // Set slide defaults
    var theCashAmount = 10000;
    var theYearsAmount = 5;
    var theInflationAmount = 1.80; // Updated 20 January 2017

    // Cash
    $('#cash').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 1000000,
        value: theCashAmount,
        step: 10000,

        create: function (event, ui) {

            $("#cash > a.ui-slider-handle").text(theCashAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#cash > a.ui-slider-handle").text(sliderCharacter);
            $("#cash-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateInflation();

        }

    });

    // Pull amount from input
    $("#cash-amount").blur(function (event, ui) {

        calculateInflation();
        $("#cash").slider('option', 'value', parseInt($(this).val()));
        $("#cash > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#cash-amount").val($("#cash").slider("value"));

    // Years
    $('#years').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
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

            calculateInflation();

        }

    });

    // Pull amount from input
    $("#years-amount").blur(function (event, ui) {

        calculateInflation();
        $("#years").slider('option', 'value', parseInt($(this).val()));
        $("#years > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#years-amount").val($("#years").slider("value"));

    // Inflation
    $('#inflation').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 10,
        value: theInflationAmount,
        step: .25,

        create: function (event, ui) {

            $("#inflation > a.ui-slider-handle").text(theInflationAmount);
            calculateInflation();

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#inflation > a.ui-slider-handle").text(sliderCharacter);
            $("#inflation-amount").val(ui.value);

        },

        stop: function (event, ui) {

            calculateInflation();

        }

    });

    // Pull amount from input
    $("#inflation-amount").blur(function (event, ui) {

        calculateInflation();
        $("#inflation").slider('option', 'value', parseInt($(this).val()));
        $("#inflation > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#inflation-amount").val($("#inflation").slider("value"));

    calculateInflation();

};

// Calculation
function calculateInflation() {

    var todayAmount = document.getElementById('cash-amount').value;
    var numYears = document.getElementById('years-amount').value;
    var inflationRate = document.getElementById('inflation-amount').value;

    var futureValue = todayAmount / (toPowerOf(inflationRate / 100, numYears));
    futureValue = Math.round(100 * futureValue) / 100;

    var output = "&pound;" + addCommas(futureValue);

    document.getElementById('total').innerHTML = output;

    var output = "In <span class=\"highlight-amount\">" + numYears + "</span> years, assuming annual inflation of <span class=\"highlight-amount\">" + inflationRate + "%</span>, <span class=\"highlight-amount\">&pound;" + addCommas(todayAmount) + "</span> will be worth <span class=\"highlight-amount\">&pound;" + addCommas(futureValue);

    document.getElementById('summary').innerHTML = output;

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
    fieldinput = fieldinput.replace(/Â£/g, "");
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

// call init
init();