<template>
    <nav>
        <form @submit.prevent="" class="flex w-full items-center py-2 px-4">
            <input type="search" v-model="indexFilter" placeholder="Search for index" class="flex-grow rounded-l px-2 py-1 bg-transparent border border-gray-400 dark:border-gray-600">
        </form>
        <div class="h-full flex flex-col overflow-y-auto">
            <div class="flex flex-col">
            <button
                type="button"
                class="text-left py-2 px-4 flex items-center"
                :class="{'font-bold bg-primary-200 dark:bg-primary-800': indexName == idx.uid}"
                v-for="idx in filteredIndexes" :key="idx.uid"
                @click="setIndex(idx.uid)">
                <index-icon class="w-4 mr-2 text-primary-400 dark:text-primary-300 fill-current" />
                {{ idx.name }}
            </button>
            </div>
        </div>
        <div class="flex justify-end py-2 px-4">
            <button-base class="rounded" @click="$emit('refresh-indexes')">
                <refresh-icon class="w-3 fill-current" />
            </button-base>
            <!-- <button-base>New Index</button-base> -->
        </div>
    </nav>
</template>


<script>
import ButtonBase from "../controls/ButtonBase.vue";
import IndexIcon from '../icons/index.vue';
import RefreshIcon from '../icons/refresh.vue';

export default {
    emits: ["select-index", "refresh-indexes"],
    components: {
      ButtonBase,
      IndexIcon,
      RefreshIcon
    },
    props: {
        indexes: {
            default: null
        }
    },
    data() {
        return {
            client: null,
            indexName: null,
            indexFilter: null
        };
    },

    computed: {
      filteredIndexes: function () {
        if (this.indexFilter) {
          let searchToken = new RegExp(this.indexFilter, 'ig')
          return this.indexes.filter(({ name, uid }) => (name + uid).match(searchToken))
        }

        return this.indexes
      },
    },

    methods: {
        setIndex (uid) {
          this.indexName = uid;
          this.$emit("select-index", uid);
        },
    }
};
</script>
