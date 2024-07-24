import api from './api'

export const loginUser = (credentials) => {
  return api.post('/login', credentials)
}

export const getUserInfo = () => {
  return api.get('/info')
}

export const updateUserProfile = (userId, profileData) => {
  return api.put(`/perfil/${userId}`, profileData)
}

export const updateUserPassword = (userId, passwordData) => {
  return api.put(`/password/${userId}`, passwordData)
}

export const createUser = (userData) => {
  return api.post('/users', userData)
}

export const getPasantes = () => {
  return api.get('/pasantes')
}

export const getPasanteById = (id) => {
  return api.get(`/pasantes/${id}`)
}

export const updatePasante = (id, pasanteData) => {
  return api.put(`/pasantes/${id}`, pasanteData)
}

export const getResumenAtenciones = () => {
  return api.get('/atenciones-usuario')
}

export const getPendientesUsuarios = () => {
  return api.get('/pendientes-usuario')
}

export async function fetchSolucionados(month, year) {
  const response = await api.get(`/solucionados-mes?month=${month}&year=${year}`)
  return response
}

export async function fetchPendientes(month, year) {
  const response = await api.get(`/pendientes-mes?month=${month}&year=${year}`)
  return response
}

export async function getAtencionesMes() {
  const response = await api.get('/atenciones-mes')
  return response.data
}

export async function getPlanillas() {
  const response = await api.get('/total-planillas')
  return response.data
}

export async function getRoe() {
  const response = await api.get('/total-roe')
  return response.data
}

export async function getTrabajadores() {
  const response = await api.get('/total-trabajadores')
  return response.data
}

export async function getTotalOtros() {
  const response = await api.get('/total-otros')
  return response.data
}

export const getPreguntasFrecuentes = () => {
  return api.get('/preguntas-frecuentes')
}

export const addPregunta = (preguntaData) => {
  return api.post('/add-preguntas', preguntaData)
}

export const getListaPasantes = () => {
  return api.get('/lista-pasantes')
}

export const getReport = (filters) => {
  return api.post('/reportes', filters)
}

export const getPreguntaById = (id) => {
  return api.get(`/preguntas/${id}`);
};

export const updatePregunta = (id, preguntaData) => {
  return api.put(`/preguntas/${id}`, preguntaData);
};

export const getOperadores = () => {
  return api.get('/operadores');
};

export const updateRolSupervisor = (id) => {
  return api.put(`/update-operadores/${id}`);
};

export const updateRolesSupervisor = (idSupervisor, idUser) => {
  return api.put(`/update-roles/${idSupervisor}/${idUser}`);
};

