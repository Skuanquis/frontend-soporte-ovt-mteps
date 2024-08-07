<script setup>
import { ref, onMounted } from 'vue';
import { getUserAtenciones, updateAtencion, getUserAtencionesByDate } from '@/services/atencionService';
import { getUserInfo } from '@/services/userService';
import { useToast } from 'primevue/usetoast';
import { jsPDF } from 'jspdf';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import 'jspdf-autotable';
const toast = useToast();

const value1 = ref(null);
const value2 = ref(null);
const value3 = ref(null);
const value4 = ref(null);
const value5 = ref('');
const value6 = ref('');
const value7 = ref('');
const value8 = ref(null);
const value9 = ref(null);
const value10 = ref(null);
const value11 = ref(null);
const subProblema = ref(null);
const atenciones = ref([]);
const loading1 = ref(false);
const nombre = ref('');
const valueFechaIni = ref('');
const valueFechaFin = ref('');

const principal = ref([
    { name: 'Planillas', code: 'P' },
    { name: 'ROE', code: 'R' },
    { name: 'Trabajadores', code: 'T' },
    { name: 'Deposito', code: 'D' },
    { name: 'Falla interoperabilidad', code: 'F' },
    { name: 'Contraseña', code: 'C' },
    { name: 'Otro', code: 'O' }
]);

const planillaOptions = ref([
    { name: 'Mensual', code: '1' },
    { name: 'Retroactiva', code: '2' },
    { name: 'Aguinaldo', code: '3' },
    { name: 'Rectificación', code: '4' },
    { name: 'Fuera de plazo', code: '5' },
    { name: 'Declaración en cero', code: '6' },
    { name: 'Tipo de declaración', code: '7' },
    { name: 'No figura sucursal', code: '8' },
    { name: 'Incumplimiento de declaración', code: '9' },
    { name: 'Error al importar', code: '10' }
]);

const roeOptions = ref([
    { name: 'Dar de baja el ROE', code: '1' },
    { name: 'Correo de confirmación', code: '2' },
    { name: 'Multa RM°105/18', code: '3' },
    { name: 'Inicio de actividades', code: '4' },
    { name: 'Sucursal inactiva', code: '5' },
    { name: 'Inscripción al ROE', code: '6' },
    { name: 'Pendiente de firma', code: '7' },
    { name: 'Actualizar ROE', code: '8' },
    { name: 'Error interno', code: '9' },
    { name: 'Representante legal', code: '10' }
]);

const trabajadorOptions = ref([
    { name: 'No es jubilado', code: '1' },
    { name: 'Retiro de trabajador', code: '2' },
    { name: 'No valida dependiente', code: '3' },
    { name: 'No valida trabajador', code: '4' }
]);

const tipos = ref([
    { name: 'Correo', code: 'C' },
    { name: 'Telefono', code: 'T' },
    { name: 'Presencial', code: 'P' }
]);

const solucion = ref([
    { name: 'Solucionado', code: 'S' },
    { name: 'Pendiente', code: 'PE' }
]);

const loadUserInfo = async () => {
    try {
        const response = await getUserInfo();
        const user = response.data;
        nombre.value = user.nombre;
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
};

const editarAtencion = ref(false);
const selectedAtencion = ref(null);

const obtenerAtencionesPorFecha = async () => {
    if (!valueFechaIni.value || !valueFechaFin.value) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, completa las fechas de inicio y fin.', life: 5000 });
        return;
    }

    loading1.value = true;
    try {
        const fechaInicioFormatted = new Date(valueFechaIni.value).toISOString().slice(0, 10);
        const fechaFinFormatted = new Date(valueFechaFin.value).toISOString().slice(0, 10);

        const response = await getUserAtencionesByDate(fechaInicioFormatted, fechaFinFormatted);
        if (response && response.data) {
            atenciones.value = response.data.map(atencion => ({
                ...atencion,
                fecha: new Date(atencion.fecha)
            }));
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('Error fetching atenciones:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las atenciones', life: 3000 });
    } finally {
        loading1.value = false;
    }
};

const loadAtenciones = async () => {
    valueFechaIni.value = '';
    valueFechaFin.value = '';
    loading1.value = true;
    try {
        const response = await getUserAtenciones();
        if (response && response.data) {
            atenciones.value = response.data.map(atencion => ({
                ...atencion,
                fecha: new Date(atencion.fecha)
            }));
        } else {
            throw new Error('No data received');
        }

    } catch (error) {
        console.error('Error fetching atenciones:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las atenciones', life: 3000 });
    } finally {
        loading1.value = false;
    }
};



