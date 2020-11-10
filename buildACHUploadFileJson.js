let lineInput = "101 06200001919999999990509211317A094101Regions Bank           XYZ Company            Ref Coder\r\n";
lineInput += "5200XYZ Company     Discretionary Data  1999999999PPDPAYROLL   050921050923   1062000010000001\r\n";
lineInput += "622062000019123456789        00001250251001           Harper, John            0062000010000001\r\n";
lineInput += "622062000019123456789        00001303251002           Brown, Grg              0062000010000002\r\n";
lineInput += "622062000019123456789        00001516221003           Jones, Sara             0062000010000003\r\n";
lineInput += "820000001300829505630000000000000000018639771999999999                         062000010000001\r\n";
lineInput += "9000001000002000000130082950563000000000000000001863977                                       \r\n";
lineInput += "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999";
let achJson = createAchJson(lineInput);
console.log(JSON.stringify(achJson));

function createAchJson(line){
    //File Array & Obj
    let fileRecArr = [];
    let fileRecObj = {};
    //Batch Array & Obj
    let batchRecArr = [];
    let batchRecObj = {};
    //Detail Array & Obj
    let entrDtRecArr = [];
    let entrDtRecObj = {};

    let lines = line.split("\r\n");
    //console.log("lines.length = " + lines.length);
    // convert each line to JSONdb format
    //
    lines.forEach(function (line) {
        //console.log("line=" + line); 
        let recTypeCode = line.substr(0, 1);
        //console.log("recTypeCode : "+recTypeCode);
        if(recTypeCode==="1"){ 
            //FILE HEADER RECORD (‘1’ RECORD) 
            fileRecObj = getJsonFileHeaderRecord(line);
        } else if(recTypeCode==="5"){ 
            //BATCH HEADER RECORD (‘5’ RECORD)
            batchRecObj = {};
            batchRecObj = getJsonBatchHeaderRecord(line);

            ////
            //batchRecArr.push(batchRecObj);
            //fileRecObj.ACHBatchRecord_NEW_by_fileRecordID = batchRecArr;
            //fileRecArr.push(fileRecObj);
        } else if(recTypeCode==="6"){ 
            //ENTRY DETAIL RECORD (‘6’ RECORD)
            entrDtRecObj = {};
            entrDtRecObj = getJsonEntryDetailRecord(line);
            entrDtRecArr.push(entrDtRecObj);
            batchRecObj.ACHEntryDetail_NEW_by_batchRecordID = entrDtRecArr;
        } else if(recTypeCode==="8"){ 
            //BATCH CONTROL (TRAILER) RECORD (‘8’ RECORD)
            let batchRecTrailerObj = getJsonBatchTrailerRecord(line);
            batchRecObj = Object.assign(batchRecObj, batchRecTrailerObj);
            ////
            batchRecArr.push(batchRecObj);
            fileRecObj.ACHBatchRecord_NEW_by_fileRecordID = batchRecArr;
            //fileRecArr.push(fileRecObj);
        } else if(recTypeCode==="9"){ 
            if(line!=="9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"){
                //FILE CONTROL (TRAILER) RECORD (‘9’ RECORD)
                let fileRecTrailerObj = getJsonFileTrailerRecord(line);
                //console.log(fileRecTrailerObj);
                fileRecObj = Object.assign(fileRecObj, fileRecTrailerObj);
                //fileRecObj.ACHBatchRecord_NEW_by_fileRecordID = batchRecArr;
                fileRecArr.push(fileRecObj);
            }
        } 
    });
    return fileRecArr;
}

function getJsonFileHeaderRecord(line){
    let fileRecObj = {};
    let fileRecDict = [{"fieldName":"PriorityCode","size":"2"},
                          {"fieldName":"ImmediateDestination","size":"10"},
                          {"fieldName":"ImmediateOrigin","size":"10"},
                          {"fieldName":"FileCreationDateTime","size":"10"},
                          {"fieldName":"FileIDModifier","size":"1"},
                          {"fieldName":"RecordSize","size":"3"},
                          {"fieldName":"BlockingFactor","size":"2"},
                          {"fieldName":"FormatCode","size":"1"},
                          {"fieldName":"ImmediateDestinationName","size":"23"},
                          {"fieldName":"ImmediateOriginName","size":"23"},
                          {"fieldName":"ReferenceCode","size":"8"}];
    let charCnt = 1;
    for(let j=0; j<fileRecDict.length; j++){
        let size = fileRecDict[j].size;
        let fldName = fileRecDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        if(fldName==="FileCreationDateTime"){
            fieldVal = getFormattedDateTime(fieldVal);
        }
        fileRecObj[fldName] = fieldVal;
        charCnt = charCnt + parseInt(size);
    }
    fileRecObj["RawDataRecord1"] = line;
    return fileRecObj;
}

function getJsonFileTrailerRecord(line){
    let fileRecTrailObj = {};
    let fileRecTrailDict = [{"fieldName":"BatchCount","size":"6"},
                          {"fieldName":"BlockCount","size":"6"},
                          {"fieldName":"EntryAddendaCounts","size":"8"},
                          {"fieldName":"EntryHash","size":"10"},
                          {"fieldName":"TotalDebit","size":"12"},
                          {"fieldName":"TotalCredit","size":"12"},
                          {"fieldName":"Reserved","size":"39"}];
    let charCnt = 1;
    for(let j=0; j<fileRecTrailDict.length; j++){
        let size = fileRecTrailDict[j].size;
        let fldName = fileRecTrailDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        if(fldName!=="Reserved"){
            fileRecTrailObj[fldName] = fieldVal;
        }
        charCnt = charCnt + parseInt(size);
    }
    fileRecTrailObj["RawDataRecord9"] = line;
    return fileRecTrailObj;
}

