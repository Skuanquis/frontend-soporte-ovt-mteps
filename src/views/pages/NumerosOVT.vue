<script setup>
import { ref, onMounted } from 'vue';
import { getReporteAnual, getReporteAnualMensual, getReporteAnioMes } from '@/services/atencionService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const reporteAnual = ref([]);
const reporteAnualMensual = ref(Array(12).fill({}));
const dialogVisible = ref(false);
const datosMes = ref({});
const mesSeleccionado = ref(''); 

const fetchReporteAnual = async () => {
  try {
    const response = await getReporteAnual(); 
    reporteAnual.value = response.data; 
    //console.log("array Anual: ",reporteAnual.value)
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos anuales', life: 3000 });
  }
};


const fetchReporteAnualMensual = async () => {
  try {
    const response = await getReporteAnualMensual();
    const datosPorAnio = {};

    response.data.forEach(item => {
      if (!datosPorAnio[item.Anio]) {
        datosPorAnio[item.Anio] = Array(12).fill().map(() => ({
          Total_Casos: 0,
          Total_Correos: 0,
          Total_Llamadas: 0,
          Total_Presencial: 0
        }));
      }
      datosPorAnio[item.Anio][item.Mes - 1] = {...item};
    });

    reporteAnualMensual.value = datosPorAnio;
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos mensuales', life: 3000 });
  }
};

const openDialog = async (anio, mes) => {
  try {
    const response = await getReporteAnioMes(anio, mes + 1);
    datosMes.value = response.data.length > 0 ? response.data : [];
    mesSeleccionado.value = obtenerMes(mes + 1);
    dialogVisible.value = true;
  } catch (error) {
    console.error('Error al obtener los datos del mes:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del mes', life: 3000 });
    datosMes.value = [];
    dialogVisible.value = true;
  }
};



const obtenerMes = (mes) => {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return meses[mes-1];
}



onMounted(() => {

  fetchReporteAnual();
  fetchReporteAnualMensual();
});
</script>

