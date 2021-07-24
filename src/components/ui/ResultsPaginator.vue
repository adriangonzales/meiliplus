<template>
    <div>
        <div class="">
            <div role="status" aria-live="polite">
                {{
                    stringFormat(messages.pagingInfo, setting.offset, setting.limit, total)
                }}
            </div>
        </div>
        <div class="">
            <span>{{ messages.pageSizeChangeLabel }}</span>
            <select class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100" v-model="setting.pageSize">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>

            <span>{{ messages.gotoPageLabel }}</span>
            <select class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100" v-model="setting.page">
                <option v-for="n in setting.maxPage" :key="n">{{ n }}</option>
            </select>
        </div>
        <nav :class="classPaginationWrapper" aria-label="Pagination">
            <button type="button"
                :disabled="setting.page <= 1"
                :class="classPaginationButton"
                aria-label="Previous"
                @click="setting.page = 1">
                <span aria-hidden="true">&laquo;</span>
                <span class="sr-only">First</span>
            </button>
            <button type="button"
                :disabled="setting.page <= 1"
                :class="classPaginationButton"
                aria-label="Previous"
                @click="prevPage">
                <span aria-hidden="true">&lt;</span>
                <span class="sr-only">Prev</span>
            </button>
            <button type="button"
                v-for="n in setting.paging"
                :key="n"
                :disabled="setting.page === n"
                :class="[setting.page === n ? classPaginationButtonActive : classPaginationButton]"
                @click="movePage(n)"
            >
                {{ n }}
            </button>
            <button type="button"
                :disabled="setting.page >= setting.maxPage"
                :class="classPaginationButton"
                aria-label="Next"
                @click="nextPage"
            >
                <span aria-hidden="true">&gt;</span>
                <span class="sr-only">Next</span>
            </button>
            <button type="button"
                :disabled="setting.page >= setting.maxPage"
                :class="classPaginationButton"
                @click="setting.page = setting.maxPage"
                aria-label="Last"
            >
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Last</span>
            </button>
        </nav>
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

interface tableSetting {
  keyColumn: string;
  page: number;
  pageSize: number;
  maxPage: number;
  offset: number;
  limit: number;
  paging: Array<number>;
}

interface column {
  isKey: string;
  field: string;
}

export default defineComponent({
  emits: ["return-checked-rows", "do-search", "is-finished"],
  props: {
    // (Whether to perform a re-query)
    isReSearch: {
      type: Boolean,
      require: true,
    },
    // 有無Checkbox (Presence of Checkbox)
    hasCheckbox: {
      type: Boolean,
      default: false,
    },
    // 欄位 (Field)
    columns: {
      type: Array,
      default: () => {
        return [];
      },
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
    },
    classPaginationWrapper: {
      type: String,
      default: 'relative inline-flex shadow-sm -space-x-px text-sm font-medium',
    },
    classPaginationButton: {
      type: String,
      default: 'bg-white text-gray-500 hover:bg-gray-50 relative px-4 py-2',
    },
    classPaginationButtonActive: {
      type: String,
      default: 'bg-primary-50 text-primary-600 relative px-4 py-2',
    },
    // 顯示文字 (Display text)
    messages: {
      type: Object,
      default: () => {
        return {
          pagingInfo: "Showing {0}-{1} of {2}",
          pageSizeChangeLabel: "Row count:",
          gotoPageLabel: "Go to page:",
          noDataAvailable: "No data",
        };
      },
    }
  },
  setup(props, { emit }) {
    // (Internal set value for components)
    const setting: tableSetting = reactive({
      // (KEY field name)
      keyColumn: computed(() => {
        let key = "";
        Object.assign(props.columns).forEach((col: column) => {
          if (col.isKey) {
            key = col.field;
          }
        });
        return key;
      }),
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
      }),
      // 換頁陣列 (Paging array)
      paging: computed(() => {
        let startPage = setting.page - 2 <= 0 ? 1 : setting.page - 2;
        if (setting.maxPage - setting.page <= 2) {
          startPage = setting.maxPage - 4;
        }
        startPage = startPage <= 0 ? 1 : startPage;
        let pages = [];
        for (let i = startPage; i <= setting.maxPage; i++) {
          if (pages.length < 5) {
            pages.push(i);
          }
        }
        return pages;
      }),
      paginationButtonClass: computed((active = false) => {
        return active ? props.classPaginationButton : props.classPaginationButtonActive;
      }),
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
        emit("do-search", offset, limit);
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

    // 監聽資料變更 (Monitoring data changes)
    watch(
      () => props.rows,
      () => {
        if (props.isReSearch) {
          setting.page = 1;
        }
        nextTick(function () {
          // (Return the private components after the data is rendered)
          let localElement = document.getElementsByClassName("is-rows-el");
          emit("is-finished", localElement);
        });
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stringFormat = (template: string, ...args: any[]) => {
      return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
      });
    };

    return {
        setting,
        prevPage,
        movePage,
        nextPage,
        stringFormat,
    };
  },
});
</script>
