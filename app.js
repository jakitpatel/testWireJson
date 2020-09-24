// Requiring Fields Json file 
let fields = require("./fields.json");
//console.log(fields);

// Requiring Wires Json file 
let wire = require("./wire.json");
//console.log(wire);

let errorMsg = "";
let tagCnt = 0;
for(var i = 0; i < fields.length; i++) {
    var obj = fields[i];
    //console.log(obj.tag);
    let elementArr = obj.elements;
    //console.log("element.len = "+ elementArr.length);
    errorMsg += verifytag(obj.tag, elementArr , wire);
    tagCnt = tagCnt +1;
    /*
    for(var j = 0; j < elementArr.length; j++) {
        
        var objElement = elementArr[j];
        console.log(objElement.name);
        let val = wire[objElement.name];
        console.log("val =" + val);
        
        if(objElement.mandatory == 0){
            let err1 = checkOptional(obj.tag, objElement, val);
            if(err1 !== null){
                errorMsg = errorMsg+err1+" ";
            }
        }
        else if(objElement.mandatory == 1){
            let err1 = checkMandatory(obj.tag, objElement, val);
            if(err1 !== null){
                errorMsg = errorMsg+err1+" ";
            }
        }
        else if(objElement.mandatory == 2){
            let err1 = checkSpecial(obj.tag, objElement, val, wire);
            if(err1 !== null){
                errorMsg = errorMsg+err1+" ";
            }
        }
        else {
            if(err1 !== null){
                errorMsg = errorMsg+obj.tag+":not valid mandatory value ";
            }
        }
    }*/
}

function verify1500(tag, elementArr, wire) {
    /*{1500} Sender Supplied Information
    Format Version (‘30’)
    User Request Correlation (8 characters)
    Test Production Code (‘T’ test or ‘P’ production)
    Message Duplication Code (‘ ‘ original message or ‘P’ resend)
    Mandatory*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkMandatory(tag, objElement, val)+" ";
    }
    return errTag;
}

function verify1510(tag, elementArr, wire) {
    /*{1510}
        Type/Subtype
        Type Code (2 characters) Subtype Code (2 characters)
        Mandatory*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkMandatory(tag, objElement, val)+" ";
    }
    return errTag;
}

function verify1520(tag, elementArr, wire) {
    /*{1520} Input Message Accountability Data (IMAD)
    Input Cycle Date (CCYYMMDD)
    Input Source (8 characters)
    Input Sequence Number (6 characters)
    Mandatory
    Note: Optional for FedLine Advantage® import customers, but if present, must be 22 characters.*/
    let errTag = "";

    let inputCycleDate = wire['inputCycleDate'];
    let inputSource = wire['inputSource'];
    let inputSeqNum = wire['inputSeqNum'];

    if(typeof inputCycleDate  == 'undefined' && typeof inputSource  == 'undefined' && typeof inputSeqNum  == 'undefined'){
        return "";
    }

    if (inputCycleDate.length !== 8 || inputSource.length !== 8 || inputSeqNum.length !== 6){
        return  tag+ ":" +  " not a valid length;";
    }
    // verify (CCYYMMDD)
    return errTag;
}

function verify2000(tag, elementArr, wire) {
    /*{2000}
        Amount (up to a penny less than $10 billion)
        Format: 12 numeric, right-justified with leading zeros, an implied decimal point and no commas; e.g., $12,345.67 becomes 000001234567
        Mandatory
        Can be all zeros for subtype 90.*/
    let errTag = "";
    let amount = wire['amount'];

    errTag = errTag + checkMandatory(tag, elementArr[0], amount)+" ";
    let subtypeCode = wire['subtypeCode'];
    if(subtypeCode=="90"){
        if(amount!=="000000000000"){
            errTag = errTag + tag+ ": amount : " +  " must have all 000000000000;";
        }
    }
    return errTag;
}

