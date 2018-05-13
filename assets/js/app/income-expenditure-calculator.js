function goTo(id) {
    $('html,body').animate({
        scrollTop: $("#" + id).offset().top
    }, 'slow');
}

function incomesubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate income subtotal
    var incomesubtotal = 0;
    var incomevar = 0;
    var freqvar = 0;

    for (i = 1; i < 7; i++) {
        incomevar = document.getElementById("in" + i).value;
        freqvar = document.getElementById("yrin" + i).value;
        incomesubtotal = incomesubtotal + ((incomevar * freqvar) / 12);
    }

    document.getElementById("totalincome").value = parseInt(incomesubtotal * 100) / 100;
    recalcall(field);
    incomesubtotal = parseInt(incomesubtotal * 100) / 100;
    incomesubtotal = incomesubtotal.toFixed(2);
    summarycalc();
}

function householdsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate household subtotal
    var householdsubtotal = 0;
    var householdvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 1; i < 7; i++) {
        householdvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        householdsubtotal = householdsubtotal + ((householdvar * freqvar) / 12)
    }

    document.getElementById("totalhousehold").value = parseInt(householdsubtotal * 100) / 100;
    householdp = (parseInt(householdsubtotal / totalincome * 100) / 100) * 100;
    householdp = householdp.toFixed(0);
    
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percenthousehold").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percenthousehold").innerHTML = householdp + "% of your Income";
    }
    summarycalc();

    householdsubtotal = parseInt(householdsubtotal * 100) / 100;
    householdsubtotal = householdsubtotal.toFixed(2);
}

function savingdebtsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate saving debt subtotal
    var savingdebtsubtotal = 0;
    var savingdebtvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 7; i < 12; i++) {
        savingdebtvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        savingdebtsubtotal = savingdebtsubtotal + ((savingdebtvar * freqvar) / 12)
    }
    
    document.getElementById("totalsavingdebt").value = parseInt(savingdebtsubtotal * 100) / 100;
    savingdebtp = (parseInt(savingdebtsubtotal / totalincome * 100) / 100) * 100;
    savingdebtp = savingdebtp.toFixed(0);
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentsavingdebt").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentsavingdebt").innerHTML = savingdebtp + "% of your Income";
    }
    summarycalc();

    savingdebtsubtotal = parseInt(savingdebtsubtotal * 100) / 100;
    savingdebtsubtotal = savingdebtsubtotal.toFixed(2);
}

function leisuresubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate leisure subtotal
    var leisuresubtotal = 0;
    var leisurevar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 12; i < 17; i++) {
        leisurevar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        leisuresubtotal = leisuresubtotal + ((leisurevar * freqvar) / 12)
    }

    document.getElementById("totalleisure").value = parseInt(leisuresubtotal * 100) / 100;
    leisurep = (parseInt(leisuresubtotal / totalincome * 100) / 100) * 100;
    leisurep = leisurep.toFixed(0);
    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentleisure").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentleisure").innerHTML = leisurep + "% of your Income";
    }
    summarycalc();

    leisuresubtotal = parseInt(leisuresubtotal * 100) / 100;
    leisuresubtotal = leisuresubtotal.toFixed(2);
}

function childrensubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate children subtotal
    var childrensubtotal = 0;
    var childrenvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 17; i < 20; i++) {
        childrenvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        childrensubtotal = childrensubtotal + ((childrenvar * freqvar) / 12)
    }

    document.getElementById("totalchildren").value = parseInt(childrensubtotal * 100) / 100;
    childrenp = (parseInt(childrensubtotal / totalincome * 100) / 100) * 100;
    childrenp = childrenp.toFixed(0);

    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percentchildren").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percentchildren").innerHTML = childrenp + "% of your Income";
    }

    summarycalc();

    childrensubtotal = parseInt(childrensubtotal * 100) / 100;
    childrensubtotal = childrensubtotal.toFixed(2);
}

