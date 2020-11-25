// Requiring String Input file 
let st = "{1100}30P N{1110}09040117FT03{1120}20200904abcFNP6312346009040117FT03\r\n";
st += "{1100}30P N{1110}09090918FT03{1120}2{1510}1000{1520}2{2000}808260.00{3100}012345008C*{3320}SWF123456253*{3400}026002574B*{3600}CTP{3710}USD808260,00*{4200}D8312345143*K*U*N*{4320}P*{5000}D22123123451*UD*6*B*{5100}L*WD*1D*RE*L*{5200}B*B0*1E*P*{6500}R{30000}2{30001}2\r\n";
st += "{4200}D8310613143*KNOWLEABCMARKET LIMITED*UNIT NO. 604-555,4G OPAL TOWER,BUSI*NESS BAY*\r\n";
st += "{1500}30        P \r\n";
st += "{3700}SUSD0,00*{8300}OIPROPJohn*78653*78653*AHMDB*BIZZ{8350}Shouki*OIPROP78653*78653*AHMDB*BIZZ{8400}AROIPDP*DIN*John*{8450}USD1234.56*{8500}USD1234.56*{8550}USD123.56*{8600}81CRDTUSD123.45*ADD*{8650}55201117{8700}AROIPDP*DIN*John*{8750}Free1*Free2*Free3*{8400}AROIPDP*DIN*Marry*{8450}USD4321.56*{1100}30P N\r\n";
st += "{3700}SUSD0,00*{8300}OIPROPJohn*78653*78653*AHMDB*BIZZ{8350}Shouki*OIPROP78653*78653*AHMDB*BIZZ{8400}AROIPDP*DIN*Marry*{8450}USD4321.56*{1100}30P N";
st = "{8300}OIPROPJohn*78653*78653**BIZZ";
// convert line in fundwire protocol
// into internal CSFB db format using JSON
// conversion is being done using a dictionary retrieved from the database
//
function processLine(fields, line)
{
    let inputObj = {};
    let firstArr = line.split("{");
    //console.log(firstArr);
    for(let i=0; i< firstArr.length; i++){
     if(firstArr[i].length>0){
            let tagValArr = firstArr[i].split("}");
            //console.log(tagValArr[0]);
            //console.log(tagValArr[1]);
            inputObj[tagValArr[0]] = tagValArr[1];
        }
    }
    
    console.log("***** Json Object Built from Input String ****");
    console.log(inputObj);
    //console.log(inputObj[1120]);
    //{3700}SUSD0,00*
    //let wireDocObj = {};
    ///Process Main Wire Input Object to Json
    let outputObj = processObjToJson(inputObj,fields,false);
    outputObj["textWireMsg"] = line;
    ///Process Wire Docs lines to Json
    let wireDocObjArr = processWireDoc(line,fields);
    if((wireDocObjArr.length>0) && ("wireRemittance_by_wireID" in outputObj)){
        if(outputObj["wireRemittance_by_wireID"].length>0){
            outputObj["wireRemittance_by_wireID"][0]["wireRemittanceDoc_by_wireRemittanceID"] = wireDocObjArr;
        }
    }
    //outputObj["WireDoc_By_WireID"] = wireDocObjArr;
    return outputObj;

}

///Process Wire Document
function processWireDoc(line,fields) {
    let wireDocInputArr = [];
    ///Extract Each Document line by splitting the line with {8400}
    let firstArr = line.split("{8400}");
    //console.log(firstArr);
    for(let i=0; i< firstArr.length; i++){
     if(firstArr[i].length>0){
        if(i!==0){
            let wireDocLine = "{8400}"+firstArr[i];
            let wireDocObj = {};
            ///Remove unwanted tag from the last doc line
            //console.log(wireDocLine);
            let firstDocArr = wireDocLine.split("{");
            //console.log(firstDocArr);
            for(let j=0; j< firstDocArr.length; j++){
                if(firstDocArr[j].length>0){
                    let docTagValArr = firstDocArr[j].split("}");
                    //console.log(docTagValArr[0]);
                    //console.log(docTagValArr[1]);
                    if(docTagValArr[0]==="8400" || docTagValArr[0]==="8450" || docTagValArr[0]==="8500" || docTagValArr[0]==="8550" || docTagValArr[0]==="8600" || docTagValArr[0]==="8650" || docTagValArr[0]==="8700" || docTagValArr[0]==="8750"){
                        wireDocObj[docTagValArr[0]] = docTagValArr[1];
                    }
                }
            }
            if(Object.keys(wireDocObj).length !== 0 && wireDocObj.constructor === Object){
                wireDocInputArr.push(wireDocObj);
            }
        }
     }
    }
    //Doc Input Object Array
    //console.log(wireDocInputArr);
    let wireDocOutputArr = [];
    for(let i=0; i<wireDocInputArr.length; i++){
        let docInputObj = wireDocInputArr[i];
        let docOutputObj = processObjToJson(docInputObj,fields,true);
        wireDocOutputArr.push(docOutputObj);
    }
    //Doc Output Object Array
    //console.log(wireDocOutputArr);
    return wireDocOutputArr;
}

