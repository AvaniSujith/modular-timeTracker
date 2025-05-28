function getWeekStartDate(offset){
    if(typeof offset === 'undefined') offset = 0;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}


function formatWeekDisplay(offset){
    if(offset === 0){
        return "This Week";
    }else if(offset === -1){
        return "Last Week";
    }else if(offset === 1){
        return "Next Week";
    }else if(offset < -1){
        return Math.abs(offset) + ' Week Ago';
    }else{
        return offset + ' Week Ahead';
    }
}

function generateDateRange(period, weekOffset){
    if(typeof weekOffset === 'undefined') weekOffset = 0;

    const dates = [];
    let startDate;
    let days;

    switch(period){
        case "1week":
            days = 7;
            startDate = getWeekStartDate(weekOffset);
            break;
        case "2week":
            days = 14;
            startDate = getWeekStartDate(weekOffset);
            break;
        case "1month":
            days = 30;
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days + 1);
            break;
        case "6month":
            days = 180;
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days + 1);
            break;
        case "1year":
            days = 365;
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days + 1);
            break;
        default:
            days = 7;
            startDate = getWeekStartDate(weekOffset);
    }

    for(let i = 0; i < days; i++){
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
}

function getMaxTime(data){
    if(data.length === 0) return 0;
    return Math.max.apply(Math, data.map(function(entry){
        return entry.minutes;
    }));
}

function normalizedMaxTime(maxTime, timeUnit){
    // if(maxTime === 0) return timeUnit === "hours" ? 240 : 60;
    if(maxTime === 0) return timeUnit === "hours" ? 60 : 5
;    
    if(timeUnit === "hours"){
        const maxHours = Math.ceil(maxTime / 60);
        // return Math.ceil(maxHours / 2) * 2 * 60;
        return maxHours * 60;
    }else{
        // return Math.ceil(maxTime / 30) * 30
        return Math.ceil(maxTime / 5) * 5;
    }
}

function generateYAxisLabels(normalizedMax, timeUnit){
    const labels = [];
    // let interval = timeUnit === "hours" ? 120 : 30;
    
    // if(timeUnit === "hours" && normalizedMax > 480){
    //     interval = 240;
    // }

    let interval;
    if(timeUnit === "hours"){
        interval = 60;
    }else{
        interval = 5;
    }

    // for(let i = 0; i <= normalizedMax; i += interval){
    //     if(timeUnit === "hours"){
    //         const hours = i / 60;
    //         labels.push(hours % 1 === 0 ? hours + 'h' : hours.toFixed(1) + 'h');
    //     }else{
    //         labels.push(i + 'm');
    //     }
    // }

    for(let i = 0; i <= normalizedMax; i += interval){
        if(timeUnit === "hours"){
            labels.push((i / 60) + 'h');
        }else{
            labels.push(i + 'm');
        }
    }

    return labels;
}


function generateColors(count){
    const colors = [
        "#b08aa7", 
        "#2196F3", 
        "#FF9800", 
        "#E91E63", 
        "#9C27B0",
        "#00BCD4", 
        "#CDDC39", 
        "#FF5722", 
        "#795548", 
        "#607D8B",
        "#F44336", 
        "#3F51B5", 
        "#009688", 
        "#FFC107", 
        "#8BC34A",
        "#673AB7", 
        "#FF6F00", 
        "#C2185B", 
        "#7B1FA2", 
        "#0097A7"
    ];

    const result = [];

    for(let i = 0; i< count; i++){
        result.push(colors[i % colors.length]);
    }

    return result;
}

function formatDateLabel(dateString, period){
    const date = new Date(dateString);

    if(period === "1year" || period === "6month"){
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'});

    }else{
        const days = ["Sun", 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }
}

export{
    getWeekStartDate,
    formatWeekDisplay,
    generateDateRange,
    getMaxTime,
    normalizedMaxTime,
    generateYAxisLabels,
    generateColors,
    formatDateLabel
};