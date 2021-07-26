<template>
    <table class="border-collapse w-full">
        <thead class="sticky top-0 w-full text-sm">
            <tr class="w-full bg-bright-300 dark:bg-dim-900 border-b border-bright-400 dark:border-dim-600">
                <th class="w-8 border-r border-bright-400 dark:border-dim-600">
                    <input type="checkbox" v-model="setting.isCheckAll" />
                </th>
                <th
                    v-for="(col, index) in columns"
                    :key="index"
                    :style="{ width: col.width ? col.width : 'auto' }"
                    class="border-r border-bright-400 dark:border-dim-600 py-2"
                    >
                    {{ col.label }}
                </th>
            </tr>
        </thead>
        <tbody v-if="rows.length > 0">
            <tr @click="handleRowSelect" v-for="(row, i) in rows" :key="i" :class="['cursor-pointer', classTableRows[i % 2]]">
                <td class="border-r border-bright-400 dark:border-dim-600 p-2">
                    <input
                        type="checkbox"
                        :ref="(el) => {
                            rowsChecked[i] = el;
                        }"
                        :value="row[setting.keyColumn]"
                        @click="handleRowCheck"
                    />
                </td>
                <td v-for="(col, j) in columns" :key="j"
                    class="border-r border-bright-400 dark:border-dim-600 p-2">
                    <div v-if="col.display" v-html="col.display(row)"></div>
                    <span v-else>{{ row[col.field] }}</span>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUpdate,
} from "vue";

interface tableSetting {
  isCheckAll: boolean;
  keyColumn: string;
}

interface column {
  isKey: string;
  field: string;
}

export default defineComponent({
  emits: ["return-checked-rows", "return-selected-rows"],
  data() {
    return {
        classTableRows: [
            'text-bright-900 dark:text-dim-100 bg-bright-100 dark:bg-dim-800',
            'text-bright-900 dark:text-dim-100 bg-bright-200 dark:bg-dim-900'
        ]
    }
  },
  props: {
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
    }
  },
  setup(props, { emit }) {
    // (Internal set value for components)
    const setting: tableSetting = reactive({
      // (Whether to select all)
      isCheckAll: false,
      // KEY field name
      keyColumn: computed(() => {
        let key = "";
        Object.assign(props.columns).forEach((col: column) => {
          if (col.isKey) {
            key = col.field;
          }
        });
        return key;
      })
    });

    ////////////////////////////
    //
    //  Checkbox related operations)
    //

    // Checkbox (Define Checkbox reference)
    const rowsChecked = ref([]);
    const rowsSelected = ref([]);

    /**
     * (Execute before re-rendering)
     */
    onBeforeUpdate(() => {
        // (Clear all values before each update)
        rowsChecked.value = [];
        rowsSelected.value = [];
    });

    /**
     * Checkbox (Check all checkboxes for monitoring)
     */
    watch(
        () => setting.isCheckAll,
        (state: boolean) => {
            let isChecked: Array<string> = [];
            rowsChecked.value.forEach((val: HTMLInputElement) => {
                if (val) {
                val.checked = state;
                if (val.checked) {
                    isChecked.push(val.value);
                }
                }
            });
            // (Return the selected data on the screen)
            emit("return-checked-rows", isChecked);
        }
    );

    /**
     * Checkbox點擊事件 (Checkbox click event)
     */
    const handleRowCheck = () => {
      let isChecked: Array<string> = [];

        console.log('rowsChecked', rowsChecked);

      rowsChecked.value.forEach((val: HTMLInputElement) => {
        if (val && val.checked) {
          isChecked.push(val.value);
        }
      });
      // 回傳畫面上選上的資料 (Return the selected data on the screen)
      emit("return-checked-rows", isChecked);
    };

    const handleRowSelect = () => {
        let isChecked: Array<string> = [];

        console.log('rowsSelected', rowsSelected);

        rowsSelected.value.forEach((val: HTMLInputElement) => {
            if (val && val.checked) {
                isChecked.push(val.value);
            }
        });

        // (Return the selected data on the screen)
        emit("return-selected-rows", isChecked);
    };

    /**
     * 清空畫面上所有選擇資料 (Clear all selected data on the screen)
     */
    const clearChecked = () => {
      rowsChecked.value.forEach((val: HTMLInputElement) => {
        if (val && val.checked) {
          val.checked = false;
        }
      });
      // 回傳畫面上選上的資料 (Return the selected data on the screen)
      emit("return-checked-rows", []);
    };

    return {
        setting,
        rowsChecked,
        handleRowCheck
    };
  },
});
</script>