<template>
  <div class="grid p-fluid">
    <div class="col md:col-12" v-for="(reporte, index) in reporteAnual" :key="index">
      <div class="card">
        <h5 class="text-center gestion-title"><strong>Gestión {{ reporte.Anio }}</strong></h5>
        <h5 class="text-center total-casos">Total de casos registrados: {{ reporte.Total_Casos }}</h5>
        <div class="grid p-fluid">
          <div class="col md:col-4">
            <h5 class="info-data">Correos Atendidos: {{ reporte.Total_Correos }}</h5>
          </div>
          <div class="col md:col-4">
            <h5 class="info-data">Llamadas Registradas: {{ reporte.Total_Llamadas }}</h5>
          </div>
          <div class="col md:col-4">
            <h5 class="info-data">Atenciones Presenciales: {{ reporte.Total_Presencial }}</h5>
          </div>
        </div>
        <div class="grid p-fluid">
          <div class="col md:col-3">
            <h5 class="info-data">Casos de Planillas: {{ reporte.Total_Inconvenientes_Planillas }}</h5>
            <h5 class="case-data">Planilla Mensual: {{ reporte.Subproblema_Mensual }}</h5>
            <h5 class="case-data">Planilla Retroactiva: {{ reporte.Subproblema_Retroactiva }}</h5>
            <h5 class="case-data">Planilla Aguinaldo: {{ reporte.Subproblema_Aguinaldo }}</h5>
            <h5 class="case-data">Rectificación: {{ reporte.Subproblema_Rectificacion }}</h5>
            <h5 class="case-data">Fuera de Plazo: {{ reporte.Subproblema_Fueradeplazo }}</h5>
            <h5 class="case-data">Declaración en Cero: {{ reporte.Subproblema_Declaracionencero }}</h5>
            <h5 class="case-data">Tipo de Declaración: {{ reporte.Subproblema_Tipodedeclaracion }}</h5>
            <h5 class="case-data">No Figura Sucursal: {{ reporte.Subproblema_Nofigurasucursal }}</h5>
            <h5 class="case-data">Incumplimiento: {{ reporte.Subproblema_Incumplimientodeclaracion }}</h5>
            <h5 class="case-data">Error al Importar: {{ reporte.Subproblema_Errorimportar }}</h5>
          </div>
          <div class="col md:col-3">
            <h5 class="info-data">Casos de ROE: {{ reporte.Total_ROE }}</h5>
            <h5 class="case-data">Dar de Baja el ROE: {{ reporte.Subproblema_DarbajaROE }}</h5>
            <h5 class="case-data">Correo de Confirmación: {{ reporte.Subproblema_Correodeconfirmacion }}</h5>
            <h5 class="case-data">Multa RM°105/18: {{ reporte.Subproblema_MultaRM105 }}</h5>
            <h5 class="case-data">Inicio de Actividades: {{ reporte.Subproblema_Iniciodeactividades }}</h5>
            <h5 class="case-data">Sucursal Inactiva: {{ reporte.Subproblema_Sucursalinactiva }}</h5>
            <h5 class="case-data">Inscripción al ROE: {{ reporte.Subproblema_InscripcionROE }}</h5>
            <h5 class="case-data">Pendiente de Firma: {{ reporte.Subproblema_Pendientedefirma }}</h5>
            <h5 class="case-data">Actualizar ROE: {{ reporte.Subproblema_ActualizarROE }}</h5>
            <h5 class="case-data">Error Interno: {{ reporte.Subproblema_Errorinterno }}</h5>
            <h5 class="case-data">Representante Legal: {{ reporte.Subproblema_Representantelegal }}</h5>
          </div>
          <div class="col md:col-3">
            <h5 class="info-data">Casos de Trabajadores: {{ reporte.Total_Trabajadores }}</h5>
            <h5 class="case-data">No es Jubilado: {{ reporte.Subproblema_Noesjubilado }}</h5>
            <h5 class="case-data">Retiro de Trabajador: {{ reporte.Subproblema_Retirotrabajador }}</h5>
            <h5 class="case-data">No Valida Dependiente: {{ reporte.Subproblema_Novalidadependiente }}</h5>
            <h5 class="case-data">No Valida Trabajador: {{ reporte.Subproblema_Novalidatrabajador }}</h5>
          </div>
          <div class="col md:col-3">
            <h5 class="info-data">Otros Casos: {{ (reporte.Total_Contraseña || 0) + (reporte.Total_Falla_Interoperabilidad || 0) + (reporte.Total_Otro || 0) + (reporte.Deposito || 0)}}</h5>
            <h5 class="case-data">Deposito: {{ reporte.Deposito }}</h5>
            <h5 class="case-data">Contraseña: {{ reporte.Total_Contraseña }}</h5>
            <h5 class="case-data">Falla de Interoperabilidad: {{ reporte.Total_Falla_Interoperabilidad }}</h5>
            <h5 class="case-data">Otro: {{ reporte.Total_Otro }}</h5>
          </div>
        </div>
        <div class="grid p-fluid">
          <div class="col md:col-3" v-for="(data, monthIndex) in reporteAnualMensual[reporte.Anio]" :key="monthIndex">
            <div class="card card-mes" @click="openDialog(reporte.Anio, monthIndex)">
              <h5 class="text-center month-name">{{ ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][monthIndex] }}</h5>
              <div class="data-section">
                <h5 class="data-text">Casos atendidos: {{ data.Total_Casos || 0 }}</h5>
              </div>
              <div class="data-section">
                <h5 class="data-text">Correos: {{ data.Total_Correos || 0 }}</h5>
              </div>
              <div class="data-section">
                <h5 class="data-text">Llamadas: {{ data.Total_Llamadas || 0 }}</h5>
              </div>
              <div class="data-section">
                <h5 class="data-text">Presenciales: {{ data.Total_Presencial || 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="dialogVisible" :style="{ width: '450px' }" header="Detalles del mes" :modal="true" class="p-fluid">
    <h5 class="text-center month-name-dialog">{{ mesSeleccionado }}</h5>
    <template v-if="datosMes && datosMes.length > 0">
      <div class="data-wrapper">
        <div class="data-section">
          <h5 class="info-data-dialog">Total de casos registrados: {{ datosMes[0].Total_Casos }}</h5>
          <h5 class="info-data-dialog">Correos: {{ datosMes[0].Total_Correos }}</h5>
          <h5 class="info-data-dialog">Llamadas: {{ datosMes[0].Total_Llamadas }}</h5>
          <h5 class="info-data-dialog">Atenciones Presenciales: {{ datosMes[0].Total_Presencial }}</h5>
        </div>
        <div class="data-section">
          <h5 class="info-data-dialog">Casos de Planillas: {{ datosMes[0].Total_Inconvenientes_Planillas }}</h5>
          <div class="grid p-fluid">
            <div class="col md:col-6">
              <h5 class="case-data">Planilla Mensual: {{datosMes[0].Subproblema_Mensual }}</h5>
              <h5 class="case-data">Planilla Retroactiva: {{datosMes[0].Subproblema_Retroactiva }}</h5>
              <h5 class="case-data">Planilla Aguinaldo: {{datosMes[0].Subproblema_Aguinaldo }}</h5>
              <h5 class="case-data">Rectificación: {{datosMes[0].Subproblema_Rectificacion }}</h5>
              <h5 class="case-data">Fuera de Plazo: {{datosMes[0].Subproblema_Fueradeplazo }}</h5>
            </div>
            <div class="col md:col-6">
              <h5 class="case-data">Declaración en Cero: {{datosMes[0].Subproblema_Declaracionencero }}</h5>
              <h5 class="case-data">Tipo de Declaración: {{datosMes[0].Subproblema_Tipodedeclaracion }}</h5>
              <h5 class="case-data">No Figura Sucursal: {{datosMes[0].Subproblema_Nofigurasucursal }}</h5>
              <h5 class="case-data">Incumplimiento: {{datosMes[0].Subproblema_Incumplimientodeclaracion }}</h5>
              <h5 class="case-data">Error al Importar: {{datosMes[0].Subproblema_Errorimportar }}</h5>
            </div>
          </div>
        </div>
        <div class="data-section">
          <h5 class="info-data-dialog">Casos de ROE: {{ datosMes[0].Total_ROE }}</h5>
          <div class="grid p-fluid">
            <div class="col md:col-6">
              <h5 class="case-data">Dar de Baja el ROE: {{ datosMes[0].Subproblema_DarbajaROE }}</h5>
              <h5 class="case-data">Correo de Confirmación: {{ datosMes[0].Subproblema_Correodeconfirmacion }}</h5>
              <h5 class="case-data">Multa RM°105/18: {{ datosMes[0].Subproblema_MultaRM105 }}</h5>
              <h5 class="case-data">Inicio de Actividades: {{ datosMes[0].Subproblema_Iniciodeactividades }}</h5>
              <h5 class="case-data">Sucursal Inactiva: {{ datosMes[0].Subproblema_Sucursalinactiva }}</h5>
            </div>
            <div class="col md:col-6">
              <h5 class="case-data">Inscripción al ROE: {{ datosMes[0].Subproblema_InscripcionROE }}</h5>
              <h5 class="case-data">Pendiente de Firma: {{ datosMes[0].Subproblema_Pendientedefirma }}</h5>
              <h5 class="case-data">Actualizar ROE: {{ datosMes[0].Subproblema_ActualizarROE }}</h5>
              <h5 class="case-data">Error Interno: {{ datosMes[0].Subproblema_Errorinterno }}</h5>
              <h5 class="case-data">Representante Legal: {{ datosMes[0].Subproblema_Representantelegal }}</h5>
            </div>
          </div>
        </div>
        <div class="data-section">
          <h5 class="info-data-dialog">Casos de Trabajadores: {{ datosMes[0].Total_Trabajadores }}</h5>
          <div class="grid p-fluid">
            <div class="col md:col-6">
              <h5 class="case-data">No es Jubilado: {{ datosMes[0].Subproblema_Noesjubilado }}</h5>
              <h5 class="case-data">Retiro de Trabajador: {{ datosMes[0].Subproblema_Retirotrabajador }}</h5>
            </div>
            <div class="col md:col-6">
              <h5 class="case-data">No Valida Dependiente: {{ datosMes[0].Subproblema_Novalidadependiente }}</h5>
              <h5 class="case-data">No Valida Trabajador: {{ datosMes[0].Subproblema_Novalidatrabajador }}</h5>
            </div>
          </div>
        </div>
        <div class="data-section">
          <h5 class="info-data-dialog">Otros Casos: {{ (datosMes[0].Total_Contraseña || 0) + (datosMes[0].Total_Falla_Interoperabilidad || 0) + (datosMes[0].Total_Otro || 0) + (datosMes[0].Deposito || 0)}}</h5>
          <div class="grid p-fluid">
            <div class="col md:col-6">
              <h5 class="case-data">Contraseña: {{ datosMes[0].Total_Contraseña }}</h5>
              <h5 class="case-data">Deposito: {{ datosMes[0].Deposito }}</h5>
            </div>
            <div class="col md:col-6">
              <h5 class="case-data">Falla de Interoperabilidad: {{ datosMes[0].Total_Falla_Interoperabilidad }}</h5>
              <h5 class="case-data">Otro: {{ datosMes[0].Total_Otro }}</h5>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <h5 class="text-center">No hay datos disponibles para este mes.</h5>
    </template>
  </Dialog>

</template>
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

