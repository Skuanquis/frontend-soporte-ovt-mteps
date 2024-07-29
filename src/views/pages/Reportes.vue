<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { getListaPasantes, getReport } from '../../services/userService';
import { jsPDF } from 'jspdf';
import { useToast } from 'primevue/usetoast';
import 'jspdf-autotable';

const toast = useToast();
const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const value5 = ref('');
const value6 = ref('');
const subProblema = ref('');

const reportAvailable = ref(false);

const pasantes = ref([]);

const principal = ref([
    { name: 'Planillas', code: 'P' },
    { name: 'ROE', code: 'R' },
    { name: 'Trabajadores', code: 'T' },
    { name: 'Falla interoperabilidad', code: 'F' },
    { name: 'Contraseña', code: 'C' },
    { name: 'Otro', code: 'O' },
    { name: 'Todos', code: 'TO' }
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
    { name: 'Error al importar', code: '10' },
    { name: 'Todos', code: '11' }
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
    { name: 'Representante legal', code: '10' },
    { name: 'Todos', code: '11' }
]);

const trabajadorOptions = ref([
    { name: 'No es jubilado', code: '1' },
    { name: 'Retiro de trabajador', code: '2' },
    { name: 'No valida dependiente', code: '3' },
    { name: 'No valida trabajador', code: '4' },
    { name: 'Todos', code: '5' }
]);

const tipos = ref([
    { name: 'Correo', code: 'C' },
    { name: 'Telefono', code: 'T' },
    { name: 'Presencial', code: 'P' },
    { name: 'Todos', code: 'TO' }
]);

const estado = ref([
    { name: 'Solucionado', code: 'S' },
    { name: 'Pendiente', code: 'PE' },
    { name: 'Todos', code: 'T' }
]);

const resultados = ref([]);
const filters = ref({});

const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const handleSubmit = async () => {
    //console.log(value1.value.name, value2.value.nombre, value3.value.name, value4.value.name, subProblema.value.name, value5.value, value6.value);
    if (!value1.value.name || !value2.value.nombre || !value3.value.name || !value4.value.name || (value5.value === null) || (value6.value === null)) {
        toast.add({ severity: 'warn', summary: 'Campos Requeridos', detail: 'Completa todos los campos antes de obtener el reporte.', life: 3000 });
        return;
    }

    const formattedFechaInicio = value5.value instanceof Date ? value5.value.toISOString().split('T')[0] : null;
    const formattedFechaFin = value6.value instanceof Date ? value6.value.toISOString().split('T')[0] : null;

    try {
        const response = await getReport({
            tipoAtencion: value1.value?.name || 'Todos',
            pasante: value2.value?.nombre || 'Todos',
            estado: value3.value?.name || 'Todos',
            problema: value4.value?.name || 'Todos',
            subproblema: subProblema.value?.name || 'Todos',
            fechaInicio: formattedFechaInicio,
            fechaFin: formattedFechaFin
        });
        resultados.value = response.data;
        reportAvailable.value = true;
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        toast.add({ severity: 'error', summary: 'Error al obtener el reporte', detail: 'Hubo un problema al intentar obtener el reporte. Por favor, inténtalo de nuevo.', life: 3000 });
        reportAvailable.value = false;
    }
};