function getJsonBatchHeaderRecord(line){
    let batchHdrRecObj = {};
    let batchHdrRecDict = [{"fieldName":"ServiceClassCode","size":"3"},
                          {"fieldName":"CompanyName","size":"16"},
                          {"fieldName":"CompanyDiscretionaryData","size":"20"},
                          {"fieldName":"CompanyID","size":"10"},
                          {"fieldName":"StandardEntryClass","size":"3"},
                          {"fieldName":"CompanyEntryDescription","size":"10"},
                          {"fieldName":"CompanyDescriptiveDate","size":"6"},
                          {"fieldName":"EffectiveEntryDate","size":"6"},
                          {"fieldName":"SattlementDate","size":"3"},
                          {"fieldName":"OriginatorStatusCode","size":"1"},
                          {"fieldName":"OriginatingDFI","size":"8"},
                          {"fieldName":"BatchNumber","size":"7"}];
    let charCnt = 1;
    for(let j=0; j<batchHdrRecDict.length; j++){
        let size = batchHdrRecDict[j].size;
        let fldName = batchHdrRecDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        if(fldName==="CompanyDescriptiveDate" || fldName==="EffectiveEntryDate"){
            fieldVal = getFormattedDate(fieldVal);
        }
        if(fldName!=="SattlementDate"){
            batchHdrRecObj[fldName] = fieldVal;
        }
        charCnt = charCnt + parseInt(size);
    }
    batchHdrRecObj["RawDataRecord5"] = line;
    return batchHdrRecObj;
}

function getJsonBatchTrailerRecord(line){
    let batchTrilerRecObj = {};
    let batchTrailerRecDict = [{"fieldName":"ServiceClassCode","size":"3"},
                            {"fieldName":"EntryAddendaCount","size":"6"},
                            {"fieldName":"EntryHash","size":"10"},
                            {"fieldName":"TotalDebitAmount","size":"12"},
                            {"fieldName":"TotalCreditAmount","size":"12"},
                            {"fieldName":"CompanyID","size":"10"},
                            {"fieldName":"MsgAuthenticationCode","size":"19"},
                            {"fieldName":"Reserved","size":"6"},
                            {"fieldName":"OriginatingDFI","size":"8"},
                            {"fieldName":"BatchNumber","size":"7"}];
    let charCnt = 1;
    for(let j=0; j<batchTrailerRecDict.length; j++){
        let size = batchTrailerRecDict[j].size;
        let fldName = batchTrailerRecDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        /*if(fldName==="CompanyDescriptiveDate" || fldName==="EffectiveEntryDate"){
            fieldVal = getFormattedDate(fieldVal);
        }*/
        if(fldName!=="ServiceClassCode" && fldName!=="CompanyID" && fldName!=="MsgAuthenticationCode" && fldName!=="Reserved" && fldName!=="OriginatingDFI" && fldName!=="BatchNumber"){
            batchTrilerRecObj[fldName] = fieldVal;
        }
        charCnt = charCnt + parseInt(size);
    }
    batchTrilerRecObj["RawDataRecord8"] = line;
    return batchTrilerRecObj;
}

function getJsonEntryDetailRecord(line){
    let entrDtRecObj = {};
    let entrDtRecDict = [{"fieldName":"TransactionCode","size":"2"},
                          {"fieldName":"RDFID","size":"9"},
                          {"fieldName":"DFIAccountNumber","size":"17"},
                          {"fieldName":"Amount","size":"10"},
                          {"fieldName":"IndivIDNumber","size":"15"},
                          {"fieldName":"IndivName","size":"22"},
                          {"fieldName":"DiscretionaryData","size":"2"},
                          {"fieldName":"AddendaRecordIndicator","size":"1"},
                          {"fieldName":"TraceNumber","size":"15"}];
    let charCnt = 1;
    for(let j=0; j<entrDtRecDict.length; j++){
        let size = entrDtRecDict[j].size;
        let fldName = entrDtRecDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        if(fldName!=="AddendaRecordIndicator" && fldName!=="DiscretionaryData"){
            entrDtRecObj[fldName] = fieldVal;
        }
        charCnt = charCnt + parseInt(size);
    }
    entrDtRecObj["RawDataRecord6"] = line;
    return entrDtRecObj;
}

function getFormattedDateTime(fieldVal){
    var yr = "20"+fieldVal.substr(0, 2);
    var month = fieldVal.substr(2, 2);
    var dt = fieldVal.substr(4, 2);
    var hh = fieldVal.substr(6, 2);
    var mm = fieldVal.substr(8, 2);
    var ss = "00";
    fieldVal = month+"/"+dt+"/"+yr + " "+ hh +":" + mm + ":" + ss;
    return fieldVal;
}

function getFormattedDate(fieldVal){
    var yr = "20"+fieldVal.substr(0, 2);
    var month = fieldVal.substr(2, 2);
    var dt = fieldVal.substr(4, 2);
    fieldVal = month+"/"+dt+"/"+yr;
    return fieldVal;
}