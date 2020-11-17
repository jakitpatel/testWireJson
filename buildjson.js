// Requiring String Input file 
let st = "{1100}30P N{1110}09040117FT03{1120}20200904abcFNP6312346009040117FT03\r\n";
st += "{1100}30P N{1110}09090918FT03{1120}2{1510}1000{1520}2{2000}808260.00{3100}012345008C*{3320}SWF123456253*{3400}026002574B*{3600}CTP{3710}USD808260,00*{4200}D8312345143*K*U*N*{4320}P*{5000}D22123123451*UD*6*B*{5100}L*WD*1D*RE*L*{5200}B*B0*1E*P*{6500}R{30000}2{30001}2\r\n";
st += "{4200}D8310613143*KNOWLEABCMARKET LIMITED*UNIT NO. 604-555,4G OPAL TOWER,BUSI*NESS BAY*\r\n";
st += "{3700}SUSD0,00*\r\n";
st += "{1500}30        P ";

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
    let outputObj = {};
    //{3700}SUSD0,00*
    
    outputObj["textWireMsg"] = line;
    Object.entries(inputObj).forEach(
        ([key, value]) => {
            console.log(key, value);
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
                    //console.log("value : "+value);
                    //console.log("charCnt : "+charCnt);
                    let nextChar = value.substr(charCnt, 1);
                    //console.log("nextChar : "+nextChar);
                    //Check for additional start at the end of value
                    if(nextChar==="*"){
                        charCnt = charCnt + 1;
                    }
                    nextChar = value.substr(charCnt, 1);
                    //if(nextChar != " "){ // Skip the field if value is blank
                        //Get the Value by length of an element
                        fieldVal = value.substr(charCnt, len);
                        //console.log(fieldVal);
                        if(fieldVal.includes("*")){
                            let index = fieldVal.indexOf("*");
                            fieldVal = fieldVal.substr(0,index);
                            len = index+1;
                        }
                   //}
             
                    
                    if(fieldVal !== null && fieldVal !== "")
                    {
                        // sendersChargesAmount comes in n,nn notation 
                        // we need to change to n.nn notation
                        // this will be to sendersChargesAmount1, sendersChargesAmount2, etc.
                        //
                        if(fieldName.includes("sendersChargesAmount"))
                            fieldVal = fieldVal.replace(",", ".");
                         outputObj[fieldName] = fieldVal;
                    }
                    charCnt = charCnt + parseInt(len);
                }
            }
        }
    );
 
    return outputObj;

}

// Requiring Fields Json file 
let wireDic = require("./fields.json");
//console.log(wireDic);
console.log("wireDic =" + JSON.stringify(wireDic));
console.log("wireDic.length =" + wireDic.length);

// split each wire input line
//
var str = st;

//let lines = event.request.payload.split("\r\n");
let lines = str.split("\r\n");
let wirearray =[];
console.log("lines.length = " + lines.length);
// convert each line to JSONdb format
//
lines.forEach(function (line) {
    console.log("line=" + line); 
    var jsonline = processLine(wireDic, line);
    //jsonline.errorMsg = verifyMsg(wireDic, jsonline);
    wirearray.push(jsonline);
});

console.log("wirearray: " + JSON.stringify(wirearray));