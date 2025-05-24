

const GRAPH_SETTINGS = {
    timeUnit: "hours",
    period: "1week",
};

export const createGraph = (graphContainer) => {

    const container = document.getElementById("graphContainer");
    if(!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "analytics-wrapper";

    const controls = buildControls();
    const graph = document.createElement("div");
    graph.className = "analytics-graph"

    wrapper.appendChild(controls);
    wrapper.appendChild(graph);
    container.innerHTML = "";
    container.appendChild(wrapper);
};


const buildControls = () => {
    const controls = document.createElement("div");
    controls.className = "analytics-controls";
    controls.innerHTML = `
        <label for="timePeriod">Period:</label>
        <select id="timePeriod">
            <option value="1week">1 Week</option>
            <option value="2week">2 Weeks</option>
            <option value="1month">1 Month</option>
            <option value="6month">6 Months</option>
            <option value="1year">1 Year</option>
        </select>
        <label for="timeUnit">Unit:</label>
        <select id="timeUnit">
            <option value="hours">Hours</option>
            <option value="minutes">Minutes</option>
        </select>
    `;

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");

    timePeriodSelect.value = GRAPH_SETTINGS.period;
    timeUnitSelect.value = GRAPH_SETTINGS.timeUnit;

    timePeriodSelect.addEventListener("change", (event) => {
        GRAPH_SETTINGS.period = event.target.value;
        renderGraph(document.querySelector(".analytics-graph"));
    });

    timeUnitSelect.addEventListener("change", (event) => {
        GRAPH_SETTINGS.timeUnit = event.target.value;
        renderGraph(document.querySelector(".analytics-graph"));
    });

    return controls;
};

const filterDataByPeriod = (data, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
        case "1week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "2week":
            startDate = new Date(now.setDate(now.getDate() - 14));
            break;
        case "1month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case "6month":
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
        case "1year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(0); 
    }

    const startDateString = startDate.toISOString().split('T')[0];

    return data.filter(entry => entry.date >= startDateString);
};

const getMaxTime = (data) => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(entry => entry.minutes));
};

const normalizeMaxTime = (maxTime, timeUnit) => {
    let normalizedMax = maxTime;
    if (timeUnit === "hours") {
        normalizedMax = Math.ceil(maxTime / 60); 
        return (normalizedMax + 3) * 60; 
    } else { 
        normalizedMax = Math.ceil(maxTime / 10) * 10; 
        return normalizedMax + 15; 
    }
};

const generateYAxisLabels = (normalizedMax, timeUnit) => {
    const labels = [];
    let interval = timeUnit === "hours" ? 60 : 10; 
     if (timeUnit === "minutes" && normalizedMax / interval > 10) { 
        interval = 15;
    }


    for (let i = 0; i <= normalizedMax; i += interval) {
        if (timeUnit === "hours") {
            labels.push(`${i / 60} hours`);
        } else {
            labels.push(`${i} minutes`);
        }
    }
    return labels;
};

const labelToMinutes = (label, timeUnit) => {
    if (timeUnit === "hours") {
        return parseFloat(label.replace(" hours", "")) * 60;
    } else {
        return parseInt(label.replace(" minutes", ""));
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const renderGraph = (graph) => {
    graph.innerHTML = "";

    const data = fetchLocalStorageDate();
    const filtered  = filterDataByPeriod(data, GRAPH_SETTINGS.period);

    const maxTime = getMaxTime(filtered);
    const normalizedMax = normalizeMaxTime(maxTime, GRAPH_SETTINGS.timeUnit);
    
    const yLabels = generateYAxisLabels(normalizedMax, GRAPH_SETTINGS.timeUnit);
    const xLabels = filtered.map(d => formatDate(d.date));

    const grid = document.createElement("div");
    grid.className = "grid";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `auto repeat(${xLabels.length}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${yLabels.length}, 1fr) auto`;

    yLabels.slice().reverse().forEach(label => {
        const yCell = document.createElement("div");
        yCell.className = "cell y-label";
        yCell.textContent = label;
        grid.appendChild(yCell);
    });

    filtered.forEach((entry, colIndex) => {
        const timeVal = GRAPH_SETTINGS.timeUnit === "hours" ? entry.hours : entry.minutes;

        yLabels.slice().reverse().forEach(label => {
            const threshold = labelToMinutes(label, GRAPH_SETTINGS.timeUnit);
            const bar = document.createElement("div");
            bar.className = "cell graph-cell";

            if(timeVal >= threshold){
                bar.style.backgroundColor = "#4CAF50";
            }

            grid.appendChild(bar);
        });
    });

    const empty = document.createElement("div");
    empty.className = "cell x-label";
    grid.appendChild(empty);

    xLabels.forEach(label => {
        const xCell = document.createElement("div");
        xCell.className = "cell x-label";
        xCell.textContent = label;
        grid.appendChild(xCell);
    });

    graph.appendChild(grid);
};

const fetchLocalStorageDate = () => {
    const raw = localStorage.getItem("tasks");
    if(!raw) return [];

    let tasks;
    try{
        tasks = JSON.parse(raw);

    }catch{
        return [];
    }

    const dateMap = new Map();

    for(const task of tasks){
        if(!task.timeFragments || !Array.isArray(task.timeFragments)) continue;

        for(const fragment of task.timeFragments){
            const date = fragment.date;
            const duration = parseDurationToMinutes(fragment.duration);

            if(!dateMap.has(date)){
                dateMap.set(date, 0)
            }
            dateMap.set(date, dateMap.get(date) + duration);
        }
    }

    return Array.from(dateMap.entries()).map(([date, totalMinutes]) => ({
        date,
        minutes: totalMinutes,
        hours: +(totalMinutes / 60).toFixed(2)
    }));
};

const parseDurationToMinutes = (durationStr) => {
    const parts = durationStr.split(":").map(Number);
    const [hh, mm, ss] = parts;
    return hh * 60 + mm + ss / 60;
}
