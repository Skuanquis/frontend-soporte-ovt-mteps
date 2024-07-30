<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { getPasantes, getPasanteById, updatePasante } from '../../services/userService';
import { getReporteAnioMesUserId } from '@/services/atencionService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const pasantes = ref([]);
const loading1 = ref(false);

const roles = ref([
    { name: 'Operador', code: 'operador' },
    { name: 'Supervisor', code: 'supervisor' }
]);


const estados = ref([
    { name: 'Activo', code: 'activo' },
    { name: 'Inactivo', code: 'inactivo' }
]);

const getSeverity = (status) => {
    switch (status) {
        case 'inactivo':
            return 'danger';
        case 'activo':
            return 'success';
        default:
            return 'info';
    }
};

const pasante = ref({
    id_usuario: null,
    nombre: '',
    direccion: '',
    ci: '',
    numero: '',
    casos: '',
    password: '',
    estado: '',
    rol: ''
});

const nuevaPassword = ref('');

const editarPasante = ref(false);
const verEstadisticas = ref(false);
const submitted = ref(false);

const estadisticas = ref([]);

const estadisticasPasante = async (infoPasante) => {
    const id = infoPasante.id_usuario
    try {
        const stats = await getReporteAnioMesUserId(id);
        estadisticas.value = stats.data;
        verEstadisticas.value = true; 
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar las estadísticas', life: 3000 });
    }
};

const hideDialog = () => {
    editarPasante.value = false;
    submitted.value = false;
    pasante.value = {
        id_usuario: null,
        nombre: '',
        direccion: '',
        ci: '',
        numero: '',
        casos: '',
        estado: '',
        password: ''
    };
    nuevaPassword.value = '';
};

const loadPasantes = async () => {
    loading1.value = true;
    try {
        const response = await getPasantes();
        pasantes.value = response.data;
    } catch (error) {
        console.error('Error fetching pasantes:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los pasantes', life: 3000 });
    } finally {
        loading1.value = false;
    }
};

const guardarCambios = async () => {
    submitted.value = true; 
    if (!pasante.value.nombre || !pasante.value.direccion || !pasante.value.ci || !pasante.value.numero) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor completa todos los campos requeridos.', life: 3000 });
        return; 
    }
    
    const dataToSend = {
        nombre: pasante.value.nombre,
        direccion: pasante.value.direccion,
        ci: pasante.value.ci,
        numero: pasante.value.numero,
        estado: pasante.value.estado,
        rol: pasante.value.rol,
        casos: pasante.value.casos, 
    };

    
    if (nuevaPassword.value) {
        dataToSend.password = nuevaPassword.value;
    }
    try {

        await updatePasante(pasante.value.id_usuario, dataToSend);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pasante actualizado con éxito', life: 3000 });
        hideDialog();  
        loadPasantes();
    } catch (error) {
        console.error('Error updating pasante:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el pasante', life: 3000 });
    }
};


const infoPasante = async (infoPasante) => {
    try {
        const response = await getPasanteById(infoPasante.id_usuario);
        const estadoActual = estados.value.find(e => e.name.toLowerCase() === response.data.estado.toLowerCase());
        const rolActual = roles.value.find(r => r.code === response.data.rol);
        pasante.value = { 
            ...response.data, 
            ci: parseInt(response.data.ci, 10),
            numero: parseInt(response.data.numero, 10),
            casos: infoPasante.casos,
            estado: estadoActual ? estadoActual.name : '',
            rol: rolActual ? rolActual.code : ''  
        };
        editarPasante.value = true;
    } catch (error) {
        console.error('Error fetching pasante:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la información del pasante', life: 3000 });
    }
};

const filtros = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    celular: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    ci: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    casos: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    rol: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    estado: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const iniciarFiltros = () => {
    filtros.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        celular: { value: null, matchMode: FilterMatchMode.EQUALS },
        ci: { value: null, matchMode: FilterMatchMode.EQUALS },
        casos: { value: null, matchMode: FilterMatchMode.EQUALS },
        rol: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        estado: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    };
};

const limpiarFiltros = () => iniciarFiltros();

