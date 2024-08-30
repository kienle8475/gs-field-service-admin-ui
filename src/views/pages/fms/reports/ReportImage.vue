<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Tag severity="secondary">BÁO CÁO POSM</Tag>
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="primary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <DataTable ref="dt" v-model:expandedRows="expandedRows" :value="shiftstrans" dataKey="id"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
            <template #header>
                <div class="flex flex-wrap justify-end gap-2">
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
                    <Tag :value="(slotProps.data.shift)"
                        :severity="getShiftSeverity(slotProps.data.shift)" />
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
                        <ColumnGroup type="header">
                            <Row>
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
                        <Column field="user"></Column>
                        <Column field="posm_in_1" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_in_1" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="posm_in_2" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_in_2" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="posm_in_3" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_in_3" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="report_in" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.report_in" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="posm_out_1" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_out_1" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="posm_out_2" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_out_2" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="posm_out_3" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.posm_out_3" class="shadow-lg" width="64">
                            </template>
                        </Column>
                        <Column field="report_out" header="Ảnh Check Out">
                            <template #body="slotProps">
                                <img :src="slotProps.data.report_out" class="shadow-lg" width="64">
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
            <!-- <template #expansion="slotProps">
                <div class="p-4">
                    <DataTable :value="slotProps.data.working_shifts" stripedRows>
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
                    </DataTable>
                </div>
            </template> -->
        </DataTable>
    </div>
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
const expandedRows = ref({});

const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

const onRowExpand = (event) => {
    // toast.add({ severity: 'info', summary: 'Expanded', detail: event.data.name, life: 3000 });
};
const onRowCollapse = (event) => {
    // toast.add({ severity: 'success', summary: 'Collapsed', detail: event.data.name, life: 3000 });
};

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
    shiftstrans.value = transformData(shifts.value);
    console.log(shiftstrans.value)
})


function transformData(data) {
    return data.map((item) => {
        const workingShifts = (item.working_shifts || [])
            .filter((item) => item.posm_in || item.posm_out)
            .map((sh) => {
                return {
                    user: sh.user.username,
                    ...(sh.posm_in && {
                        posm_in_1: sh.posm_in.posm_image_urls[0],
                        posm_in_2: sh.posm_in.posm_image_urls[1],
                        posm_in_3: sh.posm_in.posm_image_urls[2],
                        report_in: sh.posm_in.report_image_url,
                    }),
                    ...(sh.posm_out && {
                        posm_out_1: sh.posm_out.posm_image_urls[0],
                        posm_out_2: sh.posm_out.posm_image_urls[1],
                        posm_out_3: sh.posm_out.posm_image_urls[2],
                        report_out: sh.posm_out.report_image_url,
                    }),
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
