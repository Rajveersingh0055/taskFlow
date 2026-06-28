import api from './api'

/**
 * Task Service
 * All requests automatically include the JWT token via the shared axios
 * instance (api.defaults.headers.common.Authorization is set by AuthContext).
 */

/** Create a new task on a board */
const createTask = async (taskData) => {
  const { data } = await api.post('/api/tasks', taskData)
  return data
}

/** Fetch all tasks for a given board */
const getTasksByBoard = async (boardId) => {
  const { data } = await api.get(`/api/tasks/board/${boardId}`)
  return data
}

/** Fetch a single task by id */
const getTaskById = async (id) => {
  const { data } = await api.get(`/api/tasks/${id}`)
  return data
}

/** Partially update a task */
const updateTask = async (id, taskData) => {
  const { data } = await api.put(`/api/tasks/${id}`, taskData)
  return data
}

/** Delete a task */
const deleteTask = async (id) => {
  const { data } = await api.delete(`/api/tasks/${id}`)
  return data
}

export { createTask, getTasksByBoard, getTaskById, updateTask, deleteTask }
