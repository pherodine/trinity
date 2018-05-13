function incometax_calculate() {

    // Allowances
    var pa65 = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var pa6574 = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var pa75over = 11500.00; // 2017/18 tax year, updated 5 April 2017
    var mca = 3260.00; // 2017/18 tax year, updated 5 April 2017
    var mca75 = 0.00; // 2017/18 tax year, updated 5 April 2017
    var mca75over = 8445.00; // 2017/18 tax year, updated 5 April 2017
    var ba = 2320.00; // 2017/18 tax year, updated 5 April 2017
    var trelief = 28000.00; // 2017/18 tax year, updated 5 April 2017

    // Rates & Bands
    var taxstart = 0.00; // 2017/18 tax year, updated 5 April 2017
    var taxsavings = 20; // Not used
    var taxbasic = 20.00; // 2017/18 tax year, updated 5 April 2017
    var taxhigher = 40.00; // 2017/18 tax year, updated 5 April 2017
    var bandstart = 0.00; // 2017/18 tax year, updated 5 April 2017
    var bandbasic = 33500.00; // 2017/18 tax year, updated 5 April 2017

    // 2010/11 Changes to income tax calculation
    var taxadditional = 45.00; // 2017/18 tax year, updated 5 April 2017
    var bandadditional = 150000.00; // 2017/18 tax year, updated 5 April 2017

    // Reducing personal allowance	
    var pareductionthreshold = 100000.00; // 2017/18 tax year, updated 5 April 2017
    var pareductionrate = 50.00; // 2017/18 tax year, updated 5 April 2017

    // Other	
    var taxable = 0;
    var tax = -1;
    var net = 0;

    // Get Input variables
    var earnings = document.getElementById("earnings").value;
    var personalallowance = document.getElementById("personalallowance").value;
    var marriedallowance = document.getElementById("marriedallowance").value;
    var blindallowance = document.getElementById("blindallowance").value;

    // Rate Conversion
    taxstart = taxstart / 100;
    taxsavings = taxsavings / 100;
    taxbasic = taxbasic / 100;
    taxhigher = taxhigher / 100;
    taxadditional = taxadditional / 100;
    pareductionrate = pareductionrate / 100;

    // Deal with personal allowance adjustments here for 2010/11 onwards
    if (earnings > pareductionthreshold) {
        pareduction = (earnings - pareductionthreshold) * pareductionrate;

        pa65 = pa65 - pareduction;
        pa6574 = pa6574 - pareduction;
        pa75over = pa75over - pareduction;

        // Reset to zero if gone negative
        if (pa65 < 0) {
            pa65 = 0;
        }
        if (pa6574 < 0) {
            pa6574 = 0;
        }
        if (pa75over < 0) {
            pa75over = 0;
        }
    }

    // Deal with blind allowance

    if (blindallowance == 'ba') {
        pa65 = pa65 + ba;
        pa6574 = pa6574 + ba;
        pa75over = ba;
    }

    // Start Calculation for single person under 65
    if (personalallowance == 'pa65' && marriedallowance == '0') {
        if (earnings < pa65) {
            // Earnings below allowances   
            tax = 0;
            net = earnings;
        } else { // starting rate
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax 
                if (earnings <= (pa65 + bandstart + bandbasic)) {
                    taxable = earnings - (pa65 + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in higher rate tax

                    if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                        taxable = earnings - (pa65 + bandstart + bandbasic);
                        hrtamount = taxable;
                        tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                        net = earnings - tax;
                    } else { // Earnings in additional higher rate tax 

                        if (earnings > bandadditional) {

                            taxableadditional = earnings - bandadditional;
                            taxablehigher = bandadditional - bandbasic;
                            hrtamount = taxable;
                            tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                            net = earnings - tax;

                        }

                    }

                }
            }

        }
        // Ends calculation single person under 65
    }

    // Start Calculation for single person age 65-74,
    if (personalallowance == 'pa6574' && marriedallowance == '0') {
        if (earnings < pa6574) {
            // earnings are below allowances
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax full age
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in basic rate tax with age ie trelief<income>(trelief+2*(pa6574-pa65))
                    // tax allowing full age is (trelief-(pa6574+bandstart))*taxbasic + (bandstart*taxstart)
                    if (earnings <= (trelief + 2 * (pa6574 - pa65))) {
                        taxable = earnings - trelief;
                        clawback = taxbasic * (earnings - trelief) / 2;
                        tax = Math.round((taxable * taxbasic) + clawback + ((trelief - (pa6574 + bandstart)) * taxbasic) + (bandstart * taxstart));
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                            net = earnings - tax;
                        } else { //earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                net = earnings - tax;
                            } else {
                                // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }

                            }
                        }
                    }
                }
            }
        }
        // End Calculation for single person age 65-74
    }

    // Start Calculation for single person age 75 and over
    if (personalallowance == 'pa75over' && marriedallowance == 0) {
        if (earnings < pa75over) {
            //earnings are below allowances 
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band
            if (earnings <= (pa75over + bandstart)) {
                taxable = earnings - pa75over;
                tax = Math.round(taxable * taxstart);
                net = earnings - tax;
            } else { // earnings are in basic rate tax full age
                if (earnings <= trelief) {
                    taxable = earnings - (pa75over + bandstart);
                    tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                    net = earnings - tax;
                } else { // earnings are in basic rate tax with age ie trelief<income>(trelief+2*(pa75over-pa65))
                    // tax allowing full age is (trelief-(pa75over+bandstart))*taxbasic + (bandstart*taxstart)
                    if (earnings <= (trelief + 2 * (pa75over - pa65))) {
                        taxable = earnings - trelief;
                        clawback = taxbasic * (earnings - trelief) / 2;
                        tax = Math.round((taxable * taxbasic) + clawback + ((trelief - (pa75over + bandstart)) * taxbasic) + (bandstart * taxstart));
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = Math.round((taxable * taxbasic) + (bandstart * taxstart));
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrttamount = taxable;
                                tax = Math.round((taxable * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                net = earnings - tax;
                            } else {

                                // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }


                            }
                        }
                    }
                }
            }
        }

        // End Calculation for single person age 75 and over
    }

    // Start Calculation Married couple mca75, pa65 (taxpayer under 65, married to 65-75 year old).
    if (personalallowance == 'pa65' && marriedallowance == 'mca') {
        if (earnings < pa65) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = taxable * taxstart;
                if (tax - (mca75 * taxstart) > 0) {
                    tax = tax - (mca75 * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    var taxable = earnings - (pa65 + bandstart);
                    var tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75 * taxstart) > 0) {
                        tax = tax - (mca75 * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75 - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa65 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75 * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // Earnings in additional higher rate tax 

                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }

                            }
                        }
                    }
                }
            }
        }

        // End Calculation Married couple mca75, pa65
    }

    // Start Calculation married couple mca75over, pa65 (taxpayer under 65, married to 75+ year old).
    if (personalallowance == 'pa65' && marriedallowance == 'mca75') {
        if (earnings < pa65) {
            // earnings are below allowances
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa65 + bandstart)) {
                taxable = earnings - pa65;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa65 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa65 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // earnings are in basic rate tax no age 
                        if (earnings <= (pa65 + bandstart + bandbasic)) {
                            taxable = earnings - (pa65 + bandstart);
                            tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in higher rate tax
                            if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                taxable = earnings - (pa65 + bandstart + bandbasic);
                                hrtamount = taxable;
                                tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                net = earnings - tax;
                            } else {

                                // Earnings in additional higher rate tax 
                                if (earnings > bandadditional) {

                                    taxableadditional = earnings - bandadditional;
                                    taxablehigher = bandadditional - bandbasic;
                                    hrtamount = taxable;
                                    tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                    net = earnings - tax;
                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75over, pa65
    }

    // Start calculation married couple mca75, pa6574
    if (personalallowance == 'pa6574' && marriedallowance == 'mca') {
        if (earnings < pa6574) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = taxable * taxstart;
                if (tax - (mca75 * taxstart) > 0) {
                    tax = tax - (mca75 * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75 * taxstart) > 0) {
                        tax = tax - (mca75 * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75 - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa6574 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75 * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75 - mca + pa6574 - pa65) * 2)) {
                            a = trelief + (mca75 - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa6574 - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {
                                    // Earnings in additional higher rate tax 
                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }


                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75, pa6574
    }


    // Start calculation married couple mca75over, pa6574
    if (personalallowance == 'pa6574' && marriedallowance == 'mca75') {
        if (earnings < pa6574) {
            // earnings are below allowances  
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa6574 + bandstart)) {
                taxable = earnings - pa6574;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa6574 + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa6574 - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75over - mca + pa6574 - pa65) * 2)) {
                            a = trelief + (mca75over - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa6574 - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { // earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {

                                    // Earnings in additional higher rate tax 
                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
        // End calculation married couple mca75over, pa6574
    }

    // Start Calculation married couple mca75over, pa75over
    if (personalallowance == 'pa75over' && marriedallowance == 'mca75') {
        if (earnings < pa75over) {
            // earnings are below allowances 
            tax = 0;
            net = earnings;
        } else { // earnings are in ten percent band,
            if (earnings <= (pa75over + bandstart)) {
                taxable = earnings - pa75over;
                tax = taxable * taxstart;
                if (tax - (mca75over * taxstart) > 0) {
                    tax = tax - (mca75over * taxstart)
                } else {
                    tax = 0
                }
                net = earnings - tax;
            } else { // earnings are in basic rate tax with full age 
                if (earnings <= trelief) {
                    taxable = earnings - (pa75over + bandstart);
                    tax = (taxable * taxbasic) + (bandstart * taxstart);
                    if (tax - (mca75over * taxstart) > 0) {
                        tax = tax - (mca75over * taxstart)
                    } else {
                        tax = 0
                    }
                    tax = Math.round(tax);
                    net = earnings - tax;
                } else { // basic rate tax, full age but trelief in effect for mca
                    if (earnings <= (trelief + 2 * (mca75over - mca))) {
                        clawback = ((earnings - trelief) / 2) * taxstart;
                        a = earnings - trelief;
                        b = (trelief - pa75over - bandstart) * taxbasic + (bandstart * taxstart) - (mca75over * taxstart);
                        tax = (a * taxbasic) + b + clawback;
                        net = earnings - tax;
                    } else { // basic rate tax age trelief in effect, mca down to basic
                        if (earnings <= (trelief + (mca75over - mca + pa75over - pa65) * 2)) {
                            a = trelief + (mca75over - mca) * 2;
                            b = (earnings - a) / 2;
                            c = pa75over - b;
                            tax = (earnings - c - bandstart) * taxbasic + (bandstart * taxstart) - (mca * taxstart);
                            net = earnings - tax;
                        } else { // earnings are in basic rate tax no age 
                            if (earnings <= (pa65 + bandstart + bandbasic)) {
                                taxable = earnings - (pa65 + bandstart);
                                tax = (taxable * taxbasic) + (bandstart * taxstart) - (mca * taxstart);
                                net = earnings - tax;
                            } else { //earnings are in higher rate tax
                                if ((earnings > (pa65 + bandstart + bandbasic)) && (earnings <= bandadditional)) {
                                    taxable = earnings - (pa65 + bandstart + bandbasic);
                                    hrtamount = taxable;
                                    tax = (taxable * taxhigher) + (bandstart * taxstart) + (bandbasic * taxbasic) - (mca * taxstart);
                                    net = earnings - tax;
                                } else {

                                    if (earnings > bandadditional) {

                                        taxableadditional = earnings - bandadditional;
                                        taxablehigher = bandadditional - bandbasic;
                                        hrtamount = taxable;
                                        tax = Math.round((taxableadditional * taxadditional) + (taxablehigher * taxhigher) + ((bandstart * taxstart) + (bandbasic * taxbasic)));
                                        net = earnings - tax;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
        // End Calculation married couple mca75over, pa75over
    }

    if (tax == -1) {
        alert("Please reselect Allowances");
    }

    // ba and  tidying results and vetting for errors
    net = parseFloat(net);
    tax = parseFloat(tax);

    // ba 
    //if(blindallowance=='ba'){ 
    //net=net+(ba*taxstart);
    //tax=tax-(ba*taxstart);

    //}
    //correct for negatives (ie from ba and child)
    if (tax <= 0) {
        net = earnings;
        document.getElementById("total").innerHTML = "£0";
        document.getElementById('summary').innerHTML = "No tax to pay"


    } else {
        document.getElementById("total").innerHTML = "&pound;" + addCommas(Math.round(tax));

        // Summary

        var total = document.getElementById("total").innerHTML

        var output = "Based on earnings of <span class=\"highlight-amount\">&pound;" + addCommas(earnings) + "</span> and tax rates and allowances for the tax year 2017/18, your income tax would be <span class=\"highlight-amount\">" + total + "</span>";

        document.getElementById('summary').innerHTML = output;

    }
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