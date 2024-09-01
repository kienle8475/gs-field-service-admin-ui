<template>
  <div class="card">
    <Toolbar class="mb-6">
      <template #start>
        <Tag severity="secondary">BÁO CÁO TẶNG QUÀ SAMPLING</Tag>
      </template>
      <template #end>
        <div class="flex flex-wrap gap-4">
          <FloatLabel>
            <DatePicker v-model="reportDateRange" inputId="reportDateRange" selectionMode="range" :manualInput="false"
              showIcon fluid :showOnFocus="true" />
          </FloatLabel>
          <Button label="Filter" icon="pi pi-search" severity="warn" @click="exportExcel($event)" />
          <Button label="Export" icon="pi pi-file-excel" severity="primary" @click="exportExcel($event)" />
        </div>
      </template>
    </Toolbar>
    <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id" @rowExpand="onRowExpand"
      @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem" :paginator="true" :rows="15" :loading="isPending"
      v-model:filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[15, 50, 100]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} report">
      <template #header>
        <div class="flex flex-wrap gap-4 justify-between">
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
            <Button text icon="pi pi-refresh" label="Làm Mới Dữ Liệu" @click="refreshData" />
          </div>
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
            <Column field="customer_name" header="Tên Khách Hàng"></Column>
            <Column field="customer_phone" header="Số Điện Thoại"></Column>
            <Column field="sampling_type" header="Hoạt Động">
              <template #body="slotProps">
                <Tag :value="slotProps.data.sampling_type" :severity="getGiftSeverity(slotProps.data.sampling_type)" />
              </template>
            </Column>
            <Column field="reward_gift" header="Quà Tặng"></Column>
            <Column field="creward_image_url" header="Hình Ảnh Khách Nhận Quà">
              <template #body="slotProps">
                <div class="images" v-viewer>
                  <img :src="slotProps.data.reward_image_url" class="shadow-lg" width="64" alt="Services">
                </div>
              </template>
            </Column>
            <Column field="bill_image_url" header="Hình Ảnh Post Bài">
              <template #body="slotProps">
                <div class="images" v-viewer>
                  <img :src="slotProps.data?.post_social_image_url" class="shadow-lg" width="64">
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
import { ref, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast'
import { ExportXLSX } from '@/service/ExportXLSX';

import 'viewerjs/dist/viewer.css'
import stbruby_export_data_template from '@/assets/templates/stbruby_export_data_template-Sampling.xlsx'

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});
const reportDateRange = ref();
const toast = useToast();

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

watch(shifts, (newData) => {
  transformData(shifts.value)
})

const transformData = (dt) => {
  dt.forEach((item) => {
    if (item.working_shifts.length > 0) {
      let giftitems = [];
      item.working_shifts.forEach((ws) => {
        giftitems = giftitems.concat(ws.report_samplings);
      })
      if (giftitems.length > 0) {
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

const refreshData = () => {
  shiftstrans.value = [];
  refetch()
  toast.add({ severity: 'success', summary: 'Thành công ', detail:"Dữ liệu đã được cập nhật", life: 3000 });
}

const flatMapObject = (obj) => {
  return obj.gifts.map((item) => ({
    id: obj.id,
    date: formatUTCToDDMMYYYY(obj.date),
    session: obj.shift,
    outlet: obj.store,
    time: formatUTC7Time(item.created_utc),
    customer_name: item.customer_name,
    customer_phone: item.customer_phone,
    otp_code: item.otp_code || "",
    sampling_type: item.sampling_type,
    gift: item.reward_gift,
    customer_img: item.reward_image_url,
    post_social_image: item.post_social_image_url
  }));
}

const transformExportData = (data) => {
  const shiftFlatten = []
  data.forEach((item, index) => {
    shiftFlatten.push(flatMapObject(item))
  });
  return shiftFlatten.flat(Infinity)
}

const exportExcel = () => {
  const dataExport = transformExportData(shiftstrans.value);
  fetch(stbruby_export_data_template)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      ExportXLSX.exportExcel(dataExport, arrayBuffer, "Sampling", "Report Sampling")
    })
    .catch(error => {
      console.error('Error loading XLSX Template file:', error);
    });
}

const onRowExpand = (event) => {
  // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};

const onRowCollapse = (event) => {
  // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};

const expandAll = () => {
  expandedRows.value = shiftstrans.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};

const collapseAll = () => {
  expandedRows.value = null;
};

const formatUTCToDDMMYYYY = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;

}

const formatUTC7Time = (utcTimestamp) => {

const utc7Timestamp = utcTimestamp ? moment.utc(utcTimestamp).utcOffset(7).format('HH:mm:ss') : "";
return utc7Timestamp;
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
    case 'POST_SOCIAL_HASHTAG':
      return 'info'
    case 'CATCH_YOUR_SPARKLING':
      return 'success';

    default:
      return null;
  }
}

</script>

<style>
.p-datatable-header-cell {
  background-color: #ffeebc !important;
}
</style>