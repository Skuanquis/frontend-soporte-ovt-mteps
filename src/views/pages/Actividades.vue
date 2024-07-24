<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createActivity, getAllActivities } from '@/services/actividadesService';
import { getOperadores } from '@/services/userService';
import { FilterMatchMode } from 'primevue/api';
const dialogVisible = ref(false);
const newActivity = ref({
  titulo: '',
  descripcion: '',
  hora: '',
  fecha: new Date(),
  id_usuario: null
});
const actividades = ref([]);
const operadores = ref([]);
const toast = useToast();

const fetchOperadores = async () => {
  try {
    const response = await getOperadores();
    operadores.value = response.data;
  } catch (error) {
    toast.error('Error al cargar operadores');
  }
};

const fetchActivities = async () => {
  try {
    const response = await getAllActivities();
    actividades.value = response.data;
  } catch (error) {
    toast.error('Error al cargar actividades');
  }
};

const submitActivity = async () => {
  if (!newActivity.value.titulo || !newActivity.value.hora || !newActivity.value.fecha || !newActivity.value.id_usuario || !newActivity.value.descripcion) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, completa todos los campos requeridos.', life: 3000 });
    return;
  }
  const formattedHour = newActivity.value.hora.getHours() + ':' + newActivity.value.hora.getMinutes();
  const activityToSubmit = {
    ...newActivity.value,
    hora: formattedHour
  };
  try {
    await createActivity(activityToSubmit);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad creada con éxito', life: 3000 });
    fetchActivities();
    dialogVisible.value = false;
    resetActivityForm();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la actividad', life: 3000 });
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const resetActivityForm = () => {
  newActivity.value = {
    titulo: '',
    descripcion: '',
    hora: '',
    fecha: new Date(),
    id_usuario: null
  };
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(() => {
  fetchOperadores();
  fetchActivities();
});
</script>
  
<template>
    <div>
      <Toast />
      <Dialog v-model:visible="dialogVisible" :style="{ width: '550px' }" header="Crear actividad" :modal="true" class="p-fluid">
        <div class="field">
            <form @submit.prevent="submitActivity">
            <br>
            <FloatLabel>
                <InputText id="text1" v-model="newActivity.titulo" placeholder="Título" />
                <label for="text1">Título</label>
            </FloatLabel>
            <br>
            <FloatLabel>
                <Textarea id="text2" v-model="newActivity.descripcion" placeholder="Descripción" />
                <label for="text2">Descripción</label>
            </FloatLabel>
            <br>
            <FloatLabel>
                <Calendar id="calendar-timeonly" v-model="newActivity.hora" timeOnly />
                <label for="calendar-timeonly">Hora</label>
            </FloatLabel>
            <br>
            <FloatLabel>
                <Calendar id="calendar" v-model="newActivity.fecha" :showIcon="true" />
                <label for="calendar">Fecha</label>
            </FloatLabel>
            <br>
            <FloatLabel>
                <Dropdown id="dropdown" v-model="newActivity.id_usuario" :options="operadores" optionLabel="nombre" optionValue="id_usuario" placeholder="Selecciona un pasante " />
                <label for="dropdown">Elegir usuario</label>
            </FloatLabel>
            <br>
            <Button label="Crear Actividad" @click="submitActivity" />
            </form>
        </div>
      </Dialog>
      <Button label="Nueva Actividad" @click="dialogVisible = true" />
      <h5>Historial de actividades</h5>
      <DataTable v-model:filters="filters" :value="actividades" removableSort tableStyle="min-width: 50rem"
      paginator :rows="10" dataKey="id" 
      :globalFilterFields="['titulo', 'descripcion', 'fecha', 'hora', 'usuario', 'estado']"> 
      <template #header>
                <div class="flex justify-end">
                    <span class="relative">
                        <InputText v-model="filters['global'].value" placeholder="Buscar"  class="pl-10 font-normal"/>
                    </span>
                </div>
        </template>
        <Column field="titulo" header="Título" sortable style="width: 20%"></Column>
        <Column field="descripcion" header="Descripción" sortable style="width: 20%"></Column>
        <Column field="fecha" header="Fecha Asignada" sortable style="width: 10%">
            <template #body="slotProps">
            {{ formatDate(slotProps.data.fecha) }}
            </template>
        </Column>
        <Column field="hora" header="Hora" sortable style="width: 10%"></Column>
        <Column field="usuario" header="Asignado a" sortable style="width: 20%"></Column>
        <Column field="estado" header="Estado" sortable style="width: 10%"></Column>
        <Column field="fecha_completado" header="Fecha Completada" style="width: 10%">
                        <template #body="slotProps">
                            {{ (formatDate(slotProps.data.fecha_completado) === '31/12/69' ? '' : formatDate(slotProps.data.fecha_completado)) || 'No completada aun' }}
                        </template>
                    </Column>
      </DataTable>
    </div>
  </template>

