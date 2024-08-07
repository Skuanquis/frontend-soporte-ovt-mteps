import api from './api'

export const createActivity = (actividadData) => {
    return api.post('/crear-actividad', actividadData)
};
  
export const getAllActivities = () => {
    return api.get('/get-actividades');
};

export const getActivitiesByUserId = () => {
    return api.get('/get-actividades-id');
};

export const getActivitiesByUserIdCompletadas = () => {
    return api.get('/get-actividades-completadas');
};

export const marcarActividadCompletada = (id) => {
    return api.put(`/marcar-actividad/${id}/complete`);
};

export const updateActivity = (id, activityData) => {
    return api.put(`/actividades/${id}/update`, activityData);
};