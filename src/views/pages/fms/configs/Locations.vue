<template>
    <div class="card">
        <Toolbar class="mb-6">
        <template #start>
          <Button label="Tạo Outlet" icon="pi pi-plus" severity="warn" class="mr-2" @click="openNew" />
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
        </template>
      </Toolbar>

        <DataTable :value="stores" rowGroupMode="subheader" 
            groupRowsBy="province_details" 
            sortMode="single"
            sortField="province_details" 
            :sortOrder="1"
            :loading="isPending" 
            tableStyle="min-width: 50rem"
            :paginator="true" :rows="25"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[25, 50, 100]" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} outlets"
            >
            <Column field="province_details" header="Tỉnh/Thành Phố"></Column>
            <Column field="name" header="Tên Outlet" style="min-width: 200px"></Column>
            <Column field="address" header="Địa Chỉ" style="min-width: 200px"></Column>
            <Column field="gps" header="Tọa Độ" style="min-width: 200px">
                <template #body="slotProps">
                    <!-- <Tag :value="slotProps.data.type" :severity="getSeverity(slotProps.data.type)" /> -->
                </template>
            </Column>
            <Column field="gps" header="Bán Kính Cho Phép" style="min-width: 200px">
                <template #body="slotProps">
                    <span>{{ formatNumber(slotProps.data.gps.radius) }} m</span>
                </template>
            </Column>
            <Column field="type" header="Loại" style="min-width: 200px">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.type" :severity="getSeverity(slotProps.data.type)" />
                </template>
            </Column>
            <Column field="created_utc" header="Ngày Tạo" style="min-width: 8rem">
                <template #body="slotProps">
                    {{ formatUTCToDDMMYYYY(slotProps.data.created_utc) }}
                </template>
            </Column>
            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button outlined severity="info" class="mr-2" @click="">Cập Nhật</Button>
                </template>
            </Column>
            <template #groupheader="slotProps">
                <div class="flex items-center gap-2">
                    <div class="flex font-bold w-full">{{slotProps.data.province_details}}</div>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';


const stores = ref();
const customers = ref();

const toast = useToast()
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;


const { isPending, isError, data, error, refetch } = useQuery({
  queryKey: ['list-store-detail'],
  queryFn: async () => {
    const res = await axios.get(`${APIUrl}/store/list-detail`, {
      headers: { Authorization: `Bearer ${store.state.accessToken}` }
    });
    stores.value = res.data?.data;
    console.log(stores.value)
    return res.data?.data;
  },

});

const calculateCustomerTotal = (name) => {
    let total = 0;

    if (customers.value) {
        for (let customer of customers.value) {
            if (customer.representative.name === name) {
                total++;
            }
        }
    }

    return total;
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
</script>
