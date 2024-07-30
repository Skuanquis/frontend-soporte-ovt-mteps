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

export const getReporteAnual = () => {
  return api.get('/atenciones-anual');
};

export const getReporteAnualMensual = () => {
  return api.get('/atenciones-anual-mensual');
};

export const getReporteAnioMes = (anio, mes) => {
  return api.get(`/atenciones-anual-mes/${anio}/${mes}`);
};

export const getUserAtencionesByDate = (fechaInicio, fechaFin) => {
  return api.get(`/atenciones/intervalo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
}


export const getReporteAnioMesUserId = (id) => {
  return api.get(`/reporte-atenciones-usuario/${id}`);
};
;