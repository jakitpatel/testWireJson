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
        errTag = errTag + checkMandatory(tag, objElement, val);
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
        errTag = errTag + checkMandatory(tag, objElement, val);
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
    if (inputCycleDate === null || inputSource === null || inputSeqNum === null){	
        return  tag+ ":" +  " not a valid length;";	
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

    errTag = errTag + checkMandatory(tag, elementArr[0], amount);
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
        errTag = errTag + checkMandatory(tag, objElement, val);
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
        errTag = errTag + checkMandatory(tag, objElement, val);
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
    errTag = errTag + checkMandatory(tag, elementArr[0], businessFunctionCode);

    let transactionTypeCode = wire['transactionTypeCode'];
    errTag = errTag + checkOptional(tag, elementArr[1], transactionTypeCode);
    
    if(businessFunctionCode == "CTR" && transactionTypeCode=="COV"){
        errTag = errTag + tag+ ": businessFunctionCode = CTR then can have a transactionTypeCode, but COV in transactionTypeCode is not permitted; ";
    }
    return errTag;
}

function verify3320(tag, elementArr, wire) {
    /*{3320} Sender Reference (16 characters)*/
    let errTag = "";

    let senderReference = wire['senderReference'];
    errTag = errTag + checkOptional(tag, elementArr[0], senderReference);
    
    return errTag;
}

