<template>
    <DataTable :value="shifts" tableStyle="min-width: 50rem">
        <ColumnGroup type="header">
            <Row>
                <Column header="Ngày" :rowspan="2" />
                <Column header="Ca" :rowspan="2" />
                <Column header="Outlet" :rowspan="2" />
                <Column header="Tài Khoản" :rowspan="2" />
                <Column header="Báo Cáo Hình Ảnh Đầu Ca" :colspan="4" />
                <Column header="Báo Cáo Hình Ảnh Cuối Ca" :colspan="4" />
            </Row>
            <Row>
                <Column header="POSM 1" :colspan="1" />
                <Column header="POSM 2" :colspan="1" />
                <Column header="POSM 3" :colspan="1" />
                <Column header="Biên Bản" :colspan="1" />
                <Column header="POSM 1" :colspan="1" />
                <Column header="POSM 2" :colspan="1" />
                <Column header="POSM 3" :colspan="1" />
                <Column header="Biên Bản" :colspan="1" />
            </Row>
        </ColumnGroup>
        <!-- <Column field="product" />
        <Column field="lastYearSale">
            <template #body="slotProps">
                {{slotProps.data.lastYearSale}}%
            </template>
        </Column>
        <Column field="thisYearSale">
            <template #body="slotProps">
                {{slotProps.data.thisYearSale}}%
            </template>
        </Column>
        <Column field="lastYearProfit">
            <template #body="slotProps">
                {{formatCurrency(slotProps.data.lastYearProfit)}}
            </template>
        </Column>
        <Column field="thisYearProfit">
            <template #body="slotProps">
                {{formatCurrency(slotProps.data.thisYearProfit)}}
            </template>
        </Column> -->
    </DataTable>
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
        if(item.working_shifts.length >0) {

            item.working_shifts.forEach((ws) => {
            })

            const d = {
            id: item._id,
            date: item.start_utc,
            shift: item.session,
            store: item.store.name,
            WorkingShift: item.working_shifts

        }
        // console.log(item._id)
        shiftstrans.value.push(d)
        }
        
    })
    console.log(shiftstrans.value)
}

const getSeverity = (type) => {
    switch (type) {
        case 'CVS':
            return 'success';

        case 'HYPERMARKET':
            return 'info';

        case 'SUPERMARKET':
            return 'warn';
    }
};

</script>import WorkingShift from '../configs/WorkingShift.vue';

