<template>
    <div>
        <div v-for="(row, i) in rows" :key="i" class="rounded my-6 mx-6 p-6 text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-900 border border-gray-400 dark:border-gray-600">
            <dl class="grid gap-y-2 gap-x-4 grid-cols-offset">
                <template v-for="(col, j) in Object.keys(row)" :key="j">
                    <dt class="text-right text-gray-600 dark:text-gray-400">{{ col }}</dt>
                    <dd class="">{{ row[col] }}</dd>
                </template>
            </dl>
        </div>
    </div>
</template>
<script>
import ButtonBase from "../../controls/ButtonBase.vue";

export default {
    emits: ["return-checked-rows", "return-selected-rows"],
    components: {
      ButtonBase
    },
    props: {
        rows: {
            default: null
        }
    }
}
</script>