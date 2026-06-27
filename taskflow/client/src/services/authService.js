import api from './api'

const registerUser = async (userData) => {
  const { data } = await api.post('/api/auth/register', userData)
  return data
}

const loginUser = async (credentials) => {
  const { data } = await api.post('/api/auth/login', credentials)
  return data
}

const getCurrentUser = async (token) => {
  const { data } = await api.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

export { getCurrentUser, loginUser, registerUser }