/// Give Input Object & process it to json
function processObjToJson(inputObj,fields,processDoc){
    let outputObj = {};
    let remittanceObj = {};
    let remittanceArr = [];
    Object.entries(inputObj).forEach(
        ([key, value]) => {
            //console.log(key, value);
            var result = fields.find(obj => {
                return obj.tag === key
            });
            //console.log(result);
            if(result){
                let charCnt = 0;
                let elementArr = result.elements;
                for(let j=0; j<elementArr.length; j++){
                    let el = elementArr[j];
                    let fieldName = el.name;
                    let len = el.length;
                    let fieldVal = '';
                    let elLen = len;
                    //console.log("value : "+value);
                    //console.log("charCnt : "+charCnt);
                    let nextChar = value.substr(charCnt, 1);
                    //console.log("nextChar : "+nextChar);
                    if(nextChar !== "*"){ // Skip the field if value is blank
                        //Get the Value by length of an element
                        fieldVal = value.substr(charCnt, len);
                        //console.log(fieldVal);
                        if(fieldVal.includes("*")){
                            let index = fieldVal.indexOf("*");
                            fieldVal = fieldVal.substr(0,index);
                            len = index+1;
                        }
                        let fieldLen = fieldVal.length;
                    
                        if(fieldVal !== null && fieldVal !== "")
                        {
                            // sendersChargesAmount comes in n,nn notation 
                            // we need to change to n.nn notation
                            // this will be to sendersChargesAmount1, sendersChargesAmount2, etc.
                            //
                            if(fieldName.includes("sendersChargesAmount"))
                                fieldVal = fieldVal.replace(",", ".");
                            if((result.tag==="8300" || result.tag==="8350") && processDoc===false && el.section && el.section==="wireRemittance_by_wireID"){
                                remittanceObj[fieldName] = fieldVal;
                            } else if(el.section && el.section==="wireRemittanceDoc_by_wireRemittanceID"){
                                if(processDoc===true){
                                    outputObj[fieldName] = fieldVal;
                                }
                            } else {
                                outputObj[fieldName] = fieldVal;
                            }
                        }
                        charCnt = charCnt + parseInt(len);
                        //console.log("End charCnt : "+charCnt);
                        nextChar = value.substr(charCnt, 1);
                        //console.log("nextChar : "+nextChar);
                        //Check for additional start at the end of value
                        if(nextChar==="*" && fieldLen===elLen){
                            charCnt = charCnt + 1;
                        }
                    } else {
                        charCnt = charCnt + 1;
                    }
                }
            }
        }
    );
    if(Object.keys(remittanceObj).length !== 0 && remittanceObj.constructor === Object){
        remittanceArr.push(remittanceObj);
    }
    if(remittanceArr.length>0){
        outputObj["wireRemittance_by_wireID"] = remittanceArr;
    }
    return outputObj;
}

// Requiring Fields Json file 
let wireDic = require("./fields.json");
//console.log(wireDic);
//console.log("wireDic =" + JSON.stringify(wireDic));
//console.log("wireDic.length =" + wireDic.length);

// split each wire input line
//
var str = st;

//let lines = event.request.payload.split("\r\n");
let lines = str.split("\r\n");
let wirearray =[];
//console.log("lines.length = " + lines.length);
// convert each line to JSONdb format
//
lines.forEach(function (line) {
    console.log("line=" + line); 
    var jsonline = processLine(wireDic, line);
    //jsonline.errorMsg = verifyMsg(wireDic, jsonline);
    wirearray.push(jsonline);
});

console.log("wirearray: " + JSON.stringify(wirearray));