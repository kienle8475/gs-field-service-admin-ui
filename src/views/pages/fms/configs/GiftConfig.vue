<template>
  <div class="card">
    <Toolbar class="mb-6">
      <template #start>
        <Tag severity="secondary">CẤU HÌNH QUÀ TẶNG</Tag>
      </template>
      <template #end>

      </template>
    </Toolbar>
    <DataTable v-model:editingRows="editingRows" v-model:filters="filters" :value="store_gift_trans" editMode="row" :loading="isPending"
      dataKey="_id" @row-edit-save="onRowEditSave" :pt="{
        table: { style: 'min-width: 50rem' },
        column: {
          bodycell: ({ state }) => ({
            style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
          })
        }
      }">
      <template #header>
        <div class="flex flex-wrap gap-4 justify-between">
          <div class="flex flex-wrap gap-2">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm" />
            </IconField>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button text icon="pi pi-refresh" label="Làm Mới Dữ Liệu" @click="refreshData" />
          </div>
        </div>
      </template>
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
import axios from 'axios';

import { useQuery, useMutation } from '@tanstack/vue-query';
import { reactive, ref, toRaw, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';


const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;
const store_gift = ref()
const toast = useToast()
const editingRows = ref([]);

let store_gift_trans = ref([])

const columns = [
  { field: 'STRONGBOW_STRING_BAG', header: 'Túi STRONGBOW' },
  { field: 'STRONGBOW_TUMBLER_45CL', header: 'Ly STRONGBOW ' },
  { field: 'STRONGBOW_ICE_BUCKET_PLASTIC_8L', header: 'Thùng đá STRONGBOW plastic 8L' },
  { field: 'STRONGBOW_TROLLEY', header: 'Vali STRONGBOW' }
];

const filters = ref(
  {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
);

const { isPending, isError, data, error, refetch } = useQuery({
  queryKey: ['list-store-detail'],
  queryFn: async () => {
    const res = await axios.get(`${APIUrl}/misc/luckywheel-stock`, {
      headers: { Authorization: `Bearer ${store.state.accessToken}` }
    });
    store_gift.value = res.data?.data;
    return res.data?.data;
  },

});

const updateLuckyWheelStockMutation = useMutation({
  mutationFn: (params) => axios.post(`${APIUrl}/store/${params.id}/config-luckywheel`, params.body, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
})

watch(store_gift, (newData) => {
  store_gift_trans.value = transformData(store_gift.value)
})

const transformData = (dt) => {
  const result = dt.map(item => ({
    ...item,
    ...item.gifts.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.stock }), {})
  }));
  return result
}

const refreshData = () => {
  store_gift_trans.value = []
  refetch()
  toast.add({ severity: 'success', summary: 'Thành công ', detail: "Dữ liệu đã được cập nhật", life: 3000 });
}

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

  updateLuckyWheelStockMutation.mutate({ id: newData.store._id, body: newGiftSet }, {
    onSuccess: (data, variables) => {
      toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
      refetch()
    }, onError: (err, variables) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    }
  })
};

</script>
