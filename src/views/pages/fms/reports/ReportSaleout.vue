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
    <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id" @rowExpand="onRowExpand"
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
      <Column field="date" header="Ngày">
        <template #body="slotProps">
          {{ formatUTCToDDMMYYYY(slotProps.data.date) }}
        </template>
      </Column>
      <Column field="shift" header="Ca">
        <template #body="slotProps">
          <Tag :value="(slotProps.data.shift)" :severity="getShiftSeverity(slotProps.data.shift)" />
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
import axios from 'axios';

import { useQuery } from '@tanstack/vue-query';
import { reactive, ref, toRaw, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});
const reportDateRange = ref();

const filters = ref(
  {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
);

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
  shiftstrans.value = transformData(shifts.value);
})

const reduceProductList = (data) => {
  const result = {};
  data.forEach(item => {
    result[item.name] = item.count;
  });
  return result;
}

const transformData = (data) => {
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

const formatUTCToDDMMYYYY = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;

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
