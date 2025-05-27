import { formatWeekDisplay, generateColors } from "./analyticsUtils.js";
import { getGraphSettings, getCurrentWeekOffset, setCurrentWeekOffset } from "./analyticsCore.js";
import { renderGraph } from "./analyticsRender.js";

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

    const GRAPH_SETTINGS = getGraphSettings();

    const timePeriodSelect = controls.querySelector("#timePeriod");
    const timeUnitSelect = controls.querySelector("#timeUnit");
    const gridToggle = controls.querySelector("#gridToggle");
    const borderToggle = controls.querySelector("#borderToggle");
    const colorModeSelect = controls.querySelector('#colorMode');

    timePeriodSelect.value = GRAPH_SETTINGS.period;
    timeUnitSelect.value = GRAPH_SETTINGS.timeUnit;
    gridToggle.checked = GRAPH_SETTINGS.showGridLines;
    borderToggle.checkbox = GRAPH_SETTINGS.showBarBorders;
    colorModeSelect.value = GRAPH_SETTINGS.colorMode;

    setupControlEventListeners(controls);

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
        // const { renderGraph } = require('./analyticsRender.js');
        renderGraph(document.querySelector(".analytics-graph"));
    });

    timeUnitSelect.addEventListener("change", function(event){
        GRAPH_SETTINGS.timeUnit = event.target.value;
        // const { renderGraph } = require('./analyticsRender.js');
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
        setCurrentWeekOffset(getCurrentWeekOffset() - 1);
        // const { renderGraph } = require('./analyticsRender.js');
        renderGraph(document.querySelector(".analytics-graph"));
        updateWeekControllers();
    });

    nextWeekButton.addEventListener("click", function(event){
        event.preventDefault();
        const currentOffset = getCurrentWeekOffset();
        if(currentOffset < 0){
            setCurrentWeekOffset(currentOffset + 1);
            // const { renderGraph } = require('./analyticsRender.js');
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
    
    if (currentWeekElement) {
        currentWeekElement.textContent = formatWeekDisplay(currentWeekOffset);
    }
    
    if (nextWeekButton) {
        if (currentWeekOffset >= 0) {
            nextWeekButton.style.opacity = "0.5";
            nextWeekButton.style.pointerEvents = "none";
            nextWeekButton.style.cursor = "not-allowed";
        } else {
            nextWeekButton.style.opacity = "1";
            nextWeekButton.style.pointerEvents = "auto";
            nextWeekButton.style.cursor = "pointer";
        }
    }
    
    if (lastWeekButton) {
        lastWeekButton.style.opacity = "1";
        lastWeekButton.style.pointerEvents = "auto";
        lastWeekButton.style.cursor = "pointer";
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
        : ["#4caf50"];

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