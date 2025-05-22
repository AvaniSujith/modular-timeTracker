export function todayISO(){
    return new Date().toISOString().split('T')[0];
}

export function formatDateDisplay(date){
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

    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

export function formatTimeDisplay(date){
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours < 12 ? "AM" : "PM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}`;
}