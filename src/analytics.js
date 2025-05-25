

const GRAPH_SETTINGS = {
    timeUnit: "hours",
    period: "1week",
    showGridLines: true,
    showBarBorders: true,
    colorMode: "single",
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

    renderGraph(graph);

};

const buildControls = () => {
    const controls = document.createElement("div");
    controls.className = "analytics-controls";
    controls.innerHTML = `
        <div class="controls-section">
            <label for="timePeriod">Period:</label>
            <select id="timePeriod">
                <option value="1week">1 Week</option>
                <option value="2week">2 Weeks</option>
                <option value="1month">1 Month</option>
                <option value="6month">6 Month</option>
                <option value="1year">1 Year</option>
            </select>

            <label for="timeUnit">Unit:</label>
            <select id="timeUnit">
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
            </select>
        </div>

        <div class="controls-section toggles">
            <label class="toggle-container">
                <input type="checkbox" id="gridToggle" checked>
                <span class="toggle-label">Grid Lines</span>
            </label>

            <label class="toggle-container">
                <input type="checkbox" id="borderToggle" checked>
                <span class="toggle-label">Bar Border</span>
            </label>

            <label for="colorMode">Colors:</label>
            <select id="colorMode">
                <option value="single">Same Color</option>
                <option value="distinct">Distinct Colors</option>
            </select>

        </div>
    `;

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");
    const gridToggle = controls.querySelector("#gridToggle");
    const borderToggle = controls.querySelector('#borderToggle');
    const colorModeSelect = controls.querySelector('#colorMode');

    timePeriodSelect.value = GRAPH_SETTINGS.period;
    timeUnitSelect.value = GRAPH_SETTINGS.timeUnit;
    gridToggle.checked = GRAPH_SETTINGS.showGridLines;
    borderToggle.checked = GRAPH_SETTINGS.showBarBorders;
    colorModeSelect.value = GRAPH_SETTINGS.colorMode;


    timePeriodSelect.addEventListener("change", (event) => {
        GRAPH_SETTINGS.period = event.target.value;
        renderGraph(document.querySelector(".analytics-graph"));
    });

    timeUnitSelect.addEventListener("change", (event) => {
        GRAPH_SETTINGS.timeUnit = event.target.value;
        renderGraph(document.querySelector(".analytics-graph"));
    });

    gridToggle.addEventListener("change", (event) => {
        GRAPH_SETTINGS.showGridLines = event.target.checked;
        toggleGridLines(event.target.checked);
    });

    borderToggle.addEventListener("change", (event) => {
        GRAPH_SETTINGS.showBarBorders = event.target.checked;
        toggleBarBorders(event.target.checked);
    });

    colorModeSelect.addEventListener("change", (event) => {
        GRAPH_SETTINGS.colorMode = event.target.value;
        updateBarColors();

    })

    return controls;
};

const filterDataByPeriod = (data, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
        case "1week":
            // startDate = new Date(now.setDate(now.getDate() - 7));
            startDate.setDate(now.getDate() - 7);
            break;
        case "2week":
            // startDate = new Date(now.setDate(now.getDate() - 14));
            startDate.setDate(now.getDate() - 14);
            break;
        case "1month":
            // startDate = new Date(now.setMonth(now.getMonth() - 1));
            startDate.setMonth(now.getDate() - 1);
            break;
        case "6month":
            // startDate = new Date(now.setMonth(now.getMonth() - 6));
            startDate.setMonth(now.getDate() - 6);
            break;
        case "1year":
            startDate.setFullYear(now.getFullYear() - 1);
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
    if(maxTime === 0) return timeUnit === "hour" ? 240 : 60;

    // let normalizedMax = maxTime;
    if (timeUnit === "hours") {
        // normalizedMax = Math.ceil(maxTime / 60); 
        // return (normalizedMax + 3) * 60; 
        const maxHours = Math.ceil(maxTime / 60);
        return Math.ceil(maxHours / 2) * 2 * 60;
    } else { 
        // normalizedMax = Math.ceil(maxTime / 10) * 10; 
        // return normalizedMax + 15; 
        return Math.ceil(maxTime / 30) * 30;
    }
};