function verify3100(tag, elementArr, wire) {
    /*{3100} Sender DI
        Sender ABA Number (9 characters)
        Sender Short Name (18 characters; if omitted, it will not be inserted by the Fedwire Funds Service)
        Mandatory*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkMandatory(tag, objElement, val)+" ";
    }
    return errTag;
}

function verify3400(tag, elementArr, wire) {
    /*{3400} Receiver DI
        Receiver ABA Number (9 characters)
        Receiver Short Name (18 characters; if omitted, it will not be inserted by the Fedwire Funds Service)
        Mandatory*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkMandatory(tag, objElement, val)+" ";
    }
    return errTag;
}

function verify3600(tag, elementArr, wire) {
    /*{{3600} : Business Function Code
    Business Function Code (3 characters) : BTR, CKS, CTP, CTR, DEP, DRB, DRC, DRW, FFR, FFS, SVC
    Transaction Type Code (3 characters)
    Mandatory
    If {3600} is CTR, an optional Transaction Type Code element is permitted; 
    however, the Transaction Type Code “COV” is not permitted.*/
    let errTag = "";

    let businessFunctionCode = wire['businessFunctionCode'];
    errTag = errTag + checkMandatory(tag, elementArr[0], businessFunctionCode)+" ";

    let transactionTypeCode = wire['transactionTypeCode'];
    errTag = errTag + checkOptional(tag, elementArr[1], transactionTypeCode)+" ";
    
    if(businessFunctionCode == "CTR" && transactionTypeCode=="COV"){
        errTag = errTag + tag+ ": businessFunctionCode = CTR then can have a transactionTypeCode, but COV in transactionTypeCode is not permitted; ";
    }
    return errTag;
}

function verify3320(tag, elementArr, wire) {
    /*{3320} Sender Reference (16 characters)*/
    let errTag = "";

    let senderReference = wire['senderReference'];
    errTag = errTag + checkOptional(tag, elementArr[0], senderReference)+" ";
    
    return errTag;
}

function verify3500(tag, elementArr, wire) {
    /*{3500} Previous Message Identifier (22 characters)
    Mandatory if {1510} is XX02 or XX08 and {3600} is BTR, CTR or CTP.*/
    let errTag = "";

    let prevMsgID = wire['prevMsgID'];
    errTag = errTag + checkOptional(tag, elementArr[0], prevMsgID)+" ";
    
    let typeSubTypeCode = wire['typeCode']+wire['subtypeCode'];
    let busFunCode = wire['businessFunctionCode'];
    if((typeSubTypeCode == "XX02" || typeSubTypeCode == "XX08") && (busFunCode =="BTR" || busFunCode =="CTR" || busFunCode =="CTP")){
        errTag = errTag + checkMandatory(tag, elementArr[0], prevMsgID)+" ";
    }
    return errTag;
}

function verify3610(tag, elementArr, wire) {
    /*{3610} Local Instrument
        Local Instrument Code (4 character code)
        ANSI, COVS, GXML, IXML, NARR, PROP, RMTS, RRMT, S820, SWIF, UEDI
        Proprietary Code (35 characters)
        {3600} must be CTP.
        Proprietary Code element only permitted if Local Instrument Code element is PROP.*/
    let errTag = "";
    
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    if(typeof localInstrumentCode !== 'undefined' && localInstrumentCode!== null && localInstrumentCode!== ""){
        if(busFunCode!=="CTP"){
            errTag = errTag + tag+ ": localInstrumentCode : only allowed if 3600.businessFunctionCode = CTP; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], localInstrumentCode)+" ";
        }
    }

    let proprietaryCode = wire['proprietaryCode'];
    if(typeof proprietaryCode !== 'undefined' && proprietaryCode!== null && proprietaryCode!== ""){
        if(localInstrumentCode!=="PROP"){
            errTag = errTag + tag+ " : proprietaryCode : only allowed if 3610.localInstrumentCode = PROP; ";
        } else {
            // check length
            errTag = errTag + checkMandatory(tag, elementArr[1], proprietaryCode)+" ";
        }
    }
    return errTag;
}

