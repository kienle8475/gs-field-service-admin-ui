<script setup>
import { CustomerService } from '@/service/CustomerService';
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { UserService } from '@/service/UserService';
import { onBeforeMount, reactive, ref } from 'vue';

const customers1 = ref(null);
const loading1 = ref(null);
const products = ref(null);
const visible = ref(false);

let users = ref(null);

const statuses = reactive(['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal']);

const representatives = reactive([
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Anna Fali', image: 'annafali.png' },
    { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
    { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
    { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
    { name: 'Onyama Limba', image: 'onyamalimba.png' },
    { name: 'Stephen Shaw', image: 'stephenshaw.png' },
    { name: 'XuXue Feng', image: 'xuxuefeng.png' }
]);

function getSeverity(status) {
    switch (status) {
        case 'unqualified':
            return 'danger';

        case 'qualified':
            return 'success';

        case 'new':
            return 'info';

        case 'negotiation':
            return 'warn';

        case 'renewal':
            return null;
    }
}


onBeforeMount(() => {
    users = UserService.getAllUser();
    console.log(users)
});


function formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatDate(value) {
    return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

</script>

<template>
    <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
        <template #header>
            <div class="inline-flex items-center justify-center gap-2">
                <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
                <span class="font-bold whitespace-nowrap">Amy Elsner</span>
            </div>
        </template>
        <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
        <div class="flex items-center gap-4 mb-4">
            <label for="username" class="font-semibold w-24">Username</label>
            <InputText id="username" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-2">
            <label for="email" class="font-semibold w-24">Email</label>
            <InputText id="email" class="flex-auto" autocomplete="off" />
        </div>
        <template #footer>
            <Button label="Cancel" text severity="secondary" @click="visible = false" autofocus />
            <Button label="Save" outlined severity="secondary" @click="visible = false" autofocus />
        </template>
    </Dialog>

    <Fluid>
        <div class="card">
            <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-row md:flex-row gap-4">
                    <div class="flex flex-wrap gap-2 basis-1/2">
                        <label for="username">Tài khoản</label>
                        <InputText id="username" type="text" />
                    </div>
                    <div class="flex flex-wrap gap-2 basis-1/4">
                        <label for="Role">Role</label>
                        <Select id="Role" v-model="dropdownItem" :options="dropdownItems" optionLabel="name"
                            placeholder="Select One" class="w-full"></Select>
                    </div>
                    <div class="flex flex-wrap gap-2 basis-1/4">
                        <label for="status">Trạng thái</label>
                        <Select id="status" v-model="dropdownItem" :options="dropdownItems" optionLabel="name"
                            placeholder="Select One" class="w-full"></Select>
                    </div>
                    <div class="flex flex-wrap gap-8 basis-1/6">
                        <label for="Search"></label>
                        <Button id="Search" label="Tìm Kiếm"></Button>
                    </div>
                    <div class="flex flex-wrap gap-8 basis-1/6">
                        <label for="AddNew"></label>
                        <Button id="AddNew" label="Thêm mới" severity="warn" @click="visible = true"></Button>
                    </div>
                </div>
            </div>
        </div>
    </Fluid>

    <div class="card">
        <DataTable :value="customers1" :paginator="true" :rows="10" dataKey="id" :rowHover="true" filterDisplay="menu"
            :loading="loading1">
            <!-- <template #header>
                <div class="flex justify-between">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters1['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template> -->
            <template #empty> No user found. </template>
            <template #loading> Loading users data. Please wait. </template>

            <Column header="Tài Khoản" :showFilterMatchModes="false"
                :filterMenuStyle="{ width: '14rem' }" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <img :alt="data.representative.name"
                            :src="`https://primefaces.org/cdn/primevue/images/avatar/${data.representative.image}`"
                            style="width: 32px" />
                        <span>{{ data.representative.name }}</span>
                    </div>
                </template>
                <template>
                    <MultiSelect v-model="filterModel.value" :options="representatives" optionLabel="name"
                        placeholder="Any">
                        <template #option="slotProps">
                            <div class="flex items-center gap-2">
                                <img :alt="slotProps.option.name"
                                    :src="`https://primefaces.org/cdn/primevue/images/avatar/${slotProps.option.image}`"
                                    style="width: 32px" />
                                <span>{{ slotProps.option.name }}</span>
                            </div>
                        </template>
                    </MultiSelect>
                </template>
            </Column>
            <Column header="Vai Trò" dataType="date" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.date) }}
                </template>
                <template>
                    <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />
                </template>
            </Column>
            <Column header="Ngày Tạo" dataType="date" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.date) }}
                </template>
                <template>
                    <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />
                </template>
            </Column>
            <Column header="Trạng Thái" field="status" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getSeverity(data.status)" />
                </template>
                <template>
                    <Select v-model="filterModel.value" :options="statuses" placeholder="Select One" showClear>
                        <template #option="slotProps">
                            <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                        </template>
                    </Select>
                </template>
            </Column>
            <Column header="" field=""  dataType="boolean" bodyClass="text-center"
                style="min-width: 8rem">
                <template #body="{ data }">
                    <i class="pi"
                        :class="{ 'pi-check-circle text-green-500 ': data.verified, 'pi-times-circle text-red-500': !data.verified }"></i>
                </template>
                <template>
                    <label for="verified-filter" class="font-bold"> Verified </label>
                    <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary
                        inputId="verified-filter" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style lang="scss" scoped></style>import { UserService } from '@/service/UserService';
import { UserService } from '@/service/UserService';
import { data } from 'autoprefixer';