const generateYAxisLabels = (normalizedMax, timeUnit) => {
    const labels = [];
    let interval = timeUnit === "hours" ? 120 : 30; 

    if(timeUnit === "hours" && normalizedMax > 480){
        interval = 240;
    }

    for(let i = 0; i <= normalizedMax; i += interval){
        if(timeUnit === "hours"){
            const hours = i / 60;
            labels.push(hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`);
        }else{
            labels.push(`${i}m`)
        }
    }

    //  if (timeUnit === "minutes" && normalizedMax / interval > 10) { 
    //     interval = 15;
    // }

    // if(timeUnit === "hours" && normalizedMax > 480 ){
    //     if(timeUnit === "hours"){
    //         const hours = i / 60;
    //         labels.push(hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`);
    //     }else{
    //         labels.push(`${i}m`);
    //     }
    // }

    // for (let i = 0; i <= normalizedMax; i += interval) {
    //     if (timeUnit === "hours") {
    //         labels.push(`${i / 60} hours`);
    //     } else {
    //         labels.push(`${i} minutes`);
    //     }
    // }

    return labels;
};

const generateDateRange = (period) => {
    const dates = [];
    const now = new Date();
    let days;

    switch(period){
        case "1week": 
            days = 7; 
            break;
        case "2weeks":
            days = 14;
            break;
        case "1month":
            days = 30;
            break;
        case "6month":
            days = 180;
            break;
        case "1year":
            days = 365;
            break;
        default:
            days = 7;

    }

    for(let i = days - 1; i >= 0; i--){
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

const generateColors = (count) => {
    const colors = [
        "#4CAF50", 
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
    for(let i = 0; i < count; i++){
        result.push(colors[i % colors.length]);
    }
    return result;
}

const toggleGridLines = (show) => {
    const chartArea = document.querySelector('.chart-area');
    if(chartArea){
        if(show){
            chartArea.classList.add('show-grid');
        }else{
            chartArea.classList.remove('show-grid');
        }
    }
}

const toggleBarBorders = (show) => {
    const bars = document.querySelectorAll('.histogram-bar');
    bars.forEach(bar => {
        if(show){
            bar.classList.add('show-grid');
        }else{
            bar.classList.remove('show-border');
        }
    });
};

const updateBarColors = () => {
    const bars = document.querySelectorAll('.histogram-bar');
    const colors = GRAPH_SETTINGS.colorMode === "distinct"
        ? generateColors(bars.length)
        : ["#4caf50"];

        bars.forEach((bar, index) => {
            const isEmpty = bar.style.height === "0%" || !bar.style.height;
            if(isEmpty){
                bar.style.backgroundColor = "#f0f0f0";
            }else{
                const color = GRAPH_SETTINGS.colorMode === "distinct"
                    ? colors[index]
                    : colors[0];
                
                bar.style.backgroundColor = color;
                bar.dataset.originalCode = color;
            }
        });
};

const formatDateLabel = (dateString, period) => {
    const date = new Date(dateString);

    if(period === "1year" || period === "6month"){
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
    }else{
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }
};

// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     return `${year}-${month}-${day}`;
// };


const renderGraph = (graph) => {
    if(!graph) return;

    graph.innerHTML = "";

    const data = fetchLocalStorageDate();
    // const filtered  = filterDataByPeriod(data, GRAPH_SETTINGS.period);
    const dateRange = generateDateRange(GRAPH_SETTINGS.period);

    const dataMap = new Map();
    data.forEach(entry => {
        dataMap.set(entry.date, entry)
    });

    const completeData = dateRange.map(date => {
        return dataMap.get(date) || {
            date,
            minutes : 0,
            hours : 0
        };
    });

    const maxTime = getMaxTime(completeData);

    const normalizedMax = normalizeMaxTime(maxTime, GRAPH_SETTINGS.timeUnit);
    const yLabels = generateYAxisLabels(normalizedMax, GRAPH_SETTINGS.timeUnit);
    // const xLabels = filtered.map(d => formatDate(d.date));

    const histogramContainer = document.createElement("div");
    histogramContainer.className = "histogram-container";

    const yAxis = document.createElement("div");
    yAxis.className = "y-axis";

    yLabels.slice().reverse().forEach(label => {
        const yLabel = document.createElement("div");
        yLabel.className = 'y-axis-label';
        yLabel.textContent = label;
        yAxis.appendChild(yLabel);
    });
 
    const chartArea = document.createElement("div");
    chartArea.className = `chart-area ${GRAPH_SETTINGS.showGridLines ? 'show-grid' : ''}`;

    const barWidth = Math.max(20, Math.max(60, 600 / completeData.length));
    const distinctColor = generateColors(completeData.length);

    completeData.forEach((entry, index) => {

        const barContainer = document.createElement("div");
        barContainer.className = "bar-container";
        barContainer.style.width = `${barWidth}px`;

        const bar = document.createElement("div");
        bar.className = `history-bar ${GRAPH_SETTINGS.showBarBorders ? 'show-border' : ''}`;

        
    })

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
