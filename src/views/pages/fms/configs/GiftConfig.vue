<template>
    <div class="card">
        <DataTable v-model:editingRows="editingRows" :value="store_gift_trans" editMode="row" :loading="isPending" dataKey="_id"
            @row-edit-save="onRowEditSave" :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                }
            }">
            <Column field="store.name" header="Outlet"></Column>
            <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        </DataTable>
    </div>
</template>

<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw, watch } from 'vue';
import { useToast } from "primevue/usetoast";

const outlet = ref();
const gps = ref();

const store_gift = ref()
let store_gift_trans = ref([])

const outlets = ref();
const isEdit = ref();
const outletDialog = ref(false);
const submitted = ref(false);
const provinces = ref();
const toast = useToast()
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;


const columns = [
    { field: 'STRONGBOW_STRING_BAG', header: 'Túi STRONGBOW' },
    { field: 'STRONGBOW_TUMBLER_45CL', header: 'Ly STRONGBOW ' },
    { field: 'STRONGBOW_ICE_BUCKET_PLASTIC_8L', header: 'Thùng đá STRONGBOW plastic 8L' },
    { field: 'STRONGBOW_TROLLEY', header: 'Vali STRONGBOW' }
];

const { isPending: loadingStatus, isError, data, error, refetch } = useQuery({
    queryKey: ['list-store-detail'],
    queryFn: async () => {
        const res = await axios.get(`${APIUrl}/misc/luckywheel-stock`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        store_gift.value = res.data?.data;
        return res.data?.data;
    },

});

const products = ref();
const editingRows = ref([]);


watch(store_gift, (newData) => {
    store_gift_trans.value = transformData(store_gift.value)
})

function transformData(dt) {
    const result = dt.map(item => ({
        ...item,
        ...item.gifts.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.stock }), {})
    }));
    return result
}

const updateLuckyWheelStockMutation = useMutation({
    mutationFn: (params) => axios.post(`${APIUrl}/store/${params.id}/config-luckywheel`, params.body, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
})

const onRowEditSave = (event) => {
    let { newData, index } = event;
    const newGiftSet = {
        gifts: [
            {
                name: "STRONGBOW_STRING_BAG",
                stock: parseInt(newData.STRONGBOW_STRING_BAG)
            },
            {
                name: "STRONGBOW_TUMBLER_45CL",
                stock: parseInt(newData.STRONGBOW_TUMBLER_45CL)
            },
            {
                name: "STRONGBOW_ICE_BUCKET_PLASTIC_8L",
                stock: parseInt(newData.STRONGBOW_ICE_BUCKET_PLASTIC_8L)
            },
            {
                name: "STRONGBOW_TROLLEY",
                stock: parseInt(newData.STRONGBOW_TROLLEY)
            }
        ]
    }

    updateLuckyWheelStockMutation.mutate({ id: newData.store._id, body: newGiftSet}, {
        onSuccess: (data, variables) => {
            toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
            refetch()
        }, onError: (err, variables) => {
            toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        }
    })
};

// products.value[index] = newData;

</script>
