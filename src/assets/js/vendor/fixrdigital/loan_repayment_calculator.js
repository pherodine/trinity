var init = function () {

    // Main function to setup up calculator and initialise JQuery UI components goes here

    // Set slide defaults
    var theLoanAmount = 1000;
    var theTermAmount = 36;
    var theInterestAmount = 7.75;

    // Loan
    $('#loan').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 100000,
        value: theLoanAmount,
        step: 1000,

        create: function (event, ui) {

            $("#loan > a.ui-slider-handle").text(theLoanAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#loan > a.ui-slider-handle").text(sliderCharacter);
            $("#loan-amount").val(ui.value);
        },

        stop: function (event, ui) {

            loan_calculate();

        }

    });

    // Pull amount from input
    $("#loan-amount").blur(function (event, ui) {

        loan_calculate();
        $("#loan").slider('option', 'value', parseInt($(this).val()));
        $("#loan > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#loan-amount").val($("#loan").slider("value"));

    // Term
    $('#term').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 120,
        value: theTermAmount,
        step: 1,

        create: function (event, ui) {

            $("#term > a.ui-slider-handle").text(theTermAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;

            $("#term > a.ui-slider-handle").text(sliderCharacter);
            $("#term-amount").val(ui.value);

        },

        stop: function (event, ui) {

            loan_calculate();

        }

    });

    // Pull amount from input
    $("#term-amount").blur(function (event, ui) {

        loan_calculate();
        $("#term").slider('option', 'value', parseInt($(this).val()));
        $("#term > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#term-amount").val($("#term").slider("value"));

    // Interest
    $('#interest').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 50,
        value: theInterestAmount,
        step: .25,

        create: function (event, ui) {

            $("#interest > a.ui-slider-handle").text(theInterestAmount);
            loan_calculate();

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#interest > a.ui-slider-handle").text(sliderCharacter);
            $("#interest-amount").val(ui.value);

        },

        stop: function (event, ui) {

            loan_calculate();

        }

    });

    // Pull amount from input
    $("#interest-amount").blur(function (event, ui) {

        loan_calculate();
        $("#interest").slider('option', 'value', parseInt($(this).val()));
        $("#interest > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#interest-amount").val($("#interest").slider("value"));

    loan_calculate();

};

// Calculation
function loan_calculate() {
    // Perform calculation
    var loanamount = parseFloat(document.getElementById("loan-amount").value);
    var loanmonths = parseFloat(document.getElementById("term-amount").value);
    var monthlyinterest = parseFloat(document.getElementById("interest-amount").value) / 12 / 100;
    var monthlypay = (monthlyinterest * loanamount) / (1 - (Math.pow((1 + monthlyinterest), (-loanmonths))));
    var interestamount = parseFloat(document.getElementById("interest-amount").value);

    var total = document.getElementById("total").innerHTML = "&pound;" + addCommas(parseInt(monthlypay * 100) / 100);

    var output = "For a loan of <span class=\"highlight-amount\">&pound;" + addCommas(loanamount) + "</span> repaid over <span class=\"highlight-amount\">" + loanmonths + "</span> months and with an interest rate of <span class=\"highlight-amount\">" + interestamount + "%</span> - Your monthly repayments would be <span class=\"highlight-amount\">" + total + "</span>";

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