function verify3620(tag, elementArr, wire) {
    /*{3620} : Payment Notification
        Payment Notification Indicator (‘0’ through ‘9’)
        Contact Notification Electronic Address (2,048 characters; i.e., E-mail or URL address)
        Contact Name (140 characters)
        Contact Phone Number (35 characters)
        Contact Mobile Number (35 characters) Contact Fax Number (35 characters) End-to-End Identification (35 characters)
        {3600} must be CTP.
        Payment Notification Indicator is mandatory.
        Indicators 0 through 6 – Reserved for
        market practice conventions.
        Indicators 7 through 9 – Reserved for bilateral agreements between Fedwire senders and receivers.*/
    let errTag = "";

    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(objElement.name === "paymentNotificationIndicator"){
            let payNotIndicator = wire['paymentNotificationIndicator'];
            let busFunCode = wire['businessFunctionCode'];
            if(typeof payNotIndicator !== 'undefined' && payNotIndicator!== null && payNotIndicator!== ""){
                if(busFunCode!=="CTP"){
                    errTag = errTag + tag+ ": paymentNotificationIndicator : only allowed if 3600.businessFunctionCode = CTP; ";
                } else {
                    // check Val has '0' through '9'
                    var numbers = /^[0-9]+$/;
                    if(payNotIndicator.match(numbers)) {
                    
                    } else {
                        errTag = errTag + tag+ ": paymentNotificationIndicator : only allowed [0-9] in 3620.paymentNotificationIndicator; ";
                    }
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val)+" ";
        }
    }
    return errTag;
}

