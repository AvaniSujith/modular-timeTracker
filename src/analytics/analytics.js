import{
    fetchLocalStorageData,
    setTaskData,
    getTaskData,
    refreshAnalyticsData,
    setupStorageListener,
    convertTasksToGraphData
} from './analyticsCore.js';
import { buildControls, updateWeekControllers } from './analyticsControls.js';
import { renderGraph } from './analyticsRender.js';

export function createGraph(){
    const container = document.getElementById("graphContainer");
    if(!container) {
        console.error("Graph container not found");
        return;
    }

    const taskData = fetchLocalStorageData();
    setTaskData(taskData);

    const controls = buildControls();
    const graph = document.createElement("div");
    graph.className = "analytics-graph";

    container.innerHTML = "";
    container.appendChild(controls);
    container.appendChild(graph);

    renderGraph(graph);
    updateWeekControllers();
}

function initializeAnalytics(){
    createGraph();
    setupStorageListener();
}

function renderingGraph(graphElement, graphData){
    if(graphElement && graphData){
        setTaskData(graphData);
        renderGraph(graphElement);
    }
}

export{
    refreshAnalyticsData,
    initializeAnalytics,
    convertTasksToGraphData,
    renderGraph as renderGraphModule,
    renderingGraph as renderGraph
};