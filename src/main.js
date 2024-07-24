/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import '@/assets/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import store from './store'

import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Toast from 'primevue/toast'
import FloatLabel from 'primevue/floatlabel'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import TreeSelect from 'primevue/treeselect'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Chart from 'primevue/chart'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea';
import ToastService from 'primevue/toastservice'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(store)
app.use(PrimeVue, { ripple: true })
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('InputText', InputText)
app.component('Button', Button)
app.component('Checkbox', Checkbox)
app.component('Password', Password)
app.component('Toast', Toast)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
app.component('FloatLabel', FloatLabel)
app.component('Dropdown', Dropdown)
app.component('Calendar', Calendar)
app.component('InputNumber', InputNumber)
app.component('TreeSelect', TreeSelect)
app.component('DataTable', DataTable)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('Column', Column)
app.component('Tag', Tag)
app.component('Dialog', Dialog)
app.component('Chart', Chart)
app.component('Textarea', Textarea)
app.component('RadioButton', RadioButton)
app.use(ToastService)

app.mount('#app')