const generatePDF = () => {
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
    doc.text(`Tipo de Atención: ${value1.value.name}`, 14, 50);
    doc.text(`Pasante: ${value2.value.nombre}`, 14, 56);
    doc.text(`Problema: ${value4.value.name}`, 14, 62);
    doc.text(`Sumproblema: ${subProblema.value.name || ""}`, 14, 68);
    doc.text(`Estado: ${value3.value.name}`, 105, 50);
    doc.text(`Fecha Inicio: ${formatDate(value5.value)}`, 105, 56);
    doc.text(`Fecha Fin: ${formatDate(value6.value)}`, 105, 62);
    doc.text(`Fecha del Reporte: ${formatDate(fechaActual)}`, 105, 68);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Registros encontrados: ${resultados.value.length}`, 14, 76);

    const margins = {
        top: 14,
        bottom: 14,
        left: 14,
        right: 14
    };

    const headers = [
        { title: 'Tipo', dataKey: 'tipo_atencion' },
        { title: 'Pasante', dataKey: 'nombre_pasante' },
        { title: 'Problema', dataKey: 'problema' },
        { title: 'Sub Problema', dataKey: 'subproblema' },
        { title: 'Estado', dataKey: 'estado' },
        { title: 'Fecha', dataKey: 'fecha' },
        { title: 'NIT', dataKey: 'nit' },
        { title: 'Nombre Empresa', dataKey: 'nombre_empresa' }
    ];


    const data = resultados.value.map(row => ({
        tipo_atencion: row.tipo_atencion || 'N/D',
        nombre_pasante: row.nombre_pasante || 'N/D',
        problema: row.problema || 'N/D',
        subproblema: row.subproblema || 'N/D',
        estado: row.estado || 'N/D',
        fecha: formatDate(row.fecha) || 'N/D',
        nit: row.nit || 'N/D',
        nombre_empresa: row.nombre_empresa || 'N/D'
    }));

    //console.log(data)

    doc.autoTable({
        columns: headers,
        body: data,
        startY: 80,
        margin: margins
    });

    doc.save(`reporteSoporteOVT${fechaActualDoc}.pdf`);
};



onMounted(async () => {
    try {
        const response = await getListaPasantes();
        pasantes.value = response.data;
        //console.log(pasantes.value)
    } catch (error) {
        console.error('Error al obtener pasantes:', error);
    }
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

onBeforeMount(() => {
    initFilters();
});
</script>

<template>
    <div>
        <div class="grid">
            <div class="col md:col-4">
                <div class="card">
                    <h5>Tipo de atención</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Dropdown id="tipo-atencion" :options="tipos" v-model="value1" optionLabel="name">
                            </Dropdown>
                            <label for="tipo-atencion">Elige una opción</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
            <div class="col md:col-4">
                <div class="card">
                    <h5>Pasante</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Dropdown id="pasante" :options="pasantes" v-model="value2" optionLabel="nombre"></Dropdown>
                            <label for="pasante">Elige un pasante</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
            <div class="col md:col-4">
                <div class="card">
                    <h5>Estado de atención</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Dropdown id="estado" :options="estado" v-model="value3" optionLabel="name"></Dropdown>
                            <label for="estado">Elige un estado</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid">
            <div class="col md:col-4">
                <div class="card">
                    <h5>Tipo de problema</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Dropdown id="tipo-problema" :options="principal" v-model="value4" optionLabel="name">
                            </Dropdown>
                            <label for="tipo-problema">Elige una opción</label>
                        </FloatLabel>
                    </div>
                    <template v-if="value4 && value4.code === 'P'">
                        <div class="p-fluid mt-3">
                            <FloatLabel>
                                <Dropdown id="planilla-options" :options="planillaOptions" v-model="subProblema"
                                    optionLabel="name"></Dropdown>
                                <label for="planilla-options">Problemas Planillas</label>
                            </FloatLabel>
                        </div>
                    </template>
                    <template v-if="value4 && value4.code === 'R'">
                        <div class="p-fluid mt-3">
                            <FloatLabel>
                                <Dropdown id="roe-options" :options="roeOptions" v-model="subProblema"
                                    optionLabel="name"></Dropdown>
                                <label for="roe-options">Problemas ROE</label>
                            </FloatLabel>
                        </div>
                    </template>
                    <template v-if="value4 && value4.code === 'T'">
                        <div class="p-fluid mt-3">
                            <FloatLabel>
                                <Dropdown id="trabajador-options" :options="trabajadorOptions" v-model="subProblema"
                                    optionLabel="name"></Dropdown>
                                <label for="trabajador-options">Problemas Trabajadores</label>
                            </FloatLabel>
                        </div>
                    </template>
                </div>
            </div>
            <div class="col md:col-4">
                <div class="card">
                    <h5>Fecha inicio</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Calendar inputId="fecha-inicio" v-model="value5" dateFormat="dd/mm/yy"></Calendar>
                            <label for="fecha-inicio">Fecha</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
            <div class="col md:col-4">
                <div class="card">
                    <h5>Fecha fin</h5>
                    <div class="p-fluid mt-3">
                        <FloatLabel>
                            <Calendar inputId="fecha-fin" v-model="value6" dateFormat="dd/mm/yy"></Calendar>
                            <label for="fecha-fin">Fecha</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid">
            <div class="col md:col-4"></div>
            <div class="col md:col-4 p-fluid">
                <Button label="Exportar reporte en PDF" @click="generatePDF" :disabled="!reportAvailable"
                    icon="pi pi-file-pdf" class="p-button-success" />
            </div>
            <div class="col md:col-4 p-fluid">
                <Button label="Obtener reporte" class="mr-2 mb-2" @click="handleSubmit"></Button>
            </div>
        </div>

        <!-- Tabla para mostrar los resultados -->
        <DataTable ref="dt" :value="resultados" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]"
            :filters="filters" currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} atenciones">
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <h5 class="m-0">Reporte Generado</h5>
                    <h5>Se encontraron {{ resultados.length }} registros</h5>
                    <IconField iconPosition="left" class="block mt-2 md:mt-0">
                        <InputIcon class="pi pi-search" />
                        <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Buscar..." />
                    </IconField>
                </div>
            </template>
            <Column field="tipo_atencion" header="Tipo" sortable></Column>
            <Column field="nombre_pasante" header="Pasante" sortable></Column>
            <Column field="problema" header="Problema" sortable></Column>
            <Column field="subproblema" header="Sub problema" sortable></Column>
            <Column field="estado" header="Estado" sortable></Column>
            <Column field="fecha" header="Fecha">
                <template #body="slotProps">
                {{ formatDate(slotProps.data.fecha) }}
                </template>
            </Column>
            <Column field="nit" header="NIT" sortable></Column>
            <Column field="nombre_empresa" header="Nombre empresa" sortable></Column>
        </DataTable>
    </div>
</template>