const formatDate = (value) => {
    return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const getSeverity = (status) => {
    switch (status) {
        case 'Pendiente':
            return 'danger';
        case 'Solucionado':
            return 'success';
        default:
            return 'info';
    }
};

const handleEditAtencion = (atencion) => {
    selectedAtencion.value = { ...atencion };
    value1.value = tipos.value.find(t => t.name === atencion.tipo_atencion); 
    value2.value = new Date(atencion.fecha);
    value3.value = parseInt(atencion.nit, 10);
    value4.value = parseInt(atencion.matricula, 10);
    value5.value = atencion.nombre_empresa;
    value6.value = atencion.nombre_empleador;
    value7.value = atencion.correo;
    value8.value = parseInt(atencion.telefono, 10);
    value9.value = principal.value.find(p => p.name === atencion.problema); 
    subProblema.value = findSubProblema(atencion.problema, atencion.subproblema);
    value10.value = atencion.asistencia_remota;
    value11.value = solucion.value.find(s => s.name === atencion.estado);
    editarAtencion.value = true;
};

function findSubProblema(problema, subproblema) {
    switch (problema) {
        case 'Planillas': return planillaOptions.value.find(p => p.name === subproblema);
        case 'ROE': return roeOptions.value.find(r => r.name === subproblema);
        case 'Trabajadores': return trabajadorOptions.value.find(t => t.name === subproblema);
        default: return null;
    }
}


const handleUpdateAtencion = async () => {
    try {
        const atencionData = {
            fecha: value2.value.toISOString().slice(0, 10),//cambie aqui xD
            tipo_atencion: value1.value.name,
            nombre_empleador: value6.value,
            correo: value7.value,
            telefono: value8.value,
            nombre_empresa: value5.value,
            nit: value3.value,
            matricula: value4.value,
            problema: value9.value.name,
            subproblema: subProblema.value ? subProblema.value.name : null,
            estado: value11.value.name,
            asistencia_remota: value10.value
        };
        const response = await updateAtencion(selectedAtencion.value.id_atencion, atencionData);
        toast.add({ severity: 'success', summary: 'Éxito', detail: response.data.message, life: 3000 });
        editarAtencion.value = false;
        loadAtenciones();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la atencion', life: 3000 });
    }
};

const filtros = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tipo_atencion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    fecha: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    nit: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    empresa: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    problema: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    subproblema: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    telefono: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    estado: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const iniciarFiltros = () => {
    filtros.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tipo_atencion: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        fecha: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        nit: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        empresa: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        problema: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        subproblema: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        telefono: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        estado: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
    };
};

onMounted(() => {
    iniciarFiltros();
});


