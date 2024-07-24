<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import { ref, watch, onMounted } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { getResumenAtenciones, getPendientesUsuarios } from '@/services/userService';
import { fetchSolucionados, fetchPendientes, getAtencionesMes, getPlanillas, getRoe, getTrabajadores, getTotalOtros } from '@/services/userService';


const { layoutConfig } = useLayout();
let documentStyle = getComputedStyle(document.documentElement);
let textColor = documentStyle.getPropertyValue('--text-color');
let textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
let surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const resumenAtenciones = ref({});
const atencionesPendientes = ref({});

onMounted(async () => {
    try {
        const response = await getResumenAtenciones();
        response.data.forEach(item => {
            resumenAtenciones.value[item.tipo_atencion] = item.total;
        });

        const responsePendientes = await getPendientesUsuarios();
        responsePendientes.data.forEach(item => {
            atencionesPendientes.value[item.tipo_atencion] = item.cantidad;
        });
    } catch (error) {
        console.error('Error fetching atenciones summary:', error);
    }
});

const lineData = ref({});
const pieDataPlanillas = ref({});
const pieDataRoe = ref({});
const pieDataTrabajadores = ref({});
const doughnutData = ref(null);
//const polarData = ref(null);
const barData = ref(null);
//const radarData = ref(null);

const lineOptions = ref({});
const pieOptionsPlanillas = ref({});
const pieOptionsRoe = ref({});
const pieOptionsTrabajadores = ref({});
const doughnutOptions = ref(null);
//const polarOptions = ref(null);
const barOptions = ref(null);
//const radarOptions = ref(null);



const setColorOptions = () => {
    documentStyle = getComputedStyle(document.documentElement);
    textColor = documentStyle.getPropertyValue('--text-color');
    textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    surfaceBorder = documentStyle.getPropertyValue('--surface-border');
};

const setLineChart = async () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    const responseSolucionados = await fetchSolucionados(currentMonth, currentYear);
    const solucionadosData = responseSolucionados.data;
    const responsePendientes = await fetchPendientes(currentMonth, currentYear);
    const pendientesData = responsePendientes.data;

    const dataSolucionados = new Array(daysInMonth).fill(0);
    const dataPendientes = new Array(daysInMonth).fill(0);

    solucionadosData.forEach(item => {
        if (item.dia <= daysInMonth) {
            dataSolucionados[item.dia - 1] = item.solucionados;
        }
    });

    pendientesData.forEach(item => {
        if (item.dia <= daysInMonth) {
            dataPendientes[item.dia - 1] = item.pendientes;
        }
    });

    lineData.value = {
        labels,
        datasets: [
            {
                label: 'Casos solucionados',
                data: dataSolucionados,
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--primary-700'),
                borderColor: documentStyle.getPropertyValue('--primary-700'),
                tension: 0.4
            },
            {
                label: 'Casos pendientes',
                data: dataPendientes,
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--primary-300'),
                borderColor: documentStyle.getPropertyValue('--primary-300'),
                tension: 0.4
            }
        ]
    };

    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                ticks: {
                    stepSize: 1,
                    color: '#555',
                    callback: function (value) {
                        if (Math.floor(value) === value) {
                            return value;
                        }
                    }
                },
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Día del mes',
                    color: '#111',
                    font: {
                        size: 15
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#555',
                    stepSize: 1
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.8)',
                    borderDash: [5, 5]
                },
                title: {
                    display: true,
                    text: 'Número de casos',
                    color: '#111',
                    font: {
                        size: 15
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            intersect: false
        }
    };
}


const setBarChart = async () => {
    const atencionesData = await getAtencionesMes();
    const labels = atencionesData.map(atencion => atencion.tipo_atencion);
    const data = atencionesData.map(atencion => atencion.total);
    barData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Atenciones realizadas',
                backgroundColor: [documentStyle.getPropertyValue('--primary-700'), documentStyle.getPropertyValue('--primary-400'), documentStyle.getPropertyValue('--primary-200')],
                borderColor: [documentStyle.getPropertyValue('--primary-700'), documentStyle.getPropertyValue('--primary-400'), documentStyle.getPropertyValue('--primary-200')],
                data: data
            }
        ]
    };
    barOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    stepSize: 1,
                    color: '#555',
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    stepSize: 1,
                    color: '#555',
                    callback: function (value) {
                        if (Math.floor(value) === value) {
                            return value;
                        }
                    }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

