var init = function () {

    // Main function to setup up calculator and initialise JQuery UI components goes here

    // Set slide defaults
    var yourSalaryAmount = 20000;
    var partnerSalaryAmount = 0;
    var depositAmount = 0;
    var outgoingsAmount = 1000;



    // Your Salary
    $('#yoursalary').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 1000000,
        value: yourSalaryAmount,
        step: 10000,

        create: function (event, ui) {

            $("#yoursalary > a.ui-slider-handle").text(yourSalaryAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#yoursalary > a.ui-slider-handle").text(sliderCharacter);
            $("#yoursalary-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#yoursalary-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#yoursalary").slider('option', 'value', parseInt($(this).val()));
        $("#yoursalary > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#yoursalary-amount").val($("#yoursalary").slider("value"));







    // Partner Salary
    $('#partnersalary').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 100000,
        value: partnerSalaryAmount,
        step: 1000,

        create: function (event, ui) {

            $("#partnersalary > a.ui-slider-handle").text(partnerSalaryAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#partnersalary > a.ui-slider-handle").text(sliderCharacter);
            $("#partnersalary-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#partnersalary-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#partnersalary").slider('option', 'value', parseInt($(this).val()));
        $("#partnersalary > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#partnersalary-amount").val($("#partnersalary").slider("value"));






    // Deposit
    $('#deposit').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 100000,
        value: depositAmount,
        step: 1000,

        create: function (event, ui) {

            $("#deposit > a.ui-slider-handle").text(depositAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#deposit > a.ui-slider-handle").text(sliderCharacter);
            $("#deposit-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#deposit-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#deposit").slider('option', 'value', parseInt($(this).val()));
        $("#deposit > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#deposit-amount").val($("#deposit").slider("value"));





    // Outgoings
    $('#outgoings').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 10000,
        value: outgoingsAmount,
        step: 100,

        create: function (event, ui) {

            $("#outgoings > a.ui-slider-handle").text(outgoingsAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#outgoings > a.ui-slider-handle").text(sliderCharacter);
            $("#outgoings-amount").val(ui.value);
        },

        stop: function (event, ui) {

            calculateMortgage();

        }

    });

    // Pull amount from input
    $("#outgoings-amount").blur(function (event, ui) {

        calculateMortgage();
        $("#outgoings").slider('option', 'value', parseInt($(this).val()));
        $("#outgoings > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#outgoings-amount").val($("#outgoings").slider("value"));



    calculateMortgage();

};



// Calculation

function calculateMortgage() {
    var lowthreshold = 2.50; // Updated 5 April 2017
    var highthreshold = 5.00; // Updated 5 April 2017
    var lowamount;
    var highamount;
    var deposit = parseFloat(document.getElementById("deposit-amount").value);
    var lowdepositpercent
    var highdepositpercent
    var mindeposit = 5.00 / 100;

    lowdepositpercent = parseFloat(document.getElementById("yoursalary-amount").value) + parseFloat(document.getElementById("partnersalary-amount").value);
    lowdepositpercent = lowdepositpercent * lowthreshold;
    lowdepositpercent = lowdepositpercent + deposit;
    lowdepositpercent = deposit / lowdepositpercent;

    highdepositpercent = parseFloat(document.getElementById("yoursalary-amount").value) + parseFloat(document.getElementById("partnersalary-amount").value);
    highdepositpercent = highdepositpercent * highthreshold;
    highdepositpercent = highdepositpercent + deposit;
    highdepositpercent = deposit / highdepositpercent;

    lowamount = parseFloat(document.getElementById("yoursalary-amount").value) + parseFloat(document.getElementById("partnersalary-amount").value);
    lowamount = lowamount * lowthreshold;
    lowamount = lowamount - parseFloat(document.getElementById("outgoings-amount").value) * 12 * lowthreshold;

    highamount = parseFloat(document.getElementById("yoursalary-amount").value) + parseFloat(document.getElementById("partnersalary-amount").value);
    highamount = highamount * highthreshold;
    highamount = highamount - parseFloat(document.getElementById("outgoings-amount").value) * 12 * highthreshold;

    if (lowdepositpercent < mindeposit) {
        document.getElementById("lowdeposit").innerHTML = "* Deposit Percentage:<span class=\"warning-text\"> " + parseInt(lowdepositpercent * 1000) / 10 + "%</span>"
    } else {
        document.getElementById("lowdeposit").innerHTML = ""
    }

    if (highdepositpercent < mindeposit) {

        document.getElementById("highdeposit").innerHTML = "** Deposit Percentage:<span class=\"warning-text\"> " + parseInt(highdepositpercent * 1000) / 10 + "%</span> <br/><br/><span class=\"warning-text\">You may not be able to borrow this amount with your current deposit</span>"
    } else {
        document.getElementById("highdeposit").innerHTML = ""
    }

    document.getElementById("total").innerHTML = "&pound;" + addCommas(lowamount) + " - &pound;" + addCommas(highamount);



    document.getElementById("summary").innerHTML = "Depending on Lender you may be able to borrow between: <span class=\"highlight-amount\">&pound;" + addCommas(lowamount) + "* - &pound;" + addCommas(highamount) + "**</span>";


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

init();