function verify3700(tag, elementArr, wire) {
    /*{3700} Charges
        Details of Charges (‘B’ beneficiary or ‘S’ shared)
        Senders Charges
        (up to 4 occurrences of 15 characters each)
        Format: The first three characters must contain an alpha currency code (e.g., USD). The remaining characters for the amount must begin with at least one numeric character (0-9) and only one decimal comma marker (e.g., $1,234.56 should be entered as USD1234,56 and $0.99 should be entered as USD0,99).
        {3600} must be CTR or CTP.
        Not permitted if {3610} Local Instrument Code is COVS.*/
    let errTag = "";
    
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let detailsOfCharges = wire['detailsOfCharges'];
    if(typeof detailsOfCharges !== 'undefined' && detailsOfCharges!== null && detailsOfCharges!== ""){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": detailsOfCharges : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": detailsOfCharges : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], detailsOfCharges)+" ";
        }
    }

    let letters = /^[A-Za-z]+$/;
    let sendersChargesCurrency1 = wire['sendersChargesCurrency1'];
    errTag = errTag + checkOptional(tag, elementArr[1], sendersChargesCurrency1)+" ";
    if(typeof sendersChargesCurrency1 !== 'undefined' && sendersChargesCurrency1!== null && sendersChargesCurrency1!== ""){
        if(!sendersChargesCurrency1.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency1 : only allowed [A-Z] in 3700.sendersChargesCurrency1; ";
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    let sendersChargesAmount1 = wire['sendersChargesAmount1'];
    errTag = errTag + checkOptional(tag, elementArr[2], sendersChargesAmount1)+" ";
    if(typeof sendersChargesAmount1 !== 'undefined' && sendersChargesAmount1!== null && sendersChargesAmount1!== ""){
        if(!sendersChargesAmount1.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount1 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount1; ";
        }
    }

    let sendersChargesCurrency2 = wire['sendersChargesCurrency2'];
    errTag = errTag + checkOptional(tag, elementArr[3], sendersChargesCurrency2)+" ";
    if(typeof sendersChargesCurrency2 !== 'undefined' && sendersChargesCurrency2!== null && sendersChargesCurrency2!== ""){
        if(!sendersChargesCurrency2.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency2 : only allowed [A-Z] in 3700.sendersChargesCurrency2; ";
        }
    }

    let sendersChargesAmount2 = wire['sendersChargesAmount2'];
    errTag = errTag + checkOptional(tag, elementArr[4], sendersChargesAmount2)+" ";
    if(typeof sendersChargesAmount2 !== 'undefined' && sendersChargesAmount2!== null && sendersChargesAmount2!== ""){
        if(!sendersChargesAmount2.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount2 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount2; ";
        }
    }

    let sendersChargesCurrency3 = wire['sendersChargesCurrency3'];
    errTag = errTag + checkOptional(tag, elementArr[5], sendersChargesCurrency3)+" ";
    if(typeof sendersChargesCurrency3 !== 'undefined' && sendersChargesCurrency3!== null && sendersChargesCurrency3!== ""){
        if(!sendersChargesCurrency3.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency3 : only allowed [A-Z] in 3700.sendersChargesCurrency3; ";
        }
    }

    let sendersChargesAmount3 = wire['sendersChargesAmount3'];
    errTag = errTag + checkOptional(tag, elementArr[6], sendersChargesAmount3)+" ";
    if(typeof sendersChargesAmount3 !== 'undefined' && sendersChargesAmount3!== null && sendersChargesAmount3!== ""){
        if(!sendersChargesAmount3.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount3 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount3; ";
        }
    }

    let sendersChargesCurrency4 = wire['sendersChargesCurrency4'];
    errTag = errTag + checkOptional(tag, elementArr[7], sendersChargesCurrency4)+" ";
    if(typeof sendersChargesCurrency4 !== 'undefined' && sendersChargesCurrency4!== null && sendersChargesCurrency4!== ""){
        if(!sendersChargesCurrency4.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency4 : only allowed [A-Z] in 3700.sendersChargesCurrency4; ";
        }
    }

    let sendersChargesAmount4 = wire['sendersChargesAmount4'];
    errTag = errTag + checkOptional(tag, elementArr[8], sendersChargesAmount4)+" ";
    if(typeof sendersChargesAmount4 !== 'undefined' && sendersChargesAmount4!== null && sendersChargesAmount4!== ""){
        if(!sendersChargesAmount4.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount4 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount4; ";
        }
    }

    return errTag;
}


function verify3710(tag, elementArr, wire) {
    /*{3710} : Instructed Amount
        Currency Code (3 characters)
        Amount (15 characters)
        Format: Must begin with at least one numeric character (0-9) and contain only one decimal comma marker (e.g., $1,234.56
        should be entered as 1234,56 and $0.99 should be entered as 0,99).
        {3600} must be CTR or CTP. Mandatory if {3720} is present.
        Not permitted if {3610} Local Instrument Code is COVS.*/
    let errTag = "";
    
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let instAmtCurrCode = wire['instructedAmountCurrencyCode'];
    let instructedAmount = wire['instructedAmount'];
    if(typeof instAmtCurrCode !== 'undefined' && instAmtCurrCode!== null && instAmtCurrCode!== ""){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], instAmtCurrCode)+" ";
        }
    }

    let exchangeRate = wire['exchangeRate'];
    if(exchangeRate!==null && exchangeRate!==""){
        errTag = errTag + checkMandatory(tag, elementArr[0], instAmtCurrCode)+" ";
        errTag = errTag + checkMandatory(tag, elementArr[1], instructedAmount)+" ";
    }

    let letters = /^[A-Za-z]+$/;
    errTag = errTag + checkOptional(tag, elementArr[0], instAmtCurrCode)+" ";
    if(typeof instAmtCurrCode !== 'undefined' && instAmtCurrCode!== null && instAmtCurrCode!== ""){
        if(!instAmtCurrCode.match(letters)) {
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed [A-Z] in 3710.sendersChargesCurrency1; ";
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    errTag = errTag + checkOptional(tag, elementArr[1], instructedAmount)+" ";
    if(typeof instructedAmount !== 'undefined' && instructedAmount!== null && instructedAmount!== ""){
        if(!instructedAmount.match(numeric)) {
            errTag = errTag + tag+ ": instructedAmount : only allowed [0-9][0-9,]* in 3710.instructedAmount; ";
        }
    }

    return errTag;
}

function verify3720(tag, elementArr, wire) {
    /*{3720} Exchange Rate (12 characters)
        Format: Must contain at least one numeric character and only one decimal comma marker (e.g., an exchange rate of 1.2345 should be entered as 1,2345).
        {3600} must be CTR or CTP.
        If present, {3710} is mandatory.
        Not permitted if {3610} Local Instrument Code is COVS.*/
    let errTag = "";
    
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let exchangeRate = wire['exchangeRate'];
    if(typeof exchangeRate !== 'undefined' && exchangeRate!== null && exchangeRate!== ""){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": exchangeRate : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": exchangeRate : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], exchangeRate)+" ";
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    errTag = errTag + checkOptional(tag, elementArr[0], exchangeRate)+" ";
    if(typeof exchangeRate !== 'undefined' && exchangeRate!== null && exchangeRate!== ""){
        if(!exchangeRate.match(numeric)) {
            errTag = errTag + tag+ ": exchangeRate : only allowed [0-9][0-9,]* in 3720.exchangeRate; ";
        }
    }

    return errTag;
}

