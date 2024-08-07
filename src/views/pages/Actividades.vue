<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createActivity, getAllActivities, updateActivity } from '@/services/actividadesService';
import { getOperadoresSupervisores } from '@/services/userService';
import { FilterMatchMode } from 'primevue/api';

const dialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedActivity = ref(null);
const newActivity = ref({
  titulo: '',
  descripcion: '',
  hora: '',
  fecha: '',
  id_usuario: null
});
const actividades = ref([]);
const operadores = ref([]);
const toast = useToast();

const fetchOperadores = async () => {
  try {
    const response = await getOperadoresSupervisores();
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
  const hours = newActivity.value.hora.getHours().toString().padStart(2, '0');
  const minutes = newActivity.value.hora.getMinutes().toString().padStart(2, '0');
  const seconds = newActivity.value.hora.getSeconds().toString().padStart(2, '0');

  const formattedHour = `${hours}:${minutes}:${seconds}`; 


  const activityToSubmit = {
    ...newActivity.value,
    hora: formattedHour,
    fecha: newActivity.value.fecha.toISOString().slice(0, 10)
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

const updateSelectedActivity = async () => {
  if (!selectedActivity.value.titulo || !selectedActivity.value.hora || !selectedActivity.value.fecha || !selectedActivity.value.id_usuario || !selectedActivity.value.descripcion) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, completa todos los campos requeridos.', life: 3000 });
    return;
  }
  const hours = new Date(selectedActivity.value.hora).getHours().toString().padStart(2, '0');
  const minutes = new Date(selectedActivity.value.hora).getMinutes().toString().padStart(2, '0');
  const seconds = selectedActivity.value.hora.getSeconds().toString().padStart(2, '0');

  const formattedHour = `${hours}:${minutes}:${seconds}`; 

  const activityToUpdate = {
    ...selectedActivity.value,
    hora: formattedHour,
    fecha: new Date(selectedActivity.value.fecha).toISOString().slice(0, 10)
  };

  try {
    await updateActivity(selectedActivity.value.id_actividad, activityToUpdate);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad actualizada con éxito', life: 3000 });
    fetchActivities();
    editDialogVisible.value = false;
    selectedActivity.value = null;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la actividad', life: 3000 });
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

const openEditDialog = (activity) => {
  selectedActivity.value = { ...activity,
    fecha: formatDate(activity.fecha)
   };
  editDialogVisible.value = true;
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
        <Column headerStyle="min-width:8rem; text-align: center;" header="Modificar" style="width: 10%">
          <template #body="slotProps">
            <div style="text-align: center;">
              <Button icon="pi pi-pencil" severity="secondary" rounded
              :disabled="slotProps.data.estado === 'completada'"
              @click="openEditDialog(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
      <Dialog v-model:visible="editDialogVisible" :style="{ width: '550px' }" header="Editar actividad" :modal="true" class="p-fluid">
      <div class="field">
        <form @submit.prevent="updateSelectedActivity">
          <br>
          <FloatLabel>
            <InputText id="editText1" v-model="selectedActivity.titulo" placeholder="Título" />
            <label for="editText1">Título</label>
          </FloatLabel>
          <br>
          <FloatLabel>
            <Textarea id="editText2" v-model="selectedActivity.descripcion" placeholder="Descripción" />
            <label for="editText2">Descripción</label>
          </FloatLabel>
          <br>
          <FloatLabel>
            <Calendar id="editCalendar-timeonly" v-model="selectedActivity.hora" timeOnly />
            <label for="editCalendar-timeonly">Hora</label>
          </FloatLabel>
          <br>
          <FloatLabel>
            <Calendar id="editCalendar" v-model="selectedActivity.fecha" :showIcon="true" />
            <label for="editCalendar">Fecha</label>
          </FloatLabel>
          <br>
          <FloatLabel>
            <Dropdown id="editDropdown" v-model="selectedActivity.id_usuario" :options="operadores" optionLabel="nombre" optionValue="id_usuario" placeholder="Selecciona un pasante" />
            <label for="editDropdown">Elegir usuario</label>
          </FloatLabel>
          <br>
          <Button label="Actualizar Actividad" @click="updateSelectedActivity" />
        </form>
      </div>
    </Dialog>
    </div>
  </template>

