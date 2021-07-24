<template>
    <section class="flex-grow flex flex-col h-full">
        <div class="flex flex-col items-center px-4 border-b border-gray-400 dark:border-gray-700 bg-gray-300 dark:bg-gray-900">
            <form @submit.prevent="doSearch()" class="flex w-full items-center py-2">
                <input type="search" v-model="query" class="flex-grow rounded-l px-2 py-1 bg-transparent border border-gray-400 dark:border-gray-600 ">
                <button-base type="submit" class="border border-l-0 rounded-r py-1">Search</button-base>
            </form>
            <div class="flex w-full items-center py-2">
                <button-base class="rounded py-1 text-xs dark:border-gray-600 bg-gray-400 dark:bg-gray-600" @click="clearQuery()">Unset</button-base>
            </div>
        </div>
        <div class="overflow-y-auto">
            <div class="flex-grow h-full">
                <results-table
                    v-if="results && results.hits"
                    :has-checkbox="true"
                    :is-loading="table.isLoading"
                    :is-re-search="table.isReSearch"
                    :columns="tableColumns"
                    :rows="results.hits"
                    :total="results.nbHits"
                    @return-checked-rows="updateCheckedRows"
                ></results-table>

                <!-- <table class="table-auto w-full">
                    <thead class="sticky top-0 w-full text-sm">
                    <tr class="w-full bg-gray-300 dark:bg-gray-900 border-b border-gray-400 dark:border-gray-600">
                        <th
                        class="border-r border-gray-400 dark:border-gray-600"
                        v-for="resultProperty in Object.keys(results.hits[0])"
                        :key="resultProperty">
                        {{ resultProperty }}
                        </th>
                    </tr>
                    </thead>
                    <tbody class="px-4">
                    <tr
                        v-for="(hit, index) in results.hits"
                        :key="index"
                        :class="rowClasses[index % 2]">
                        <td
                        v-for="resultProperty in Object.keys(hit)"
                        :key="resultProperty"
                        class="border-r border-gray-400 dark:border-gray-600 py-1 px-2">{{ hit[resultProperty] }}</td>
                    </tr>
                    </tbody>
                </table> -->
                <div v-else class="p-4 text-gray-500 dark:text-gray-600">
                    No Results
                </div>
            </div>
        </div>
        <results-paginator
            v-if="results && results.hits"
            :is-re-search="table.isReSearch"
            :rows="results.hits"
            :total="results.nbHits"
            class="px-4 py-8 flex justify-between items-center"
        ></results-paginator>
    </section>
</template>

<script>
import ButtonBase from "../ui/ButtonBase.vue";
import ResultsTable from "../ui/ResultsTable.vue";
import ResultsPaginator from "../ui/ResultsPaginator.vue";

export default {
    components: {
      ButtonBase,
      ResultsTable,
      ResultsPaginator
    },
    props: {
        query: {
            default: null
        },
        results: {
            default: null
        },
        primaryKey: {
            default: null
        },
        table: Object
    },
    computed: {
        tableColumns: function () {
            let columns = [];

            if (this.results.hits) {
            Object.keys(this.results.hits[0]).forEach(attribute => {
                let column = {
                label: attribute,
                field: attribute
                };

                if (attribute === this.primaryKey) {
                column.isKey = true;
                }

                columns.push(column);
            });
            }

            return columns;
        }
    },
    methods: {
        updateCheckedRows(rowsKey) {
            console.log('updateCheckedRows', rowsKey);
        },
    }
}
</script>