function verify4000(tag, elementArr, wire) {
    /*{4000} : Intermediary FI
        ID Code (B, C, D, F, U)
        Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        If present, tags {4100} and {4200} are mandatory.
        If ID Code is present, Identifier is mandatory and vice versa.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let intermediaryFICode = wire['intermediaryFICode'];
        let intermediaryFIIdentifier = wire['intermediaryFIIdentifier'];
        if(objElement.name === "intermediaryFICode"){
            if(typeof intermediaryFICode !== 'undefined' && intermediaryFICode!== null && intermediaryFICode!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[1], intermediaryFIIdentifier)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[0], intermediaryFICode)+" ";
            }
        } else if(objElement.name === "intermediaryFIIdentifier"){
            if(typeof intermediaryFIIdentifier !== 'undefined' && intermediaryFIIdentifier!== null && intermediaryFIIdentifier!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[0], intermediaryFICode)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[1], intermediaryFIIdentifier)+" ";
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val)+" ";
        }
    }
    return errTag;
}

function verify4100(tag, elementArr, wire) {
    /*{4100} : Beneficiary FI
        ID Code (B, C, D, F, U) Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        If present, tag {4200} is mandatory.
        If ID Code is present, Identifier is mandatory and vice versa.
        If {4000} present, tags {4100} are mandatory.*/
    let errTag = "";
    let intermediaryFICode = wire['intermediaryFICode'];
    
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let beneficiaryFICode = wire['beneficiaryFICode'];
        let beneficiaryFIIdentifier = wire['beneficiaryFIIdentifier'];
        if(objElement.name === "beneficiaryFICode"){
            if(typeof beneficiaryFICode !== 'undefined' && beneficiaryFICode!== null && beneficiaryFICode!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryFIIdentifier)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryFICode)+" ";
            }
        } else if(objElement.name === "beneficiaryFIIdentifier"){
            if(typeof beneficiaryFIIdentifier !== 'undefined' && beneficiaryFIIdentifier!== null && beneficiaryFIIdentifier!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryFICode)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryFIIdentifier)+" ";
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val)+" ";
        }
        if(typeof intermediaryFICode !== 'undefined' && intermediaryFICode!== null && intermediaryFICode!== ""){
            errTag = errTag + checkMandatory(tag, objElement, val)+" ";
        }
    }
    return errTag;
}

