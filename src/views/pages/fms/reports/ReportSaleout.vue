<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Tag severity="secondary">BÁO CÁO BÁN HÀNG</Tag>
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id" :loading="isPending"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
            <template #header>
                <div class="flex flex-wrap justify-end gap-2">
                </div>
            </template>
            <Column expander style="width: 5rem" />
            <Column field="date" header="Ngày"> 
                <template #body="slotProps">
                    {{ formatUTCToDDMMYYYY(slotProps.data.date) }}
                </template>
            </Column>
            <Column field="shift" header="Ca">
                <template #body="slotProps">
                    <Tag :value="(slotProps.data.shift)"
                        :severity="getShiftSeverity(slotProps.data.shift)" />
                </template>
            </Column>
            <Column field="store" header="Outlet"> </Column>
            <Column field="status" header="Trạng Thái Báo Cáo">
                <template #body="slotProps">
                    <Tag :value="getShiftStatus(slotProps.data.status)"
                        :severity="getShiftStatusSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <template #expansion="slotProps">
                <div class="p-4">
                    <DataTable :value="slotProps.data.working_shifts" stripedRows>
                        <Column field="user" header="Tài Khoản"></Column>
                        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
    </div>
</template>


<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';


const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;


const columns = [
    { field: "sales.STRONGBOW_KIWI_DRAGON_FRUIT_CAN_320ML", header: "STRONGBOW_KIWI_DRAGON_FRUIT_CAN_320ML" },
    { field: "sales.STRONGBOW_KIWI_DRAGON_FRUIT_BOTTLE_330ML", header: "STRONGBOW_KIWI_DRAGON_FRUIT_BOTTLE_330ML" },
    { field: "sales.STRONGBOW_PINEAPPLE_POMEGRANATE_CAN_320ML", header: "STRONGBOW_PINEAPPLE_POMEGRANATE_CAN_320ML" },
    { field: "sales.STRONGBOW_PINEAPPLE_POMEGRANATE_BOTTLE_330ML", header: "STRONGBOW_PINEAPPLE_POMEGRANATE_BOTTLE_330ML" },
    { field: "sales.STRONGBOW_ORIGINAL_APPLE_CAN_320ML", header: "STRONGBOW_ORIGINAL_APPLE_CAN_320ML" },
    { field: "sales.STRONGBOW_ORIGINAL_APPLE_BOTTLE_330ML", header: "STRONGBOW_ORIGINAL_APPLE_BOTTLE_330ML" },
    { field: "sales.STRONGBOW_RED_BERRY_CAN_320ML", header: "STRONGBOW_RED_BERRY_CAN_320ML" },
    { field: "sales.STRONGBOW_RED_BERRY_BOTTLE_330ML", header: "STRONGBOW_RED_BERRY_BOTTLE_330ML" },
    { field: "sales.STRONGBOW_DARK_FRUIT_CAN_320ML", header: "STRONGBOW_DARK_FRUIT_CAN_320ML" },
    { field: "sales.STRONGBOW_DARK_FRUIT_BOTTLE_330ML", header: "STRONGBOW_DARK_FRUIT_BOTTLE_330ML" }
]

const onRowExpand = (event) => {
    // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};
const onRowCollapse = (event) => {
    // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};

const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['populate-deep'],
    queryFn: async () => {
        const res = await axios.get(`${APIUrl}/shift/populate-deep`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        shifts.value = res.data?.data;
        return res.data?.data;
    },

});

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


const getGiftCountSeverity = (value) => {
    if (parseInt(value) > 0) {
        return "success";
    }
    return "secondary";
}

function formatUTCToDDMMYYYY(utcTimestamp) {
    const date = new Date(utcTimestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;

}

watch(shifts, (newData) => {
    shiftstrans.value = transformData(shifts.value);
    console.log(shiftstrans.value)
})


function reduceProductList(data) {
  const result = {};
  data.forEach(item => {
    result[item.name] = item.count;
  });
  return result;
}


function transformData(data) {
    return data.map((item) => {
        const workingShifts = (item.working_shifts || [])
            .filter((item) => item.sales)
            .map((sh) => {
                return {
                    user: sh.user.username,
                    sales: reduceProductList(sh.sales)
                };
            });
        const status = (workingShifts.length > 0)
        return {
            date: item.created_utc,
            shift: item.session,
            store: item.store.name,
            working_shifts: workingShifts,
            status: status,
            id: item._id
        };
    });
}


const getShiftStatus = (status) => {
    return status ? "ĐÃ THỰC HIỆN" : "CHƯA THỰC HIỆN"
};

const getShiftStatusSeverity = (status) => {
    return status ? "info" : "danger"
};

const getShiftSeverity = (session) => {
    switch (session) {
        case 'MORNING':
            return 'success';

        case 'AFTERNOON':
            return 'warn';

        default:
            return null;
    }
};


</script>
