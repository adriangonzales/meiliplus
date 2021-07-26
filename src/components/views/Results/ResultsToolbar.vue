<template>
    <div>
        <form @submit.prevent="changeFilter()" class="flex w-full items-center py-2">
            <input type="search" v-model="query" class="flex-grow rounded-l px-2 py-1 bg-transparent border border-bright-400 dark:border-dim-600 ">
            <button-base type="submit" class="border border-l-0 rounded-r py-1">Search</button-base>
        </form>
        <div class="flex w-full items-center py-2">
            <button-base class="rounded py-1 text-xs dark:border-dim-600 bg-bright-400 dark:bg-dim-600" @click="clearFilter">Unset</button-base>
        </div>
    </div>
</template>
<script>
import ButtonBase from "../../controls/ButtonBase.vue";

export default {
    emits: ["change-filter", "clear-filter"],
    components: {
      ButtonBase
    },
    props: {
        filter: {
            default: null
        }
    },
    data() {
        return {
            query: null
        };
    },
    methods: {
        changeFilter () {
            this.$emit('change-filter', this.query)
        },
        clearFilter () {
            this.query = null
            this.$emit('clear-filter')
        },
    }
}
</script>