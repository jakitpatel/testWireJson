/*let instructedAmount = "808260,00";
let numeric = /^[0-9][0-9,]*$/;
//numeric = /^\$\d{1,3}\.[0-9]{2}$|^\$(\d{1,3},)+\d{3}\.[0-9]{2}$/;
//numeric = /^\d+(\.\d{1,2})?$/;
errTag = "";
if(typeof instructedAmount !== 'undefined' && instructedAmount!== null && instructedAmount!== ""){
    if(!instructedAmount.match(numeric)) {
        errTag = "instructedAmount : only allowed [0-9][0-9,]* in 3710.instructedAmount; ";
    }
}*/
let str = "\u200b\u200b\u200b{\u200b1500}";
str = JSON.stringify(str);
console.log("str : "+str);
let strObj = "\\u200b\\u200b\\u200b{\\u200b1500}";
let ms = str.replace(/\u200B/g,'');
console.log("ms : "+ms);