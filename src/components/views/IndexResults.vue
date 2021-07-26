<template>
    <section>
        <results-toolbar
            :filter="query"
            @change-filter="handleFilterChange"
            @clear-filter="handleFilterClear"
            class="flex flex-col items-center px-4 border-b border-bright-400 dark:border-black bg-bright-300 dark:bg-dim-900" />

        <div class="overflow-y-auto flex-grow h-full">
            <template v-if="results && results.hits">
                <results-table
                    v-if="view === 'table'"
                    :columns="tableColumns"
                    :rows="results.hits"
                    @return-checked-rows="updateCheckedRows"
                ></results-table>
                <results-list
                    v-if="view === 'list'"
                    :rows="results.hits"
                    @return-checked-rows="updateCheckedRows"
                ></results-list>
            </template>

            <div v-else class="p-4 text-bright-500 dark:text-dim-600">
                No Results
            </div>
        </div>

        <results-footer
            v-if="results && results.hits"
            :is-re-search="isReSearch"
            :is-loading="isLoading"
            :rows="results.hits"
            :total="results.nbHits"
            :offset="offset"
            :limit="limit"
            :results-view="view"
            class="px-4 py-1 flex justify-between items-center border-t border-bright-400 dark:border-dim-700 bg-bright-300 dark:bg-dim-900"
            @change-page="handlePageChange"
            @change-view="handleViewChange"
        ></results-footer>
    </section>
</template>

<script>
import ButtonBase from "../controls/ButtonBase.vue";
import ResultsToolbar from "./Results/ResultsToolbar.vue";
import ResultsTable from "./Results/ResultsTable.vue";
import ResultsList from "./Results/ResultsList.vue";
import ResultsFooter from "./Results/ResultsFooter.vue";

export default {
    components: {
      ButtonBase,
      ResultsToolbar,
      ResultsTable,
      ResultsList,
      ResultsFooter
    },
    props: {
        index: {
            default: null
        }
    },
    data() {
        return {
            view: 'table',
            isLoading: false,
            indexes: null,
            primaryKey: 'id',
            results: null,
            query: null,
            offset: 0,
            limit: 10,
            rowClasses: [
              'text-bright-900 dark:text-dim-100 bg-bright-200 dark:bg-dim-800',
              'text-bright-900 dark:text-dim-100 bg-bright-300 dark:bg-dim-900'
            ]
        };
    },
    computed: {
        isReSearch: function () {
            return this.offset == undefined ? true : false
        },
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

    watch: {
        index: function () {
            this.handleFilterClear();
        }
    },

    mounted: function() {
      if (localStorage.getItem('resultView') === 'list') {
        this.view = 'list'
      } else {
        this.view = 'table'
      }
    },

    methods: {
        updateCheckedRows(rowsKey) {
            console.log('updateCheckedRows', rowsKey);
        },
        setLoading(status = true) {
            this.isLoading = status;
        },
        handleViewChange (view) {
            localStorage.setItem('resultView', view)
            this.view = view
        },
        setPage(offset = 0, limit = 10) {
            this.offset = offset
            this.limit = limit
        },
        handlePageChange (offset = 0, limit = null) {
            this.setLoading()
            this.setPage(parseInt(offset), parseInt(limit))
            this.sendQuery();
        },
        handleFilterChange (filter) {
            this.setLoading()
            this.setPage()
            this.query = filter
            this.sendQuery();
        },
        async sendQuery () {
            let searchParams = {
                offset: this.offset,
                limit: this.limit
            }

            this.results = await this.index.search(this.query, searchParams);
        },
        handleFilterClear () {
            this.setPage()
            this.query = null;
            this.sendQuery();
        }
    }
}
</script>