const timeToday = document.querySelector(".time");
const dateToday = document.querySelector(".date");


function getTime(date){

    const hours = date.getHours() % 12 || 12;;
    const minutes = date.getMinutes();
    const isAm = date.getHours() < 12;

    return `${hours.toString().padStart(2, "0")} : ${minutes.toString().padStart(2, "0")}  ${isAm ? "AM" : "PM"}`;
}

function getDate(date){
    // date.getMonth();
    
    const DAYS = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
}


setInterval(() => {
    const now = new Date();

    timeToday.textContent = getTime(now);
    dateToday.textContent = getDate(now);

}, 200);