import api from './api'

const getBoards = async () => {
  const { data } = await api.get('/api/boards')
  return data
}

const createBoard = async (boardData) => {
  const { data } = await api.post('/api/boards', boardData)
  return data
}

const getBoardById = async (id) => {
  const { data } = await api.get(`/api/boards/${id}`)
  return data
}

const updateBoard = async (id, boardData) => {
  const { data } = await api.put(`/api/boards/${id}`, boardData)
  return data
}

const deleteBoard = async (id) => {
  const { data } = await api.delete(`/api/boards/${id}`)
  return data
}

export { getBoards, createBoard, getBoardById, updateBoard, deleteBoard }
