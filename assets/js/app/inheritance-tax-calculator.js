function IHT_calculate() {

    var ihtthreshold = 325000.00; // 2017/18 tax year, updated 5 April 2017
    var ihtmainhomethreshold = 100000.00; // 2017/18 tax year, updated 5 April 2017
    var ihttaxrate = 40.00; // 2017/18 tax year, updated 5 April 2017

    var totamount;
    totamount = parseFloat(document.getElementById("homes").value) + parseFloat(document.getElementById("investments").value);
    totamount = totamount + parseFloat(document.getElementById("artantiques").value) + parseFloat(document.getElementById("lifeinsurance").value);
    totamount = totamount + parseFloat(document.getElementById("loansdebtors").value) + parseFloat(document.getElementById("business").value)
    totamount = totamount - parseFloat(document.getElementById("loanscreditors").value);

    var combinedThreshold = 0;
    if (document.getElementById("mainresidenceleft").checked == true) {
        combinedThreshold = ihtthreshold + ihtmainhomethreshold;
    } else {
        combinedThreshold = ihtthreshold;
    }

    if (totamount <= combinedThreshold) {
        var taxamount = 0;
    } else {
        var taxamount = (totamount - combinedThreshold) * (ihttaxrate / 100);
    }

    document.getElementById("estatevalue").innerHTML = "<span class=\"small-text\">Total value of your estate:</span>&pound;" + addCommas(parseInt(totamount * 100) / 100) + "</span>"
    document.getElementById("ihtliability").innerHTML = "<span class=\"small-text\">Total Inheritance Tax due:</span>&pound;" + addCommas(parseInt(taxamount * 100) / 100) + ""

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