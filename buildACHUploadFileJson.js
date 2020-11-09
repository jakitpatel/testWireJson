// Importing the Required Modules 
const fs = require('fs'); 
const readline = require('readline'); 
  
// Creating a readable stream from file 
// readline module reads line by line  
// but from a readable stream only. 
const file = readline.createInterface({ 
    input: fs.createReadStream('inputText.txt'), 
    output: process.stdout, 
    terminal: false
});

/// Final Json Output Object
let outputObj = {
    "resource":[]
};
let fileOutoutObj = {
    "FileName": "TRANSFERWISETEST_11-21-2014.TXT",
    "ACHFileRecord_NEW_by_uploadedFilesID":[]
};

let fileRecArr = [];

// Printing the content of file line by 
//  line to console by listening on the 
// line event which will triggered 
// whenever a new line is read from 
// the stream 
file.on('line', (line) => { 
    console.log(line);
    let recTypeCode = line.substr(0, 1);
    //console.log("recTypeCode : "+recTypeCode);
    let fileRecObj = {};
    if(recTypeCode==="1"){ 
        //FILE HEADER RECORD (‘1’ RECORD) 
        fileRecObj = getJsonFileHeaderRecord(line);
        fileRecArr.push(fileRecObj);
    } 
})
.on('close', function(line) {
    // EOF
    fileOutoutObj.ACHFileRecord_NEW_by_uploadedFilesID = fileRecArr;
    outputObj.resource.push(fileOutoutObj);
    console.log(JSON.stringify(outputObj));
    //console.log(outputObj);
});

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