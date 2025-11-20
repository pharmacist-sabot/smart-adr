<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { Send, Activity, Calculator, AlertCircle, CheckCircle2, XCircle } from 'lucide-vue-next'
import { isValidHN, isValidCID } from '../utils/validators'

// Define Type ให้ชัดเจน (Standard TypeScript)
// ใช้ Tuple [number, number, number] เพื่อบอกว่ามี 3 ค่าเสมอ (ใช่, ไม่, ไม่ทราบ)
// ทำให้ TypeScript มั่นใจว่า q.scores[0] จะมีค่าเสมอ
type ScoreTuple = [number, number, number];

interface NaranjoQuestion {
    q: string;
    scores: ScoreTuple;
    selected: 0 | 1 | 2; // บังคับว่าเป็นได้แค่ index 0, 1, 2
}

const props = defineProps<{ apiUrl: string }>()

// State Form
const form = ref({
    hn: '',
    cid: '',
    drug: '',
    symptom: '',
    reporter: '',
    note: '',
    naranjo: 0,
    naranjoResult: ''
})

const errors = ref({
    hn: '',
    cid: '',
    drug: ''
})

// Watchers
watch(() => form.value.hn, (val) => {
    if (!val) errors.value.hn = ''
    else if (!isValidHN(val)) errors.value.hn = 'HN ต้องเป็นตัวเลข 7 หลัก'
    else errors.value.hn = ''
})

watch(() => form.value.cid, (val) => {
    if (!val) errors.value.cid = ''
    else if (!isValidCID(val)) errors.value.cid = 'เลขบัตรฯ ไม่ถูกต้อง'
    else errors.value.cid = ''
})

watch(() => form.value.drug, (val) => {
    if (val) errors.value.drug = ''
})

// Naranjo Logic
const showNaranjo = ref(false)