function verify4200(tag, elementArr, wire) {
    /*{4200} : Beneficiary
        ID Code (B, C, D, F, T, U, 1, 2, 3, 4, 5, 9) Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        Mandatory when {3600} is CTR, CTP, DRW or DRC; otherwise optional.
        If ID Code is present, Identifier is mandatory and vice versa.
        If ID Code is ‘B’, ‘F’, or ‘U’, the Identifier will be edited for proper structure.
        If ID Code is ‘T’:
         {3600} must be CTR or CTP.
         Identifier must be present and should contain an account number.
         Name must be present and should contain a SWIFT BIC or BEI, which will be edited for proper structure.*/
    let errTag = "";
    let intermediaryFICode = wire['intermediaryFICode'];
    let beneficiaryFICode = wire['beneficiaryFICode'];
    let busFunCode = wire['businessFunctionCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let beneficiaryCode = wire['beneficiaryCode'];
        let beneficiaryIdentifier = wire['beneficiaryIdentifier'];
        if(objElement.name === "beneficiaryCode"){
            if(typeof beneficiaryCode !== 'undefined' && beneficiaryCode!== null && beneficiaryCode!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryIdentifier)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryCode)+" ";
            }
        } else if(objElement.name === "beneficiaryIdentifier"){
            if(typeof beneficiaryIdentifier !== 'undefined' && beneficiaryIdentifier!== null && beneficiaryIdentifier!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryCode)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryIdentifier)+" ";
            }
        } else if(objElement.name === "beneficiaryName"){
            if(beneficiaryCode == "T"){
                errTag = errTag + checkMandatory(tag, objElement, val)+" ";
                let n = val.includes("SWIFT, BIC, BEI");
                if(n==false){
                    errTag = errTag + tag+ ": beneficiaryName : should contain a SWIFT BIC or BEI if beneficiaryCode = T; ";
                }
                if(busFunCode!=="CTR" && busFunCode!=="CTP"){
                    errTag = errTag + tag+ ": 3600.businessFunctionCode must be CTR OR CTP if beneficiaryCode = T; ";
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val)+" ";
        }
        if(typeof intermediaryFICode !== 'undefined' && intermediaryFICode!== null && intermediaryFICode!== ""){
            errTag = errTag + checkMandatory(tag, objElement, val)+" ";
        }
        if(typeof beneficiaryFICode !== 'undefined' && beneficiaryFICode!== null && beneficiaryFICode!== ""){
            errTag = errTag + checkMandatory(tag, objElement, val)+" ";
        }
        if(busFunCode=="CTR" || busFunCode=="CTP" || busFunCode=="DRW" || busFunCode=="DRC"){
            errTag = errTag + checkMandatory(tag, objElement, val)+" ";
        }
    }
    return errTag;
}

function verify4320(tag, elementArr, wire) {
    /*{4320} Reference for Beneficiary (16 characters)
    Mandatory when {3600} is CTP and {3610} is COVS; otherwise optional.
    */
    let errTag = "";
    let referenceForBeneficiary = wire['referenceForBeneficiary'];
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    if(busFunCode=="CTP" && localInstrumentCode=="COVS"){
        errTag = errTag + checkMandatory(tag, elementArr[0], referenceForBeneficiary)+" ";
    }
    return errTag;
}

