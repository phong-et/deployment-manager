/**
 * Created by Phillipet on 2/24/2016.
 */
/*! Copyright by phillip7.et
 Written by : Me
 Lisence    : free
 */


function setFormatStart(Duration,element_hour,element_minute,element_second){
    // Do toán từ phần dư trong javascript không có nên làm vầy
    temp = Duration % 3600;
    hour = (Duration - temp)/3600;
    Duration2 = Duration - hour*3600;
    temp = Duration2 % 60;
    minute = (Duration2 - temp)/60;
    second = Duration2 - minute*60;

    setHTML(element_hour,hour);
    setHTML(element_minute,minute);
    setHTML(element_second,second);
    //var t = hour*3600 + minute*60 + second;
    //alert(t);
}
function setHTML(element,value){
    //strImage = ""; <img src="../images/clock/c0.gif" /><img src="../images/clock/c0.gif" />
    if(value<10){
        if(value>0)
            value = '<img style="width:20px" src="../images/clock/c0.gif" />' + '<img style="width:20px" src="../images/clock/c' + value + '.gif" />';
        else // Tức là khi = 0 k0 bị tru them = -1 ==> sai image
            value = '<img style="width:20px" src="../images/clock/c0.gif" /><img style="width:20px" src="../images/clock/c0.gif" />';
    }
    else{
        number2 = value % 10;
        number1 = (value - number2)/10;
        value = '<img style="width:20px" src="../images/clock/c' + number1 + '.gif" />' + '<img style="width:20px" src="../images/clock/c' + number2 + '.gif" />'
    }
    document.getElementById(element).innerHTML = value;
}
function start(iDuration,element_hour,element_minute,element_second){
    Duration = iDuration-1;
    second--;
    setHTML(element_second,second);
    if(second==0){
        second = 60;
        minute --;
        setHTML(element_minute,minute);
    }
    if(minute==0 && Duration>0){
        // làm gì đó
        minute = 60;
        hour--;
        setHTML(element_hour,hour);
    }
    if(Duration == 0){
        setHTML('minute',0);
        setHTML('second',0);
        return;
    }
    else
        setTimeout('start(Duration,"hour","minute","second")', 1000);
}

