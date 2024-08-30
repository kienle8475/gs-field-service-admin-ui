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

    <DataTable :value="outlets" rowGroupMode="subheader" groupRowsBy="province_details" sortMode="single"
      sortField="province_details" :sortOrder="1" :loading="loadingStatus" tableStyle="min-width: 50rem"
      :paginator="true" :rows="25"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[25, 50, 100]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} outlets">
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
          <Button outlined severity="info" class="mr-2" @click="editOutlet(slotProps.data)">Cập Nhật</Button>
        </template>
      </Column>
      <template #groupheader="slotProps">
        <div class="flex items-center gap-2">
          <div class="flex font-bold w-full">{{ slotProps.data.province_details }}</div>
        </div>
      </template>
    </DataTable>
  </div>

  <Dialog v-model:visible="outletDialog" :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" header="Chi Tiết Outlet" :modal="true">
    <div class="flex flex-col gap-6">
      <div>
        <label for="outletname" class="block font-bold mb-3">Tỉnh/Thành phố</label>
        <Select v-model="outlet.province" :options="provinces" optionLabel="name" optionValue="_id" placeholder="Chọn Tỉnh/Thành phố"
          class="w-full" />
      </div>
      <div>
        <label for="outletname" class="block font-bold mb-3">Tên Outlet</label>
        <InputText id="outletname" v-model="outlet.name" required="true" autofocus
          :invalid="submitted && !outlet.name" fluid />
        <small v-if="submitted && !outlet.name" class="text-red-500">Outlet Name is required.</small>
      </div>
      <div>
        <label for="outletaddress" class="block font-bold mb-3">Địa Chỉ</label>
        <InputText id="outletaddress" v-model="outlet.address" required="true" autofocus
          :invalid="submitted && !outlet.address" fluid />
        <small v-if="submitted && !outlet.address" class="text-red-500">Outlet Address is required.</small>
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col grow basis-0">
            <label for="lat" class="block font-bold mb-3">Kinh Độ</label>
            <InputText id="lat" type="number" v-model.number="gps.lat"/>
          </div>
          <div class="flex flex-col grow basis-0">
            <label for="lng" class="block font-bold mb-3">Vĩ Độ</label>
            <InputText id="lng" type="number" v-model.number="gps.lng"/>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col grow basis-0">
            <label for="radius" class="block font-bold mb-3">Bán Kính Checkin Cho Phép</label>
            <InputText type="number" id="radius" v-model.number="gps.radius" required="true" autofocus
            :invalid="submitted && !gps.radius" fluid />
          </div>
          <div class="flex flex-col grow basis-0">
            <label for="outlettype" class="block font-bold mb-3">Loại Outlet</label>
          <Select v-model="outlet.type" :options="outletTypeItems" optionLabel="name" optionValue="code" placeholder="Chọn Loại Outlet"
            class="w-full" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" @click="saveOutlet" />
    </template>
  </Dialog>

</template>

<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw } from 'vue';
import { useToast } from "primevue/usetoast";

const outlet = ref();
const gps = ref();

const outlets = ref();
const isEdit = ref();
const outletDialog = ref(false);
const submitted = ref(false);
const provinces = ref();
const toast = useToast()
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const { isPending: loadingStatus, isError, data, error, refetch } = useQuery({
  queryKey: ['list-store-detail'],
  queryFn: async () => {
    const res = await axios.get(`${APIUrl}/store/list-detail`, {
      headers: { Authorization: `Bearer ${store.state.accessToken}` }
    });
    outlets.value = res.data?.data;
    console.log(outlets.value)
    return res.data?.data;
  },

});

const provinceQuery = useQuery({
  queryKey: ['list-province'],
  queryFn: async () => {
    const res = await axios.get(`${APIUrl}/province/list`, {
      headers: { Authorization: `Bearer ${store.state.accessToken}` }
    });
    provinces.value = res.data?.data;
    console.log(provinces.value)
    return res.data?.data;
  },

});

const addLocationMutation = useMutation({
  mutationFn: (newOutlet) => axios.post(`${APIUrl}/store/create`, newOutlet, { headers: { Authorization: `Bearer ${store.state.accessToken}` }})
})

const updateLocationMutation = useMutation({
  mutationFn: (params) => axios.put(`${APIUrl}/store/${params.id}/update`, params.body, { headers: { Authorization: `Bearer ${store.state.accessToken}` }})
})

const outletTypeItems = ref([
  { name: 'CVS', code: 'CVS' },
  { name: 'Minimart', code: 'MINIMART' },
  { name: 'Supermarket - Medium', code: 'SUPERMARKET' },
  { name: 'Supermarket - Mass', code: 'HYPERMARKET' }
]);

function openNew() {
  outlet.value = {};
  gps.value = {};
  submitted.value = false;
  outletDialog.value = true;
  isEdit.value = false;
}

function editOutlet(ol) {
  outlet.value = { ...ol };
  gps.value = outlet.value.gps
  outletDialog.value = true;
  isEdit.value = true;
}

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

function hideDialog() {
  outletDialog.value = false;
  submitted.value = false;
}

function saveOutlet() {
  submitted.value = true;
  outlet.value.gps = gps.value;
  if (!isEdit.value) {
    addLocationMutation.mutate(outlet.value, {
      onSuccess: (data, variables) => {
        toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
        refetch()
      }, onError: (err, variables) => {
        toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      }
    })
  } else {
    const outletId = outlet.value._id;
    delete(outlet.value._id)
    delete(outlet.value.shifts)
    delete(outlet.value.created_utc)
    delete(outlet.value.updated_utc)
    delete(outlet.value.province_details)
    updateLocationMutation.mutate({ id: outletId, body: outlet.value }, {
    onSuccess: (data, variables) => {
      toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
      refetch()
    }, onError: (err, variables) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    }
  })
  }
  outletDialog.value = false;
  outlet.value = {};
}


</script>import { values } from 'lodash';

