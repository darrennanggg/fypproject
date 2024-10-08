import React, { useState, createContext } from 'react';

// use context to pass props in the app
export const Context = createContext();

export const Provider = ({ children }) => {
    const [ viewMode, setViewMode ] = useState("list");

    const [ taskList, setTaskList ] = useState([]);

    const [ taskList_stateFilter, setTaskList_stateFilter ] = useState([
        {id: 0, header: 'Complete', data: [] },
        {id: 1, header: 'Incomplete', data: [] },
    ]);

    const [ taskList_dateFilter, setTaskList_dateFilter ] = useState([
        {id: 0, header: 'Today', data: [] },
        {id: 1, header: 'Tomorrow', data: [] },
        {id: 2, header: 'Upcoming', data: [] },
        {id: 3, header: 'Overdue', data: [] }
    ]);

    const [ taskList_priorityFilter, setTaskList_priorityFilter ] = useState([
        {id: 0, header: 'High', data: [] },
        {id: 1, header: 'Medium', data: [] },
        {id: 2, header: 'Low', data: [] },
    ]);

    const [ taskList_categoryFilter, setTaskList_categoryFilter ] = useState([
        {id: 0, header: 'Work', data: [] },
        {id: 1, header: 'Household', data: [] },
        {id: 2, header: 'Health', data: [] },
        {id: 3, header: 'School', data: [] },
        {id: 4, header: 'Hobbies', data: [] },
        {id: 5, header: 'Habits', data: [] },
        {id: 6, header: 'Miscellaneous', data: [] },
    ]);

    const [ taskList_iconFilter, setTaskList_iconFilter ] = useState([]);

    // show task via filter
    const [ showTask, setShowTask ] = useState(taskList_dateFilter);
    
    // task editing staes
    const [ taskEditState, setTaskEditState ] = useState(false);

    // delete task states
    const [ taskDeleteState, setTaskDeleteState ] = useState(false);
    // single deletion of tasks
    const [ taskDeleteState_single, setTaskDeleteState_single ] = useState(false);
    // selected items to delete
    const [ deleteTaskItems, setDeleteTaskItems ] = useState([]);

    // filter checkbox
    const [filterCheckbox, setFilterCheckbox ] = useState([
        { id: 1, header: "Show Tasks by Date", mode: "Date", checked: true,
          sub: [
            {id: 0, header: "Today",  checked: true},
            {id: 1, header: "Tomorrow",  checked: true},
            {id: 2, header: "Upcoming",  checked: true},
            {id: 3, header: "Overdue",  checked: true},
          ]
        },
        { id: 2, header: "Show Tasks by Priority", mode: "Priority", checked: false,
          sub: [
            {id: 0, header: "High",  checked: false},
            {id: 1, header: "Medium",  checked: false},
            {id: 2, header: "Low",  checked: false},
          ]
        },
        { id: 3, header: "Show Tasks by Category", mode: "Category", checked: false,
          sub: [
            {id: 0, header: "Work",  checked: false},
            {id: 1, header: "Household",  checked: false},
            {id: 2, header: "Health",  checked: false},
            {id: 3, header: 'School',  checked: false},
            {id: 4, header: 'Hobbies', checked: false},
            {id: 5, header: 'Habits',  checked: false},
            {id: 6, header: 'Miscellaneous',  checked: false},
          ]
        },

    ])

    const [filterMode, setFilterMode] = useState();
    const [subFilterMode, setSubFilterMode] = useState([]);

    // task data for task detail screen
    const [ taskItemForScreen, setTaskItemForScreen ] = useState();

    return (
        <Context.Provider 
            value={{ 
                viewMode, setViewMode,
                taskList, setTaskList,
                taskList_stateFilter, setTaskList_stateFilter,
                taskList_dateFilter, setTaskList_dateFilter,
                taskList_priorityFilter, setTaskList_priorityFilter,
                taskList_categoryFilter, setTaskList_categoryFilter,
                taskList_iconFilter, setTaskList_iconFilter,
                showTask, setShowTask,
                filterCheckbox, setFilterCheckbox,
                taskItemForScreen, setTaskItemForScreen,
                taskEditState, setTaskEditState,
                taskDeleteState, setTaskDeleteState,
                taskDeleteState_single, setTaskDeleteState_single,
                deleteTaskItems, setDeleteTaskItems,
                filterMode, setFilterMode,
                subFilterMode, setSubFilterMode,
            }}>
            { children }
        </Context.Provider>
    );
}
