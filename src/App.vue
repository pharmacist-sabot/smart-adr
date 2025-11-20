<script setup lang="ts">
import { ref } from 'vue'
import SearchPanel from './components/SearchPanel.vue'
import ReportForm from './components/ReportForm.vue'
import { Search, PlusCircle, Info } from 'lucide-vue-next'

const API_URL = 'https://script.google.com/macros/s/AKfycbxXSoQk3Qg5rNO9EPpEVSKYNnUcsjU55pFRsK2fjMT1DB7byYlzq81Qa4CYY4yDtWf2/exec' // 🔴 อย่าลืมใส่ URL ของคุณ

const activeTab = ref('search')
</script>

<template>
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">

        <!-- Top Bar -->
        <header class="bg-white px-6 pt-12 pb-4 rounded-b-3xl shadow-sm sticky top-0 z-10">
            <div class="flex justify-between items-center">
                <div>
                    <h1
                        class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-500">
                        SMART ADR
                    </h1>
                    <p class="text-xs text-slate-400">โรงพยาบาลสระโบสถ์</p>
                </div>
                <div class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Info class="w-6 h-6" />
                </div>
            </div>
        </header>

        <!-- Content Area -->
        <main class="p-4 max-w-lg mx-auto">
            <Transition name="fade" mode="out-in">
                <SearchPanel v-if="activeTab === 'search'" :api-url="API_URL" />
                <ReportForm v-else-if="activeTab === 'report'" :api-url="API_URL" />

                <div v-else class="text-center py-20 text-slate-400">
                    <h3 class="text-lg font-bold text-slate-600">เกี่ยวกับโครงการ</h3>
                    <p>SMART ADR: นวัตกรรมดิจิทัลส่งต่อข้อมูลป้องกันแพ้ยาซ้ำ</p>
                </div>
            </Transition>
        </main>

        <!-- Bottom Tab Bar -->
        <nav
            class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20">
            <div class="flex justify-around items-center max-w-lg mx-auto h-16">

                <button @click="activeTab = 'search'" :class="['nav-item', activeTab === 'search' ? 'active' : '']">
                    <Search class="w-6 h-6" />
                    <span class="text-[10px] font-medium mt-1">ค้นหา</span>
                </button>

                <button @click="activeTab = 'report'"
                    class="relative -top-6 bg-gradient-to-tr from-blue-600 to-teal-500 text-white p-4 rounded-full shadow-lg shadow-blue-300 active:scale-90 transition-transform">
                    <PlusCircle class="w-8 h-8" />
                </button>

                <button @click="activeTab = 'info'" :class="['nav-item', activeTab === 'info' ? 'active' : '']">
                    <Info class="w-6 h-6" />
                    <span class="text-[10px] font-medium mt-1">ข้อมูล</span>
                </button>
            </div>
        </nav>

    </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Nav Item Styles */
.nav-item {
    @apply flex flex-col items-center text-slate-300 transition-colors duration-300;
}

.nav-item.active {
    @apply text-blue-600;
}
</style>
