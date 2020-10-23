let instructedAmount = "808260,00";
let numeric = /^[0-9][0-9,]*$/;
//numeric = /^\$\d{1,3}\.[0-9]{2}$|^\$(\d{1,3},)+\d{3}\.[0-9]{2}$/;
//numeric = /^\d+(\.\d{1,2})?$/;
errTag = "";
if(typeof instructedAmount !== 'undefined' && instructedAmount!== null && instructedAmount!== ""){
    if(!instructedAmount.match(numeric)) {
        errTag = "instructedAmount : only allowed [0-9][0-9,]* in 3710.instructedAmount; ";
    }
}
console.log("errTag : "+errTag);