const setPiePlanillas = async () => {
    const data = await getPlanillas();
    pieDataPlanillas.value = {
        labels: data.map(item => item.subproblema),
        datasets: [{
            data: data.map(item => item.total),
            backgroundColor: ['#264653', '#287271', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#0C7075', '#0F969C', '#6DA5C0', '#294D61'],
            hoverBackgroundColor: ['#2a526a', '#2d8880', '#33b59b', '#efd07e', '#f7ae78', '#ec7d5d', '#107f82', '#13a6ac', '#79b2cd', '#2e5970']
        }]
    };
    pieOptionsPlanillas.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: 'black'
                }
            }
        }
    }
}
const setPieRoe = async () => {
    const data = await getRoe();
    pieDataRoe.value = {
        labels: data.map(item => item.subproblema),
        datasets: [{
            data: data.map(item => item.total),
            backgroundColor: ['#264653', '#287271', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#0C7075', '#0F969C', '#6DA5C0', '#294D61'],
            hoverBackgroundColor: ['#2a526a', '#2d8880', '#33b59b', '#efd07e', '#f7ae78', '#ec7d5d', '#107f82', '#13a6ac', '#79b2cd', '#2e5970']
        }]
    };
    pieOptionsRoe.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: 'black'
                }
            }
        }
    }
}
const setPieTrabajadores = async () => {
    const data = await getTrabajadores();
    pieDataTrabajadores.value = {
        labels: data.map(item => item.subproblema),
        datasets: [{
            data: data.map(item => item.total),
            backgroundColor: ['#264653', '#287271', '#2A9D8F', '#E9C46A'],
            hoverBackgroundColor: ['#2a526a', '#2d8880', '#33b59b', '#efd07e']
        }]
    };
    pieOptionsPlanillas.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: 'black'
                }
            }
        }
    }
}

const setDonutOtros = async () => {
    const data = await getTotalOtros();
    doughnutData.value = {
        labels: data.map(item => item.problema),
        datasets: [
            {
                data: data.map(item => item.total),
                backgroundColor: ['#81b29a', '#f2cc8f', '#eab69f'],
                hoverBackgroundColor: ['#91c3aa', '#f3d6a5', '#f3c1b0']
            }
        ]
    }
    doughnutOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: 'black'
                }
            }
        }
    }
}

watch(
    layoutConfig.theme,
    () => {
        setColorOptions();
        setLineChart();
        setBarChart();
        setPiePlanillas();
        setPieRoe();
        setPieTrabajadores();
        setDonutOtros();
    },
    { immediate: true }
);
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Correos</span>
                        <div class="text-900 font-medium text-xl">{{ resumenAtenciones['Correo'] || 0 }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-envelope text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">{{ atencionesPendientes['Correo'] || 0 }} </span>
                <span class="text-500"> pendientes</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Llamadas</span>
                        <div class="text-900 font-medium text-xl">{{ resumenAtenciones['Telefono'] || 0 }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-phone text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">{{ atencionesPendientes['Telefono'] || 0 }}</span>
                <span class="text-500"> pendientes</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Presencial</span>
                        <div class="text-900 font-medium text-xl">{{ resumenAtenciones['Presencial'] || 0 }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-building text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">{{ atencionesPendientes['Presenciales'] || 0 }}</span>
                <span class="text-500"> pendientes</span>
            </div>
        </div>
    </div>
    <div class="grid p-fluid">
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Casos atendidos en el mes</h5>
                <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Tipos de atención</h5>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card flex flex-column align-items-center">
                <h5 class="text-left w-full">Inconvenientes declaracion de planillas</h5>
                <Chart type="pie" :data="pieDataPlanillas" :options="pieOptionsPlanillas"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card flex flex-column align-items-center">
                <h5 class="text-left w-full">Inconvenientes con el ROE</h5>
                <Chart type="pie" :data="pieDataRoe" :options="pieOptionsRoe"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card flex flex-column align-items-center">
                <h5 class="text-left w-full">Inconvenientes con trabajadores</h5>
                <Chart type="pie" :data="pieDataTrabajadores" :options="pieOptionsTrabajadores"></Chart>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card flex flex-column align-items-center">
                <h5 class="text-left w-full">Otros tipos de casos</h5>
                <Chart type="doughnut" :data="doughnutData" :options="doughnutOptions"></Chart>
            </div>
        </div>
    </div>
</template>

<style scoped></style>