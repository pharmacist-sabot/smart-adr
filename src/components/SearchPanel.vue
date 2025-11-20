<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { Search, AlertTriangle, Calendar, User, FileText, XCircle, Calculator, UserCircle2 } from 'lucide-vue-next'
import type { HistoryItem } from '../types'
import { isValidCID, isNumeric } from '../utils/validators'

const props = defineProps<{ apiUrl: string }>()

const query = ref('')
const results = ref<HistoryItem[]>([])
const loading = ref(false)
const searched = ref(false)
const errorMsg = ref('')

const handleSearch = async () => {
    errorMsg.value = ''
    const input = query.value.trim()

    if (!input) {
        errorMsg.value = 'กรุณาระบุ HN, เลขบัตรฯ หรือ ชื่อ-นามสกุล'
        return
    }

    // Logic Validation:
    // 1. ถ้าเป็นตัวเลขล้วน -> บังคับ HN(7) หรือ CID(13)
    // 2. ถ้ามีตัวหนังสือ -> อนุญาตให้ค้นหาเป็นชื่อได้เลย

    if (isNumeric(input)) {
        const isHN = input.length === 7
        const isCID = input.length === 13

        if (!isHN && !isCID) {
            errorMsg.value = 'ตัวเลขต้องเป็น HN (7 หลัก) หรือ CID (13 หลัก)'
            return
        }
        if (isCID && !isValidCID(input)) {
            errorMsg.value = 'เลขบัตรประชาชนไม่ถูกต้อง (Checksum Error)'
            return
        }
    }
    // ถ้าไม่ใช่ตัวเลข (เช่น "สมชาย") -> ให้ผ่านไปค้นหาชื่อได้เลย

    loading.value = true
    searched.value = false
    results.value = []

    try {
        const res = await axios.get(`${props.apiUrl}?action=search&q=${input}`)
        if (res.data.status === 'success') {
            results.value = res.data.data
        }
    } catch (e) {
        errorMsg.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
    } finally {
        loading.value = false
        searched.value = true
    }
}
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <!-- Search Header -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search class="w-6 h-6 text-blue-600" />
                ค้นหาประวัติแพ้ยา
            </h2>

            <div class="relative">
                <input v-model="query" @keyup.enter="handleSearch" @input="errorMsg = ''" type="text"
                    placeholder="ระบุ HN, เลขบัตรฯ หรือ ชื่อผู้ป่วย..."
                    class="w-full pl-4 pr-12 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none text-lg border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    :class="{ 'border-red-300 bg-red-50 text-red-900': errorMsg }" />
                <button @click="handleSearch"
                    class="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200">
                    <Search class="w-5 h-5" />
                </button>
            </div>

            <!-- Error Message -->
            <div v-if="errorMsg" class="flex items-center gap-2 mt-3 text-red-500 text-sm font-medium animate-pulse">
                <XCircle class="w-4 h-4" />
                {{ errorMsg }}
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
            <div v-for="i in 2" :key="i" class="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>

        <!-- Results List -->
        <div v-else-if="results.length > 0" class="space-y-4 pb-20">
            <div class="text-sm text-slate-500 px-2">
                ค้นหา: <span class="font-bold text-blue-600">{{ query }}</span>
                (พบ {{ results.length }} รายการ)
            </div>

            <div v-for="(item, idx) in results" :key="idx"
                class="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-red-500 relative overflow-hidden hover:shadow-md transition-shadow">

                <!-- Header: Drug & Date -->
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-bold text-red-600 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg">
                        <AlertTriangle class="w-5 h-5" /> {{ item.drug }}
                    </h3>
                    <span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded flex items-center gap-1">
                        <Calendar class="w-3 h-3" /> {{ item.date }}
                    </span>
                </div>

                <!-- ชื่อผู้ป่วย -->
                <div v-if="item.patientName"
                    class="flex items-center gap-2 text-slate-800 font-semibold mb-2 border-b border-slate-50 pb-2">
                    <UserCircle2 class="w-5 h-5 text-blue-500" />
                    {{ item.patientName }}
                    <span class="text-xs text-slate-400 font-normal">(HN: {{ item.hn }})</span>
                </div>

                <!-- Symptom -->
                <p class="text-slate-700 text-sm mb-4 pl-1">
                    <span class="font-semibold text-slate-900">อาการ:</span> {{ item.symptom }}
                </p>

                <!-- Footer -->
                <div class="flex justify-between items-end pt-3 border-t border-slate-100">
                    <div class="text-xs text-slate-400 flex items-center gap-1">
                        <User class="w-3 h-3" /> ผู้รายงาน: {{ item.reporter }}
                    </div>

                    <div v-if="item.naranjo"
                        class="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold border border-orange-100">
                        <Calculator class="w-3 h-3" />
                        Naranjo: {{ item.naranjo }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Not Found -->
        <div v-else-if="searched && !errorMsg"
            class="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <FileText class="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500 font-medium">ไม่พบข้อมูล</p>
            <p class="text-xs text-slate-400 mt-1">สำหรับ: {{ query }}</p>
        </div>
    </div>
</template>