function verify3500(tag, elementArr, wire) {
    /*{3500} Previous Message Identifier (22 characters)
    Mandatory if {1510} is XX02 or XX08 and {3600} is BTR, CTR or CTP.*/
    let errTag = "";

    let prevMsgID = wire['prevMsgID'];
    errTag = errTag + checkOptional(tag, elementArr[0], prevMsgID);
    
    let typeSubTypeCode = wire['typeCode']+wire['subtypeCode'];
    let busFunCode = wire['businessFunctionCode'];
    if((typeSubTypeCode == "XX02" || typeSubTypeCode == "XX08") && (busFunCode =="BTR" || busFunCode =="CTR" || busFunCode =="CTP")){
        errTag = errTag + checkMandatory(tag, elementArr[0], prevMsgID);
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
    if(isExist(localInstrumentCode)){
        if(busFunCode!=="CTP"){
            errTag = errTag + tag+ ": localInstrumentCode : only allowed if 3600.businessFunctionCode = CTP; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], localInstrumentCode);
        }
    }

    let proprietaryCode = wire['proprietaryCode'];
    if(isExist(proprietaryCode)){
        if(localInstrumentCode!=="PROP"){
            errTag = errTag + tag+ " : proprietaryCode : only allowed if 3610.localInstrumentCode = PROP; ";
        } else {
            // check length
            errTag = errTag + checkMandatory(tag, elementArr[1], proprietaryCode);
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
            if(isExist(payNotIndicator)){
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
            errTag = errTag + checkOptional(tag, objElement, val);
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
    if(isExist(detailsOfCharges)){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": detailsOfCharges : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": detailsOfCharges : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], detailsOfCharges);
        }
    }

    let letters = /^[A-Za-z]+$/;
    let sendersChargesCurrency1 = wire['sendersChargesCurrency1'];
    errTag = errTag + checkOptional(tag, elementArr[1], sendersChargesCurrency1);
    if(isExist(sendersChargesCurrency1)){
        if(!sendersChargesCurrency1.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency1 : only allowed [A-Z] in 3700.sendersChargesCurrency1; ";
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    let sendersChargesAmount1 = wire['sendersChargesAmount1'];
    errTag = errTag + checkOptional(tag, elementArr[2], sendersChargesAmount1);
    if(isExist(sendersChargesAmount1)){
        if(!sendersChargesAmount1.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount1 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount1; ";
        }
    }

    let sendersChargesCurrency2 = wire['sendersChargesCurrency2'];
    errTag = errTag + checkOptional(tag, elementArr[3], sendersChargesCurrency2);
    if(isExist(sendersChargesCurrency2)){
        if(!sendersChargesCurrency2.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency2 : only allowed [A-Z] in 3700.sendersChargesCurrency2; ";
        }
    }

    let sendersChargesAmount2 = wire['sendersChargesAmount2'];
    errTag = errTag + checkOptional(tag, elementArr[4], sendersChargesAmount2);
    if(isExist(sendersChargesAmount2)){
        if(!sendersChargesAmount2.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount2 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount2; ";
        }
    }

    let sendersChargesCurrency3 = wire['sendersChargesCurrency3'];
    errTag = errTag + checkOptional(tag, elementArr[5], sendersChargesCurrency3);
    if(isExist(sendersChargesCurrency3)){
        if(!sendersChargesCurrency3.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency3 : only allowed [A-Z] in 3700.sendersChargesCurrency3; ";
        }
    }

    let sendersChargesAmount3 = wire['sendersChargesAmount3'];
    errTag = errTag + checkOptional(tag, elementArr[6], sendersChargesAmount3);
    if(isExist(sendersChargesAmount3)){
        if(!sendersChargesAmount3.match(numeric)) {
            errTag = errTag + tag+ ": sendersChargesAmount3 : only allowed [0-9][0-9,]* in 3700.sendersChargesAmount3; ";
        }
    }

    let sendersChargesCurrency4 = wire['sendersChargesCurrency4'];
    errTag = errTag + checkOptional(tag, elementArr[7], sendersChargesCurrency4);
    if(isExist(sendersChargesCurrency4)){
        if(!sendersChargesCurrency4.match(letters)) {
            errTag = errTag + tag+ ": sendersChargesCurrency4 : only allowed [A-Z] in 3700.sendersChargesCurrency4; ";
        }
    }

    let sendersChargesAmount4 = wire['sendersChargesAmount4'];
    errTag = errTag + checkOptional(tag, elementArr[8], sendersChargesAmount4);
    if(isExist(sendersChargesAmount4)){
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
    if(isExist(instAmtCurrCode)){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            let exchangeRate = wire['exchangeRate'];
            if(exchangeRate!==null && exchangeRate!==""){
                errTag = errTag + checkMandatory(tag, elementArr[0], instAmtCurrCode);
                errTag = errTag + checkMandatory(tag, elementArr[1], instructedAmount);
            }
            //errTag = errTag + checkMandatory(tag, elementArr[0], instAmtCurrCode);
        }
    }

    let letters = /^[A-Za-z]+$/;
    errTag = errTag + checkOptional(tag, elementArr[0], instAmtCurrCode);
    if(isExist(instAmtCurrCode)){
        if(!instAmtCurrCode.match(letters)) {
            errTag = errTag + tag+ ": instructedAmountCurrencyCode : only allowed [A-Z] in 3710.sendersChargesCurrency1; ";
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    errTag = errTag + checkOptional(tag, elementArr[1], instructedAmount);
    if(isExist(instructedAmount)){
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
    if(isExist(exchangeRate)){
        if(busFunCode!=="CTP" && busFunCode!=="CTR"){
            errTag = errTag + tag+ ": exchangeRate : only allowed if 3600.businessFunctionCode must be CTR or CTP; ";
        } else if(localInstrumentCode==="COVS"){
            errTag = errTag + tag+ ": exchangeRate : only allowed if 3610.localInstrumentCode not COVS; ";
        } else {
            // check Val from values & length
            errTag = errTag + checkMandatory(tag, elementArr[0], exchangeRate);
        }
    }

    let numeric = /^[0-9][0-9,]*$/;
    errTag = errTag + checkOptional(tag, elementArr[0], exchangeRate);
    if(isExist(exchangeRate)){
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
            if(isExist(intermediaryFICode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], intermediaryFIIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], intermediaryFICode);
            }
        } else if(objElement.name === "intermediaryFIIdentifier"){
            if(isExist(intermediaryFIIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], intermediaryFICode);
                errTag = errTag + checkMandatory(tag, elementArr[1], intermediaryFIIdentifier);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
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
            if(isExist(beneficiaryFICode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryFIIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryFICode);
            }
        } else if(objElement.name === "beneficiaryFIIdentifier"){
            if(isExist(beneficiaryFIIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryFICode);
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryFIIdentifier);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(intermediaryFICode)){
            errTag = errTag + checkMandatory(tag, objElement, val);
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

    let originToBeneficiaryInfo1 = wire['originToBeneficiaryInfo1'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let beneficiaryCode = wire['beneficiaryCode'];
        let beneficiaryIdentifier = wire['beneficiaryIdentifier'];
        if(objElement.name === "beneficiaryCode"){
            if(isExist(beneficiaryCode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryCode);
            }
        } else if(objElement.name === "beneficiaryIdentifier"){
            if(isExist(beneficiaryIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], beneficiaryCode);
                errTag = errTag + checkMandatory(tag, elementArr[1], beneficiaryIdentifier);
            }
        } else if(objElement.name === "beneficiaryName"){
            if(beneficiaryCode == "T"){
                errTag = errTag + checkMandatory(tag, objElement, val);
                let n = val.includes("SWIFT, BIC, BEI");
                if(n==false){
                    errTag = errTag + tag+ ": beneficiaryName : should contain a SWIFT BIC or BEI if beneficiaryCode = T; ";
                }
                if(busFunCode!=="CTR" && busFunCode!=="CTP"){
                    errTag = errTag + tag+ ": 3600.businessFunctionCode must be CTR OR CTP if beneficiaryCode = T; ";
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(intermediaryFICode)){
            if(!objElement.name.includes("beneficiaryAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        if(isExist(beneficiaryFICode)){
            if(!objElement.name.includes("beneficiaryAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        if(busFunCode=="CTR" || busFunCode=="CTP" || busFunCode=="DRW" || busFunCode=="DRC"){
            if(!objElement.name.includes("beneficiaryAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        // If 6000 is present then 4200 is mandatory
        if(isExist(originToBeneficiaryInfo1)){
            if(!objElement.name.includes("beneficiaryAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
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
        errTag = errTag + checkMandatory(tag, elementArr[0], referenceForBeneficiary);
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
            if(isExist(accountDebitedCode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName);
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode);
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else if(objElement.name === "accountDebitedIdentifier"){
            if(isExist(accountDebitedIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode);
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName);
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier);
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else if(objElement.name === "accountDebitedName"){
            if(isExist(accountDebitedName)){
                errTag = errTag + checkMandatory(tag, elementArr[0], accountDebitedCode);
                errTag = errTag + checkMandatory(tag, elementArr[1], accountDebitedIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[2], accountDebitedName);
                if(busFunCode!="DRB" && busFunCode != "DRC" && busFunCode!="DRW" && busFunCode != "SVC"){
                    errTag = errTag + tag+ ": accountDebitedCode is not allowed if 3600.businessFunctionCode is not DRB, DRC, DRW OR SVC; ";
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(busFunCode=="DRB" || busFunCode=="DRC"){
            errTag = errTag + checkMandatory(tag, objElement, val);
        }
    }
    return errTag;
}

function verify5000(tag, elementArr, wire) {
    /*{5000} : Originator
        ID Code (B, C, D, F, T, U, 1, 2, 3, 4, 5, 9) Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        Mandatory when {3600} is CTR or CTP if {5010} is not present.
        If ID Code is present, Identifier is mandatory and vice versa.
        If ID Code is ‘T’:
         {3600} must be CTR or CTP.
         Identifier must be present and should
        contain an account number.
         Name must be present and should contain a SWIFT BIC or BEI, which will be edited for proper structure.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let originatorFICode = wire['originatorFICode'];
    let originatorFIIdentifier = wire['originatorFIIdentifier'];
    let instructingFICode = wire['instructingFICode'];
    let instructingFIIdentifier = wire['instructingFIIdentifier'];
    let originToBeneficiaryInfo1 = wire['originToBeneficiaryInfo1'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let originatorCode = wire['originatorCode'];
        let originatorIdentifier = wire['originatorIdentifier'];
        let originatorName = wire['originatorName'];
        if(objElement.name === "originatorCode"){
            if(isExist(originatorCode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], originatorIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], originatorCode);
            }
        } else if(objElement.name === "originatorIdentifier"){
            if(isExist(originatorIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], originatorCode);
                errTag = errTag + checkMandatory(tag, elementArr[1], originatorIdentifier);
            }
        } else if(objElement.name === "originatorName"){
            if(isExist(originatorName)){
                if(originatorCode == "T"){
                    errTag = errTag + checkMandatory(tag, objElement, val);
                    let n = val.includes("SWIFT, BIC, BEI");
                    if(n==false){
                        errTag = errTag + tag+ ": originatorName : should contain a SWIFT BIC or BEI if originatorCode = T; ";
                    }
                    if(busFunCode!=="CTR" && busFunCode!=="CTP"){
                        errTag = errTag + tag+ ": 3600.businessFunctionCode must be CTR OR CTP if beneficiaryCode = T; ";
                    }
                }
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        // If 5100 is present then 5000 is mandatory
        if(isExist(originatorFICode)){
            if(!objElement.name.includes("originatorAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        // If 5200 is present then 5000 is mandatory
        if(isExist(instructingFICode)){
            if(!objElement.name.includes("originatorAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        // Also check if 5010 is not present
        if(busFunCode=="CTR" || busFunCode=="CTP"){
            if(!objElement.name.includes("originatorAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
        // If 6000 is present then 5000 is mandatory
        if(isExist(originToBeneficiaryInfo1)){
            if(!objElement.name.includes("originatorAddress")){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
    }
    return errTag;
}

function verify5010(tag, elementArr, wire) {
    /*{5010} : Originator Option F
    Party Identifier (35 characters)
    Must be one of the following two formats:
    1. 2.
    /Account Number (slash followed by at least one valid non-space character: e.g., /123456)
    Unique Identifier/ (4 character code followed by a slash and at least one valid non-space character: e.g., SOSE/123-456-789)
    ARNU/ CCPT/ CUST/ DRLC/ EMPL/ NIDN/ SOSE/ TXID/
    Alien Registration Number Passport Number
    Customer Identification Number Driver’s License Number Employer Number
    National Identify Number Social Security Number Tax Identification Number
    Name (35 characters)
    Format: Must begin with Line Code 1 followed by a slash and at least one valid non-space character: e.g., 1/SMITH JOHN.
    Line 1 to 3 (35 characters each)
    Format: Each line, if present, must begin with one of the following Line Codes followed by a slash and at least one valid non-space character.
    1 Name
    2 Address
    3 Country and Town
    4 Date of Birth
    5 Place of Birth
    6 Customer Identification Number
    7 National Identity Number
    8 Additional Information
    For example:
    2/123 MAIN STREET 3/US/NEW YORK, NY 10000 7/111-22-3456
    Mandatory when {3600} is CTP and {5000} is not present; otherwise not permitted.
    Party Identifier and Name are mandatory.
    If present, Line 1, Line 2 and Line 3 must adhere to the following edits:
     Each line must begin with one of the
    numeric line codes in numerical order.
     Codes 1 and 2 can be repeated.
     Codes3,4,5,6,7and8cannotbe repeated.
     Code 2 cannot be used without Code 3.
     Code 4 cannot be used without Code 5
    and vice versa.
     Code 8 can only be used to continue information from one of the following: Party Identifier (if Unique Identifier used), Code 6 or Code 7.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let originatorCode = wire['originatorCode'];
    let originatorIdentifier = wire['originatorIdentifier'];
    let originatorName = wire['originatorName'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let partyID = wire['partyID'];
        let partyIDUniqeIDType = wire['partyIDUniqeIDType'];
        let partyName = wire['partyName'];
        // Also check if 5000 is not present
        if(busFunCode=="CTP" && originatorCode==="" && originatorCode===null){
            if(objElement.name === "partyID" || objElement.name === "partyIDUniqeIDType" || objElement.name === "partyName"){
                errTag = errTag + checkMandatory(tag, objElement, val);
            } else {
                errTag = errTag + checkOptional(tag, objElement, val);
            }
        } else {
            if(isExist(partyName)){
                errTag = errTag + tag+ ": partyName is not allowed if 3600.businessFunctionCode is not CTP & {5000} is present; ";
            }
            if(isExist(partyID)){
                errTag = errTag + tag+ ": partyID is not allowed if 3600.businessFunctionCode is not CTP & {5000} is present; ";
            }
            if(isExist(partyIDUniqeIDType)){
                errTag = errTag + tag+ ": partyIDUniqeIDType is not allowed if 3600.businessFunctionCode is not CTP & {5000} is present; ";
            }
        }
    }
    return errTag;
}

function verify5100(tag, elementArr, wire) {
    /*{5100} : Originator FI
        ID Code (B, C, D, F, U)
        Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        If present, {5000} (or {5010} if {3600} is CTP) is mandatory.
        If ID Code is present, Identifier is mandatory and vice versa.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let instructingFICode = wire['instructingFICode'];
    let instructingFIIdentifier = wire['instructingFIIdentifier'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let originatorFICode = wire['originatorFICode'];
        let originatorFIIdentifier = wire['originatorFIIdentifier'];
        if(objElement.name === "originatorFICode"){
            if(isExist(originatorFICode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], originatorFIIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], originatorFICode);
            }
        } else if(objElement.name === "originatorFIIdentifier"){
            if(isExist(originatorFIIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], originatorFICode);
                errTag = errTag + checkMandatory(tag, elementArr[1], originatorFIIdentifier);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        // If 5200 is present then 5100 is mandatory
        if(isExist(instructingFICode)){
            if(objElement.name === "originatorFIIdentifier" || objElement.name === "originatorFICode"){
                errTag = errTag + checkMandatory(tag, objElement, val);
            }
        }
    }
    return errTag;
}

function verify5200(tag, elementArr, wire) {
    /*{5200} : Instructing FI
        ID Code (B, C, D, F, U)
        Identifier (34 characters)
        Name (35 characters)
        Address (3 lines of 35 characters each)
        If present, {5000} (or {5010} if {3600} is CTP) and {5100} are mandatory.
        If ID Code is present, Identifier is mandatory and vice versa.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let instructingFICode = wire['instructingFICode'];
        let instructingFIIdentifier = wire['instructingFIIdentifier'];
        if(objElement.name === "instructingFICode"){
            if(isExist(instructingFICode)){
                errTag = errTag + checkMandatory(tag, elementArr[1], instructingFIIdentifier);
                errTag = errTag + checkMandatory(tag, elementArr[0], instructingFICode);
            }
        } else if(objElement.name === "instructingFIIdentifier"){
            if(isExist(instructingFIIdentifier)){
                errTag = errTag + checkMandatory(tag, elementArr[0], instructingFICode);
                errTag = errTag + checkMandatory(tag, elementArr[1], instructingFIIdentifier);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
    }
    return errTag;
}

function verify5400(tag, elementArr, wire) {
    /*{5400} Account Credited in Drawdown
        Drawdown Credit Account Number (9 character ABA)
        Mandatory when {3600} is DRB or DRC, but can also be present for DRW or SVC; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let accountCreditedDrawdown = wire['accountCreditedDrawdown'];
    if(busFunCode === "DRB" || busFunCode === "DRC"){
        errTag = errTag + checkMandatory(tag, elementArr[0], accountCreditedDrawdown);
    }
    if(busFunCode !== "DRB" && busFunCode !== "DRC" && busFunCode !== "DRW" && busFunCode !== "SVC"){
        if(isExist(accountCreditedDrawdown)){
            errTag = errTag + tag+ ": accountCreditedDrawdown only allowed if 3600.businessFunctionCode must be DRB, DRC, DRW OR SVC; ";
        }
    }
    return errTag;
}

function verify6000(tag, elementArr, wire) {
    /*{6000} : Originator to Beneficiary Information
        (up to 4 lines of 35 characters each)
        If present, {4200} and {5000} (or {5010} if {3600} is CTP) are mandatory.
        See latest version of the FAIM manual for Line Limits for Tags {6000} to {6500}.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify6100(tag, elementArr, wire) {
    /*{6100} Receiver FI Information
        1 line of 30 characters, plus up to 5 lines of 33 characters each*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify6110(tag, elementArr, wire) {
    /*{6110} : Drawdown Debit Account Advice Information
        Advice Code (LTR, PHN, TLX or WRE)
        Additional Information (1 line of 26 characters, plus up to 5 lines of 33 characters each)
        Can only be used if {3600} is DRB, DRC, DRW or SVC; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let drawdownDebitAcctCode = wire['drawdownDebitAcctCode'];
        if(objElement.name === "drawdownDebitAcctCode"){
            if(isExist(drawdownDebitAcctCode)){
                errTag = errTag + checkMandatory(tag, objElement, drawdownDebitAcctCode);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(busFunCode!=="DRB" && busFunCode!=="DRC" && busFunCode!=="DRW" && busFunCode!=="SVC"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" only allowed if 3600.businessFunctionCode must be DRB, DRC, DRW OR SVC; ";
            }
        }
    }
    return errTag;
}

function verify6200(tag, elementArr, wire) {
    /*{6200} Intermediary FI Information
        1 line of 30 characters, plus up to 5 lines of 33 characters each.
        If present, {4000}, {4100} and {4200} are required.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
        if(isExist(val)){
            // Check 4000, 4100, 4200 exist or not
            let intermediaryFICode = wire['intermediaryFICode'];
            if(typeof intermediaryFICode == 'undefined' && intermediaryFICode== null && intermediaryFICode== ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4000} must be present; ";
            }
            let beneficiaryFICode = wire['beneficiaryFICode'];
            if(typeof beneficiaryFICode == 'undefined' && beneficiaryFICode == null && beneficiaryFICode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4100} must be present; ";
            }
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6210(tag, elementArr, wire) {
    /*{6210} : Intermediary FI Advice Information
        Advice Code (LTR, PHN, TLX or WRE)
        Additional Information (1 line of 26 characters, plus up to 5 lines of 33 characters each)
        If present, {4000}, {4100} and {4200} are required.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        let intermediaryFIAdviceCode = wire['intermediaryFIAdviceCode'];
        if(objElement.name === "intermediaryFIAdviceCode"){
            if(isExist(intermediaryFIAdviceCode)){
                errTag = errTag + checkMandatory(tag, objElement, intermediaryFIAdviceCode);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(val)){
            // Check 4000, 4100, 4200 exist or not
            let intermediaryFICode = wire['intermediaryFICode'];
            if(typeof intermediaryFICode == 'undefined' && intermediaryFICode== null && intermediaryFICode== ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4000} must be present; ";
            }
            let beneficiaryFICode = wire['beneficiaryFICode'];
            if(typeof beneficiaryFICode == 'undefined' && beneficiaryFICode == null && beneficiaryFICode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4100} must be present; ";
            }
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6300(tag, elementArr, wire) {
    /*{6300} Beneficiary’s FI Information
        1 line 30 characters, plus up to 5 lines of 33 characters each.
        If present, {4100} and {4200} are required.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
        if(isExist(val)){
            // Check 4100, 4200 exist or not
            let beneficiaryFICode = wire['beneficiaryFICode'];
            if(typeof beneficiaryFICode == 'undefined' && beneficiaryFICode == null && beneficiaryFICode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4100} must be present; ";
            }
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6310(tag, elementArr, wire) {
    /*{6310} : Beneficiary’s FI Advice Information
        Advice Code (LTR, PHN, TLX or WRE)
        Additional Information (1 line of 26 characters, plus up to 5 lines of 33 characters each)
        If present, {4100} and {4200} are required.*/
    let errTag = "";
    let beneficiaryFIAdviceCode = wire['beneficiaryFIAdviceCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(objElement.name === "beneficiaryFIAdviceCode"){
            if(isExist(beneficiaryFIAdviceCode)){
                errTag = errTag + checkMandatory(tag, objElement, beneficiaryFIAdviceCode);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(val)){
            // Check 4100, 4200 exist or not
            let beneficiaryFICode = wire['beneficiaryFICode'];
            if(typeof beneficiaryFICode == 'undefined' && beneficiaryFICode == null && beneficiaryFICode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4100} must be present; ";
            }
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6400(tag, elementArr, wire) {
    /*{6400} Beneficiary Information
        1 line of 30 characters, plus up to 5 lines of 33 characters each.
        If present, {4200} is required.*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
        if(isExist(val)){
            // Check 4200 exist or not
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6410(tag, elementArr, wire) {
    /*{6410} : Beneficiary Advice Information
        Advice Code (LTR, PHN, TLX, WRE or HLD)
        Additional Information (1 line of 26 characters, plus up to 5 lines of 33 characters each)
        If present, {4200} is required.*/
    let errTag = "";
    let beneficiaryAdviceCode = wire['beneficiaryAdviceCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(objElement.name === "beneficiaryAdviceCode"){
            if(isExist(beneficiaryAdviceCode)){
                errTag = errTag + checkMandatory(tag, objElement, beneficiaryAdviceCode);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(val)){
            // Check 4200 exist or not
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6420(tag, elementArr, wire) {
    /*{6420} : Method of Payment to Beneficiary
        Method of Payment (‘CHECK’ is the only valid option) Additional Information (30 characters)
        If present, {6410} and {4200} are required.*/
    let errTag = "";
    let methodOfPayment = wire['methodOfPayment'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(objElement.name === "methodOfPayment"){
            if(isExist(methodOfPayment)){
                errTag = errTag + checkMandatory(tag, objElement, methodOfPayment);
            }
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(isExist(val)){
            // Check 4200, 6410 exist or not
            let beneficiaryCode = wire['beneficiaryCode'];
            if(typeof beneficiaryCode == 'undefined' && beneficiaryCode == null && beneficiaryCode == ""){
                errTag = errTag + tag+ ": "+objElement.name+" is present then {4200} must be present; ";
            }
            let beneficiaryAdviceCode = wire['beneficiaryAdviceCode'];
            if(typeof beneficiaryAdviceCode == 'undefined' && beneficiaryAdviceCode == null && beneficiaryAdviceCode == ""){
                errTag = errTag + tag+ ": If "+objElement.name+" is present then {6410} must be present; ";
            }
        }
    }
    return errTag;
}

function verify6500(tag, elementArr, wire) {
    /*{6500} FI to FI Information
        up to 6 lines of 35 characters each*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7033(tag, elementArr, wire) {
    /*{7033} : Sequence B 33B Currency/Instructed Amount
        SWIFT Field Tag (5 characters) Instructed Amount (18 characters)
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7050(tag, elementArr, wire) {
    /*{7050} : Sequence B 50a Ordering Customer
        SWIFT Field Tag (5 characters) Line 1 to 5 (35 characters each)
        Must be present if {3600} is CTP and {3610} is COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        if(busFunCode == "CTP" && localInstrumentCode == "COVS"){
            errTag = errTag + checkMandatory(tag, objElement, val);
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
    }
    return errTag;
}

function verify7052(tag, elementArr, wire) {
    /*{7052} : Sequence B 52a Ordering Institution
        SWIFT Field Tag (5 characters) Line 1 to 5 (35 characters each)
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7056(tag, elementArr, wire) {
    /*{7056} : Sequence B 56a Intermediary Institution
        SWIFT Field Tag (5 characters) Line 1 to 5 (35 characters each).
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7057(tag, elementArr, wire) {
    /*{7057} : Sequence B 57a Account with Institution
        SWIFT Field Tag (5 characters) Line 1 to 5 (35 characters each).
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.
        Must be present if {7056} is present.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let seqBIntermediaryInstitutionTag = wire['seqBIntermediaryInstitutionTag'];
    let seqBIntermediaryInstitutionLine1 = wire['seqBIntermediaryInstitutionLine1'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        if(isExist(seqBIntermediaryInstitutionTag)){
            errTag = errTag + checkMandatory(tag, objElement, val);
        }
        if(isExist(seqBIntermediaryInstitutionLine1)){
            errTag = errTag + checkMandatory(tag, objElement, val);
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7059(tag, elementArr, wire) {
    /*{7059} : Sequence B 59a Beneficiary Customer
        SWIFT Field Tag (5 characters) Line 1 to 5 (35 characters each)
        Must be present if {3600} is CTP and {3610} is COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        if(busFunCode == "CTP" && localInstrumentCode == "COVS"){
            errTag = errTag + checkMandatory(tag, objElement, val);
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
    }
    return errTag;
}

function verify7070(tag, elementArr, wire) {
    /*{7070} : Sequence B 70 Remittance Information
        SWIFT Field Tag (5 characters) Line 1 to 4 (35 characters each)
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify7072(tag, elementArr, wire) {
    /*{7072} : Sequence B 72 Sender to Receiver Information
        SWIFT Field Tag (5 characters) Line 1 to 6 (35 characters each)
        {3600} must be CTP and {3610} must be COVS; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "COVS"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = COVS; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify8200(tag, elementArr, wire) {
    /*{8200} : Unstructured Addenda Information
        Addenda Length (4 characters) Addenda Information (8,994 characters)
        Must be present if {3600} is CTP and {3610} is ANSI, GXML, IXML, NARR, S820, SWIF or UEDI; otherwise not permitted.
        Addenda Length must be numeric, padded with leading zeros if less than four characters and must equal length of content in Addenda Information (e.g., if content of Addenda Information is 987 characters, Addenda Length must be 0987).
        If {3610} is ANSI or S820, only the X12 Character Set* is permitted in Addenda Information element.
        If {3610} is GXML, IXML, NARR, SWIF or UEDI, only the SWIFT MX ISO 20022 Character Set* is permitted in Addenda Information element.
        * See latest version of the FAIM manual for specific characters included in character set.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "ANSI" && localInstrumentCode !== "GXML" && localInstrumentCode !== "IXML" && localInstrumentCode !== "NARR" && localInstrumentCode !== "S820" && localInstrumentCode !== "SWIF" && localInstrumentCode !== "UEDI"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode is in (ANSI, GXML, IXML, NARR, S820, SWIF or UEDI); ";
            }
        }
        if(busFunCode == "CTP" && (localInstrumentCode == "ANSI" || localInstrumentCode == "GXML" || localInstrumentCode == "IXML" || localInstrumentCode == "NARR" || localInstrumentCode == "S820" || localInstrumentCode == "SWIF" || localInstrumentCode == "UEDI")){
            errTag = errTag + checkMandatory(tag, objElement, val);
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
        if(objElement.name === "unstructuredAddendaLength"){
            if(isExist(val) &&  !is_Numeric(val)){
                errTag = errTag + tag+ ": "+objElement.name+" must be numeric; ";
            }
        }
    }
    return errTag;
}

function is_Numeric(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
}

function verify8250(tag, elementArr, wire) {
    /*{8250} : Related Remittance Information
        Remittance Identification (35 characters) Remittance Location Method (4 character code)
        EDIC EMAL FAXI POST SMSM URID
        Electronic Data Interchange E-mail
        Fax
        Postal services
        Short Message Service (text) Uniform Resource Identifier
        Remittance Location Electronic Address (2,048 characters; i.e., E-mail or URL address)
        Name (140 characters)
        Address Type (ADDR, BIZZ, DLVY, HOME, MLTO, PBOX) Department (70 characters)
        Sub-Department (70 characters)
        Street Name (70 characters)
        Building Number (16 characters)
        Post Code (16 characters)
        Town Name (35 characters)
        Country Sub Division/State (35 characters)
        Country (2 characters)
        Address Line 1 to 7 (70 characters each)
        Must be present if {3600} is CTP and {3610} is RRMT; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "CTP" && localInstrumentCode !== "RRMT"){
            if(isExist(val)){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = RRMT; ";
            }
        }
        if(busFunCode == "CTP" && localInstrumentCode == "RRMT"){
            errTag = errTag + checkMandatory(tag, objElement, val);
        } else {
            errTag = errTag + checkOptional(tag, objElement, val);
        }
    }
    return errTag;
}

function verify8300(tag, elementArr, wire) {
    /*{8300} : Remittance Originator
        Identification Type (‘OI’ organization ID or ‘PI’ private ID) Identification Code (4 character code):
        Organization Identification Codes (BANK, CUST, DUNS, EMPL, GS1G, PROP, SWBB, TXID )
        Private Identification Codes (ARNU, CCPT, CUST, DPOB, DRLC, EMPL, NIDN, PROP, SOSE, TXID)
        Name (140 characters)
        Identification Number (35 characters)
        Identification Number Issuer (35 characters)
        Date & Place of Birth (82 characters)
        Address Type (ADDR, BIZZ, DLVY, HOME, MLTO, PBOX) Department (70 characters)
        Sub-Department (70 characters)
        Street Name (70 characters)
        Building Number (16 characters)
        Post Code (16 characters)
        Town Name (35 characters)
        Country Sub Division/State (35 characters)
        Country (2 characters)
        Address Line 1 to 7 (70 characters each)
        Country of Residence (2 characters)
        Contact Name (140 characters)
        Contact Phone Number (35 characters)
        Contact Mobile Number (35 characters)
        Contact Fax Number (35 characters)
        Contact Electronic Address (2,048 characters; i.e., E-mail or URL address)
        Contact Other Information (35 characters)
        Must be present if {3600} is CTP and {3610} is RMTS; otherwise not permitted.
        Identification Type, Identification Code and Name are mandatory.
        Identification Number is mandatory for all Identification Codes except DPOB.
        Identification Number is not permitted for Identification Code DPOB.
        Identification Number Issuer is not permitted for Identification Code SWBB and DPOB.
        Date & Place of Birth is only permitted for Identification Code DPOB.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let remittanceArr = wire['wireRemittance_by_wireID'];
    if(remittanceArr && remittanceArr.length>0){
        let remittanceObj = remittanceArr[0];
        let remittanceOrignatorIDCode = remittanceObj['remittanceOrignatorIDCode'];
        let remittanceOrignatorIDNumber = remittanceObj['remittanceOrignatorIDNumber'];
        let remittanceOrignatorIDIssuer = remittanceObj['remittanceOrignatorIDIssuer'];
        let remittanceOrignatorDatePlaceBirth = remittanceObj['remittanceOrignatorDatePlaceBirth'];
        for(var j = 0; j < elementArr.length; j++) {
            let objElement = elementArr[j];
            let val = remittanceObj[objElement.name];
            if(busFunCode !== "CTP" && localInstrumentCode !== "RMTS"){
                if(isExist(val)){
                    errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = RMTS; ";
                }
            }
            if(busFunCode == "CTP" && localInstrumentCode == "RMTS"){
                if(objElement.name == "remittanceOrignatorIDType" || objElement.name == "remittanceOrignatorIDCode" || objElement.name == "remittanceOrignatorName"){
                    errTag = errTag + checkMandatory(tag, objElement, val);
                    //console.log(objElement.name +" : "+val+" : "+errTag);
                } else if(objElement.name == "remittanceOrignatorIDNumber"){
                    if(remittanceOrignatorIDCode !== "DPOB"){
                        errTag = errTag + checkMandatory(tag, objElement, val);
                    } else {
                        errTag = errTag + checkOptional(tag, objElement, val);
                    }
                    if(isExist(remittanceOrignatorIDNumber) && remittanceOrignatorIDCode == "DPOB"){
                        errTag = errTag + tag+ ": "+objElement.name+" is not permitted for Identification Code DPOB; ";
                    }
                } else if(objElement.name == "remittanceOrignatorIDIssuer"){
                    if(isExist(remittanceOrignatorIDIssuer) && (remittanceOrignatorIDCode == "DPOB" || remittanceOrignatorIDCode == "SWBB")){
                        errTag = errTag + tag+ ": "+objElement.name+" is not permitted for Identification Code DPOB & SWBB; ";
                    } else {
                        errTag = errTag + checkOptional(tag, objElement, val);
                    }
                } else if(objElement.name == "remittanceOrignatorDatePlaceBirth"){
                    if(isExist(remittanceOrignatorDatePlaceBirth) && remittanceOrignatorIDCode !== "DPOB"){
                        errTag = errTag + tag+ ": "+objElement.name+" is only permitted for Identification Code DPOB; ";
                    } else {
                        errTag = errTag + checkOptional(tag, objElement, val);
                    }
                } else {  
                    errTag = errTag + checkOptional(tag, objElement, val);
                }            
            } else {
                errTag = errTag + checkOptional(tag, objElement, val);
            }
        }
    }
    //console.log("Final : errTag : "+errTag);
    return errTag;
}

function verify8350(tag, elementArr, wire) {
    /*{8350} : Remittance Beneficiary
        Name (140 characters)
        Identification Type (‘OI’ organization ID or ‘PI’ private ID) Identification Code (4 character code):
        Organization Identification Codes (BANK, CUST, DUNS, EMPL, GS1G, PROP, SWBB, TXID)
        Private Identification Codes (ARNU, CCPT, CUST, DPOB, DRLC, EMPL, NIDN, PROP, SOSE, TXID)
        Identification Number (35 characters)
        Identification Number Issuer (35 characters)
        Date & Place of Birth (82 characters)
        Address Type (ADDR, BIZZ, DLVY, HOME, MLTO, PBOX) Department (70 characters)
        Sub-Department (70 characters) Street Name (70 characters) Building Number (16 characters) Post Code (16 characters)
        Town Name (35 characters)
        Country Sub Division/State (35 characters) Country (2 characters)
        Address Line 1 to 7 (70 characters each) Country of Residence (2 characters),
        Must be present if {3600} is CTP and {3610} is RMTS; otherwise not permitted.
        Name is mandatory. Identification Number
         Not permitted unless Identification Type and Identification Code are present.
         Not permitted for Identification Code DPOB.
        Identification Number Issuer
         Not permitted unless Identification Type, Identification Code and Identification Number are present.
         Not permitted for Identification Code SWBB and DPOB.
        Date & Place of Birth is only permitted for Identification Code DPOB.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let remittanceArr = wire['wireRemittance_by_wireID'];
    if(remittanceArr && remittanceArr.length>0){
        let remittanceObj = remittanceArr[0];
        let remittanceBeneficiaryName = remittanceObj['remittanceBeneficiaryName'];
        let remittanceBeneficiaryIDCode = remittanceObj['remittanceBeneficiaryIDCode'];
        let remittanceBeneficiaryDatePlaceBirth = remittanceObj['remittanceBeneficiaryDatePlaceBirth'];
        let remittanceBeneficiaryIDNumber = remittanceObj['remittanceBeneficiaryIDNumber'];
        let remittanceBeneficiaryIDType = remittanceObj['remittanceBeneficiaryIDType'];
        let remittanceBeneficiaryIDIssuer = remittanceObj['remittanceBeneficiaryIDIssuer'];

        for(var j = 0; j < elementArr.length; j++) {
            let objElement = elementArr[j];
            let val = remittanceObj[objElement.name];
            if(busFunCode !== "CTP" && localInstrumentCode !== "RMTS"){
                if(isExist(val)){
                    errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = RMTS; ";
                }
            }
            if(busFunCode == "CTP" && localInstrumentCode == "RMTS"){
                if(objElement.name == "remittanceBeneficiaryName"){
                    errTag = errTag + checkMandatory(tag, objElement, val);
                } else if(objElement.name == "remittanceBeneficiaryIDNumber"){
                    if(isExist(remittanceBeneficiaryIDNumber)){
                        if(remittanceBeneficiaryIDType=="" || remittanceBeneficiaryIDType==null || remittanceBeneficiaryIDCode=="" || remittanceBeneficiaryIDCode==null){
                            errTag = errTag + tag+ ": "+objElement.name+" is not permitted unless Identification Type and Identification Code are present; ";
                        }
                    }
                    if(typeof remittanceBeneficiaryIDNumber !== 'undefined' && remittanceBeneficiaryIDNumber !== null && remittanceBeneficiaryIDNumber !== "" && remittanceBeneficiaryIDCode == "DPOB"){
                        errTag = errTag + tag+ ": "+objElement.name+" is not permitted for Identification Code DPOB; ";
                    }
                }  else if(objElement.name == "remittanceBeneficiaryIDIssuer"){
                    if(typeof remittanceBeneficiaryIDIssuer !== 'undefined' && remittanceBeneficiaryIDIssuer !== null && remittanceBeneficiaryIDIssuer !== ""){
                        if(remittanceBeneficiaryIDType=="" || remittanceBeneficiaryIDType==null || remittanceBeneficiaryIDCode=="" || remittanceBeneficiaryIDCode==null || remittanceBeneficiaryIDNumber=="" || remittanceBeneficiaryIDNumber==null){
                            errTag = errTag + tag+ ": "+objElement.name+" is Not permitted unless Identification Type, Identification Code and Identification Number are present; ";
                        }
                    }
                    if(typeof remittanceBeneficiaryIDIssuer !== 'undefined' && remittanceBeneficiaryIDIssuer !== null && remittanceBeneficiaryIDIssuer !== "" && (remittanceBeneficiaryIDCode == "DPOB" || remittanceBeneficiaryIDCode == "SWBB")){
                        errTag = errTag + tag+ ": "+objElement.name+" is not permitted for Identification Code SWBB and DPOB; ";
                    }
                } else if(objElement.name == "remittanceBeneficiaryDatePlaceBirth"){
                    if(typeof remittanceBeneficiaryDatePlaceBirth !== 'undefined' && remittanceBeneficiaryDatePlaceBirth !== null && remittanceBeneficiaryDatePlaceBirth !== "" && remittanceBeneficiaryIDCode !== "DPOB"){
                        errTag = errTag + tag+ ": "+objElement.name+" is only permitted for Identification Code DPOB; ";
                    } else {
                        errTag = errTag + checkOptional(tag, objElement, val);
                    }
                } else {  
                    errTag = errTag + checkOptional(tag, objElement, val);
                }            
            } else {
                errTag = errTag + checkOptional(tag, objElement, val);
            }
        }
    }
    return errTag;
}

function verify8400(tag, elementArr, wire) {
    /*{8400} Primary Remittance Document Information
        Document Type Code (4 character code)
        AROI Accounts Receivable Open Item
        BOLD Bill of Lading Shipping Notice
        CINV Commercial Invoice
        CMCN Commercial Contract
        CNFA Credit Note Related to Financial Adjustment
        CREN Credit Note
        DEBN Debit Note
        DISP Dispatch Advice
        DNFA Debit Note Related to Financial Adjustment
        HIRI Hire Invoice
        MSIN Metered Service Invoice
        PROP Proprietary Document Type
        PUOR Purchase Order
        SBIN Self Billed Invoice
        SOAC Statement of Account
        TSUT Trade Services Utility Transaction
        VCHR Voucher
        Proprietary Document Type Code (35 characters)
        Document Identification Number (35 characters)
        Issuer (35 characters)
        Must be present if {3600} is CTP and {3610} is RMTS; otherwise not permitted.
        Document Type Code and Document Identification Number are mandatory for each set of remittance data.
        Proprietary Document Type Code is mandatory for Document Type Code PROP; otherwise not permitted.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    let localInstrumentCode = wire['localInstrumentCode'];
    let remittanceArr = wire['wireRemittance_by_wireID'];
    if(remittanceArr && remittanceArr.length>0){
        let remittanceObj = remittanceArr[0];
        let remDocArr = remittanceObj['wireRemittanceDoc_by_wireRemittanceID'];
        if(remDocArr && remDocArr.length>0){
            for(var k = 0; k < remDocArr.length; k++) {
                let remDocObj = remDocArr[k];
                let wireDocID = remDocObj['wireDocID'];
                let primaryDocumentTypeCode = remDocObj['primaryDocumentTypeCode'];
                let primaryDocumentProprietary = remittanceObj['primaryDocumentProprietary'];
                let primaryDocumentID = remittanceObj['primaryDocumentID'];
                let primaryDocumentIssuer = remittanceObj['primaryDocumentIssuer'];

                for(var j = 0; j < elementArr.length; j++) {
                    let objElement = elementArr[j];
                    let val = remDocObj[objElement.name];
                    if(busFunCode !== "CTP" && localInstrumentCode !== "RMTS"){
                        if(isExist(val)){
                            errTag = errTag + tag+ ": "+wireDocID+" : "+objElement.name+" is only allowed if 3600.businessFunctionCode = CTP & 3610.localInstrumentCode = RMTS; ";
                        }
                    }
                    if(busFunCode == "CTP" && localInstrumentCode == "RMTS"){
                        if(objElement.name == "primaryDocumentTypeCode" || objElement.name == "primaryDocumentID"){
                            errTag = errTag + checkMandatory(tag, objElement, val, wireDocID);
                        } else if(objElement.name == "primaryDocumentProprietary"){
                            if(isExist(primaryDocumentProprietary) && primaryDocumentTypeCode !== "PROP"){
                                errTag = errTag + tag+ ": "+wireDocID+" : "+objElement.name+" is not permitted for Document Type Code other than PROP; ";
                            }
                            if(primaryDocumentTypeCode === "PROP"){
                                errTag = errTag + checkMandatory(tag, objElement, val, wireDocID);
                            } 
                        } else {  
                            errTag = errTag + checkOptional(tag, objElement, val, wireDocID);
                        }            
                    } else {
                        errTag = errTag + checkOptional(tag, objElement, val, wireDocID);
                    }
                }
            }
        }
    }
    return errTag;
}

function verify9000(tag, elementArr, wire) {
    /*{9000} : Service Message Information
        Line 1 to 12 (35 characters each)
        {3600} must be SVC.*/
    let errTag = "";
    let busFunCode = wire['businessFunctionCode'];
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        if(busFunCode !== "SVC"){
            if(typeof val !== 'undefined' && val !== null && val !== ""){
                errTag = errTag + tag+ ": "+objElement.name+" is only allowed if 3600.businessFunctionCode = SVC; ";
            }
        }
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify1100(tag, elementArr, wire) {
    /*{1100} : Message Disposition
        Format Version ‘30’
        Test Production Code (‘T’ test or ‘P’ production)
        Message Duplication Code (‘ ‘ original, ‘R’ retrieval of an original message or ‘P’ possible duplicate) Message Status Indicator (1 character code)
        Outgoing Messages
        0 In Process or Intercepted
        2 Successful with Accounting (Value)
        3 Rejected due to Error Condition
        7 Successful without Accounting (Non-Value)
        Incoming Messages
        N Successful with Accounting (Value)
        S Successful without Accounting (Non-Value)*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify1110(tag, elementArr, wire) {
    /*{1110} : Receipt Time Stamp
        Receipt Date (MMDD, based on the calendar date)
        Receipt Time (HHMM, based on a 24-hour clock, Eastern Time) Receipt Application ID (4 characters)*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify1120(tag, elementArr, wire) {
    /*{1120} : Output Message Accountability Data (OMAD)
        Output Cycle Date (CCYYMMDD)
        Output Destination ID (8 characters)
        Output Sequence Number (6 characters)
        Output Date (MMDD, based on the calendar date)
        Output Time (HHMM, based on a 24-hour clock, Eastern Time) Output FRB Application ID (4 characters)*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
    }
    return errTag;
}

function verify1130(tag, elementArr, wire) {
    /*{1130} : Error
        Error Category (1 character code) E Data Error
        F Insufficient Balance X Duplicate IMAD
        Error Code (3 characters)
        Error Description (35 characters)
        H Accountability Error W Cutoff Hour Error
        I In Process or Intercepted*/
    let errTag = "";
    for(var j = 0; j < elementArr.length; j++) {
        let objElement = elementArr[j];
        let val = wire[objElement.name];
        errTag = errTag + checkOptional(tag, objElement, val);
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
        case 5000:
            errTag = verify5000(tag, elementArr, wire);
            break;
        case 5010:
            errTag = verify5010(tag, elementArr, wire);
            break;
        case 5100:
            errTag = verify5100(tag, elementArr, wire);
            break;
        case 5200:
            errTag = verify5200(tag, elementArr, wire);
            break;
        case 5400:
            errTag = verify5400(tag, elementArr, wire);
            break;
        case 6000:
            errTag = verify6000(tag, elementArr, wire);
            break;
        case 6100:
            errTag = verify6100(tag, elementArr, wire);
            break;
        case 6110:
            errTag = verify6110(tag, elementArr, wire);
            break;
        case 6200:
            errTag = verify6200(tag, elementArr, wire);
            break;
        case 6210:
            errTag = verify6210(tag, elementArr, wire);
            break;
        case 6300:
            errTag = verify6300(tag, elementArr, wire);
            break;
        case 6310:
            errTag = verify6310(tag, elementArr, wire);
            break;
        case 6400:
            errTag = verify6400(tag, elementArr, wire);
            break;
        case 6410:
            errTag = verify6410(tag, elementArr, wire);
            break;
        case 6420:
            errTag = verify6420(tag, elementArr, wire);
            break;
        case 6500:
            errTag = verify6500(tag, elementArr, wire);
            break;
        case 7033:
            errTag = verify7033(tag, elementArr, wire);
            break;
        case 7050:
            errTag = verify7050(tag, elementArr, wire);
            break;
        case 7052:
            errTag = verify7052(tag, elementArr, wire);
            break;
        case 7056:
            errTag = verify7056(tag, elementArr, wire);
            break;
        case 7057:
            errTag = verify7057(tag, elementArr, wire);
            break;
        case 7059:
            errTag = verify7059(tag, elementArr, wire);
            break;
        case 7070:
            errTag = verify7070(tag, elementArr, wire);
            break;
        case 7072:
            errTag = verify7072(tag, elementArr, wire);
            break;
        case 8200:
            errTag = verify8200(tag, elementArr, wire);
            break;
        case 8250:
            errTag = verify8250(tag, elementArr, wire);
            break;
        case 8300:
            errTag = verify8300(tag, elementArr, wire);
            break;
        case 8350:
            errTag = verify8350(tag, elementArr, wire);
            break;
        case 9000:
            errTag = verify9000(tag, elementArr, wire);
            break;
        case 1100:
            errTag = verify1100(tag, elementArr, wire);
            break;
        case 1110:
            errTag = verify1110(tag, elementArr, wire);
            break;
        case 1120:
            errTag = verify1120(tag, elementArr, wire);
            break;
        case 1130:
            errTag = verify1130(tag, elementArr, wire);
            break;
        default:
            errTag = tag + ":" + "verify tbd";
            break;
    }
    return errTag;
}
//console.log("Total Tag Count:" + tagCnt);
//console.log("\n");
console.log("Error:" + errorMsg);
//console.log("\n");

function checkMandatory(tag, objElement, val, remDocID=null){
    //console.log("checkMandatory: tag =" + tag + " objElement=" + JSON.stringify(objElement) + " val=" + val);

    let err = "";
   
    if( typeof val == 'undefined' || val === null || val === ""){
            if(remDocID!==null){
                err = tag+":"+remDocID+" : "+objElement.name+": value is mandatory;";
            } else {
                err = tag+":"+objElement.name+": value is mandatory;";
            }
    }
    // check if val exist in value array
    //
    else if(objElement.value !== "") {
        var n = objElement.value.includes(val);
        //console.log("checkMandatory exist : " + n);
        if(n === false){
            if(remDocID!==null){
                err = tag+":"+remDocID+" : "+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
            } else {
                err = tag+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
            }
        }
    } else if(objElement.length !== null && val.length > objElement.length){
        // check if length equals to value
        if(remDocID!==null){
            err = tag+":"+remDocID+" : "+objElement.name+": value too long;";
        } else {
            err = tag+":"+objElement.name+": value too long;";
        }
    }
    
    return err;
}

function checkOptional(tag, objElement, val, remDocID=null){
    let err = "";
    if(typeof val !== 'undefined'){
        if(val !== null && val.length > objElement.length){
            if(remDocID!==null){
                err = tag+":"+remDocID+":"+objElement.name+": value too long;";
            } else {
                err = tag+":"+objElement.name+": value too long;";
            }
        }
        if(val !== null && objElement.value !== ""){
            var n = objElement.value.includes(val);
            //console.log("checkMandatory exist : " + n);
            if(n === false){
                if(remDocID!==null){
                    err = tag+":"+remDocID+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
                } else {
                    err = tag+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
                }
            }
        }
    }
    return err;
}

function checkMandatory(tag, objElement, val, remDocID=null){
    //console.log("checkMandatory: tag =" + tag + " objElement=" + JSON.stringify(objElement) + " val=" + val);
    if(tag == 1500){
      //console.log("val=" + val);     
    }
    let err = "";
   
    if( typeof val == 'undefined' || val === null || val === ""){
        if(remDocID!==null){
            err = tag+":"+remDocID+":"+objElement.name+": value is mandatory;";
        } else {
            err = tag+":"+objElement.name+": value is mandatory;";
        }
    }
    // check if val exist in value array
    //
    else if(objElement.length !== null && val.length > objElement.length){
        // check if length equals to value
        if(remDocID!==null){
            err = tag+":"+remDocID+":"+objElement.name+": value too long;";
        } else {
            err = tag+":"+objElement.name+": value too long;";
        }
    }
    else {
            let regex = objElement.value;
            if(regex !== null && regex !== ''){
                if(!val.match(regex)) {
                    //console.log("checkMandatory: DID NOT found match val="+ val + " regEx=" + regex );
                    if(remDocID!==null){
                        err = tag+":"+remDocID+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
                    } else {
                        err = tag+":"+objElement.name+": value " + val + " not in " + objElement.value.toString()+";";
                    }
                } else {
                    //console.log("checkMandatory: found match val="+ val + " regEx=" + regex );
                }
            }
    }
    return err;
}

function checkOptional(tag, objElement, val, remDocID=null){
    let err = "";
    if(typeof val !== 'undefined'){
        if(val !== null && val.length > objElement.length){
            if(remDocID!==null){
                err = tag+":"+remDocID+":"+objElement.name+": value too long;";
            } else {
                err = tag+":"+objElement.name+": value too long;";
            }
        }
        if(val !== null && objElement.value !== ""){
            let regex = objElement.value;
            if(!val.match(regex)) {
                if(remDocID!==null){
                    err = tag+":"+remDocID+":"+objElement.name+": value " + val + " don't match " + objElement.value.toString()+";";
                } else {
                    err = tag+":"+objElement.name+": value " + val + " don't match " + objElement.value.toString()+";";
                }      
                //console.log("checkOptional: DID NOT found match val="+ val + " regEx=" + regex );
            } else {
                //console.log("checkOptional: found match val="+ val + " regEx=" + regex );
            }
        }
    }
    return err;
}

function isExist(val){
    if(typeof val !== 'undefined' && val !== null && val !== ""){
        return true;
    }
    return false;
}