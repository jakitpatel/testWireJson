let lineInput = "101 06200001919999999990509211317A094101Regions Bank           XYZ Company            Ref Coder\r\n5200XYZ Company     Discretionary Data  1999999999PPDPAYROLL    050921050923   1062000010000001";
let achJson = createAchJson(lineInput);
console.log(JSON.stringify(achJson));

function createAchJson(line){
    let fileRecArr = [];
    let batchRecArr = [];
    let fileRecObj = {};
    let batchRecObj = {};

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
            batchRecObj = getJsonBatchHeaderRecord(line);

            ////
            batchRecArr.push(batchRecObj);
            fileRecObj.ACHBatchRecord_NEW_by_fileRecordID = batchRecArr;
            fileRecArr.push(fileRecObj);
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
            var yr = "20"+fieldVal.substr(0, 2);
            var month = fieldVal.substr(2, 2);
            var dt = fieldVal.substr(4, 2);
            var hh = fieldVal.substr(6, 2);
            var mm = fieldVal.substr(8, 2);
            var ss = "00";
            fieldVal = month+"/"+dt+"/"+yr + " "+ hh +":" + mm + ":" + ss;
        }
        fileRecObj[fldName] = fieldVal;
        charCnt = charCnt + parseInt(size);
    }
    return fileRecObj;
}

function getJsonBatchHeaderRecord(line){
    let fileRecObj = {};
    let fileRecDict = [{"fieldName":"ServiceClassCode","size":"3"},
                          {"fieldName":"CompanyName","size":"16"},
                          {"fieldName":"CompanyDiscretionaryData","size":"20"},
                          {"fieldName":"CompanyID","size":"10"},
                          {"fieldName":"StandardEntryClass","size":"10"},
                          {"fieldName":"CompanyEntryDescription","size":"10"},
                          {"fieldName":"CompanyDescriptiveDate","size":"6"},
                          {"fieldName":"EffectiveEntryDate","size":"6"},
                          {"fieldName":"OriginatorStatusCode","size":"1"},
                          {"fieldName":"OriginatingDFI","size":"8"},
                          {"fieldName":"BatchNumber","size":"7"}];
    let charCnt = 1;
    for(let j=0; j<fileRecDict.length; j++){
        let size = fileRecDict[j].size;
        let fldName = fileRecDict[j].fieldName;
        fieldVal = line.substr(charCnt, size);
        fileRecObj[fldName] = fieldVal;
        charCnt = charCnt + parseInt(size);
    }
    return fileRecObj;
}