// กำหนด Type ให้ตัวแปร ref อย่างชัดเจน
const naranjoQuestions = ref<NaranjoQuestion[]>([
    {
        q: '1. เคยมีสรุปรายงานปฏิกิริยานี้มาก่อนหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    },
    {
        q: '2. อาการเกิดขึ้นภายหลังได้รับยาที่สงสัยใช่หรือไม่?',
        scores: [2, -1, 0],
        selected: 2
    },
    {
        q: '3. อาการดีขึ้นเมื่อหยุดยา หรือให้ยาต้านจำเพาะหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    },
    {
        q: '4. อาการเป็นซ้ำเมื่อได้รับยาอีกครั้งใช่หรือไม่?',
        scores: [2, -1, 0],
        selected: 2
    },
    {
        q: '5. มีสาเหตุอื่นนอกจากยาที่ทำให้เกิดปฏิกิริยานี้ได้หรือไม่?',
        scores: [-1, 2, 0],
        selected: 2
    },
    {
        q: '6. เกิดปฏิกิริยานี้เมื่อได้รับยาหลอก (Placebo) หรือไม่?',
        scores: [-1, 1, 0],
        selected: 2
    },
    {
        q: '7. ตรวจพบยาในเลือด/ของเหลว ในระดับที่เป็นพิษหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    },
    {
        q: '8. ปฏิกิริยารุนแรงขึ้นเมื่อเพิ่มขนาดยา หรือลดลงเมื่อลดขนาดยาหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    },
    {
        q: '9. ผู้ป่วยเคยมีอาการแพ้คล้ายกันนี้กับยาตัวเดิม/คล้ายกันมาก่อนหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    },
    {
        q: '10. การเกิดอาการไม่พึงประสงค์นี้ยืนยันได้ด้วยหลักฐานที่เป็นรูปธรรมหรือไม่?',
        scores: [1, 0, 0],
        selected: 2
    }
])

const totalScore = computed(() => {
    return naranjoQuestions.value.reduce((sum, q) => {
        // ใช้ Nullish coalescing (?? 0) เพื่อความปลอดภัยสูงสุด
        return sum + (q.scores[q.selected] ?? 0)
    }, 0)
})

const interpretation = computed(() => {
    const score = totalScore.value
    if (score >= 9) return { text: 'Definite (ใช่แน่นอน)', color: 'text-green-600 bg-green-100 ring-green-200' }
    if (score >= 5) return { text: 'Probable (น่าจะใช่)', color: 'text-blue-600 bg-blue-100 ring-blue-200' }
    if (score >= 1) return { text: 'Possible (อาจจะใช่)', color: 'text-yellow-600 bg-yellow-100 ring-yellow-200' }
    return { text: 'Doubtful (น่าสงสัย/ไม่ใช่)', color: 'text-gray-500 bg-gray-100 ring-gray-200' }
})

const submitting = ref(false)

const submitForm = async () => {
    let hasError = false

    if (!form.value.hn) { errors.value.hn = 'กรุณากรอก HN'; hasError = true }
    else if (!isValidHN(form.value.hn)) { errors.value.hn = 'HN ไม่ถูกต้อง'; hasError = true }

    if (form.value.cid && !isValidCID(form.value.cid)) { errors.value.cid = 'เลขบัตรฯ ไม่ถูกต้อง'; hasError = true }

    if (!form.value.drug) { errors.value.drug = 'กรุณากรอกชื่อยา'; hasError = true }

    if (hasError) {
        alert('กรุณาตรวจสอบข้อมูลสีแดงให้ถูกต้อง')
        return
    }

    submitting.value = true

    form.value.naranjo = totalScore.value
    form.value.naranjoResult = interpretation.value.text

    try {
        await axios.post(props.apiUrl, JSON.stringify(form.value), {
            headers: { 'Content-Type': 'text/plain' }
        })

        alert(`✅ บันทึกข้อมูลสำเร็จ\n\nผลประเมิน Naranjo: ${interpretation.value.text} (${totalScore.value} คะแนน)`)

        form.value = { hn: '', cid: '', drug: '', symptom: '', reporter: '', note: '', naranjo: 0, naranjoResult: '' }
        naranjoQuestions.value.forEach(q => q.selected = 2)
        showNaranjo.value = false

    } catch (e) {
        alert('❌ เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่')
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="animate-fade-in pb-24">
        <div class="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-teal-400"></div>

            <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity class="w-7 h-7 text-teal-500" />
                รายงานการแพ้ยา
            </h2>

            <div class="space-y-5">
                <!-- Patient Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-slate-600">HN (7 หลัก) <span
                                class="text-red-500">*</span></label>
                        <div class="relative">
                            <input v-model="form.hn" type="text" maxlength="7" class="input-field pr-10"
                                :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100': errors.hn }"
                                placeholder="เช่น 0012345" />
                            <XCircle v-if="errors.hn" class="absolute right-3 top-3 w-5 h-5 text-red-500" />
                            <CheckCircle2 v-else-if="form.hn && !errors.hn"
                                class="absolute right-3 top-3 w-5 h-5 text-green-500" />
                        </div>
                        <p v-if="errors.hn" class="text-xs text-red-500 mt-1 font-medium">{{ errors.hn }}</p>
                    </div>

                    <div class="space-y-1">
                        <label class="text-sm font-medium text-slate-600">CID (13 หลัก)</label>
                        <div class="relative">
                            <input v-model="form.cid" type="text" maxlength="13" class="input-field pr-10"
                                :class="{ 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100': errors.cid }"
                                placeholder="ระบุเลขบัตรประชาชน" />
                            <XCircle v-if="errors.cid" class="absolute right-3 top-3 w-5 h-5 text-red-500" />
                            <CheckCircle2 v-else-if="form.cid && !errors.cid"
                                class="absolute right-3 top-3 w-5 h-5 text-green-500" />
                        </div>
                        <p v-if="errors.cid" class="text-xs text-red-500 mt-1 font-medium">{{ errors.cid }}</p>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-600">ชื่อยาที่สงสัย (Drug) <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.drug" class="input-field" :class="{ 'border-red-500 bg-red-50': errors.drug }"
                        placeholder="ระบุชื่อยา..." />
                    <p v-if="errors.drug" class="text-xs text-red-500 mt-1 font-medium">{{ errors.drug }}</p>
                </div>

                <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-600">อาการที่พบ (Symptom)</label>
                    <textarea v-model="form.symptom" rows="3" class="input-field"
                        placeholder="ระบุลักษณะอาการ..."></textarea>
                </div>

                <!-- Naranjo Calculator Section -->
                <div
                    class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
                    <div class="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition-colors"
                        @click="showNaranjo = !showNaranjo">
                        <div class="flex items-center gap-2 text-slate-700 font-bold">
                            <Calculator class="w-5 h-5 text-blue-600" />
                            ประเมิน Naranjo Score
                        </div>
                        <div class="flex items-center gap-3">
                            <span v-if="!showNaranjo"
                                :class="['text-xs px-3 py-1 rounded-full font-bold border ring-1', interpretation.color]">
                                {{ totalScore }} : {{ interpretation.text.split(' ')[0] }}
                            </span>
                            <span v-else class="text-slate-400 text-sm font-medium">ซ่อน</span>
                        </div>
                    </div>

                    <div v-if="showNaranjo" class="px-4 pb-4 space-y-4 bg-slate-100/50 pt-2 border-t border-slate-200">
                        <div
                            class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                            <div class="text-center pl-2">
                                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Score</p>
                                <p class="text-4xl font-black text-slate-700 mt-1">{{ totalScore }}</p>
                            </div>
                            <div class="text-right border-l pl-6 border-slate-100">
                                <p class="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-wider">
                                    Interpretation</p>
                                <span
                                    :class="['px-3 py-1.5 rounded-lg text-sm font-bold border', interpretation.color]">
                                    {{ interpretation.text }}
                                </span>
                            </div>
                        </div>

                        <div v-for="(q, i) in naranjoQuestions" :key="i"
                            class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <p class="mb-3 font-medium text-slate-700 text-sm leading-relaxed">{{ q.q }}</p>
                            <div class="flex gap-2">
                                <button @click="q.selected = 0"
                                    :class="['option-btn', q.selected === 0 ? 'active-yes' : '']">
                                    ใช่ ({{ q.scores[0] > 0 ? '+' : '' }}{{ q.scores[0] }})
                                </button>
                                <button @click="q.selected = 1"
                                    :class="['option-btn', q.selected === 1 ? 'active-no' : '']">
                                    ไม่ ({{ q.scores[1] > 0 ? '+' : '' }}{{ q.scores[1] }})
                                </button>
                                <button @click="q.selected = 2"
                                    :class="['option-btn', q.selected === 2 ? 'active-dk' : '']">
                                    ไม่ทราบ (0)
                                </button>
                            </div>
                        </div>

                        <div
                            class="flex gap-3 items-start bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs text-yellow-800 mt-2">
                            <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
                            <p class="leading-relaxed">การประเมินนี้เป็นเพียงเครื่องมือช่วยตัดสินใจเบื้องต้นเท่านั้น
                                การวินิจฉัยสุดท้ายขึ้นอยู่กับดุลยพินิจของแพทย์หรือเภสัชกรผู้เชี่ยวชาญ</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-600">ผู้รายงาน</label>
                    <input v-model="form.reporter" class="input-field" placeholder="ชื่อ-สกุล / ตำแหน่ง" />
                </div>

                <div class="space-y-1">
                    <label class="text-sm font-medium text-slate-600">หมายเหตุ (Note)</label>
                    <input v-model="form.note" class="input-field" placeholder="ข้อมูลเพิ่มเติม..." />
                </div>
            </div>

            <button @click="submitForm" :disabled="submitting"
                class="mt-8 w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 hover:shadow-xl hover:shadow-blue-300/50">
                <span v-if="!submitting" class="flex items-center gap-2">
                    <Send class="w-5 h-5" /> บันทึกข้อมูล
                </span>
                <span v-else class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    กำลังบันทึก...
                </span>
            </button>

        </div>
    </div>
</template>

<style scoped>
.input-field {
    @apply w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-base placeholder:text-slate-400;
}

.option-btn {
    @apply flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium transition-all hover:bg-slate-50 active:scale-95 hover:shadow-sm;
}

.active-yes {
    @apply bg-green-50 border-green-500 text-green-700 font-bold ring-1 ring-green-500/20 shadow-sm;
}

.active-no {
    @apply bg-red-50 border-red-500 text-red-700 font-bold ring-1 ring-red-500/20 shadow-sm;
}

.active-dk {
    @apply bg-slate-200 border-slate-400 text-slate-700 font-bold shadow-inner;
}
</style>
