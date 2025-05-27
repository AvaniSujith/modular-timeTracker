import { loadTasks } from "../storage.js";
import { getCurrentUser } from "../services/authService.js";


const sample = [];

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


function convertTasksToGraphData(taskList){
    const dateMap = new Map();

    taskList.forEach(task => {
        task.timeFragments.forEach(fragment => {
            const data = fragment.date;
            const duration = fragment.duration;
            const [hh, mm, ss] = duration.split(":").map(Number);
            const totalSeconds = hh * 3600 + mm * 60 + ss;
            const prev = dateMap.get(date) || 0;
            dateMap.set(date, prev + totalSeconds);
        });
    });

    const result = [];
    dateMap.forEach((totalSec, date) => {
        result.push({
            date: date,
            minutes : Math.round(totalSec / 60),
            hours: parseFloat((totalSec / 3600).toFixed(2))
        });
    });
    return result;
}


function refreshAnalyticsData(){
    taskData = fetchLocalStorageData();
    const graph = document.querySelector(".analytics-graph");
    if(graph){
        const { renderGraph } = require('./analyticsRender.js');
        renderGraph(graph);
    }
}

function setupStorageListener(){
    window.addEventListener('storage', function(e){
        if(e.key && ["timer", "timerData", "tasks", "taskData", "analyticsData"].includes(e.key)){
            console.log("localStorage changed");
            refreshAnalyticsData();
        }
    });

    setInterval(function(){
        const currentDataString = JSON.stringify(taskData);
        const newData = fetchLocalStorageData();
        const newDataString = JSON.stringify(newData);

        if(currentDataString !== newDataString){
            console.log('Timer data changed');
            taskData = newData;
            const graph = document.querySelector(".analytics-graph");
            if(graph){
                const { renderGraph } = require('./analyticsRender.js');
                renderGraph(graph);
            }
        }
    }, 5000);
}

function getCurrentWeekOffset() { return currentWeekOffset; }
function setCurrentWeekOffset(offset){ currentWeekOffset = offset; }
function getTaskData(){ return taskData; }
function setTaskData(data) { taskData = data; }
function getGraphSettings() { return GRAPH_SETTINGS; }

export {
    fetchLocalStorageData,
    processTimersForAnalytics,
    convertTasksToGraphData,
    refreshAnalyticsData,
    setupStorageListener,
    getCurrentWeekOffset,
    setCurrentWeekOffset,
    getTaskData,
    setTaskData,
    getGraphSettings,
    GRAPH_SETTINGS
};
