import React, { useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  isCompleted: boolean;
}

const ToDoList: React.FC = () => {
  const [task, setTask] = useState("");
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [error, setError] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (task.trim() === "") {
      setError("Task cannot be empty.");
      return;
    }

    setTodoList([
      ...todoList,
      { id: Date.now(), text: task, isCompleted: false },
    ]);
    setTask("");
    setError("");
  };

  const handleCompleteTask = (id: number) => {
    setTodoList(
      todoList.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTodoList(todoList.filter((item) => item.id !== id));
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[400px] p-8 bg-[#0e0f1a] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          To-Do List
        </h2>
        <form onSubmit={handleAddTask}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter a task"
              className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div>
            <button
              type="submit"
              className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center cursor-pointer hover:bg-white hover:text-black transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>

        <ul className="mt-6">
          {todoList.map((item) => (
            <li
              key={item.id}
              className={`flex justify-between items-center py-2 px-4 mb-2 text-white rounded-md ${
                item.isCompleted ? "bg-green-500 line-through" : "bg-[#333845]"
              }`}
            >
              <span>{item.text}</span>
              <div>
                <button
                  onClick={() => handleCompleteTask(item.id)}
                  className="text-sm text-white bg-transparent border border-white py-1 px-2 mr-2 rounded hover:bg-white hover:text-black transition-colors"
                >
                  {item.isCompleted ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => handleDeleteTask(item.id)}
                  className="text-sm text-red-500 bg-transparent border border-red-500 py-1 px-2 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ToDoList;
