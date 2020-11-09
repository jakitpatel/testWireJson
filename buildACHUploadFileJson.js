/// Final Json Output Object
let outputObj = {
    "resource":[]
};
let fileOutoutObj = {
    "FileName": "TRANSFERWISETEST_11-21-2014.TXT",
    "ACHFileRecord_NEW_by_uploadedFilesID":[]
};

let fileRecArr = [];

let lineInput = "101 06200001919999999990509211317A094101Regions Bank           XYZ Company            Ref Coder\r\n5200XYZ";
let achJson = createAchJson(lineInput);

function createAchJson(line){
    let lines = line.split("\r\n");
    let wirearray =[];
    console.log("lines.length = " + lines.length);
    // convert each line to JSONdb format
    //
    lines.forEach(function (line) {
        //console.log("line=" + line); 
        let recTypeCode = line.substr(0, 1);
        //console.log("recTypeCode : "+recTypeCode);
        let fileRecObj = {};
        if(recTypeCode==="1"){ 
            //FILE HEADER RECORD (‘1’ RECORD) 
            fileRecObj = getJsonFileHeaderRecord(line);
            fileRecArr.push(fileRecObj);
        } 
    });
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
        fileRecObj[fldName] = fieldVal;
        charCnt = charCnt + parseInt(size);
    }
    return fileRecObj;
}

//Display Output
fileOutoutObj.ACHFileRecord_NEW_by_uploadedFilesID = fileRecArr;
outputObj.resource.push(fileOutoutObj);
console.log(JSON.stringify(outputObj));
