<script setup>
import store from '@/store';
import { useQuery } from '@tanstack/vue-query';
import axios from 'axios';
import { ref, watch } from 'vue';

const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

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
        console.log(shifts.value);
        return res.data?.data;
    }
});

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
});

function combineStock(stockin, stockout) {
    const combinedData = {
        gifts: [],
        products: []
    };

    // Combine data from stockin and stockout for gifts, checking for stockout
    for (let i = 0; i < stockin.gifts?.length; i++) {
        combinedData.gifts.push({
            name: stockin.gifts[i].name,
            stockin: stockin.gifts[i].stock || 0,
            stockout: stockout?.gifts?.[i]?.stock || 0
        });
    }

    // Combine data from stockin and stockout for products, checking for stockout
    for (let i = 0; i < stockin.products?.length; i++) {
        combinedData.products.push({
            name: stockin.products[i].name,
            stockin: stockin.products[i].stock || 0,
            stockout: stockout?.products?.[i]?.stock || 0
        });
    }

    return combinedData;
}

function transformData(data) {
    return data.map((item) => {
        const workingShifts = (item.working_shifts || [])
            .filter((item) => item.stock_in || item.stock_out)
            .map((sh) => {
                return {
                    user: sh.user.username,
                    ...(sh.stock_in &&
                        sh.stock_out && {
                            stock: combineStock(sh.stock_in, sh.stock_out)
                        })
                };
            });
        const status = workingShifts.length > 0;
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

const getGiftCountSeverity = (value) => {
    if (parseInt(value) > 0) {
        return 'success';
    }
    return 'secondary';
};

const getShiftStatus = (status) => {
    return status ? 'ĐÃ THỰC HIỆN' : 'CHƯA THỰC HIỆN';
};

const getShiftStatusSeverity = (status) => {
    return status ? 'info' : 'danger';
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

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Tag severity="secondary">BÁO CÁO HÀNG TỒN</Tag>
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id" :loading="isPending" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
            <template #header>
                <div class="flex flex-wrap justify-end gap-2"></div>
            </template>
            <Column expander style="width: 5rem" />
            <Column field="date" header="Ngày">
                <template #body="slotProps">
                    {{ formatUTCToDDMMYYYY(slotProps.data.date) }}
                </template>
            </Column>
            <Column field="shift" header="Ca">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.shift" :severity="getShiftSeverity(slotProps.data.shift)" />
                </template>
            </Column>
            <Column field="store" header="Outlet"> </Column>
            <Column field="status" header="Trạng Thái Báo Cáo">
                <template #body="slotProps">
                    <Tag :value="getShiftStatus(slotProps.data.status)" :severity="getShiftStatusSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <template #expansion="slotProps">
                <div class="p-4">
                    <DataTable :value="slotProps.data.working_shifts" stripedRows class="custom-table">
                        <Column field="user" header="Tài khoản"></Column>
                        <Column field="stockin" header="Tồn Quà Tặng">
                            <template #body="slotProps">
                                <DataTable :value="slotProps.data.stock.gifts" stripedRows header>
                                    <Column field="name" header="Tên sản phẩm"></Column>
                                    <Column field="stockin" header="Tồn đầu">
                                        <template #body="slotProps">
                                            <Tag :value="slotProps.data.stockin" :severity="getGiftCountSeverity(slotProps.data.stockin)" />
                                        </template>
                                    </Column>
                                    <Column field="stockout" header="Tồn cuối">
                                        <template #body="slotProps">
                                            <Tag :value="slotProps.data.stockout" :severity="getGiftCountSeverity(slotProps.data.stockout)" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Column>
                        <Column field="stockin" header="Tồn Sản Phẩm Bán">
                            <template #body="slotProps">
                                <DataTable :value="slotProps.data.stock.products" stripedRows header>
                                    <Column field="name" header="Tên sản phẩm"></Column>
                                    <Column field="stockin" header="Tồn đầu"></Column>
                                    <Column field="stockout" header="Tồn cuối"></Column>
                                </DataTable>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<!-- 
<style scoped>
.custom-table .p-datatable-cell {
  text-align: left; /* Align text to the left */
  padding-left: 20px; /* Add left padding */
}
</style> -->
