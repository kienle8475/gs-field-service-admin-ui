<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Tạo Ca Làm" icon="pi pi-plus" severity="warn" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportExcel($event)" />
            </template>
        </Toolbar>

        <DataTable :value="store_shifts" sortMode="single" :sortOrder="1" :loading="loadingStatus"
            tableStyle="min-width: 50rem" :paginator="true" :rows="15" 
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[15, 50, 100]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} outlets">
            <Column field="start_utc" header="Ngày Thực hiện">
                <template #body="slotProps">
                    {{ formatUTCToDDMMYYYY(slotProps.data.start_utc) }}
                </template>
            </Column>
            <Column field="store.name" header="Outlet">
            </Column>

            <Column field="name" header="Tên Ca"></Column>
            <Column field="session" header="Ca">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.session" :severity="getSeverity(slotProps.data.session)" />
                </template>
            </Column>

            <Column field="start_utc" header="Giờ Bắt Đầu">
                <template #body="slotProps">
                    {{ formatUTC7Time(slotProps.data.start_utc) }}
                </template>
            </Column>
            <Column field="end_utc" header="Giờ Kết Thúc">
                <template #body="slotProps">
                    {{ formatUTC7Time(slotProps.data.end_utc) }}
                </template>
            </Column>
        </DataTable>
    </div>

    <Dialog v-model:visible="shiftDialog" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" header="Chi Tiết Ca Làm" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="outletname" class="block font-bold mb-3">Outlet</label>
                <Select v-model="shift.outlet" :options="outlets" optionLabel="name" optionValue="_id"
                    placeholder="Outlet" class="w-full" />
            </div>
            <div class="flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0">
                        <label for="radius" class="block font-bold mb-3">Tên ca</label>
                        <InputText type="text" id="radius" v-model="shift.name" required="true" autofocus
                            :invalid="submitted && !gps.radius" fluid />
                    </div>
                    <div class="flex flex-col grow basis-0">
                        <label for="outlettype" class="block font-bold mb-3">Ca</label>
                        <Select v-model="shift.session" :options="shiftItems" optionLabel="name" optionValue="code"
                            placeholder="Ca" class="w-full" />
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow basis-0">
                            <label for="lat" class="block font-bold mb-3">Thời gian bắt đầu</label>
                            <DatePicker id="datepicker-24h" v-model="shift.start_utc" showTime hourFormat="24" fluid />
                        </div>
                        <div class="flex flex-col grow basis-0">
                            <label for="lng" class="block font-bold mb-3">Thời gian kết thúc</label>
                            <DatePicker id="datepicker-24h" v-model="shift.end_utc" showTime hourFormat="24" fluid />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveShift" />
        </template>
    </Dialog>

</template>

<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw } from 'vue';
import { useToast } from "primevue/usetoast";
import moment from 'moment';

const store_shifts = ref();
const gps = ref();
const shift = ref();

const outlets = ref();



const isEdit = ref();
const shiftDialog = ref(false);
const submitted = ref(false);
const provinces = ref();
const toast = useToast()
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const shiftItems = ref([
    { name: 'Ca Sáng', code: 'MORNING' },
    { name: 'Ca Chiều', code: 'AFTERNOON' },

]);

const { isPending: loadingStatus, isError, data, error, refetch } = useQuery({
    queryKey: ['list-shift-detail'],
    queryFn: async () => {
        const res = await axios.get(`${APIUrl}/misc/list-shift-detail`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        store_shifts.value = res.data?.data;
        console.log(store_shifts.value)
        return res.data?.data;
    },

});

const outletQuery = useQuery({
    queryKey: ['list-outlet'],
    queryFn: async () => {
        const res = await axios.get(`${APIUrl}/store/list`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        outlets.value = res.data?.data;
        console.log(outlets.value)
        return res.data?.data;
    },

});

// const addShiftMutation = useMutation({
//     mutationFn: (newOutlet) => axios.post(`${APIUrl}/store/create`, newOutlet, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
// })

const addShiftMutation = useMutation({
    mutationFn: (params) => axios.post(`${APIUrl}/store/${params.id}/shifts/add`, params.body, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
})

const outletTypeItems = ref([
    { name: 'CVS', code: 'CVS' },
    { name: 'Minimart', code: 'MINIMART' },
    { name: 'Supermarket - Medium', code: 'SUPERMARKET' },
    { name: 'Supermarket - Mass', code: 'HYPERMARKET' }
]);

function openNew() {
    shift.value = {};
    gps.value = {};
    shiftDialog.value = true;
    isEdit.value = false;
}

function editOutlet(ol) {
    outlet.value = { ...ol };
    gps.value = outlet.value.gps
    outletDialog.value = true;
    isEdit.value = true;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatUTCToDDMMYYYY(utcTimestamp) {
    const date = new Date(utcTimestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;

}

function formattedDateToUTC(selectedDate) {
    if (selectedDate) {
        const utcDate = new Date(selectedDate);
        const utcTime = utcDate.toISOString();
        return utcTime;
    }
    return null;
}

const getSeverity = (session) => {
    switch (session) {
        case 'MORNING':
            return 'success';

        case 'AFTERNOON':
            return 'warn';

        default:
            return null;
    }
}


function formatUTC7Time(utcTimestamp) {
    const utc7Timestamp = utcTimestamp ? moment.utc(utcTimestamp).utcOffset(7).format('HH:mm:ss') : "";
    return utc7Timestamp;
}

function saveShift() {
    submitted.value = true;
    const outletid = shift.value.outlet;

    shift.value.start_utc = formattedDateToUTC(shift.value.start_utc) 
    shift.value.end_utc = formattedDateToUTC(shift.value.end_utc)
    delete(shift.value.outlet)

    // console.log(shift.value, outletid);

    if (!isEdit.value) {
        addShiftMutation.mutate({ id: outletid, body: shift.value }, {
            onSuccess: (data, variables) => {
                toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
                refetch()
            }, onError: (err, variables) => {
                toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
            }
        })
    }
    shiftDialog.value = false;
    shift.value = {};
}




function hideDialog() {
    shiftDialog.value = false;
    submitted.value = false;
}


</script>

<style>
.p-datatable-header-cell{
    background-color: #ffeebc !important;
}
</style>