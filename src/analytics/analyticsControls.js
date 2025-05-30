import { formatWeekDisplay, generateColors, getWeekRangeDays, getMonthRangeDates, getWeekStartDate } from "./analyticsUtils.js";
import { getGraphSettings, getCurrentWeekOffset, setCurrentWeekOffset, GRAPH_SETTINGS } from "./analyticsCore.js";
import { renderGraph } from "./analyticsRender.js";

function buildControls(){

    const { sundayDay, saturdayDay} = getWeekRangeDays();

    const controls = document.createElement("div");
    controls.className = "analytics-controls";
    controls.innerHTML = `
        <div class="controls-section">
            <label for="timePeriod">Period:</label>
            <select id="timePeriod">
                <option value="1week">1 Week</option>
                <option value="2week">2 Weeks</option>
                <option value="1month">1 Month</option>
            </select>

            <label for="timeUnit">Unit:</label>
            <select id="timeUnit">
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
            </select>

            <div class="toggles">

                <label for="colorMode">Colors:</label>
                <select id="colorMode">
                    <option value="single">Same Color</option>
                    <option value="distinct">Distinct Colors</option>
                </select>

                <label class="toggle-container">
                    <input type="checkbox" id="gridToggle" checked>
                    <span class="toggle-label">Grid Lines</span>
                </label>

                <label class="toggle-container">
                    <input type="checkbox" id="borderToggle" checked>
                    <span class="toggle-label">Bar Border</span>
                </label>

            </div>

        </div>

       

        <div class="week-controller">
            <a href="#" id="lastWeek">
                <i class='fas fa-arrow-alt-circle-left'></i>
            </a>
            <div class="current-week" id="currentWeek">
                This Week ${sundayDay} - ${saturdayDay}
            </div>
            <a href="#" id="nextWeek">
                <i class='fas fa-arrow-alt-circle-right'></i>
            </a>
        </div>
    `;

    const GRAPH_SETTINGS = getGraphSettings();

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");
    const gridToggle = controls.querySelector("#gridToggle");
    const borderToggle = controls.querySelector("#borderToggle");
    const colorModeSelect = controls.querySelector('#colorMode');

    timePeriodSelect.value = GRAPH_SETTINGS.period;
    timeUnitSelect.value = GRAPH_SETTINGS.timeUnit;
    gridToggle.checked = GRAPH_SETTINGS.showGridLines;
    borderToggle.checked = GRAPH_SETTINGS.showBarBorders;
    colorModeSelect.value = GRAPH_SETTINGS.colorMode;

    setupControlEventListeners(controls);
    updateWeekControllers();

    return controls;
}

function setupControlEventListeners(controls){
    const GRAPH_SETTINGS = getGraphSettings();

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");
    const gridToggle = controls.querySelector("#gridToggle");
    const borderToggle = controls.querySelector('#borderToggle');
    const colorModeSelect = controls.querySelector('#colorMode');
    const lastWeekButton = controls.querySelector("#lastWeek");
    const nextWeekButton = controls.querySelector('#nextWeek');

    timePeriodSelect.addEventListener("change", function(event){
        GRAPH_SETTINGS.period = event.target.value;
        setCurrentWeekOffset(0);
        renderGraph(document.querySelector(".analytics-graph"));
        updateWeekControllers();
    });

    timeUnitSelect.addEventListener("change", function(event){
        GRAPH_SETTINGS.timeUnit = event.target.value;
        renderGraph(document.querySelector(".analytics-graph"));
    });

    gridToggle.addEventListener("change", function(event){
        GRAPH_SETTINGS.showGridLines = event.target.checked;
        toggleGridLines(event.target.checked);
    });

    borderToggle.addEventListener("change", function(event){
        GRAPH_SETTINGS.showBarBorders = event.target.checked;
        toggleBarBorders(event.target.checked);
    });

    colorModeSelect.addEventListener("change", function(event){
        GRAPH_SETTINGS.colorMode = event.target.value;
        updateBarColors();
    });

    lastWeekButton.addEventListener("click", function(event){
        event.preventDefault();
        const GRAPH_SETTINGS = getGraphSettings();
        if (GRAPH_SETTINGS.period === "1month") {
            setCurrentWeekOffset(getCurrentWeekOffset() - 1); 
        } else {
            setCurrentWeekOffset(getCurrentWeekOffset() - 1);
        }
        renderGraph(document.querySelector(".analytics-graph"));
        updateWeekControllers();
    });

    nextWeekButton.addEventListener("click", function(event){
        event.preventDefault();
        const currentOffset = getCurrentWeekOffset();
        const GRAPH_SETTINGS = getGraphSettings();
        if (currentOffset < 0) {
            if (GRAPH_SETTINGS.period === "1month") {
                setCurrentWeekOffset(currentOffset + 1); 
            } else {
                setCurrentWeekOffset(currentOffset + 1);
            }
            renderGraph(document.querySelector(".analytics-graph"));
            updateWeekControllers();
        }
    });

}

