<script setup>
import { ref, onMounted } from 'vue';
import { getPreguntasFrecuentes, addPregunta, updatePregunta, getPreguntaById } from '@/services/userService';
import { useToast } from 'primevue/usetoast';
import { jwtDecode } from "jwt-decode";

const preguntas = ref({
    roe: [],
    planillas: [],
    resolucion: [],
    otros: []
});

const categoriaOptions = ref([
    { name: 'ROE', code: 'roe' },
    { name: 'Planillas', code: 'planillas' },
    { name: 'Resoluciones', code: 'resolucion' },
    { name: 'Otros', code: 'otros' }
]);

const dialogVisible = ref(false);
const editDialogVisible = ref(false);
const categoria = ref(null);
const datos = ref({ pregunta: '', respuesta: '' });

const toast = useToast();

const fetchPreguntasData = async () => {
    try {
        const response = await getPreguntasFrecuentes();
        const data = response.data;

        preguntas.value.roe = data.filter(p => p.categoria.toLowerCase() === 'roe');
        preguntas.value.planillas = data.filter(p => p.categoria.toLowerCase() === 'planillas');
        preguntas.value.resolucion = data.filter(p => p.categoria.toLowerCase() === 'resolucion');
        preguntas.value.otros = data.filter(p => p.categoria.toLowerCase() === 'otros');
    } catch (error) {
        console.error(error);
    }
};

const showAddDialog = () => {
    dialogVisible.value = true;
};

const showEditDialog = async (preguntaId) => {
    try {
        //console.log("Enviando ID al backend:", preguntaId);
        localStorage.setItem('id_pregunta', JSON.stringify(preguntaId));
        const response = await getPreguntaById(preguntaId);
        if (response.data) {
            categoria.value = categoriaOptions.value.find(c => c.code.toLowerCase() === response.data.categoria.toLowerCase());
            datos.value = { pregunta: response.data.pregunta, respuesta: response.data.respuesta };
            editDialogVisible.value = true;
        } else {
            throw new Error("No se encontraron datos para la pregunta");
        }
    } catch (error) {
        console.error("Error al cargar los datos de la pregunta:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información de la pregunta', life: 3000 });
    }
};



const hideDialog = () => {
    dialogVisible.value = false;
    editDialogVisible.value = false;
    categoria.value = null;
    datos.value = { pregunta: '', respuesta: '' };
};

const guardarCambios = async () => {
    if (!categoria.value || !datos.value.pregunta || !datos.value.respuesta) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos son obligatorios', life: 3000 });
        return;
    }
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const id_usuario = decoded.id;
    const nuevaPregunta = {
        categoria: categoria.value.name.toLowerCase(),
        pregunta: datos.value.pregunta,
        respuesta: datos.value.respuesta,
        id_usuario: id_usuario
    };

    try {
        await addPregunta(nuevaPregunta);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta agregada exitosamente', life: 3000 });
        fetchPreguntasData();
        hideDialog();
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar la pregunta', life: 3000 });
    }
};

const actualizarPregunta = async () => {
    if (!datos.value.pregunta && !datos.value.respuesta && !categoria.value) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe modificar al menos un campo para actualizar', life: 3000 });
        return;
    }

    const updatedPregunta = {
        categoria: categoria.value ? categoria.value.code.toLowerCase() : undefined,
        pregunta: datos.value.pregunta,
        respuesta: datos.value.respuesta
    };
    const datoGuardado = localStorage.getItem('id_pregunta');
    const preguntaId = datoGuardado ? JSON.parse(datoGuardado) : null;
    //console.log(preguntaId)
    //console.log("debuuuuuging datos")
    //console.log(updatedPregunta)
    try {
        await updatePregunta(preguntaId, updatedPregunta);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta actualizada exitosamente', life: 3000 });
        fetchPreguntasData();
        hideDialog();
        localStorage.removeItem('id_pregunta');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la pregunta', life: 3000 });
    }
};


onMounted(fetchPreguntasData);
</script>


