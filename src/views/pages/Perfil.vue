<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserInfo, updateUserProfile, updateUserPassword, getOperadores, updateRolesSupervisor } from '@/services/userService';
import { useToast } from 'primevue/usetoast';
import { jwtDecode } from "jwt-decode";
import { useStore } from 'vuex';

const store = useStore();
const token = localStorage.getItem('token');
const decoded = jwtDecode(token);
const toast = useToast();
const nombre = ref('');
const direccion = ref('');
const ci = ref('');
const numero = ref('');
const passwordAnterior = ref('');
const nuevaPassword = ref('');
const repetirNuevaPassword = ref('');
const userId = ref(null);
const router = useRouter();
const rol = decoded.role;
const idUser = decoded.id;
//const value1 = ref('');
const value2 = ref('');
const operadores = ref([]);

const loadOperadores = async () => {
    try {
        const response = await getOperadores();
        operadores.value = response.data
        //console.log(operadores.value);
    } catch (error) {
        console.error('Error fetching operadores info:', error);
    }
}

const loadUserInfo = async () => {
    try {
        const response = await getUserInfo();
        const user = response.data;
        nombre.value = user.nombre;
        direccion.value = user.direccion;
        ci.value = user.ci;
        numero.value = user.numero;
        userId.value = user.id_usuario;
    } catch (error) {
        console.error('Error fetching user info:', error);
        localStorage.removeItem('token');
        router.push('/');
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la informacion del usuario.', life: 3000 });
    }
};

/*const asignarSupervision = async () =>{
    console.log(value1.value.nombre);
    console.log(value1.value.id_usuario);
    try {
        await updateRolSupervisor(value1.value.id_usuario);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Supervisor asignado con exito', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la Error al designar supervisor', life: 3000 });
    }
}*/

const cerrarSesion = () => {
    localStorage.removeItem('token');
    store.commit('clearUser');
    router.push('/');
};


const delegarSupervision = async () =>{
    //console.log(value2.value.nombre);
    //console.log(value2.value.id_usuario);
    //console.log(idUser);
    try {
        await updateRolesSupervisor(value2.value.id_usuario, idUser);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Supervisor asignado con exito', life: 3000 });
        cerrarSesion()
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'Debes elegir al supervisor', life: 3000 });
    }
}

const actualizarInformacion = async () => {
    try {
        await updateUserProfile(userId.value, {
            nombre: nombre.value,
            direccion: direccion.value,
            ci: ci.value,
            numero: numero.value,
        });
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Información actualizada con éxito', life: 3000 });
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la información', life: 3000 });
    }
};

const actualizarContrasena = async () => {
    if (nuevaPassword.value !== repetirNuevaPassword.value) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Las nuevas contraseñas no coinciden', life: 3000 });
        return;
    }

    try {
        await updateUserPassword(userId.value, {
            passwordAnterior: passwordAnterior.value,
            nuevaPassword: nuevaPassword.value,
        });
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada con éxito', life: 3000 });
        passwordAnterior.value = '';
        nuevaPassword.value = '';
        repetirNuevaPassword.value = '';
    } catch (error) {
        console.error('Error updating password:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la contraseña', life: 3000 });
    }
};

onMounted(() => {
    loadUserInfo();
    loadOperadores();
});
</script>

<template>
    <div class="grid p-fluid">
        <div class="col-12 md:col-6">
            <div class="card">
                <h5>Nombre</h5>
                <div class="grid formgrid">
                    <div class="col-12 mb-2 ">
                        <InputText v-model="nombre" placeholder="Tu nombre"></InputText>
                    </div>
                </div>
                <h5>Direccion</h5>
                <div class="grid formgrid">
                    <div class="col-12 mb-2 ">
                        <InputText v-model="direccion" placeholder="Tu dirección"></InputText>
                    </div>
                </div>
                <br>
                <div class="formgroup-inline">
                    <div class="col-12 md:col-6">
                        <h5>CI</h5>
                        <InputText v-model="ci" placeholder="Tu CI"></InputText>
                    </div>
                    <div class="col-12 md:col-6">
                        <h5>Número</h5>
                        <InputText v-model="numero" placeholder="Tu número"></InputText>
                    </div>
                </div>
                <div class="col-12 mt-3">
                    <Button label="Actualizar Información" class="mr-2 mb-2" @click="actualizarInformacion"></Button>
                </div>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card">
                <h5>Anterior Contraseña</h5>
                <div class="grid formgrid">
                    <div class="col-12 mb-2">
                        <InputText type="password" v-model="passwordAnterior" placeholder="Contraseña Anterior">
                        </InputText>
                    </div>
                </div>
                <h5>Nueva Contraseña</h5>
                <div class="grid formgrid">
                    <div class="col-12 mb-2">
                        <Password id="nuevopass" v-model="nuevaPassword" placeholder="Nueva Contraseña" promptLabel="Ingrese su nueva contraseña" weakLabel="Muy Simple" mediumLabel="Algo Seguro" strongLabel="Muy Seguro"
                            :toggleMask="true"></Password>
                    </div>
                </div>
                <h5>Repita la Nueva Contraseña</h5>
                <div class="grid formgrid">
                    <div class="col-12 mb-2">
                        <Password id="repitenuevopass" v-model="repetirNuevaPassword" promptLabel="Repita su nueva contraseña" weakLabel="Muy Simple" mediumLabel="Algo Seguro" strongLabel="Muy Seguro"
                            placeholder="Repita la Nueva Contraseña" :toggleMask="true"></Password>
                    </div>
                </div>
                <br>
                <Button label="Actualizar Contraseña" class="mr-2 mb-2" @click="actualizarContrasena"></Button>
            </div>
        </div>
    </div>
    <div class="grid p-fluid" v-if="rol === 'supervisor'">

        <div class="col-12 md:col-6">
            <div class="card">
                <h5>Delegar Supervisión</h5>  
                <div class="p-fluid mt-3">
                    <FloatLabel>
                        <Dropdown id="operador" :options="operadores" v-model="value2" optionLabel="nombre"></Dropdown>
                        <label for="operador">Elige un operador</label>
                    </FloatLabel>
                    <br>
                    <Button label="Confirmar" class="mr-2 mb-2" @click="delegarSupervision"></Button>
                </div>  
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Agrega tus estilos aquí */
</style>
