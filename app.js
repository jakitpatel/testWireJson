// Requiring Fields Json file 
let fields = require("./fields.json");
//console.log(fields);

// Requiring Wires Json file 
let wire = require("./wire.json");
//console.log(wire);

let errorMsg = "";

for(var i = 0; i < fields.length; i++) {
    var obj = fields[i];
    console.log(obj.tag);
    let elementArr = obj.elements;
    console.log("element.len = "+ elementArr.length);
    
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
        
    }
}

console.log("Error:" + errorMsg);
console.log("\n");

function checkMandatory(tag, objElement, val){
    console.log("checkMandatory: tag =" + tag + " objElement=" + JSON.stringify(objElement) + " val=" + val);
    
    let err = null;
   
    if( typeof val == 'undefined' || val === null || val === ""){
            err = tag+":"+objElement.name+": value is mandatory;";
    }
    // check if val exist in value array
    //
    else if(objElement.value !== "")
    {
        var n = objElement.value.includes(val);
        //console.log("checkMandatory exist : " + n);
        if(n === false)
        {
            err = tag+":"+objElement.name+": value " + val + " not in " + objElement.value;
        }
    }
    
    return err;
}

function checkOptional(tag, objElement, val){
    let err = null;
    if(typeof val !== 'undefined'){
        if(val !== null && val.length > objElement.length){
            err = tag+":"+objElement.name+": value too long;";
        }
    }
    return err;
}

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
    if(rule !== null && rule !== ""){
        console.log("Processing this : "+rule);
        let n = rule.includes("only allowed");
        if(n === true){
            let conditionSt = rule.split("if")[1];
            let condArr = conditionSt.split("AND");
            for(let k=0; k<condArr.length; k++){
                let condition = condArr[k].trim();
                console.log(condition);
            }
        }
    }
}