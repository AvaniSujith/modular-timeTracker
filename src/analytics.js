import { loadTasks } from "./storage";
import { getCurrentUser } from "./services/authService";

const samplen = [
    { date: '2025-05-20', minutes: 120, hours: 2 },
    { date: '2025-05-21', minutes: 180, hours: 3.2 },
    { date: '2025-05-22', minutes: 90, hours: 0.5 },
    { date: '2025-05-23', minutes: 240, hours: 4.2 },
    { date: '2025-05-24', minutes: 60, hours: 1.3 },
    { date: '2025-05-25', minutes: 200, hours: 3.3 },
    { date: '2025-05-26', minutes: 150, hours: 2.15 }
];

let currentWeekOffset = 0;
let taskData = sampleData;

const GRAPH_SETTINGS = {
    timeUnit: "hours",
    period: "1week",
    showGridLines: true,
    showBarBorders: true,
    colorMode: "single",
};

function fetchLocalStorageData(){
    try{
        const currentUser = getCurrentUser();
        if(!currentUser || !currentUser.email){
            console.warn('No current user found');
            return sampleData;
        }

        const tasks = loadTasks(currentUser.email);

        if(tasks && tasks.length > 0){
            const processedData = processTimersForAnalytics(tasks);
            console.log('Lodaed task', processedData);
            return processedData;
        }

        console.warn('no task');
        return sampleData;
    }catch (error){
        console.error('Error fetching data');
        return sampleData;
    }
}

function parseTimeString(timeString){
    if(!timeString || typeof timeString !== 'string') return 0;

    const parts = timeString.split(":");
    if(parts.length === 3){
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    return 0;
}

function parseDateString(dateString){
    if(!dateString) return null;

    try{
        let date;

        if(dateString.includes('/')){
            const datePart = dateString.split(',')[0];
            date = new Date(datePart);
        }else{
            date = new Date(dateString);
        }

        if(isNaN(date.getTime())){
            return null;
        }

        return date.toISOString().split('T')[0]
    }catch(error){
        console.warn('Error parsing date');
        return null;
    }
}

function processTimersForAnalytics(tasks){
    const dailyTimeMap = new Map();

    tasks.forEach(function(task) {
        if(task.timeFragments && Array.isArray(task.timeFragments)){
            task.timeFragments.forEach(function(fragment){
                try{
                    let fragmentDate = null;
                    let totalSeconds = 0;

                    if(fragment.duration){
                        totalSeconds += parseTimeString(fragment.duration);
                    }

                    if(fragment.startTime){
                        fragmentDate = parseDateString(fragment.startTime);
                    }else if(fragment.date){
                        fragmentDate = parseDateString(fragment.date)
                    }

                    const totalMinutes = totalSeconds / 60;

                    if(fragmentDate && totalMinutes > 0){
                        if(dailyTimeMap.has(fragmentDate)){
                            dailyTimeMap.set(fragmentDate, dailyTimeMap.get(fragmentDate) + totalMinutes);
                        }else{
                            dailyTimeMap.set(fragmentDate, totalMinutes);
                        }
                    }
                }catch(error){
                    console.warn('Error processing fragment', fragment, error);
                }
            }); 
        }
    });

    const analyticsData = Array.from(dailyTimeMap.entries()).map(function(entry){
        const date = entry[0];
        const minutes = entry[1];
        return{
            date: date,
            minutes: Math.round(minutes * 100) / 100,
            hours: Math.round((minutes / 60) * 100) / 100
        };
    });

    analyticsData.sort(function(a, b){
        return new Date(a.date) - new Date(b.date);
    });

    return analyticsData;

}

function getWeekStartDate(offset){
    if(typeof offset === "undefined") offset = 0;

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
    }else if(offset === -1){
        return "Next Week";
    }else if(offset < -1){
        return Math.abs(offset) + ' Week Ago';
    }else{
        return offset + ' Week Ahead';
    }
}


function updateWeekControllers(){
    const currentWeekElement = document.getElementById("currentWeek");
    const nextWeekButton = document.getElementById("nextWeek");
    const lastWeekButton = document.getElementById("lastWeek");

    if(currentWeekElement){
        currentWeekElement.textContent = formatWeekDisplay(currentWeekOffset);
    }

    if(nextWeekButton){
        if(currentWeekElement >= 0){
            nextWeekButton.style.opacity = "0.5";
            nextWeekButton.style.pointerEvents = "none";
            nextWeekButton.style.cursor = "not-allowed";
        }else{
            nextWeekButton.style.opacity = "1";
            nextWeekButton.style.pointerEvents = "auto";
            nextWeekButton.style.cursor = "pointer";
        }
    }

    if(lastWeekButton){
        lastWeekButton.style.opacity = "1";
        lastWeekButton.style.pointerEvents = "auto";
        lastWeekButton.style.cursor = "pointer";
    }
}

function createGraph(){
    const container = document.getElementById("graphContainer");
    if(!container){
        console.error("Graph container not found");
        return;
    }

    taskData = fetchLocalStorageData();
    console.log("Creating graph with data:", taskData);

    const controls = buildControls();
    const graph = document.createElement("div");
    graph.className = "analytics-graph";

    container.innerHTML = "";
    container.appendChild(controls);
    container.appendChild(graph);

    renderGraph(graph);
    updateWeekControllers();

}

function buildControls(){
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

        <div class="week-controller">
            <a href="#" id="lastWeek">
                <i class='fas fa-arrow-alt-circle-left'></i>
            </a>
            <div class="current-week" id="currentWeek">
                This Week
            </div>
            <a href="#" id="nextWeek">
                <i class='fas fa-arrow-alt-circle-right'></i>
            </a>
        </div>
    `;

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");
    const gridToggle = controls.querySelector("#gridToggle");
    const borderToggle = controls.querySelector("#borderToggle");
    const colorModeSelect = controls.querySelector('#colorMode');

    timePeriodSelect.value = GRAPH_SETTINGS.period;
    timeUnitSelect.value = GRAPH_SETTINGS.timeUnit;
    gridToggle.checked = GRAPH_SETTINGS.showBarBorders;
    borderToggle.ch
}