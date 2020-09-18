// Requiring Fields Json file 
let fields = require("./fields.json");
//console.log(fields);

// Requiring Wires Json file 
let wireDtObj = require("./wire.json");
//console.log(wireDtObj);

for(var i = 0; i < fields.length; i++) {
    var obj = fields[i];
    //console.log(obj.tag);
    let elementArr = obj.elements;
    for(var j = 0; j < elementArr.length; j++) {
        var objElement = elementArr[j];
        //console.log(objElement.name);
        //console.log(wireDtObj[objElement.name]);
        let val = wireDtObj[objElement.name];
        let errorMsg = "";
        let err1 = checkLength(obj.tag, objElement, val);
        if(err1 !== null){
            errorMsg = errorMsg+err1+" ";
        }
        
        let err2 = checkMandatory(obj.tag, objElement, val);
        if(err2 !== null){
            errorMsg = errorMsg+err2+" ";
        }
        console.log(errorMsg);
        console.log("\n");
    }
}
function checkMandatory(tag, objElement, val){
    let err = null;
    if(objElement.mandatory == 1){
        if(val == null || val == ""){
            err = tag+":"+objElement.name+": value is mandatory;";
        }
    }
    return err;
}

function checkLength(tag, objElement, val){
    let err = null;
    if(val!==null && typeof val !== 'undefined'){
        if(val.length !== objElement.length){
            err = tag+":"+objElement.name+": has not correct length;";
        }
    }
    return err;
}