<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Tag severity="secondary">BÁO CÁO TẶNG QUÀ</Tag>
            </template>

            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <!-- <headers>BÁO CÁO TẶNG QUÀ</headers> -->
        <DataTable v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id" @rowExpand="onRowExpand" :loading="isPending"
            @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
            <template #header>
                <div class="flex flex-wrap justify-end gap-2">
                    <!-- <Button text icon="pi pi-plus" label="Mở Rộng" @click="expandAll" />
                    <Button text icon="pi pi-minus" label="Thu Gọn" @click="collapseAll" /> -->
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
                    <Tag :value="slotProps.data.shift" :severity="getSeverity(slotProps.data.shift)" />
                </template>
            </Column>
            <Column field="store" header="Outlet"></Column>

            <template #expansion="slotProps">
                <div class="p-4">
                    <h5>Báo cáo tặng quà {{ slotProps.data.store }}</h5>
                    <DataTable :value="slotProps.data.gifts" :loading="isPending">
                        <Column field="bill_id" header="Mã Bill"></Column>
                        <Column field="customer_name" header="Tên Khách Hàng"></Column>
                        <Column field="customer_phone" header="Số Điện Thoại"></Column>
                        <Column field="gift_type" header="Loại Quà">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.gift_type"
                                    :severity="getGiftSeverity(slotProps.data.gift_type)" />
                            </template>
                        </Column>
                        <Column field="products" header="Sản Phẩm">
                            <template #body="slotProps">
                                <DataTable :value="slotProps.data.products" stripedRows header>
                                    <Column field="name"></Column>
                                    <Column field="count">
                                        <template #body="slotProps">
                                            <Tag :value="slotProps.data.count"
                                                :severity="getGiftCountSeverity(slotProps.data.count)" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </template>
                        </Column>
                        <Column field="gift_scheme" header="Scheme Quà"></Column>
                        <Column field="reward_gift" header="Quà"></Column>
                        <Column field="bill_image_url" header="Hình Ảnh Bill">
                            <template #body="slotProps">
                                <img :src="slotProps.data.bill_image_url" class="shadow-lg" width="64" alt="Services">
                            </template>
                        </Column>
                        <Column field="creward_image_url" header="Hình Ảnh Khách Nhận Quà">
                            <template #body="slotProps">
                                <img :src="slotProps.data.reward_image_url" class="shadow-lg" width="64" alt="Services">
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
        <Toast />
    </div>
</template>

<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw, watch } from 'vue';
import moment from 'moment';


const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['populate-deep'],
    queryFn: async () => {
        const res = await axios.get(`${APIUrl}/shift/populate-deep`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        shifts.value = res.data?.data;
        console.log(shifts.value)
        return res.data?.data;
    },

});
const onRowExpand = (event) => {
    // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};
const onRowCollapse = (event) => {
    // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};


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

watch(shifts, (newData) => {
    transformData(shifts.value)
})

function transformData(dt) {
    dt.forEach((item) => {
        if (item.working_shifts.length > 0) {
            let giftitems = [];
            item.working_shifts.forEach((ws) => {
                giftitems = giftitems.concat(ws.report_gifts);
            })
            if(giftitems.length > 0 ){
                const d = {
                id: item._id,
                date: item.start_utc,
                shift: item.session,
                store: item.store.name,
                gifts: giftitems
            }
            shiftstrans.value.push(d)
            }
        }
    })
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

const getGiftSeverity = (type) => {
    switch (type) {
        case 'INSTANT_GIFT':
            return 'info';

        case 'LUCKY_WHEEL':
            return 'warn';

        default:
            return null;
    }
}

const getGiftCountSeverity = (value) => {
    if (parseInt(value) > 0) {
        return "success";
    }
    return "secondary";
}

function formatUTC7Time(utcTimestamp) {
    const utc7Timestamp = moment.utc(utcTimestamp).utcOffset(7).format('HH:mm:ss');
    return utc7Timestamp;
};


</script>

<style>
.p-datatable-header-cell{
    background-color: #ffeebc !important;
}
</style>