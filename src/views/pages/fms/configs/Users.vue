<script setup>
import store from '@/store';
import { useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { reactive, ref, toRaw } from 'vue';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from '@primevue/core/api';

const toast = useToast()
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const roleItems = reactive(['USER', 'DEVELOPER', 'ADMIN']);

const dt = ref();
const users = ref();
const userDialog = ref(false);
const disableUserDialog = ref(false);
const submitted = ref(false);

const userSelected = ref({});
const user = ref({});
const selectedProducts = ref();
const isEdit = ref();


function getUserStatus(status) {
  return status ? "Kích Hoạt" : "Vô Hiệu Hóa"
}

const { isPending, isError, data, error, refetch } = useQuery({
  queryKey: ['list-user'],
  queryFn: async () => {
    const res = await axios.get(`${APIUrl}/user/list-user`, {
      headers: { Authorization: `Bearer ${store.state.accessToken}` }
    });
    users.value = res.data?.data;
    return res.data?.data;
  },

});

const addUserMutation = useMutation({
  mutationFn: (newUser) => axios.post(`${APIUrl}/auth/signup`, newUser, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
})

const updateUserMutation = useMutation({
  mutationFn: (params) => axios.put(`${APIUrl}/user/${params.id}/update`, params.body, { headers: { Authorization: `Bearer ${store.state.accessToken}` } })
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function formatUTCToDDMMYYYY(utcTimestamp) {
  const date = new Date(utcTimestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;

}

function openNew() {
  user.value = {};
  submitted.value = false;
  userDialog.value = true;
  isEdit.value = false;
}

function hideDialog() {
  userDialog.value = false;
  submitted.value = false;
}

function saveUser() {
  submitted.value = true;
  if (!isEdit.value) {
    addUserMutation.mutate(user.value, {
      onSuccess: (data, variables) => {
        toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
        refetch()
      }, onError: (err, variables) => {
        toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      }
    })
  } else {
    const userUpdate = {
      username: user.value.username,
      role: user.value.role
    }
    updateUserMutation.mutate({ id: user.value._id, body: userUpdate }, {
    onSuccess: (data, variables) => {
      toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
      refetch()
    }, onError: (err, variables) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    }
  })
  }
  userDialog.value = false;
  user.value = {};
}

function editUser(us) {
  user.value = { ...us };
  userDialog.value = true;
  isEdit.value = true;
}

function confirmDisableUser(user) {
  userSelected.value = user;
  disableUserDialog.value = true;
}

function disableUser() {
  updateUserMutation.mutate({ id: userSelected.value._id, body: { is_active: false } }, {
    onSuccess: (data, variables) => {
      disableUserDialog.value = false;
      toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
      refetch()
    }, onError: (err, variables) => {
      toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    }
  })
}

function exportCSV() {
  dt.value.exportCSV();
}

function getSeverity(status) {
  return status ? "success" : "danger"
}

</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tạo Tài Khoản" icon="pi pi-plus" severity="warn" class="mr-2" @click="openNew" />
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable ref="dt" v-model:selection="selectedProducts" :value="users" dataKey="id" :paginator="true" :rows="15"
        :loading="isPending" :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[15, 50, 100]" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users">
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Quản lý Tài Khoản</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Tìm kiếm..." />
            </IconField>
          </div>
        </template>

        <!-- <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column> -->
        <Column field="username" header="Tên Tài Khoản" sortable style="min-width: 12rem"></Column>
        <Column field="role" header="Vai Trò" sortable style="min-width: 16rem">
          <template #body="slotProps">
            <span v-for="item in slotProps.data.role">
              <Tag :value="item" severity="info" style="margin-right: 1rem;" />
              <!-- <span v-for="childItem in item.children">
                        {{ item.message }} {{ childItem }}
                      </span> -->
            </span>
          </template>
        </Column>
        <Column field="created_utc" header="Ngày Tạo" sortable style="min-width: 8rem">
          <template #body="slotProps">
            {{ formatUTCToDDMMYYYY(slotProps.data.created_utc) }}
          </template>
        </Column>
        <Column field="status" header="Trạng Thái" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <Tag :value="getUserStatus(slotProps.data.is_active)" :severity="getSeverity(slotProps.data.is_active)" />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button outlined severity="info" class="mr-2" @click="editUser(slotProps.data)">Cập Nhật</Button>
            <Button outlined severity="danger" @click="confirmDisableUser(slotProps.data)">Vô Hiệu Hóa</Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Chi Tiết Tài Khoản" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="username" class="block font-bold mb-3">Tài Khoản</label>
          <InputText id="username" v-model.trim="user.username" required="true" autofocus
            :invalid="submitted && !user.username" fluid />
          <small v-if="submitted && !user.username" class="text-red-500">Username is required.</small>
        </div>
        <div>
          <label for="password" class="block font-bold mb-3">Mật Khẩu</label>
          <InputText :disabled="isEdit" id="password" v-model.trim="user.password" required="true" autofocus
            :invalid="submitted && !user.password" fluid />
          <small v-if="submitted && !user.password" class="text-red-500">Password is required.</small>
        </div>
        <div>
          <label for="role" class="block font-bold mb-3">Vai Trò</label>
          <MultiSelect id="role" v-model="user.role" :options="roleItems" placeholder="Chọn Vai Trò" fluid>
          </MultiSelect>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveUser" />
      </template>
    </Dialog>

    <Dialog v-model:visible="disableUserDialog" :style="{ width: '450px' }" header="Xác Nhận" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="userSelected">Bạn muốn vô hiệu hóa tài khoản <b>{{ userSelected.username }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Hủy" icon="pi pi-times" severity="info" @click="disableUserDialog = false" />
        <Button label="Xác nhận" icon="pi pi-check" severity="danger" @click="disableUser" />
      </template>
    </Dialog>
  </div>
</template>


<style lang="scss" scoped></style>
