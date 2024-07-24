import api from './api'

export const createAtencion = (atencionData) => {
  return api.post('/atenciones', atencionData)
}

export const getUserAtenciones = () => {
  return api.get('/atenciones')
}

export const updateAtencion = (id, atencionData) => {
  return api.put(`/atenciones/${id}`, atencionData)
}