function updateWeekControllers() {
    const currentWeekElement = document.getElementById("currentWeek");
    const nextWeekButton = document.getElementById("nextWeek");
    const lastWeekButton = document.getElementById("lastWeek");
    const currentWeekOffset = getCurrentWeekOffset();
    const GRAPH_SETTINGS = getGraphSettings();

    console.log("updateWeekControllers called");
    console.log("currentWeekOffset:", currentWeekOffset);
    console.log("GRAPH_SETTINGS.period:", GRAPH_SETTINGS.period);

    if (currentWeekElement) {
        if (GRAPH_SETTINGS.period === "1month") {
            const { startDate, endDate } = getMonthRangeDates(currentWeekOffset);
            const options = { year: 'numeric', month: 'long' };
            const formattedStartDate = startDate.toLocaleDateString('en-US', options);
            currentWeekElement.textContent = formattedStartDate;
            console.log("Month range:", formattedStartDate);
        } else { 
            const options = { month: 'short', day: 'numeric' };
            if (currentWeekOffset === 0) {
                const startDate = getWeekStartDate(currentWeekOffset);
                let endDate = new Date(startDate);
                let formattedEndDate;

                if (GRAPH_SETTINGS.period === "2week") {
                    endDate.setDate(startDate.getDate() + 13);
                    formattedEndDate = endDate.toLocaleDateString('en-US', options);
                    const formattedStartDate = startDate.toLocaleDateString('en-US', options);
                    currentWeekElement.textContent = `${formattedStartDate} - ${formattedEndDate}`;
                    console.log("Current 2-Week range:", `${formattedStartDate} - ${formattedEndDate}`);
                } else { 
                    const { sundayDay, saturdayDay } = getWeekRangeDays();
                    currentWeekElement.textContent = `This Week ${sundayDay} - ${saturdayDay}`;
                    console.log("Current 1-Week display:", `This Week ${sundayDay} - ${saturdayDay}`);
                }
            } else {
                const startDate = getWeekStartDate(currentWeekOffset);
                let endDate = new Date(startDate);
                let formattedEndDate;

                const formattedStartDate = startDate.toLocaleDateString('en-US', options);

                if (GRAPH_SETTINGS.period === "2week") {
                    endDate.setDate(startDate.getDate() + 13); 
                    formattedEndDate = endDate.toLocaleDateString('en-US', options);
                    currentWeekElement.textContent = `${formattedStartDate} - ${formattedEndDate}`;
                    console.log("Navigated 2-Week range:", `${formattedStartDate} - ${formattedEndDate}`);
                } else { 
                    endDate.setDate(startDate.getDate() + 6); 
                    formattedEndDate = endDate.toLocaleDateString('en-US', options);
                    currentWeekElement.textContent = `${formattedStartDate} - ${formattedEndDate}`;
                    console.log("Navigated 1-Week range:", `${formattedStartDate} - ${formattedEndDate}`);
                }

                console.log("Week startDate:", startDate);
                console.log("Week endDate:", endDate);
            }
        }
    }

    if (nextWeekButton) {
        console.log("nextWeekButton current opacity:", nextWeekButton.style.opacity);
        console.log("nextWeekButton current pointerEvents:", nextWeekButton.style.pointerEvents);
        console.log("nextWeekButton current cursor:", nextWeekButton.style.cursor);
        if (currentWeekOffset >= 0) {
            nextWeekButton.style.opacity = "0.5";
            nextWeekButton.style.pointerEvents = "none";
            nextWeekButton.style.cursor = "not-allowed";
            console.log("nextWeekButton disabled");
        } else {
            nextWeekButton.style.opacity = "1";
            nextWeekButton.style.pointerEvents = "auto";
            nextWeekButton.style.cursor = "pointer";
            console.log("nextWeekButton enabled");
        }
    }

    if (lastWeekButton) {
        lastWeekButton.style.opacity = "1";
        lastWeekButton.style.pointerEvents = "auto";
        lastWeekButton.style.cursor = "pointer";
        console.log("lastWeekButton enabled");
    }
}

function toggleGridLines(show) {
    const chartArea = document.querySelector('.chart-area');
    if(chartArea){
        if (show) {
            chartArea.classList.add('show-grid');
        } else {
            chartArea.classList.remove('show-grid');
        }
    }
}

function toggleBarBorders(show) {
    const bars = document.querySelectorAll('.histogram-bar');
    bars.forEach(function(bar) {
        if (show) {
            bar.classList.add('show-border');
        } else {
            bar.classList.remove('show-border');
        }
    });
}

function updateBarColors() {
    const bars = document.querySelectorAll('.histogram-bar');
    const GRAPH_SETTINGS = getGraphSettings();
    // const { generateColors } = require('./analyticsUtils.js');

    const colors = GRAPH_SETTINGS.colorMode === "distinct"
        ? generateColors(bars.length)
        : ["#b08aa7"];

    bars.forEach(function(bar, index) {
        const isEmpty = bar.dataset.height === '0';
        if(isEmpty){
            bar.style.backgroundColor = "#f0f0f0";
        }else{
            const color = GRAPH_SETTINGS.colorMode === "distinct"
                ? colors[index]
                : colors[0];

            bar.style.backgroundColor = color;
            bar.dataset.originalColor = color;
        }
    });
}

export {
    buildControls,
    updateWeekControllers,
    toggleGridLines,
    toggleBarBorders,
    updateBarColors
};
