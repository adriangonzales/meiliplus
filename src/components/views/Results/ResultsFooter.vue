<template>
    <div>
        <div class="w-1/3">
          <div class="flex">
            <button-base class="rounded-l" :class="{'bg-primary-500 text-white dark:bg-primary-800': resultsView == 'table'}" @click="$emit('change-view', 'table')">
                <table-icon class="w-3 fill-current" />
            </button-base>
            <button-base class="rounded-r" :class="{'bg-primary-500 text-white dark:bg-primary-800': resultsView == 'list'}" @click="$emit('change-view', 'list')">
                <list-icon class="w-3 fill-current" />
            </button-base>
          </div>
        </div>
        <div class="w-1/3 text-sm text-center select-none" role="status" aria-live="polite">
            Showing {{ setting.offset }}-{{ setting.limit }} of {{ total }}
        </div>
        <div class="w-1/3 flex items-center justify-end">
            <div class="">
                <label for="paginator-page-limit" class="mr-2 text-sm">Limit</label>
                <select id="paginator-page-limit" class="py-1 text-sm rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100" v-model="setting.pageSize">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>

            <div class="ml-2 mr-6">
                <label for="paginator-page-select" class="mr-2 text-sm">Page</label>
                <select id="paginator-page-select" class="py-1 text-sm rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100" v-model="setting.page">
                    <option v-for="n in setting.maxPage" :key="n">{{ n }}</option>
                </select>
            </div>

            <nav class="relative inline-flex shadow-sm -space-x-px text-sm font-medium" aria-label="Pagination">
                <button-base
                    :disabled="setting.page <= 1"
                    class="px-4 rounded-l"
                    aria-label="Previous"
                    @click="prevPage">
                    <span aria-hidden="true">&lt;</span>
                    <span class="sr-only">Prev</span>
                </button-base>
                <button-base
                    :disabled="setting.page >= setting.maxPage"
                    class="px-4 rounded-r"
                    aria-label="Next"
                    @click="nextPage"
                >
                    <span aria-hidden="true">&gt;</span>
                    <span class="sr-only">Next</span>
                </button-base>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  watch,
  nextTick,
} from "vue";

import ButtonBase from "../../controls/ButtonBase.vue";
import ListIcon from '../../icons/list.vue';
import TableIcon from '../../icons/table.vue';

interface tableSetting {
  page: number;
  pageSize: number;
  maxPage: number;
  offset: number;
  limit: number;
}

export default defineComponent({
  emits: ["change-view", "change-page"],
  components: {
    ButtonBase,
    ListIcon,
    TableIcon
  },
  props: {
    // (Whether to perform a re-query)
    resultsView: {
      type: String,
      default: 'table',
    },
    // (Whether to perform a re-query)
    isReSearch: {
      type: Boolean,
      require: true,
    },
    // 資料 (data)
    rows: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 一頁顯示筆數 (Display the number of items on one page)
    pageSize: {
      type: Number,
      default: 10,
    },
    // 總筆數 (Total number of transactions)
    total: {
      type: Number,
      default: 100,
    },
    // 現在頁數 (Current page number)
    page: {
      type: Number,
      default: 1,
    }
  },
  setup(props, { emit }) {
    // (Internal set value for components)
    const setting: tableSetting = reactive({
      // 當前頁數 (current page number)
      page: props.page,
      // 每頁顯示筆數 (Display count per page)
      pageSize: props.pageSize,
      // 最大頁數 (Maximum number of pages)
      maxPage: computed(() => {
        if (props.total <= 0) {
          return 0;
        }
        let maxPage = Math.floor(props.total / setting.pageSize);
        let mod = props.total % setting.pageSize;
        if (mod > 0) {
          maxPage++;
        }
        return maxPage;
      }),
      // 該頁數起始值 (The starting value of the page number)
      offset: computed(() => {
        return (setting.page - 1) * setting.pageSize + 1;
      }),
      // 該頁數最大值 (Maximum number of pages0
      limit: computed(() => {
        let limit = setting.page * setting.pageSize;
        return props.total >= limit ? limit : props.total;
      })
    });

    /**
     * (Switch page number)
     *
     * @param page      number  新頁碼    (New page number)
     * @param prevPage  number  現在頁碼  (Current page number)
     */
    const changePage = (page: number, prevPage: number) => {
      let offset = (page - 1) * setting.pageSize;
      let limit = setting.pageSize;
      if (!props.isReSearch || page > 1 || page == prevPage) {
        // (Call query will only be executed if the page number is changed without re-query)
        emit("change-page", offset, limit);
      }
    };
    // 監聽頁碼切換 (Monitor page switching)
    watch(() => setting.page, changePage);

    /**
     * 切換顯示筆數 (Switch display number)
     */
    const changePageSize = () => {
      if (setting.page === 1) {
        // 沒自動觸發 changePage()，所以手動觸發
        changePage(setting.page, setting.page);
      } else {
        // 強制返回第一頁,並自動觸發 changePage()
        setting.page = 1;
      }
    };
    // 監聽顯示筆數切換 (Monitor display number switch)
    watch(() => setting.pageSize, changePageSize);

    /**
     * 上一頁 (Previous page)
     */
    const prevPage = () => {
      if (setting.page == 1) {
        // 如果是第一頁，不予執行 (If it is the first page, it will not be executed)
        return false;
      }
      setting.page--;
    };

    /**
     * 移動至指定頁數 (Move to the specified number of pages)
     */
    const movePage = (page: number) => {
      setting.page = page;
    };

    /**
     * 下一頁 (Next page)
     */
    const nextPage = () => {
      if (setting.page >= setting.maxPage) {
        // 如果等於大於最大頁數，不與執行 (If it is equal to or greater than the maximum number of pages, no execution)
        return false;
      }
      setting.page++;
    };

    return {
        setting,
        prevPage,
        movePage,
        nextPage
    };
  },
});
</script>
