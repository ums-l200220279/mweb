"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { PillIcon as Pills, Brain, Video, FootprintsIcon as Walk } from "lucide-react"

const initialTodos = [
  { id: 1, text: "Take morning medication", icon: Pills, completed: false },
  { id: 2, text: "Complete memory exercise", icon: Brain, completed: false },
  { id: 3, text: "Video call with Dr. Smith", icon: Video, completed: false },
  { id: 4, text: "30-minute walk", icon: Walk, completed: false },
]

export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos)

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center space-x-2">
          <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
          <label
            htmlFor={`todo-${todo.id}`}
            className={`flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              todo.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            <todo.icon className={`h-4 w-4 ${todo.completed ? "text-muted-foreground" : "text-blue-500"}`} />
            <span>{todo.text}</span>
          </label>
        </div>
      ))}
    </div>
  )
}

