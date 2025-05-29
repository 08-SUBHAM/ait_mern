const firstnum = 20;
const secondnum = 30;

const smalloftwo = () => {
    if(firstnum<secondnum){
        console.log("firstnum is small")
    }
    else{
        console.log("secondnum is small")
    }
}

const bigoftwo = () => {
    if(firstnum<secondnum){
        console.log("secondnum is big")
    }
    else{
        console.log("firstnum is big")
    }
}

smalloftwo();
bigoftwo();