<script setup>
import InputNumber from 'primevue/inputnumber';
import { ref } from 'vue';
import { createAtencion } from '../../services/atencionService';
import { jwtDecode } from "jwt-decode";
import { useToast } from 'primevue/usetoast';

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
const toast = useToast();

const principal = ref([
    { name: 'Planillas', code: 'P' },
    { name: 'ROE', code: 'R' },
    { name: 'Trabajadores', code: 'T' },
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

const resetForm = () => {
    value1.value = null;
    value2.value = null;
    value3.value = null;
    value4.value = null;
    value5.value = '';
    value6.value = '';
    value7.value = '';
    value8.value = null;
    value9.value = null;
    value10.value = null;
    value11.value = null;
    subProblema.value = null;
};

const handleSubmit = async () => {
    try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const id_usuario = decoded.id;
        const atencionData = {
            id_usuario,
            fecha: value2.value,
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

        const response = await createAtencion(atencionData);
        toast.add({ severity: 'success', summary: 'Éxito', detail: response.data.message, life: 3000 });
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar la atencion', life: 3000 });
    }
};
</script>

<template>
    <div class="grid">
        <div class="col md:col-4">
            <div class="card">
                <h5>Tipo de atención</h5>
                <div class="p-fluid mt-3">
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
            </div>
        </div>
        <div class="field col md:col-4">
            <div class="card">
                <h5>Datos de la empresa</h5>
                <div class="p-fluid mt-3">
                    <FloatLabel>
                        <InputNumber id="inputnumber" v-model="value3" inputId="withoutgrouping" :useGrouping="false">
                        </InputNumber>
                        <label for="inputnumber">NIT</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputNumber id="inputnumber" v-model="value4" inputId="withoutgrouping" :useGrouping="false">
                        </InputNumber>
                        <label for="inputnumber">Matricula de comercio</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputText type="text" id="inputtext" v-model="value5" />
                        <label for="inputtext">Nombre de la empresa</label>
                    </FloatLabel>
                </div>
            </div>
        </div>
        <div class="col md:col-4">
            <div class="card">
                <h5>Datos de la persona</h5>
                <div class="p-fluid mt-3">
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
                        <InputNumber id="inputnumber" v-model="value8" inputId="withoutgrouping" :useGrouping="false" />
                        <label for="inputtext">Numero de telefono</label>
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
                        <Dropdown id="dropdown" :options="principal" v-model="value9" optionLabel="name"></Dropdown>
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
                            <Dropdown id="roe-options" :options="roeOptions" v-model="subProblema" optionLabel="name">
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
        </div>
        <div class="field col md:col-4">
            <div class="card">
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
        </div>
        <div class="field col md:col-4">
            <div class="card">
                <h5>Estado </h5>
                <div class="p-fluid mt-3">
                    <FloatLabel>
                        <Dropdown id="dropdown" :options="solucion" v-model="value11" optionLabel="name"></Dropdown>
                        <label for="dropdown">Estado</label>
                    </FloatLabel>
                    <div class="p-fluid mt-3">
                        <Button label="Registrar" class="mr-2 mb-2" @click="handleSubmit"></Button>
                    </div>
                </div>

            </div>
        </div>
    </div>

</template>
