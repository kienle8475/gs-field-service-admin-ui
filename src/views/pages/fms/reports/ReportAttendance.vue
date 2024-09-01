<template>
  <div class="card">
    <Toolbar class="mb-6">
      <template #start>
        <Tag severity="secondary">BÁO CÁO CHẤM CÔNG</Tag>
      </template>
      <template #end>
        <div class="flex flex-wrap gap-4">
          <FloatLabel>
            <DatePicker v-model="reportDateRange" inputId="reportDateRange" selectionMode="range" :manualInput="false"
              showIcon fluid :showOnFocus="true" />
          </FloatLabel>
          <Button label="Filter" icon="pi pi-search" severity="warn" @click="exportCSV($event)" />
          <Button label="Export" icon="pi pi-file-excel" severity="primary" @click="exportCSV($event)" />
        </div>
      </template>
    </Toolbar>
    <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shifts" dataKey="_id" @rowExpand="onRowExpand"
      @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem" :paginator="true" :rows="15" :loading="isPending"
      v-model:filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[15, 50, 100]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} report">
      <template #header>
        <div class="flex flex-wrap ">
          <div class="flex flex-wrap justify-start gap-2">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm" />
            </IconField>
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <Button text icon="pi pi-plus" label="Mở Rộng" @click="expandAll" />
            <Button text icon="pi pi-minus" label="Thu Gọn" @click="collapseAll" />
          </div>
        </div>
      </template>
      <Column expander style="width: 5rem" />
      <Column field="start_utc" header="Ngày">
        <template #body="slotProps">
          {{ formatUTCToDDMMYYYY(slotProps.data.start_utc) }}
        </template>
      </Column>
      <Column field="session" header="Ca">
        <template #body="slotProps">
          <Tag :value="slotProps.data.session" :severity="getSeverity(slotProps.data.session)" />
        </template>
      </Column>
      <Column field="store.name" header="Outlet"></Column>
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
      <Column field="working_shifts" header="Trạng Thái">
        <template #body="slotProps">
          <Tag :value="getShiftStatus(slotProps.data.working_shifts)"
            :severity="getShiftSeverity(slotProps.data.working_shifts)" />
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-4">
          <h5>Báo cáo check in {{ slotProps.data.name }}</h5>
          <DataTable :value="slotProps.data.working_shifts" stripedRows>
            <Column field="user.username" header="Tài Khoản"></Column>
            <Column field="check_in.time_utc" header="Giờ Check In">
              <template #body="slotProps">
                {{ formatUTC7Time(slotProps.data.check_in?.time_utc) }}
              </template>
            </Column>
            <Column field="check_out.time_utc" header="Giờ Check Out">
              <template #body="slotProps">
                {{ formatUTC7Time(slotProps.data.check_out?.time_utc) }}
              </template>
            </Column>
            <Column field="check_in.image_url" header="Ảnh Check In">
              <template #body="slotProps">
                <div class="images" v-viewer>
                  <img :src="slotProps.data.check_in?.image_url" class="shadow-lg" width="64">
                </div>
                <!-- <img :src="slotProps.data.check_in?.image_url" class="shadow-lg" width="64"> -->
              </template>
            </Column>
            <Column field="check_out.image_url" header="Ảnh Check Out">
              <template #body="slotProps">
                <div class="images" v-viewer>
                  <img :src="slotProps.data.check_out?.image_url" class="shadow-lg" width="64">
                </div>
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
import axios from 'axios';
import moment from 'moment';

import { useQuery } from '@tanstack/vue-query';
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast'

import 'viewerjs/dist/viewer.css'

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const expandedRows = ref({});
const toast = useToast();
const shifts = ref();
const reportDateRange = ref();

const dt = ref();
const filters = ref(
  {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
);

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

const formatUTC7Time = (utcTimestamp) => {

  const utc7Timestamp = utcTimestamp ? moment.utc(utcTimestamp).utcOffset(7).format('HH:mm:ss') : "";
  return utc7Timestamp;
}

const formatUTCToDDMMYYYY = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;

}

const onRowExpand = (event) => {
  // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};

const onRowCollapse = (event) => {
  // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};

const expandAll = () => {
  expandedRows.value = shifts.value.reduce((acc, p) => (acc[p._id] = true) && acc, {});
};

const collapseAll = () => {
  expandedRows.value = null;
};

const getSeverity = (session) => {
  switch (session) {
    case 'MORNING':
      return 'success';

    case 'AFTERNOON':
      return 'warn';

    default:
      return null;
  }
};

const getShiftStatus = (shifts) => {
  return shifts.length > 0 ? "ĐÃ CHECK IN" : "CHƯA CHECK IN"
}

const getShiftSeverity = (shifts) => {
  return shifts.length > 0 ? "info" : "danger"
}

const exportCSV = () => {
  dt.value.exportCSV();
}

</script>

<style>
.p-datatable-header-cell {
  background-color: #ffeebc !important;
}
</style>