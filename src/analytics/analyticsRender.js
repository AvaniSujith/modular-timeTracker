import{
    generateDateRange,
    getMaxTime,
    normalizedMaxTime,
    generateYAxisLabels,
    generateColors,
    formatDateLabel
} from './analyticsUtils.js';

import{ 
    getGraphSettings, 
    getCurrentWeekOffset,
    getTaskData
} from './analyticsCore.js';

function renderGraph(graph){
    if(!graph) return;

    graph.innerHTML = "";

    const GRAPH_SETTINGS = getGraphSettings();
    const currentWeekOffset = getCurrentWeekOffset();
    const taskData = getTaskData();

    const dateRange = generateDateRange(GRAPH_SETTINGS.period, currentWeekOffset);

    const dataMap = new Map();
    taskData.forEach(function(entry){
        dataMap.set(entry.date, entry);
    });

    const completeData = dateRange.map(function(date){
        return dataMap.get(date) || {
            date: date,
            minutes: 0,
            hours: 0
        };
    });

    if(completeData.length === 0){
        graph.innerHTML = '<div class="no-data">No data Available</div>';
        return;
    }

    const maxTime = getMaxTime(completeData);
    const normalizedMax = normalizedMaxTime(maxTime, GRAPH_SETTINGS.timeUnit);
    const yLabels = generateYAxisLabels(normalizedMax, GRAPH_SETTINGS.timeUnit);

    const histogramContainer = document.createElement("div");
    histogramContainer.className = "histogram-container";

    const yAxis = createYAxis(yLabels);
    const { chartArea, xAxis } = createChartAndXAxis(completeData, normalizedMax);

    const rightSection = document.createElement("div");
    rightSection.className = "right-section";
    rightSection.appendChild(chartArea);
    rightSection.appendChild(xAxis);

    histogramContainer.appendChild(yAxis);
    histogramContainer.appendChild(rightSection);
    graph.appendChild(histogramContainer);

}

function createYAxis(yLabels) {
    const yAxis = document.createElement("div");
    yAxis.className = "y-axis";

    const reversedYLabels = yLabels.slice().reverse();
    reversedYLabels.forEach(function(label) {
        const yLabel = document.createElement("div");
        yLabel.className = 'y-axis-label';
        yLabel.textContent = label;
        yAxis.appendChild(yLabel);
    });

    return yAxis;
}

function createChartAndXAxis(completeData, normalizedMax) {
    const GRAPH_SETTINGS = getGraphSettings();
    
    const chartArea = document.createElement("div");
    chartArea.className = 'chart-area';
    if (GRAPH_SETTINGS.showGridLines) {
        chartArea.classList.add('show-grid');
    }

    const barWidth = Math.max(20, Math.min(60, 600 / completeData.length));
    const distinctColors = generateColors(completeData.length);

    completeData.forEach(function(entry, index) {
        const barContainer = document.createElement("div");
        barContainer.className = "bar-container";
        barContainer.style.width = barWidth + 'px';

        const bar = createBar(entry, index, normalizedMax, distinctColors, barWidth);
        barContainer.appendChild(bar);
        chartArea.appendChild(barContainer);
    });

    const xAxis = createXAxis(completeData, barWidth);

    return { chartArea, xAxis };
}

function createBar(entry, index, normalizedMax, distinctColors, barWidth) {
    const GRAPH_SETTINGS = getGraphSettings();
    
    const bar = document.createElement("div");
    bar.className = 'histogram-bar';
    if (GRAPH_SETTINGS.showBarBorders) {
        bar.classList.add('show-border');
    }

    const timeValue = GRAPH_SETTINGS.timeUnit === "hours" ? entry.minutes : entry.minutes;
    const barHeight = normalizedMax > 0 ? (timeValue / normalizedMax) * 100 : 0;

    bar.style.height = barHeight + '%';
    bar.dataset.height = barHeight > 0 ? barHeight.toString() : "0";

    if(barHeight > 0){
        const color = GRAPH_SETTINGS.colorMode === "distinct" ? distinctColors[index] : "#4CAF50";
        bar.style.backgroundColor = color;
        bar.dataset.originalColor = color;
    }else{
        bar.style.backgroundColor = "#f0f0f0";
    }

    const timeDisplay = GRAPH_SETTINGS.timeUnit === "hours" ? 
        entry.hours.toFixed(1) + 'h' : entry.minutes + 'm';
    bar.dataset.tooltip = formatDateLabel(entry.date, GRAPH_SETTINGS.period) + ': ' + timeDisplay;

    return bar;
}

function createXAxis(completeData, barWidth) {
    const GRAPH_SETTINGS = getGraphSettings();
    
    const xAxis = document.createElement("div");
    xAxis.className = "x-axis";

    completeData.forEach(function(entry, index) {
        const xLabel = document.createElement("div");
        xLabel.className = "x-axis-label";
        xLabel.style.width = barWidth + 'px';
        xLabel.textContent = formatDateLabel(entry.date, GRAPH_SETTINGS.period);
        xAxis.appendChild(xLabel);
    });

    return xAxis;
}

export {
    renderGraph
};