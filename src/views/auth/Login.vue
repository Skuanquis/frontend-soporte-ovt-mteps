<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div
        class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/layout/images/mintrab2.png" alt="Image" height="100" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                    </div>

                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Usuario</label>
                        <InputText id="username" type="text" placeholder="Username" class="w-full md:w-30rem mb-5"
                            style="padding: 1rem" v-model="username" @keyup.enter="login"/>

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true"
                            :feedback="false" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" @keyup.enter="login">
                        </Password>
                        <Button label="Iniciar Sesión" class="w-full p-3 text-xl" @click="login"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/userService';

const username = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
    try {
        if (!username.value || !password.value) {
            alert('Por favor, ingrese su usuario y contraseña.');
            return;
        }

        const response = await loginUser({ username: username.value, password: password.value });
        localStorage.setItem('token', response.data.accessToken);
        router.push('/dashboard');
    } catch (error) {
        alert(`Error: ${error.response.data.error}`);
    }
};

</script>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
