var init = function () {

    // Main function to setup up calculator and initialise JQuery UI components goes here				

    // Set slide defaults
    var theInterestRate = 0.5;
    var theYearsAmount = 10;
    var theMonthlyAmount = 500;
    var theLumpSum = 1000;
    var theTargetFund = 0;

    // Interest Rate
    $('#interestrate').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 15,
        value: theInterestRate,
        step: 0.25,

        create: function (event, ui) {

            $("#interestrate > a.ui-slider-handle").text(theInterestRate);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#interestrate > a.ui-slider-handle").text(sliderCharacter);
            $("#interestrate-amount").val(ui.value);
        },

        stop: function (event, ui) {

            investment_calculate();

        }

    });

    // Pull amount from input
    $("#interestrate-amount").blur(function (event, ui) {

        investment_calculate();
        $("#interestrate").slider('option', 'value', parseInt($(this).val()));
        $("#interestrate > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#interestrate-amount").val($("#interestrate").slider("value"));

    // Investment Duration
    $('#numberyears').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 50,
        value: theYearsAmount,
        step: 1,

        create: function (event, ui) {

            $("#numberyears > a.ui-slider-handle").text(theYearsAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#numberyears > a.ui-slider-handle").text(sliderCharacter);
            $("#numberyears-amount").val(ui.value);
        },

        stop: function (event, ui) {

            investment_calculate();

        }

    });

    // Pull amount from input
    $("#numberyears-amount").blur(function (event, ui) {

        investment_calculate();
        $("#numberyears").slider('option', 'value', parseInt($(this).val()));
        $("#numberyears > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#numberyears-amount").val($("#numberyears").slider("value"));


    // Regular Monthly Investment
    $('#monthlyamount').slider({
        orientation: "horizontal",
        range: false,
        min: 100,
        max: 10000,
        value: theMonthlyAmount,
        step: 100,

        create: function (event, ui) {

            $("#monthlyamount > a.ui-slider-handle").text(theMonthlyAmount);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#monthlyamount > a.ui-slider-handle").text(sliderCharacter);
            $("#monthlyamount-amount").val(ui.value);
        },

        stop: function (event, ui) {

            investment_calculate();

        }

    });

    // Pull amount from input
    $("#monthlyamount-amount").blur(function (event, ui) {

        investment_calculate();
        $("#monthlyamount").slider('option', 'value', parseInt($(this).val()));
        $("#monthlyamount > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#monthlyamount-amount").val($("#monthlyamount").slider("value"));

    // Initial Lump Sum
    $('#singleamount').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 10000,
        value: theLumpSum,
        step: 100,

        create: function (event, ui) {

            $("#singleamount > a.ui-slider-handle").text(theLumpSum);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#singleamount > a.ui-slider-handle").text(sliderCharacter);
            $("#singleamount-amount").val(ui.value);
        },

        stop: function (event, ui) {

            investment_calculate();

        }

    });

    // Pull amount from input
    $("#singleamount-amount").blur(function (event, ui) {

        investment_calculate();
        $("#singleamount").slider('option', 'value', parseInt($(this).val()));
        $("#singleamount > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#singleamount-amount").val($("#singleamount").slider("value"));

    // Target Fund
    $('#desiredvalue').slider({
        orientation: "horizontal",
        range: false,
        min: 0,
        max: 100000,
        value: theTargetFund,
        step: 1000,

        create: function (event, ui) {

            $("#desiredvalue > a.ui-slider-handle").text(theTargetFund);

        },

        slide: function (event, ui) {

            sliderCharacter = ui.value;
            $("#desiredvalue > a.ui-slider-handle").text(sliderCharacter);
            $("#desiredvalue-amount").val(ui.value);
        },

        stop: function (event, ui) {

            investment_calculate();

        }

    });

    // Pull amount from input
    $("#desiredvalue-amount").blur(function (event, ui) {

        investment_calculate();
        $("#desiredvalue").slider('option', 'value', parseInt($(this).val()));
        $("#desiredvalue > a.ui-slider-handle").text($(this).val());

    });

    // Pull amount from slider
    $("#desiredvalue-amount").val($("#desiredvalue").slider("value"));

    investment_calculate();

};

//Simple rounding function
function roundVal(val) {

    var dec = 2;
    var result = Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;

}


// Calculation
function investment_calculate() {

    // Collect Form Data
    var apr = parseFloat(document.getElementById("interestrate-amount").value);
    var investmentyears = parseFloat(document.getElementById("numberyears-amount").value);
    var monthcont = parseFloat(document.getElementById("monthlyamount-amount").value);
    var singlecont = parseFloat(document.getElementById("singleamount-amount").value);
    var desiredfund = parseFloat(document.getElementById("desiredvalue-amount").value);

    var workingtotal = 0;
    var numbermonths = (investmentyears * 12) - 1;
    var monthlyint = 1 + ((apr / 100) / 12);

    // Calculate Growth
    if (singlecont > 1) {
        workingtotal = (workingtotal + monthcont + singlecont) * monthlyint;
        for (i = 1; i <= (numbermonths); i++) {
            workingtotal = (workingtotal + monthcont) * monthlyint;
        }
    } else {
        for (i = 1; i <= (investmentyears * 12); i++) {
            workingtotal = (workingtotal + monthcont) * monthlyint;
        }
    }

    // Calculate Shortfall      
    var fundshortfall = 0;
    var monthlyshortfall = 0;
    var singleshortfall = 0;
    if (desiredfund > 0) {
        if (desiredfund > workingtotal) {
            var monthlyrate = Math.pow((1 + (apr / 100)), (1 / 12));
            fundshortfall = desiredfund - workingtotal;
            singleshortfall = fundshortfall / (Math.pow((1 + (apr / 100)), investmentyears));
            monthlyshortfall = fundshortfall * (monthlyrate - 1) / (monthlyrate * (Math.pow(monthlyrate, investmentyears * 12) - 1));
        }
    }

    document.getElementById('total').innerHTML = "<span class=\"small-text\">(Investment Fund)</span>&pound;" + addCommas(Math.round(workingtotal)) + "<span class=\"small-text\">(Fund Shortfall (vs Target))</span><br/>&pound;" + addCommas(Math.round(fundshortfall));
    document.getElementById('summary').innerHTML = "<b>Proposed Premium</b><div class=\"summary-left\"><span class=\"small-text\">(Monthly)</span><br/><span class=\"highlight-amount\">&pound;" + addCommas(Math.round(monthcont)) + "</span></div><div class=\"summary-right\"><span class=\"small-text\">(Single)</span><br/><span class=\"highlight-amount\">&pound;" + addCommas(Math.round(singlecont)) + "</span></div><b>Additional Premium<br/>(to achieve Target)</b><div class=\"summary-left\"><span class=\"small-text\">(Monthly)</span><br/><span class=\"highlight-amount\">&pound;" + addCommas(Math.round(monthlyshortfall)) + "</span></div><div class=\"summary-right\"><span class=\"small-text\">(Single)</span><br/><span class=\"highlight-amount\">&pound;" + addCommas(Math.round(singleshortfall)) + "</span></div>";


    drawChart(workingtotal, fundshortfall);

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
    fieldinput = fieldinput.replace(/Ã‚Â£/g, "");
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

function drawChart(fund, fundshortfall) {

    // Draw Chart
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Amount');
    data.addColumn('number', '&pound;k');
    data.addRows([
        ['Fund', roundVal(fund / 1000)],
        ['Shortfall', roundVal(fundshortfall / 1000)]
    ]);

    var options = {
        width: 150,
        height: 168,
        backgroundColor: 'none',
        colors: ['#00A651'],
        legend: {
            position: 'none'
        },
        vAxis: {
            format: '£##k'
        },
        title: 'Fund vs Shortfall'
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
    chart.draw(data, options);

}

init();