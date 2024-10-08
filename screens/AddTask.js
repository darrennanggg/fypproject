import moment from 'moment';
import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FontAwesome, FontAwesome5, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import TaskTitleInput from '../components/taskTitleInput.js';
import DropDownPicker from 'react-native-dropdown-picker';
import DateSelectionModal from '../components/dateSelectionModal.js';
import Subtask from '../components/subtask.js';
import AttachmentComponent from '../components/attachmentComponent.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, firebaseDB } from '../firebaseConfig.js';

const AddTask = ({ navigation }) => {
    const { taskList, setTaskList,
        taskList_stateFilter, setTaskList_stateFilter,
        taskList_dateFilter, setTaskList_dateFilter,
        taskList_priorityFilter, setTaskList_priorityFilter,
        taskList_categoryFilter, setTaskList_categoryFilter,
        taskList_iconFilter, setTaskList_iconFilter, taskEditState, setTaskEditState,
        taskItemForScreen, 
    } = useContext(Context);

    const tabBarHeight = useBottomTabBarHeight();

    const userProfile = auth.currentUser;

    const titleInputRef = useRef();

    const [title, setInputTitle] = useState(null);

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);

    const [categoryValue, setCategoryValue] = useState(null);
    const [priorityValue, setPriorityValue] = useState(null);
    const [notifyValue, setNotifyValue] = useState(null);

    const [calendarModalVisible, setCalendarModalVisible] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    const startDate = selectedStartDate ? selectedStartDate.toString() : '';
    const endDate = selectedEndDate ? selectedEndDate.toString() : '';

    const [subtask, setSubtask] = useState([]);
    const [subtaskList, setSubtaskList] = useState([]);

    const [image, setImage] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);

    const [categoryItems, setCategoryItems] = useState([
        { label: '-None-', value: null },
        { label: 'Work', value: 'Work' },
        { label: 'Household', value: 'Household' },
        { label: 'Health', value: 'Health' },
        { label: 'School', value: 'School' },
        { label: 'Hobbies', value: 'Hobbies' },
        { label: 'Habits', value: 'Habits' },
        { label: 'Miscellaneous', value: 'Miscellaneous' }
    ]);

    const [priorityItems, setPriorityItems] = useState([
        { label: '-None-', value: null, icon: null },
        { label: 'High', value: 'High', icon: () => <MaterialCommunityIcons name="square" size={22} color={"crimson"} /> },
        { label: 'Medium', value: 'Medium', icon: () => <MaterialCommunityIcons name="square" size={22} color={"gold"} /> },
        { label: 'Low', value: 'Low', icon: () => <MaterialCommunityIcons name="square" size={22} color={"forestgreen"} /> }
    ]);

    const [notifyItems, setNotifyItems] = useState([
        { label: '-None-', value: null },
        { label: '1 day before', value: '1 day' },
        { label: '2 days before', value: '2 day' },
        { label: '3 days before', value: '3 day' },
        { label: '1 week before', value: '1 week' },
        { label: '2 weeks before', value: '2 week' }
    ]);

    // fill form with data when edit state is true
    useEffect(() => {
        if (taskEditState) {
            setInputTitle(taskItemForScreen.title);
            setSelectedStartDate(taskItemForScreen.startDate);
            setSelectedEndDate(taskItemForScreen.endDate);
            setCategoryValue(taskItemForScreen.category);
            setPriorityValue(taskItemForScreen.priority);
            setNotifyValue(taskItemForScreen.notify);
            setSubtaskList(taskItemForScreen.subtask);
            setImageList(taskItemForScreen.images);
            setFileList(taskItemForScreen.files);
        }
        else {
            cancelAddNewTask();
        }
    }, [taskEditState])

    useFocusEffect(
        useCallback(() => {
            // Do something when the screen is focused

            return () => {
                // Do something when the screen is not focused
                // when leaving the screen, set edit state to false
                setTaskEditState(false);
            };
        }, [])
    );

    // unfocus task title text input
    const unfocusTextInput = () => {
        titleInputRef.current.blur();
    }

    //close other dropdowns when category dropdown is open
    const onCategoryOpen = useCallback(() => {
        unfocusTextInput();

        setPriorityOpen(false);
        setIconOpen(false);
        setNotifyOpen(false);
    }, []);

    //close other dropdowns when priority dropdown is open
    const onPriorityOpen = useCallback(() => {
        unfocusTextInput();

        setCategoryOpen(false);
        setIconOpen(false);
        setNotifyOpen(false);
    }, []);

    //close other dropdowns when icon dropdown is open
    const onIconOpen = useCallback(() => {
        unfocusTextInput();

        setCategoryOpen(false);
        setPriorityOpen(false);
        setNotifyOpen(false);
    }, []);

    //close other dropdowns when notify dropdown is open
    const onNotifyOpen = useCallback(() => {
        unfocusTextInput();

        setCategoryOpen(false);
        setPriorityOpen(false);
        setIconOpen(false);
    }, []);

    // filter the task data by date by default, and set it into the date filter state
    const filterDataByState = async (task_data) => {
        // copy task list to new const
        const stateFilter = [...taskList_stateFilter];
        // push into incomplete task by default
        stateFilter[1].data.push(task_data);
        // set to state filter
        setTaskList_stateFilter(stateFilter);
        // Add a new document in collection "IncompleteFilter"
        await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", "Incomplete", "IncompleteFilter", task_data.title), task_data);
    }

    const filterDataByDate = async (task_data) => {
        // Get current date
        const todayDate = new Date();
        const todayDate_formatted = moment(todayDate).format('YYYY-MM-DD');
        // Task end date
        const taskEndDate_formatted = moment(task_data.endDate, 'Do MMM YYYY').format('YYYY-MM-DD');

        // copy task list to new const
        const dateFilter = [...taskList_dateFilter];

        // if today date == task end date, categorize it under 'Today' section
        if (todayDate_formatted == taskEndDate_formatted) {
            dateFilter[0].data.push(task_data);

            // Add a new document in collection "todayFilter"
            await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Today", "TodayFilter", task_data.title), task_data);
        }
        // if task end date is not today
        else if (moment(taskEndDate_formatted).isAfter(todayDate_formatted)) {
            // if task end date subtract 1 day == today date, categorize it under 'Tomorrow' section
            if (moment(taskEndDate_formatted).subtract(1, 'days').format('YYYY-MM-DD') == todayDate_formatted) {
                dateFilter[1].data.push(task_data);

                // Add a new document in collection "tomorrowFilter"
                await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Tomorrow", "TomorrowFilter", task_data.title), task_data);
            }
            // categorize everything else under 'Upcoming' section
            else {
                dateFilter[2].data.push(task_data);

                // Add a new document in collection "upcomingFilter"
                await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Upcoming", "UpcomingFilter", task_data.title), task_data);
            }
        }
        // if today's date is after task end date (Overdue)
        else if (moment(todayDate_formatted).isAfter(taskEndDate_formatted)) {
            dateFilter[3].data.push(task_data);

            // Add a new document in collection "overdueFilter"
            await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Overdue", "OverdueFilter", task_data.title), task_data);
        }

        setTaskList_dateFilter(dateFilter);
    }

    // filter tasks by the filterType parsed in
    const filterTasks = (task_data, filterType, filterData, setFilterData, mainCollection) => {
        const tempArray = [...filterData];

        tempArray.map(async (taskItem) => {
            if (filterType == taskItem.header) {
                tempArray[taskItem.id].data.push(task_data);
                // add a new document into the respective collection
                const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, taskItem.header, taskItem.header + "Filter", task_data.title);
                await setDoc((docRef), task_data);
            }
        })

        setFilterData(tempArray);
    }

    // removes old task data from arrays
    const deleteFromArrays = (filterData, setFilterData, mainCollection) => {
        const tempArray = [...filterData];

        tempArray.map((taskItem, taskItemIndex) => {
            taskItem.data.map(async (task, taskIndex) => {
                if (task.title == taskItemForScreen.title) {
                    tempArray[taskItemIndex].data.splice(taskIndex, 1);
                    // delete the document, by referencing with the document id (which is the original task title)
                    const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, taskItem.header, taskItem.header + "Filter", taskItemForScreen.title);
                    await deleteDoc(docRef);
                }
            })
        })

        setFilterData(tempArray);
    }

    // add new task to task list, and display it on task screen
    const addNewTask = async () => {
        //make a copy of task list
        const tempArray = [...taskList];

        // save data to push as variable
        var taskData = {
            title: title,
            startDate: startDate,
            endDate: endDate,
            category: categoryValue,
            priority: priorityValue,
            notify: notifyValue,
            subtask: subtaskList,
            images: imageList,
            files: fileList,
            complete: false
        }

        // if edit state is true, allow changes to the task data
        if (taskEditState) {
            tempArray.map((taskItem) => {
                // locate the correct task by title
                if (taskItem.title == taskItemForScreen.title) {
                    taskItem.title = title;
                    taskItem.endDate = startDate;
                    taskItem.endDate = endDate;
                    taskItem.category = categoryValue;
                    taskItem.priority = priorityValue;
                    taskItem.notify = notifyValue;
                    taskItem.subtask = subtaskList;
                    taskItem.images = imageList;
                    taskItem.files = fileList;
                    taskItem.complete = false;
                }
            })

            // set task list to be the tempArray
            setTaskList(tempArray);

            // remove old data from the arrays
            deleteFromArrays(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
            deleteFromArrays(taskList_dateFilter, setTaskList_dateFilter, "taskList_dateFilter");
            deleteFromArrays(taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
            deleteFromArrays(taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
            deleteFromArrays(taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");

            // filter data and set it into different state arrays
            // these are used when filtering tasks
            filterDataByState(taskData);
            filterDataByDate(taskData);
            filterTasks(taskData, taskData.priority, taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
            filterTasks(taskData, taskData.category, taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
            filterTasks(taskData, taskData.icon, taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");

            //navigates to task screen after task added
            navigation.navigate("Task");

            // clears and reset all input after task is added
            cancelAddNewTask();

            setTaskEditState(false);
        }
        // else continue adding the task to list
        else {
            // get list of task titles
            const taskTitles = [];
            tempArray.map((item) => {
                taskTitles.push(item.title);
            })

            // if no task title alert user
            if (title == "") {
                alert("Enter task title");
            }
            // dont allow same task title for locating the correct task to mark as complete, edit, delete etc.
            else if (taskTitles.includes(title)) {
                alert("Task with same title exists. Enter a new task title")
            }
            // if no task end date alert user
            else if (endDate == "" || endDate == "Invalid date") {
                alert("Select date range for task");
            }
            else {
                // push task data into temp array
                tempArray.push(taskData);

                // set task list to be the tempArray
                setTaskList(tempArray);

                // filter data and set it into different state arrays
                // these are used when filtering tasks
                filterDataByState(taskData);
                filterDataByDate(taskData);
                filterTasks(taskData, taskData.priority, taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
                filterTasks(taskData, taskData.category, taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
                filterTasks(taskData, taskData.icon, taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");

                //navigates to task screen after task is added
                navigation.navigate("Task");

                // clears and reset all input after task is added
                cancelAddNewTask();
            }
        }
    }

    // cancel add new task
    const cancelAddNewTask = () => {
        // clears and reset all input
        setInputTitle(null)
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setCategoryValue(null);
        setPriorityValue(null);
        setNotifyValue(null);
        setSubtaskList([]);
        setImageList([]);
        setFileList([]);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: TintCol() }}>
            <ScrollView style={[styles.container, { marginBottom: tabBarHeight + 25 }]}>
                {/* ENTER TASK TITLE */}
                <TaskTitleInput
                    titleInputRef={titleInputRef}
                    setInputTitle={setInputTitle}
                    title={title} />

                {/* SELECT DATE RANGE */}
                <DateSelectionModal
                    calendarModalVisible={calendarModalVisible}
                    setCalendarModalVisible={setCalendarModalVisible}
                    setSelectedStartDate={setSelectedStartDate}
                    setSelectedEndDate={setSelectedEndDate}
                    startDate={startDate}
                    endDate={endDate}
                />

                {/* SELECT CATEGORY */}
                <DropDownPicker
                    listMode="SCROLLVIEW"
                    zIndex={3000}
                    zIndexInverse={1000}
                    open={categoryOpen}
                    value={categoryValue}
                    items={categoryItems}
                    setOpen={setCategoryOpen}
                    setValue={setCategoryValue}
                    setItems={setCategoryItems}
                    onOpen={onCategoryOpen}
                    placeholder="Select a category..."
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={{ fontSize: 16, color: BackgroundCol() }}
                    labelStyle={{ fontWeight: "bold" }}
                    ArrowUpIconComponent={({ style }) =>
                        <Octicons name="triangle-up" size={32} color={BackgroundCol()} />
                    }
                    ArrowDownIconComponent={({ style }) =>
                        <Octicons name="triangle-down" size={32} color={BackgroundCol()} />
                    }
                    TickIconComponent={({ style }) =>
                        <FontAwesome5 name="check" size={20} color={TintCol()} />
                    }
                    dropDownContainerStyle={[styles.dropdownContainer,
                    { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                    listItemLabelStyle={{ color: BackgroundCol() }}
                    selectedItemContainerStyle={{ backgroundColor: BackgroundCol() }}
                    selectedItemLabelStyle={{ color: TintCol(), fontWeight: "bold" }}
                    style={[styles.dropdownPicker, { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                />

                <View style={{zIndex: 2000, zIndexInverse: 2000 }}>
                        {/* SELECT PRIORITY */}
                        <DropDownPicker
                            listMode="SCROLLVIEW"
                            zIndex={2000}
                            zIndexInverse={2000}
                            open={priorityOpen}
                            value={priorityValue}
                            items={priorityItems}
                            setOpen={setPriorityOpen}
                            setValue={setPriorityValue}
                            setItems={setPriorityItems}
                            onOpen={onPriorityOpen}
                            placeholder="Priority..."
                            placeholderStyle={styles.dropdownPlaceholder}
                            textStyle={{ fontSize: 16, color: BackgroundCol() }}
                            labelStyle={{ fontWeight: "bold" }}
                            ArrowUpIconComponent={({ style }) =>
                                <Octicons name="triangle-up" size={32} color={BackgroundCol()} />
                            }
                            ArrowDownIconComponent={({ style }) =>
                                <Octicons name="triangle-down" size={32} color={BackgroundCol()} />
                            }
                            TickIconComponent={({ style }) =>
                                <FontAwesome5 name="check" size={20} color={TintCol()} />
                            }
                            dropDownContainerStyle={[styles.dropdownContainer,
                            { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                            listItemLabelStyle={{ color: BackgroundCol() }}
                            selectedItemContainerStyle={{ backgroundColor: BackgroundCol() }}
                            selectedItemLabelStyle={{ color: TintCol(), fontWeight: "bold" }}
                            style={[styles.dropdownPicker, { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                        />
                </View>

                {/* SELECT NOTIFY TIME */}
                <DropDownPicker
                    listMode="SCROLLVIEW"
                    zIndex={1000}
                    zIndexInverse={3000}
                    open={notifyOpen}
                    value={notifyValue}
                    items={notifyItems}
                    setOpen={setNotifyOpen}
                    setValue={setNotifyValue}
                    setItems={setNotifyItems}
                    onOpen={onNotifyOpen}
                    placeholder="Notify..."
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={{ fontSize: 16, color: BackgroundCol() }}
                    labelStyle={{ fontWeight: "bold" }}
                    ArrowUpIconComponent={({ style }) =>
                        <Octicons name="triangle-up" size={32} color={BackgroundCol()} />
                    }
                    ArrowDownIconComponent={({ style }) =>
                        <Octicons name="triangle-down" size={32} color={BackgroundCol()} />
                    }
                    TickIconComponent={({ style }) =>
                        <FontAwesome5 name="check" size={20} color={TintCol()} />
                    }
                    dropDownContainerStyle={[styles.dropdownContainer,
                    { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                    listItemLabelStyle={{ color: BackgroundCol() }}
                    selectedItemContainerStyle={{ backgroundColor: BackgroundCol() }}
                    selectedItemLabelStyle={{ color: TintCol(), fontWeight: "bold" }}
                    style={[styles.dropdownPicker, { backgroundColor: TintCol(), borderColor: BackgroundCol() }]}
                />

                {/* SUBTASK */}
                <Subtask
                    subtaskList={subtaskList}
                    setSubtaskList={setSubtaskList}
                    subtask={subtask}
                    setSubtask={setSubtask}
                />


                {/* ATTACHMENTS */}
                <AttachmentComponent
                    image={image}
                    setImage={setImage}
                    imageList={imageList}
                    setImageList={setImageList}
                    file={file}
                    setFile={setFile}
                    fileList={fileList}
                    setFileList={setFileList}
                />

                {/* BUTTONS */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: "5%" }}>
                    {/* CANCEL ADD NEW TASK BUTTON */}
                    <TouchableOpacity onPress={() => { cancelAddNewTask() }}
                        style={styles.cancelAddNewTaskButton}>
                        <FontAwesome name="remove" size={28} color={"crimson"} />
                    </TouchableOpacity>
                    {/* ADD NEW TASK BUTTON */}
                    <TouchableOpacity onPress={() => { addNewTask() }}
                        style={styles.addNewTaskButton}>
                        <FontAwesome5 name="check" size={28} color={"green"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
};

export default AddTask;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: "13%",
        marginHorizontal: "3%"
    },
    dropdownPicker: {
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: "3%",
    },
    dropdownPlaceholder: {
        color: "lightgrey",
        fontSize: 16,
    },
    dropdownContainer: {
        borderWidth: 2,
        borderTopWidth: 1,
    },
    cancelAddNewTaskButton: {
        width: 50,
        height: 50,
        borderWidth: 3,
        borderRadius: 25,
        borderColor: "crimson",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: "3%",
    },
    addNewTaskButton: {
        width: 50,
        height: 50,
        borderWidth: 3,
        borderRadius: 25,
        borderColor: "green",
        justifyContent: 'center',
        alignItems: 'center',
    },

});