onMounted(() => {
    loadPasantes();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Usuarios registrados</h5>
                <DataTable :value="pasantes" :paginator="true" :rows="10" dataKey="id" :rowHover="true"
                    v-model:filters="filtros" filterDisplay="menu" :loading="loading1" :filters="filtros"
                    :globalFilterFields="['nombre', 'celular', 'ci', 'casos', 'rol']" showGridlines>
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Limpiar" outlined
                                @click="limpiarFiltros()" />
                            <IconField iconPosition="left">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="filtros['global'].value" placeholder="Buscar" style="width: 100%" />
                            </IconField>
                        </div>
                    </template>
                    <template #empty> No se encontraron usuarios. </template>
                    <template #loading> Los datos se están cargando... </template>
                    <Column field="nombre" header="Nombre" style="width: 25%">
                        <template #body="{ data }">
                            {{ data.nombre }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por nombre" />
                        </template>
                    </Column>
                    <Column header="CI" filterField="ci" dataType="numeric" style="width: 10%">
                        <template #body="{ data }">
                            {{ data.ci }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column header="Celular" filterField="celular" dataType="numeric" style="width: 10%">
                        <template #body="{ data }">
                            {{ data.celular }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column field="casos" header="Casos Atendidos" style="width: 5%">
                        <template #body="{ data }">
                            {{ data.casos }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column field="rol" header="Rol" style="width: 15%" class="text-center">
                        <template #body="{ data }">
                            {{ data.rol }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText v-model="filterModel.value" class="p-column-filter"
                                placeholder="Filtrar por rol" />
                        </template>
                    </Column>
                    <Column field="estado" header="Estado" style="width: 15%" class="text-center">
                        <template #body="{ data }">
                            <Tag :severity="getSeverity(data.estado)">{{ data.estado.toUpperCase() }}</Tag>
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText v-model="filterModel.value" class="p-column-filter"
                                placeholder="Filtrar por estado" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:8rem; text-align: center;" header="Acciones" style="width: 20%"> 
                        <template #body="slotProps">
                            <div style="text-align: center;" class="grid">
                                <div class="col md:col-6">
                                    <Button icon="pi pi-pencil" severity="primary" rounded
                                    @click="infoPasante(slotProps.data)" />
                                </div>
                                <div class="col md:col-6">
                                    <Button icon="pi pi-chart-bar" severity="info" rounded
                                    @click="estadisticasPasante(slotProps.data)" />
                                </div>
                            </div>
                            
                        </template>
                    </Column>
                    
                </DataTable>
                <Dialog v-model:visible="editarPasante" :style="{ width: '450px' }" header="Modificar Pasante"
                    :modal="true" class="p-fluid">
                    <div v-if="pasante">
                        <div class="field">
                            <h5>Datos del pasante</h5>
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <InputText type="text" :id="'inputtext1' + pasante.id_usuario" v-model="pasante.nombre" />
                                    <label :for="'inputtext1' + pasante.id_usuario">Nombre completo</label>
                                </FloatLabel>

                                <br>
                                <FloatLabel>
                                    <InputText type="text" id="inputtext" v-model="pasante.direccion" />
                                    <label for="inputtext">Dirección</label>
                                </FloatLabel>
                                <br>
                                <FloatLabel>
                                    <InputNumber id="inputnumber1" v-model="pasante.ci" inputId="withoutgrouping1"
                                        :useGrouping="false">
                                    </InputNumber>
                                    <label for="inputnumber1">CI</label>
                                </FloatLabel>
                                <br>
                                <FloatLabel>
                                    <InputNumber id="inputnumber2" v-model="pasante.numero" inputId="withoutgrouping2"
                                        :useGrouping="false">
                                    </InputNumber>
                                    <label for="inputnumber2">Número de celular</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div class="field">
                            <h5>Asignar nueva contraseña</h5>
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <InputText type="password" id="inputtext2" v-model="nuevaPassword" />
                                    <label for="inputtext2">Nueva Contraseña</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div class="field">
                            <h5>Rol</h5>
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <Dropdown v-model="pasante.rol" :options="roles" optionLabel="name" optionValue="code" />
                                    <label for="dropdown">Rol</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div class="field">
                            <h5>Estado</h5>
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <Dropdown id="dropdown" :options="estados" v-model="pasante.estado" optionLabel="name" optionValue="name" />
                                    <label for="dropdown">Estado</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="guardarCambios" />
                    </template>
                </Dialog>
                <Dialog v-model:visible="verEstadisticas" :style="{ width: '500px' }" header="Estadisticas del usuario" :modal="true" class="p-fluid">
                    <template v-if="estadisticas && estadisticas.length">
                        <div v-for="dato in estadisticas" :key="dato.Mes">
                            <h5 class="text-center month-name-dialog">{{ (nombreMes(dato.Mes)) }} - {{ (dato.Anio) }}</h5>
                            <div class="data-wrapper">
                                <div class="data-section">
                                    <h5 class="info-data-dialog">Total de casos registrados: {{ dato.Total_Casos }}</h5>
                                    <h5 class="info-data-dialog">Correos: {{ dato.Total_Correos }}</h5>
                                    <h5 class="info-data-dialog">Llamadas: {{ dato.Total_Llamadas }}</h5>
                                    <h5 class="info-data-dialog">Atenciones Presenciales: {{ dato.Total_Presencial }}</h5>
                                </div>
                                <div class="data-section">
                                    <h5 class="info-data-dialog">Casos de Planillas: {{ dato.Total_Inconvenientes_Planillas }}</h5>
                                    <div class="grid p-fluid">
                                        <div class="col md:col-6">
                                            <h5 class="case-data">Planilla Mensual: {{dato.Subproblema_Mensual }}</h5>
                                            <h5 class="case-data">Planilla Retroactiva: {{dato.Subproblema_Retroactiva }}</h5>
                                            <h5 class="case-data">Planilla Aguinaldo: {{dato.Subproblema_Aguinaldo }}</h5>
                                            <h5 class="case-data">Rectificación: {{dato.Subproblema_Rectificacion }}</h5>
                                            <h5 class="case-data">Fuera de Plazo: {{dato.Subproblema_Fueradeplazo }}</h5>
                                        </div>
                                        <div class="col md:col-6">
                                            <h5 class="case-data">Declaración en Cero: {{dato.Subproblema_Declaracionencero }}</h5>
                                            <h5 class="case-data">Tipo de Declaración: {{dato.Subproblema_Tipodedeclaracion }}</h5>
                                            <h5 class="case-data">No Figura Sucursal: {{dato.Subproblema_Nofigurasucursal }}</h5>
                                            <h5 class="case-data">Incumplimiento: {{dato.Subproblema_Incumplimientodeclaracion }}</h5>
                                            <h5 class="case-data">Error al Importar: {{dato.Subproblema_Errorimportar }}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="data-section">
                                    <h5 class="info-data-dialog">Casos de ROE: {{ dato.Total_ROE }}</h5>
                                    <div class="grid p-fluid">
                                        <div class="col md:col-6">
                                            <h5 class="case-data">Dar de Baja el ROE: {{ dato.Subproblema_DarbajaROE }}</h5>
                                            <h5 class="case-data">Correo de Confirmación: {{ dato.Subproblema_Correodeconfirmacion }}</h5>
                                            <h5 class="case-data">Multa RM°105/18: {{ dato.Subproblema_MultaRM105 }}</h5>
                                            <h5 class="case-data">Inicio de Actividades: {{ dato.Subproblema_Iniciodeactividades }}</h5>
                                            <h5 class="case-data">Sucursal Inactiva: {{ dato.Subproblema_Sucursalinactiva }}</h5>
                                        </div>
                                        <div class="col md:col-6">
                                            <h5 class="case-data">Inscripción al ROE: {{ dato.Subproblema_InscripcionROE }}</h5>
                                            <h5 class="case-data">Pendiente de Firma: {{ dato.Subproblema_Pendientedefirma }}</h5>
                                            <h5 class="case-data">Actualizar ROE: {{ dato.Subproblema_ActualizarROE }}</h5>
                                            <h5 class="case-data">Error Interno: {{ dato.Subproblema_Errorinterno }}</h5>
                                            <h5 class="case-data">Representante Legal: {{ dato.Subproblema_Representantelegal }}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="data-section">
                                    <h5 class="info-data-dialog">Casos de Trabajadores: {{ dato.Total_Trabajadores }}</h5>
                                    <div class="grid p-fluid">
                                        <div class="col md:col-6">
                                            <h5 class="case-data">No es Jubilado: {{ dato.Subproblema_Noesjubilado }}</h5>
                                            <h5 class="case-data">Retiro de Trabajador: {{ dato.Subproblema_Retirotrabajador }}</h5>
                                        </div>
                                        <div class="col md:col-6">
                                            <h5 class="case-data">No Valida Dependiente: {{ dato.Subproblema_Novalidadependiente }}</h5>
                                            <h5 class="case-data">No Valida Trabajador: {{ dato.Subproblema_Novalidatrabajador }}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="data-section">
                                    <h5 class="info-data-dialog">Otros Casos: {{ (dato.Total_Contraseña || 0) + (dato.Total_Falla_Interoperabilidad || 0) + (dato.Total_Otro || 0)}}</h5>
                                    <div class="grid p-fluid">
                                        <div class="col md:col-6">
                                            <h5 class="case-data">Contraseña: {{ dato.Total_Contraseña }}</h5>
                                            <h5 class="case-data">Falla de Interoperabilidad: {{ dato.Total_Falla_Interoperabilidad }}</h5>
                                        </div>
                                            <div class="col md:col-6">
                                            <h5 class="case-data">Otro: {{ dato.Total_Otro }}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                    <h5 class="text-center">No hay datos disponibles para el usuario.</h5>
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  data() {
    return {
      verEstadisticas: false,
      estadisticas: []
    };
  },
  methods: {
    nombreMes(mes) {
      const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return nombres[mes - 1];
    }
  }
};
</script>
<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

</style>

<style scoped>
.gestion-title {
  font-size: 2em; 
  font-weight: bold;
  color: #3f51b5; 
}

.total-casos {
  font-size: 1.3em; 
  font-weight: bold;
  color: #333; 
}

.info-data, .case-data {
  font-size: 1em;
  color: #666;
}

.info-data-dialog{
  font-size: 1.2em;
  color: #666;
}



.case-data {
  font-weight: normal; 
  padding-bottom: 0.5em; 
}

.info-data {
  font-weight: bold; 
  padding-bottom: 0.3em; 
}
.month-name {
  font-size: 1.1em;
  font-weight: bold;
  color: #3f51b5;
  margin-bottom: 0.3em;
}
.month-name-dialog {
  font-size: 1.4em;
  font-weight: bold;
  color: #3f51b5;
  margin-bottom: 0.3em;
}

.data-section {
  padding: 2px 0;
  border-bottom: 1px solid #ccc;
  margin: 0 10px;
}

.data-section:last-child {
  border-bottom: none;
}

h5 {
  margin: 0;
  padding: 2px 0;
}

.data-text {
  font-size: 0.85em; 
  color: #555; 
}

.card-mes:hover {
  background-color: #f8f9fa;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

</style>