function travelsubtotal(field) {
    // Clean input
    stripformats(field);
    // Calculate children subtotal
    var travelsubtotal = 0;
    var travelvar = 0;
    var freqvar = 0;
    var totalincome = document.getElementById("totalincome").value;

    for (i = 20; i < 23; i++) {
        travelvar = document.getElementById("ex" + i).value;
        freqvar = document.getElementById("yrex" + i).value;
        travelsubtotal = travelsubtotal + ((travelvar * freqvar) / 12)
    }

    document.getElementById("totaltravel").value = parseInt(travelsubtotal * 100) / 100;
    travelp = (parseInt(travelsubtotal / totalincome * 100) / 100) * 100;
    travelp = travelp.toFixed(0);

    if (document.getElementById("totalincome").value == 0) {
        document.getElementById("percenttravel").innerHTML = 0 + "% of your Income";
    } else {
        document.getElementById("percenttravel").innerHTML = travelp + "% of your Income";
    }
    summarycalc();

    travelsubtotal = parseInt(travelsubtotal * 100) / 100;
    travelsubtotal = travelsubtotal.toFixed(2);
}

function stripformats(field) {
    // Remove formatting from input
    var fieldinput;
    fieldinput = document.getElementById(field).value;
    fieldinput = fieldinput.replace(/,/g, "");
    fieldinput = fieldinput.replace(/£/g, "");
    fieldinput = fieldinput.replace(/$/g, "");
    fieldinput = fieldinput.replace(/%/g, "");
    document.getElementById(field).value = fieldinput;
}

function summarycalc() {
    var totspend = 0;
    var netincome = 0;
    var incomesubtotal = document.getElementById("totalincome").value;
    incomesubtotal = parseInt(incomesubtotal * 100) / 100;
    incomesubtotal = incomesubtotal.toFixed(2);
    totspend = totspend + parseFloat(document.getElementById("totaltravel").value) + parseFloat(document.getElementById("totalchildren").value) + parseFloat(document.getElementById("totalleisure").value);
    totspend = totspend + parseFloat(document.getElementById("totalsavingdebt").value) + parseFloat(document.getElementById("totalhousehold").value);
    netincome = parseFloat(document.getElementById("totalincome").value) - totspend;
    netincome = parseInt(netincome * 100) / 100;
    netincome = netincome.toFixed(2);
    totspend = parseInt(totspend * 100) / 100;
    totspend = totspend.toFixed(2);

    document.getElementById("incometotal").innerHTML = "<span class=\"small-text\">Total Income</span>&pound;" + incomesubtotal;
    document.getElementById("sumtotalspend").innerHTML = "<span class=\"small-text\">Total Spend</span>&pound;" + totspend;
    document.getElementById("sumnet").innerHTML = "<span class=\"small-text\">Total Left Over</span>&pound;" + netincome;
    //document.getElementById("totspend2").innerHTML= "£"+ totspend;
    totalspendper = (parseInt(totspend / parseFloat(document.getElementById("totalincome").value) * 100) / 100) * 100;
    totalspendper = totalspendper.toFixed(0);
    //document.getElementById("totspend2p").innerHTML= totalspendper +"%";

    drawChart();
}


function recalcall(field) {
    householdsubtotal(field);
    savingdebtsubtotal(field);
    leisuresubtotal(field);
    childrensubtotal(field);
    travelsubtotal(field);
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

function drawChart() {

    var householdsubtotal = document.getElementById("totalhousehold").value;
    var savingdebtsubtotal = document.getElementById("totalsavingdebt").value;
    var leisuresubtotal = document.getElementById("totalleisure").value;
    var childrensubtotal = document.getElementById("totalchildren").value;
    var travelsubtotal = document.getElementById("totaltravel").value;

    // Draw Chart
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Amount');
    data.addColumn('number', '&pound;');
    data.addRows([
        ['Household', roundVal(householdsubtotal / 1000)],
        ['Saving Debt', roundVal(savingdebtsubtotal / 1000)],
        ['Leisure', roundVal(leisuresubtotal / 1000)],
        ['Children', roundVal(childrensubtotal / 1000)],
        ['Travel', roundVal(travelsubtotal / 1000)]
    ]);
    var options = {
        width: 150,
        height: 168,
        backgroundColor: 'none',
        colors: ['#C4122F', '#8DC63F', '#00AEEF', '#F7941E', '#662D91'],
        tooltip: {
            text: 'percentage'
        },
        legend: {
            position: 'bottom'
        },
        vAxis: {
            format: '&pound;##k'
        },
        title: 'Breakdown of Spend'
    };

    var chart = new google.visualization.PieChart(document.getElementById('chart'));
    chart.draw(data, options);
}

//Simple rounding function
function roundVal(val) {

    var dec = 2;
    var result = Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}