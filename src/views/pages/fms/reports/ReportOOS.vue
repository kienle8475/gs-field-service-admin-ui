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
          <DataTable :value="slotProps.data.working_shifts" stripedRows class="custom-table">

            <Column field="user" header="user"></Column>
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

          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import axios from 'axios';
import store from '@/store';

import { useQuery, useMutation } from '@tanstack/vue-query';
import { reactive, ref, toRaw, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const shifts = ref();
const shiftstrans = ref([]);
const expandedRows = ref({});
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

watch(shifts, (newData) => {
  shiftstrans.value = transformData(shifts.value);
})

const combineStock = (stockin, stockout) => {
  const combinedData = {
    gifts: [],
    products: []
  };
  // Combine data from stockin and stockout for gifts, checking for stockout

  for (let i = 0; i < stockin.gifts?.length; i++) {
    combinedData.gifts.push({
      name: stockin.gifts[i].name,
      stockin: stockin.gifts[i].stock || "",
      stockout: stockout?.gifts?.[i]?.stock || ""
    });
  }

  // Combine data from stockin and stockout for products, checking for stockout
  for (let i = 0; i < stockin.products?.length; i++) {
    combinedData.products.push({
      name: stockin.products[i].name,
      stockin: stockin.products[i].stock || "",
      stockout: stockout?.products?.[i]?.stock || ""
    });
  }


  return combinedData;
}

const transformData = (data) => {
  return data.map((item) => {
    const workingShifts = (item.working_shifts || [])
      .filter((item) => item.stock_in || item.stock_out)
      .map((sh) => {
        return {
          user: sh.user.username,
          stock: combineStock(sh.stock_in, sh.stock_out)
        };
      });
    const status = (workingShifts.length > 0)
    console.log(workingShifts)
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

function getMax(values) {
  let max = undefined;

  for (let value of values) {
    if (typeof value === 'number' && (max === undefined || value > max)) {
      max = value;
    }
  }

  return max;
}

const onRowExpand = (event) => {
  // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};

const onRowCollapse = (event) => {
  // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};

const expandAll = () => {
  expandedRows.value = shifts.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
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

const getGiftCountSeverity = (value) => {
  if (parseInt(value) > 0) {
    return "success";
  }
  return "secondary";
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