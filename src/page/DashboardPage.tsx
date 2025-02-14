import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { debounce } from "lodash";
import { Pencil, Trash2, Save, X, ChevronDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from "../utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css"

interface Task {
    _id: string;
    taskName: string;
    status: string;
    createdAt: string;
    userId: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [taskName, setTaskName] = useState("");
    const [taskStatus, setTaskStatus] = useState("pending");

    const [isFormVisible, setIsFormVisible] = useState(false);

    // Inline editing state
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskName, setEditTaskName] = useState("");
    const [editTaskStatus, setEditTaskStatus] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/api/task?search=${search}&status=${status}&page=${page}&limit=5`,
                    {
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await res.json();

                if (data.success) {
                    setTasks(data.data);
                    setTotalPages(data.pagination.totalPages);
                } else {
                    toast.error(data.message || "Failed to fetch tasks");
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                toast.error("An error occurred while fetching tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user, search, status, page]);

    // Socket event listeners
    useEffect(() => {
        if (!user) return;

        // Listen for task creation
        socket.on("taskCreated", (newTask: Task) => {
            console.log("New task created:", newTask);
            if (newTask.userId === user._id) { // Check if the task belongs to the current user
                setTasks((prevTasks) => [newTask, ...prevTasks]);
                // toast.success("New task created!");
            }
        });

        // Listen for task updates
        socket.on("taskUpdated", (data: { task: Task; userId: string }) => {
            console.log("Task updated event received:", data);

            // Extract the task object from the nested structure
            const updatedTask = data.task;

            // Check if the updatedTask object is valid
            if (!updatedTask || !updatedTask._id) {
                console.error("Invalid task data received:", updatedTask);
                return;
            }

            // Check if the task belongs to the current user
            if (updatedTask.userId === user._id) {
                console.log("Updating task in state:", updatedTask);
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task._id.toString() === updatedTask._id.toString() ? updatedTask : task
                    )
                );
                // toast.success("Task updated!");
            }
        });

        // Listen for task deletion
        socket.on("taskDeleted", ({ taskId, userId }) => {
            console.log("Task deleted:", taskId);
            if (userId === user._id) { // Check if the task belongs to the current user
                setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
                // toast.success("Task deleted!");
            }
        });

        // Cleanup socket listeners on unmount
        return () => {
            socket.off("taskCreated");
            socket.off("taskUpdated");
            socket.off("taskDeleted");
        };
    }, [user]); // Add `user` as a dependency

    // Debounced search function
    const handleSearchChange = debounce((value: string) => {
        setSearch(value);
        setPage(1);
    }, 500);

    // Task creation
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return toast.warning("Task name is required!");

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/task/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ taskName, status: taskStatus }),
            });

            const data = await res.json();
            if (data.success) {
                setTasks([data.data, ...tasks]); // Update task list
                setTaskName(""); // Reset input
                setTaskStatus("pending");
                toast.success("Task created successfully!");
            } else {
                toast.error(data.message || "Failed to create task");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error("An error occurred while creating the task");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/task/${taskId}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setTasks(tasks.filter(task => task._id !== taskId));
                toast.success("Task deleted successfully!");
            } else {
                toast.error(data.message || "Failed to delete task");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("An error occurred while deleting the task");
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTaskId(task._id);
        setEditTaskName(task.taskName);
        setEditTaskStatus(task.status);
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditTaskName("");
        setEditTaskStatus("");
    };

    const handleUpdateTask = async (taskId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/task/${taskId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    taskName: editTaskName,
                    status: editTaskStatus,
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Update the task in the local state
                setTasks(tasks.map(task =>
                    task._id === taskId ? data.data : task
                ));
                setEditingTaskId(null); // Exit editing mode
                toast.success("Task updated successfully!");
            } else {
                toast.error(data.message || "Failed to update task");
            }
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("An error occurred while updating the task");
        }
    };

    const getStatusColor = (status: string) => {
        if (!status) {
            return 'bg-yellow-100 text-yellow-800'; // Default color for undefined/null status
        }

        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (!user) return (
        <div className="flex justify-center items-center pt-48">
            <p className="text-center text-stone-900">Please log in to see tasks.</p>
        </div>
    )

    return (
        <div className="w-full min-h-screen bg-white dark:bg-dot-black/[0.2] bg-dot-black/[0.2]">
            <div className="max-w-4xl mx-auto p-4 pt-24">
                {/* Your Tasks Header with Toggle Button */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        Your Tasks
                    </h2>
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors justify-end"
                    >
                        {isFormVisible ? (
                            <ChevronDown className="w-5 h-5 rotate-180 transition-transform" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Add Task Form */}
                <AnimatePresence>
                    {isFormVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isFormVisible && (
                                <form onSubmit={handleCreateTask} className="mb-8 bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Task</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Task Name Input */}
                                        <div className="flex-1">
                                            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Task Name
                                            </label>
                                            <input
                                                type="text"
                                                id="taskName"
                                                placeholder="Enter task name..."
                                                value={taskName}
                                                onChange={(e) => setTaskName(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* Task Status Dropdown */}
                                        <div className="w-full sm:w-48">
                                            <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                id="taskStatus"
                                                value={taskStatus}
                                                onChange={(e) => setTaskStatus(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>

                                        {/* Add Task Button */}
                                        <div className="self-end">
                                            <button
                                                type="submit"
                                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                                            >
                                                Add Task
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="border p-2 rounded flex-1"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Task Table - Mobile View */}
                <div className="block sm:hidden">
                    {loading ? (
                        <p className="text-center p-4">Loading...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-center p-4">No tasks found</p>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task._id} className="border rounded-lg p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        {editingTaskId === task._id ? (
                                            <input
                                                type="text"
                                                value={editTaskName}
                                                onChange={(e) => setEditTaskName(e.target.value)}
                                                className="border p-1 rounded"
                                            />
                                        ) : (
                                            <h3 className="font-medium">{task.taskName}</h3>
                                        )}
                                        {editingTaskId === task._id ? (
                                            <select
                                                value={editTaskStatus}
                                                onChange={(e) => setEditTaskStatus(e.target.value)}
                                                className="border p-1 rounded"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        ) : (
                                            <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Created: {new Date(task.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        {editingTaskId === task._id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateTask(task._id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditTask(task)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Task Table - Desktop View */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Task Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4">Loading...</td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4">No tasks found</td>
                                </tr>
                            ) : (
                                tasks.map((task) => {
                                    // console.log("Rendering task:", task); // Debugging
                                    return (
                                        <tr key={task._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {editingTaskId === task._id ? (
                                                    <input
                                                        type="text"
                                                        value={editTaskName}
                                                        onChange={(e) => setEditTaskName(e.target.value)}
                                                        className="border p-1 rounded"
                                                    />
                                                ) : (
                                                    task.taskName
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {editingTaskId === task._id ? (
                                                    <select
                                                        value={editTaskStatus}
                                                        onChange={(e) => setEditTaskStatus(e.target.value)}
                                                        className="border p-1 rounded"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-2 justify-center">
                                                    {editingTaskId === task._id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateTask(task._id)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditTask(task)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTask(task._id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex sm:flex-row justify-center items-center gap-3 mt-6 w-full">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-full 
                   bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 
                   disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium text-gray-700">
                        Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-full 
                   bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 
                   disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default Dashboard;