const limpiarFiltros = () => iniciarFiltros();
const generatePDF = ( fecha1, fecha2) => {
    const doc = new jsPDF();
    const logo1 = new Image();
    const logo2 = new Image();
    logo1.src = '/layout/images/bicentenario.png'
    logo2.src = '/layout/images/toplogo.png'

    doc.addImage(logo1, 'PNG', 60, 11, 35, 15);
    doc.addImage(logo2, 'PNG', 100, 10, 58, 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const text1 = "UNIDAD DE TECNOLOGIAS DE LA INFORMACIÓN Y COMUNICACIONES";
    const text2 = "ATENCIONES SOPORTE OVT";
    const textWidth1 = doc.getTextWidth(text1);
    const pageWidth1 = doc.internal.pageSize.getWidth();
    const textWidth2 = doc.getTextWidth(text2);
    const pageWidth2 = doc.internal.pageSize.getWidth();
    const x1 = (pageWidth1 - textWidth1) / 2;
    const x2 = (pageWidth2 - textWidth2) / 2;
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth() + 1;
    const day = fechaActual.getDate();
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
    const fechaActualDoc = `${year}-${formattedMonth}-${formattedDay}`;
    doc.text(text1, x1, 37);
    doc.text(text2, x2, 43);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Pasante: ${nombre.value}`, 14, 60);
    doc.text(`Fecha del Reporte: ${formatDate(fechaActual)}`, 14, 66);

    doc.text(`Fecha Inicio: ${fecha1 ? formatDate(fecha1) : "Todos los registros"}`, 105, 60);
    doc.text(`Fecha Fin: ${fecha2 ? formatDate(fecha2) : "Todos los registros"}`, 105, 66);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(`Registros encontrados: ${atenciones.value.length}`, 14, 74);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const headers = [
        { title: 'Tipo de Atención', dataKey: 'tipo_atencion' },
        { title: 'Fecha', dataKey: 'fecha' },
        { title: 'NIT', dataKey: 'nit' },
        { title: 'Nombre Empresa', dataKey: 'nombre_empresa' },
        { title: 'Problema', dataKey: 'problema' },
        { title: 'Subproblema', dataKey: 'subproblema' },
        { title: 'Teléfono', dataKey: 'telefono' },
        { title: 'Estado', dataKey: 'estado' }
    ];

    const data = atenciones.value.map(aten => ({
        tipo_atencion: aten.tipo_atencion || 'N/D',
        fecha: formatDate(aten.fecha) || 'N/D',
        nit: aten.nit || 'N/D',
        nombre_empresa: aten.nombre_empresa || 'N/D',
        problema: aten.problema || 'N/D',
        subproblema: aten.subproblema || 'N/D',
        telefono: aten.telefono || 'N/D',
        estado: aten.estado || 'N/D'
    }));

    console.log(data);
    doc.autoTable({
        startY: 80,
        columns: headers,
        body: data,
        theme: 'striped',
        showHead: 'everyPage',
        margin: { top: 30 },
    });

    doc.save(`reportePasante${nombre.value}-${fechaActualDoc}.pdf`);
};

onMounted(() => {
    loadAtenciones();
    loadUserInfo();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="grid p-fluid">
                    <div class="col-2">
                        <h5>Mis Atenciones</h5>
                    </div>
                    <div class="col-2">
                        <div class="p-fluid">
                            <FloatLabel>
                                <Calendar inputId="fecha-inicio" v-model="valueFechaIni" dateFormat="dd/mm/yy"></Calendar>
                                <label for="fecha-inicio">Fecha Inicio</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div class="col-2">
                        <div class="p-fluid">
                            <FloatLabel>
                                <Calendar inputId="fecha-fin" v-model="valueFechaFin" dateFormat="dd/mm/yy"></Calendar>
                                <label for="fecha-fin">Fecha Fin</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div class="col-2 mt-1">
                        <Button label="Por Fecha" @click="obtenerAtencionesPorFecha" class="p-button-info" />
                    </div>
                    <div class="col-2 mt-1">
                        <Button label="Registro Completo" @click="loadAtenciones" class="p-button-success" />
                    </div>
                    <div class="col-2 text-right mt-1"><Button label="Exportar a PDF" icon="pi pi-file-pdf"
                            class="p-button-succes" @click="generatePDF(valueFechaIni, valueFechaFin)" />
                    </div>
                </div>
                <DataTable :value="atenciones" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" :rowHover="true"
                    v-model:filters="filtros" filterDisplay="menu" :loading="loading1" :filters="filtros"
                    :globalFilterFields="['tipo_atencion', 'nit', 'telefono', 'nombre_empresa', 'estado']"
                    showGridlines stripedRows>
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
                    <template #empty> No se encontraron atenciones. </template>
                    <template #loading> Los datos se están cargando... </template>
                    <Column field="tipo_atencion" header="Atención" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.tipo_atencion }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por atención" />
                        </template>
                    </Column>
                    <Column field="fecha" header="Fecha" filterField="fecha" dataType="date" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ formatDate(data.fecha) }}
                        </template>
                        <template #filter="{ filterModel }">
                            <Calendar v-model="filterModel.value" dataType="date" dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" />
                        </template>
                    </Column>
                    <Column field="nit" header="NIT" filterField="nit" dataType="numeric" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.nit }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputNumber v-model="filterModel.value" inputId="withoutgrouping" :useGrouping="false" />
                        </template>
                    </Column>
                    <Column field="nombre_empresa" header="Nombre empresa" filterField="empresa"
                        style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.nombre_empresa }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por nombre" />
                        </template>
                    </Column>
                    <Column field="problema" header="Problema" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.problema }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por nombre" />
                        </template>
                    </Column>
                    <Column field="subproblema" header="Subproblema" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.subproblema }}
                        </template>
                        <template #filter="{ filterModel }">
                            <InputText type="text" v-model="filterModel.value" class="p-column-filter"
                                placeholder="Buscar por nombre" />
                        </template>
                    </Column>
                    <Column field="telefono" header="Telefono" fieldheader="Teléfono" filterField="telefono"
                        style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.telefono }}
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
                                    @click="handleEditAtencion(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <Dialog v-model:visible="editarAtencion" :style="{ width: '450px' }" header="Detalles de la atención"
                    :modal="true" class="p-fluid">
                    <div class="field">
                        <h5>Tipo de atención</h5>
                        <FloatLabel>
                            <Dropdown id="dropdown" :options="tipos" v-model="value1" optionLabel="name"></Dropdown>
                            <label for="dropdown">Elige una opción</label>
                        </FloatLabel>
                        <br>
                        <FloatLabel>
                            <Calendar inputId="calendar" v-model="value2"></Calendar>
                            <label for="calendar">Fecha</label>
                        </FloatLabel>
                    </div>
                    <div class="field">
                        <h5>Datos de la empresa</h5>
                        <FloatLabel>
                            <InputNumber id="inputnumber" v-model="value3" inputId="withoutgrouping"
                                :useGrouping="false">
                            </InputNumber>
                            <label for="inputnumber">NIT</label>
                        </FloatLabel>
                        <br>
                        <FloatLabel>
                            <InputNumber id="inputnumber" v-model="value4" inputId="withoutgrouping"
                                :useGrouping="false">
                            </InputNumber>
                            <label for="inputnumber">Matricula de comercio</label>
                        </FloatLabel>
                        <br>
                        <FloatLabel>
                            <InputText type="text" id="inputtext" v-model="value5" />
                            <label for="inputtext">Nombre de la empresa</label>
                        </FloatLabel>
                    </div>
                    <div class="field">
                        <h5>Datos de la persona</h5>
                        <FloatLabel>
                            <InputText type="text" id="inputtext" v-model="value6" />
                            <label for="inputtext">Nombre completo</label>
                        </FloatLabel>
                        <br>
                        <FloatLabel>
                            <InputText type="text" id="inputtext" v-model="value7" />
                            <label for="inputtext">Correo</label>
                        </FloatLabel>
                        <br>
                        <FloatLabel>
                            <InputNumber id="inputtext" v-model="value8" inputId="withoutgrouping"
                                :useGrouping="false" />
                            <label for="inputtext">Número de teléfono</label>
                        </FloatLabel>
                    </div>
                    <div class="field">
                        <h5>Tipo de problema</h5>
                        <div class="p-fluid mt-3">
                            <FloatLabel>
                                <Dropdown id="dropdown" :options="principal" v-model="value9" optionLabel="name">
                                </Dropdown>
                                <label for="dropdown">Elige una opción</label>
                            </FloatLabel>
                        </div>
                        <template v-if="value9 && value9.code === 'P'">
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <Dropdown id="planilla-options" :options="planillaOptions" v-model="subProblema"
                                        optionLabel="name"></Dropdown>
                                    <label for="planilla-options">Problemas Planillas</label>
                                </FloatLabel>
                            </div>
                        </template>
                        <template v-if="value9 && value9.code === 'R'">
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <Dropdown id="roe-options" :options="roeOptions" v-model="subProblema"
                                        optionLabel="name">
                                    </Dropdown>
                                    <label for="roe-options">Problemas ROE</label>
                                </FloatLabel>
                            </div>
                        </template>
                        <template v-if="value9 && value9.code === 'T'">
                            <div class="p-fluid mt-3">
                                <FloatLabel>
                                    <Dropdown id="trabajador-options" :options="trabajadorOptions" v-model="subProblema"
                                        optionLabel="name"></Dropdown>
                                    <label for="trabajador-options">Problemas Trabajadores</label>
                                </FloatLabel>
                            </div>
                        </template>
                    </div>
                    <div class="field">
                        <h5>¿Se realizó asistencia remota?</h5>
                        <div class="field-radiobutton mb-0">
                            <RadioButton id="siRemoro" name="option" value="Si" v-model="value10" />
                            <label for="siRemoro">Si</label>
                        </div>
                        <br>
                        <div class="field-radiobutton mb-0">
                            <RadioButton id="noRemoto" name="option" value="No" v-model="value10" />
                            <label for="noRemoto">No</label>
                        </div>
                    </div>
                    <div class="field">
                        <h5>Estado</h5>
                        <div class="p-fluid mt-3">
                            <FloatLabel>
                                <Dropdown id="dropdown" :options="solucion" v-model="value11" optionLabel="name">
                                </Dropdown>
                                <label for="dropdown">Estado</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="editarAtencion = false" />
                        <Button label="Guardar" icon="pi pi-check" text="" @click="handleUpdateAtencion" />
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