<template>
    <div class="grid">
        <div class="col-12 md:col-6">
            <div class="card" v-if="preguntas.roe && preguntas.roe.length">
                <h5>ROE</h5>
                <Accordion>
                    <AccordionTab v-for="(pregunta, index) in preguntas.roe" :key="index" :header="pregunta.pregunta">
                        <p class="line-height-3 m-0">{{ pregunta.respuesta }}</p>
                        <br>
                        <div class="grid">
                            <div class="col-12 md:col-12">
                                <div style="text-align: center;">
                                    <Button icon="pi pi-pencil" severity="primary" rounded
                                        @click="showEditDialog(pregunta.id_pregunta)" />
                                </div>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card" v-if="preguntas.planillas && preguntas.planillas.length">
                <h5>Planillas</h5>
                <Accordion>
                    <AccordionTab v-for="(pregunta, index) in preguntas.planillas" :key="index"
                        :header="pregunta.pregunta">
                        <p class="line-height-3 m-0">{{ pregunta.respuesta }}</p>
                        <br>
                        <div class="grid">
                            <div class="col-12 md:col-12">
                                <div style="text-align: center;">
                                    <Button icon="pi pi-pencil" severity="primary" rounded
                                        @click="showEditDialog(pregunta.id_pregunta)" />
                                </div>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card" v-if="preguntas.resolucion && preguntas.resolucion.length">
                <h5>RM 152/24 y RM 105/18</h5>
                <Accordion>
                    <AccordionTab v-for="(pregunta, index) in preguntas.resolucion" :key="index"
                        :header="pregunta.pregunta">
                        <p class="line-height-3 m-0">{{ pregunta.respuesta }}</p>
                        <br>
                        <div class="grid">
                            <div class="col-12 md:col-12">
                                <div style="text-align: center;">
                                    <Button icon="pi pi-pencil" severity="primary" rounded
                                        @click="showEditDialog(pregunta.id_pregunta)" />
                                </div>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card" v-if="preguntas.otros && preguntas.otros.length">
                <h5>Contraseña y Otros</h5>
                <Accordion>
                    <AccordionTab v-for="(pregunta, index) in preguntas.otros" :key="index" :header="pregunta.pregunta">
                        <p class="line-height-3 m-0">{{ pregunta.respuesta }}</p>
                        <br>
                        <div class="grid">
                            <div class="col-12 md:col-12">
                                <div style="text-align: center;">
                                    <Button icon="pi pi-pencil" severity="primary" rounded
                                        @click="showEditDialog(pregunta.id_pregunta)" />
                                </div>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
            <div class="p-fluid mt-3">
                <Button label="Añadir Pregunta" class="mr-2 mb-2" @click="showAddDialog" />
            </div>
            <Dialog v-model:visible="dialogVisible" :style="{ width: '450px' }" header="Añadir Pregunta" :modal="true"  class="p-fluid">
                <div class="field">
                    <h5>Datos de la pregunta</h5>
                    <FloatLabel>
                        <Dropdown v-model="categoria" :options="categoriaOptions" optionLabel="name" placeholder="Selecciona una categoría" />
                        <label for="categoria">Categoría</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputText v-model="datos.pregunta" id="inputtext" placeholder="Ingrese la pregunta" />
                        <label  for="inputtext">Pregunta</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputText v-model="datos.respuesta" id="inputtext1" placeholder="Ingrese la respuesta" />
                        <label  for="inputtext1">Pregunta</label>
                    </FloatLabel>
                </div>
                <template #footer>
                    <Button label="Guardar" @click="guardarCambios" />
                    <Button label="Cancelar" @click="hideDialog" />
                </template>
            </Dialog>

            <Dialog v-model:visible="editDialogVisible" :style="{ width: '450px' }" header="Editar Pregunta" :modal="true"  class="p-fluid">
                <div class="field">
                    <h5>Datos de la pregunta</h5>
                    <FloatLabel>
                        <Dropdown v-model="categoria" :options="categoriaOptions" optionLabel="name" placeholder="Selecciona una categoría" />
                        <label for="categoria">Categoría</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputText v-model="datos.pregunta" id="inputtext" placeholder="Ingrese la pregunta" />
                        <label  for="inputtext">Pregunta</label>
                    </FloatLabel>
                    <br>
                    <FloatLabel>
                        <InputText v-model="datos.respuesta" id="inputtext1" placeholder="Ingrese la respuesta" />
                        <label  for="inputtext1">Pregunta</label>
                    </FloatLabel>
                </div>
                <template #footer>
                    <Button label="Actualizar" @click="actualizarPregunta" />
                    <Button label="Cancelar" @click="hideDialog" />
                </template> 
            </Dialog>

            
        </div>
    </div>
</template>

<style>
/* Agrega tus estilos aquí */
</style>
