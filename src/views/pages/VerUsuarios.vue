<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { getPasantes, getPasanteById, updatePasante } from '../../services/userService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const pasantes = ref([]);
const loading1 = ref(false);
const estados = ref([
    { name: 'activo', code: 'S' },
    { name: 'inactivo', code: 'PE' }
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
    estado: ''
});

const nuevaPassword = ref('');

const editarPasante = ref(false);
const submitted = ref(false);

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
        pasante.value = { 
            ...response.data, 
            ci: parseInt(response.data.ci, 10),
            numero: parseInt(response.data.numero, 10),
            casos: infoPasante.casos,
            estado: estadoActual ? estadoActual.name : ''
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
    estado: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const iniciarFiltros = () => {
    filtros.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        celular: { value: null, matchMode: FilterMatchMode.EQUALS },
        ci: { value: null, matchMode: FilterMatchMode.EQUALS },
        casos: { value: null, matchMode: FilterMatchMode.EQUALS },
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
                <h5>Mis Pasantes</h5>
                <DataTable :value="pasantes" :paginator="true" :rows="10" dataKey="id" :rowHover="true"
                    v-model:filters="filtros" filterDisplay="menu" :loading="loading1" :filters="filtros"
                    :globalFilterFields="['nombre', 'celular', 'ci', 'casos']" showGridlines>
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
                    <template #empty> No se encontraron pasantes. </template>
                    <template #loading> Los datos se están cargando... </template>
                    <Column field="nombre" header="Nombre" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.nombre }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por nombre" />
                        </template>
                    </Column>
                    <Column header="CI" filterField="ci" dataType="numeric" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.ci }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column header="Celular" filterField="celular" dataType="numeric" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.celular }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column field="casos" header="Casos Atendidos" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.casos }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column field="estado" header="Estado" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Tag :severity="getSeverity(data.estado)">{{ data.estado.toUpperCase() }}</Tag>
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText v-model="filterModel.value" class="p-column-filter"
                                placeholder="Filtrar por estado" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:8rem; text-align: center;" header="Modificar">
                        <template #body="slotProps">
                            <div style="text-align: center;">
                                <Button icon="pi pi-pencil" severity="primary" rounded
                                    @click="infoPasante(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <Dialog v-model:visible="editarPasante" :style="{ width: '450px' }" header="Modificar Pasante"
                    :modal="true" class="p-fluid">
                    <div v-if="pasante">
                        <div class="field">
                            <h5>Datos del pasante</h5>
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
                        <div class="field">
                            <h5>Asignar nueva contraseña</h5>
                            <FloatLabel>
                                <InputText type="password" id="inputtext2" v-model="nuevaPassword" />
                                <label for="inputtext2">Nueva Contraseña</label>
                            </FloatLabel>
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
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
