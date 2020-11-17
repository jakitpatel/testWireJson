// Requiring Fields Json file 
let fields = require("./fields.json");
//console.log(fields);

// Requiring String Input file 
let st = "{1100}30P N{1110}09040117FT03{1120}20200904abcFNP6312346009040117FT03";
st = "{1100}30P N{1110}09090918FT03{1120}2{1510}1000{1520}2{2000}808260.00{3100}012345008C*{3320}SWF123456253*{3400}026002574B*{3600}CTP{3710}USD808260,00*{4200}D8312345143*K*U*N*{4320}P*{5000}D22123123451*UD*6*B*{5100}L*WD*1D*RE*L*{5200}B*B0*1E*P*{6500}R{30000}2{30001}2";
st = "{4200}D8310613143*KNOWLEABCMARKET LIMITED*UNIT NO. 604-555,4G OPAL TOWER,BUSI*NESS BAY*";
st = "{3700}SUSD0,00*";
st = "{1500}30        P ";
//console.log(fields);
let inputObj = {};
let firstArr = st.split("{");
//console.log(firstArr);
for(let i=0; i< firstArr.length; i++){
    if(firstArr[i].length>0){
        let tagValArr = firstArr[i].split("}");
        //console.log(tagValArr[0]);
        //console.log(tagValArr[1]);
        inputObj[tagValArr[0]] = tagValArr[1];
    }
}
console.log("****** Json Object Built from Input String *****");
console.log(inputObj);
//console.log(inputObj[1120]);
let outputObj = {};
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
                if(fieldVal!==null && fieldVal!==''){
                    outputObj[fieldName] = fieldVal;
                }
                charCnt = charCnt + parseInt(len);
            }
        }
    }
);
console.log(outputObj);