function verify4400(tag, elementArr, wire) {
    /*{4400} : Account Debited in Drawdown
        ID Code (D)
        Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        Must be present when {3600} is DRB or DRC, but can also be present for DRW or SVC; otherwise not permitted.
        If present, the ID Code, Identifier and Name elements are required.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let accountDebitedCode = wire['accountDebitedCode'];
        let accountDebitedIdentifier = wire['accountDebitedIdentifier'];
        let accountDebitedName = wire['accountDebitedName'];
        if(objElement.name === "accountDebitedCode"){
            if(typeof accountDebitedCode !== 'undefined' && accountDebitedCode!== null && accountDebitedCode!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode)+" ";
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else if(objElement.name === "accountDebitedIdentifier"){
            if(typeof accountDebitedIdentifier !== 'undefined' && accountDebitedIdentifier!== null && accountDebitedIdentifier!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier)+" ";
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else if(objElement.name === "accountDebitedName"){
            if(typeof accountDebitedName !== 'undefined' && accountDebitedName!== null && accountDebitedName!== ""){
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier)+" ";
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName)+" ";
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val)+" ";
        }
        if(busFunCode=="DRB" || busFunCode=="DRC"){
            errTag = errTag + checkMandatory(tag, objElement, val)+" ";
        }
    }
    return errTag;
}

function verifytag(tag, elementArr, wire){
    //console.log("tag =" + tag);
    let errTag = "";
    switch(parseInt(tag)) {
        case 1500:
            errTag = verify1500(tag, elementArr, wire); 
            break;	
        case 1510:
            errTag = verify1510(tag, elementArr, wire);
            break;
        case 1520:
            errTag = verify1520(tag, elementArr, wire);
            break;
        case 2000:
            errTag = verify2000(tag, elementArr, wire);
            break;
        case 3100:
            errTag = verify3100(tag, elementArr, wire);
            break;
        case 3400:
            errTag = verify3400(tag, elementArr, wire);
            break;
        case 3600:
            errTag = verify3600(tag, elementArr, wire);
            break;
        case 3320:
            errTag = verify3320(tag, elementArr, wire);
            break;
        case 3500:
            errTag = verify3500(tag, elementArr, wire);
            break;
        case 3610:
            errTag = verify3610(tag, elementArr, wire);
            break;
        case 3620:
            errTag = verify3620(tag, elementArr, wire);
            break;
        case 3700:
            errTag = verify3700(tag, elementArr, wire);
            break;
        case 3710:
            errTag = verify3710(tag, elementArr, wire);
            break;
        case 3720:
            errTag = verify3720(tag, elementArr, wire);
            break;
        case 4000:
            errTag = verify4000(tag, elementArr, wire);
            break;
        case 4100:
            errTag = verify4100(tag, elementArr, wire);
            break;
        case 4200:
            errTag = verify4200(tag, elementArr, wire);
            break;
        case 4320:
            errTag = verify4320(tag, elementArr, wire);
            break;
        case 4400:
            errTag = verify4400(tag, elementArr, wire);
            break;
        default:
            errTag = tag + ":" + "verify tbd";
            break;
    }
    return errTag;
}
console.log("Total Tag Count:" + tagCnt);
console.log("\n");
console.log("Error:" + errorMsg);
console.log("\n");

function checkMandatory(tag, objElement, val){
    //console.log("checkMandatory: tag =" + tag + " objElement=" + JSON.stringify(objElement) + " val=" + val);

    let err = "";
   
    if( typeof val == 'undefined' || val === null || val === ""){
            err = tag+":"+objElement.name+": value is mandatory;";
    }
    // check if val exist in value array
    //
    else if(objElement.value !== "") {
        var n = objElement.value.includes(val);
        //console.log("checkMandatory exist : " + n);
        if(n === false){
            err = tag+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
        }
    } else if(objElement.length !== null && val.length > objElement.length){
        // check if length equals to value
        err = tag+":"+objElement.name+": value too long;";
    }
    
    return err;
}

function checkOptional(tag, objElement, val){
    let err = "";
    if(typeof val !== 'undefined'){
        if(val !== null && val.length > objElement.length){
            err = tag+":"+objElement.name+": value too long;";
        }
    }
    return err;
}

/*
function checkSpecial(tag, objElement, val, wire){
    console.log("checkSpecial: tag =" + tag + " objElement=" + JSON.stringify(objElement) + " val=" + val);
    
    let err = null;
    let rule = "";
    if(objElement.desc !== "" && objElement.desc !== null){
        let rulesArr = objElement.desc.split(";");
        if(rulesArr.length>0){
            for(let k=0; k<rulesArr.length; k++){
                rule = rulesArr[k];
                err = getErrorByRule(rule, wire, tag, objElement, val);
            }
        } else {
            rule = objElement.desc;
            err = getErrorByRule(rule, wire, tag, objElement, val);
        }
    }
    return err;
}

function getErrorByRule(rule, wire, tag, objElement, val){
    let err = null;
    if(rule !== null && rule !== ""){
        console.log("Processing this : "+rule);
        if(val !== null && val !== ""){
            let n = rule.includes("only allowed");
            if(n === true){
                let conditionSt = rule.split("if")[1];
                let condArr = conditionSt.split("AND");
                for(let k=0; k<condArr.length; k++){
                    let condition = condArr[k].trim();
                    console.log(condition);
                    let condPartArr = condition.split(" ");
                    let field = condPartArr[0];
                    if(field.includes(".")){
                        fieldTag  = field.split(".")[0];
                        fieldName = field.split(".")[1];
                    } else {
                        fieldName = field;
                    }
                    let fieldOper = condPartArr[1];
                    let fieldMatchVal = condPartArr[2];
                    if(fieldOper=="="){
                        fieldOper = "===";
                    }
                    console.log(wire[fieldName]+fieldOper+fieldMatchVal);
                    if(wire[fieldName]+fieldOper+fieldMatchVal){
                        console.log("Matched");
                    } else {
                        err = err+tag+":"+objElement.name+": value only allowed "+condition;
                        console.log(err);
                    }
                }
            }
        }
    }
    return err;
}*/