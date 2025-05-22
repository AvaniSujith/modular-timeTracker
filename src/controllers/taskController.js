import * as taskService from '../services/taskService.js';
import * as taskView from '../views/taskView.js';

function renderTables(){
    const tasks = taskService.getTasks();
    const paused = tasks.filter(t => t.status === 'paused');
    const completed = tasks.filter(t => t.status === 'completed');

    taskView.renderPausedTable(paused, handleMoreClick);
    taskView.renderCompletedTable(completed, handleMoreClick);
}


function handleMoreClick(taskId){
    const task = taskService.getTaskById(taskId);

    taskView.showDetailsModal(task, {
        resume: () => {
            taskService.resumeTask(taskId);
            renderTables();
        },
        edit : (updatedData) => {
            taskService.updateTask(taskId);
            renderTables();
        },
        complete : () => {
            taskService.completeTask(taskId);
            renderTables();
        },
        del : () => {
            taskService.deleteTask(taskId);
            renderTables();
        }
    });
}

export function initTaskController() {
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        taskView.showNewTaskModal((formData) => {
            taskService.addTask(formData);
            renderTables();
        });
    });

    renderTables();

}

