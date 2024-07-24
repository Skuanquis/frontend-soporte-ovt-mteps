<script setup>
import { ref, onMounted } from 'vue';
import { getActivitiesByUserId, marcarActividadCompletada, getActivitiesByUserIdCompletadas } from '@/services/actividadesService';
import { useToast } from 'primevue/usetoast';

const actividades = ref([]);
const toast = useToast();
const actividadesC = ref([]);
const hoy = new Date();
const diaNum = hoy.getDate();
const dia = hoy.getDay();
const nombresDeDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const nombreDelDia = nombresDeDias[dia];

const fetchActivities = async () => {
  try {
    const response = await getActivitiesByUserId(); 
    actividades.value = response.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las actividades', life: 3000 });
  }
};

const fetchActividadesCompletadas = async () => {
    try {
    const response = await getActivitiesByUserIdCompletadas(); 
    actividadesC.value = response.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las actividades', life: 3000 });
  }
}

const marcarComoHecha = async (actividadId) => {
  try {
    await marcarActividadCompletada(actividadId);
    toast.add({ severity: 'success', summary: 'Completado', detail: 'Actividad marcada como completada', life: 3000 });
    fetchActivities();
    fetchActividadesCompletadas();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la actividad', life: 3000 });
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};


onMounted(() => {
  fetchActivities();
  fetchActividadesCompletadas();
});
</script>

<template>
    <div class="grid p-fluid">
        <div class="col-12 md:col-3">
            <div class="card">
                <div class="field text-center"><h2>{{ nombreDelDia }}</h2></div>
                <div class="field text-center"><h1>{{ diaNum }}</h1></div>
                <ul class="activity-list" >
                    <li class="activity-item detailed-item" v-for="actividad in actividades.filter(a => new Date(a.fecha).toDateString() === new Date().toDateString())" :key="actividad.id">
                        {{ actividad.hora }} - {{ actividad.titulo }} 
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card">
                <h5>Actividades Pendientes</h5>
                <ul class="activity-list detailed">
                    <li v-for="actividad in actividades" :key="actividad.id_actividad" class="activity-item detailed-item">
                        <h3>{{ actividad.titulo }} - {{ actividad.hora }} - {{ formatDate(actividad.fecha) }} </h3>
                        <p>{{ actividad.descripcion }}</p>
                        <button @click="marcarComoHecha(actividad.id_actividad)" v-if="actividad.estado === 'pendiente'" class="mark-done-btn">Marcar como hecha</button>
                    </li>
                    <p v-if="actividades.filter(a => a.estado === 'pendiente').length === 0">No tienes actividades pendientes</p>
                </ul>
            </div>
        </div>
        <div class="col-12 md:col-3">
            <div class="card">

            </div>
        </div>
        <div class="col-12 md:col-9">
            <div class="card">
                <h5>Actividades Completadas</h5>
                <DataTable :value="actividadesC" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                    <Column field="titulo" header="Título" style="width: 20%"></Column>
                    <Column field="fecha" header="Fecha Asignada" style="width: 20%">
                        <template #body="slotProps">
                        {{ formatDate(slotProps.data.fecha) }}
                        </template>
                    </Column>
                    <Column field="descripcion" header="Descripción" style="width: 20%"></Column>
                    <Column field="estado" header="Estado" style="width: 20%"></Column>
                    <Column field="fecha_completado" header="Fecha Completada" style="width: 20%">
                        <template #body="slotProps">
                            {{ (formatDate(slotProps.data.fecha_completado) === '31/12/69' ? '' : formatDate(slotProps.data.fecha_completado)) || 'No completada aun' }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style>
.activity-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.activity-item {
    padding: 10px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between; 
    align-items: center; 
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-item.detailed-item {
    flex-direction: column;
    align-items: flex-start; 
}

.detailed-item h3 {
    margin: 0.5;
    font-size: 1.25em;
}

.detailed-item p {
    margin: 0.5;
    color: #666;
}

.mark-done-btn {
    padding: 5px 15px; 
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: auto; 
    white-space: nowrap;
}

.mark-done-btn:hover {
    background-color: #45a049;
}
</style>