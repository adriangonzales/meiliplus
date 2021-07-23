<template>
  <div :class="[theme, 'h-full']">
    <div class="flex flex-col h-full text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800">
      <header class="bg-gray-100 dark:bg-gray-700 p-4">
          <div class="flex items-center justify-between select-none">
            <div
              class="flex-grow rounded text-sm px-2 py-1 mr-4"
              :class="{
                'bg-primary-600 text-primary-100': connected,
                'bg-gray-200 text-gray-500': !connected,
                }">
                <div v-if="connected" class="flex justify-between">
                  <div>
                    {{ hostUrl }}
                  </div>

                  <button v-if="connected" class="text-xs font-bold" @click="disconnect()">
                    <ErrorIcon class="w-4 fill-current" />
                  </button>
                </div>

                <div v-else>
                  Not Connected
                </div>
            </div>
            <button class="rounded text-xs p-2 capitalize bg-gray-300 dark:bg-gray-600 " @click="toggleTheme()">
              <SunIcon v-if="theme === 'dark'" class="w-3 fill-current" />
              <MoonIcon v-if="theme === 'light'" class="w-3 fill-current" />
            </button>
          </div>
      </header>
      <main class="flex-grow overflow-y-auto">
        <div v-if="!connected" class="h-full w-full flex items-center justify-center">
            <div v-if="connecting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              Connecting
            </div>
            <div v-if="!connecting" class="flex flex-col rounded shadow-xl bg-gray-100 dark:bg-gray-700 w-full max-w-lg">
              <div class="flex rounded-t">
                <input type="input" v-model="server" class="form-input flex-grow px-2 py-3 bg-transparent">
                <input type="input" v-model="port" class="form-input w-20 px-2 py-3 bg-transparent border-l border-gray-200 dark:border-gray-600">
              </div>

              <div class="border-t border-gray-200 dark:border-gray-600">
                <input type="password" v-model="apiKey" placeholder="API Key" class="form-input border-0 w-full px-2 py-3 bg-transparent">
              </div>

              <button class="bg-primary-200 dark:bg-primary-800 rounded-b px-2 py-3" @click="connect()">Connect</button>
            </div>
        </div>

        <div v-if="connected" class="h-full w-full flex items-center justify-center">
          <nav class="h-full flex flex-col flex-shrink-0 text-sm w-60 bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-900">
            <form @submit.prevent="doQuery()" class="flex w-full items-center py-2 px-4">
              <input type="search" v-model="indexFilter" placeholder="Search for index" class="form-input flex-grow rounded-l px-2 py-1 bg-transparent border border-gray-400 dark:border-gray-600">
            </form>
            <div class="h-full flex flex-col overflow-y-auto">
              <div class="flex flex-col">
                <button
                  type="button"
                  class="text-left py-2 px-4 flex items-center"
                  :class="{'font-bold bg-primary-200 dark:bg-primary-800': indexName == idx.uid}"
                  v-for="idx in filteredIndexes" :key="idx.uid"
                  @click="setIndex(idx.uid)">
                  <IndexIcon class="w-4 mr-2 text-primary-300 fill-current" />
                  {{ idx.name }}
                </button>
              </div>
            </div>
          </nav>
          <section class="flex-grow flex flex-col h-full">
            <div class="flex flex-col items-center px-4 border-b border-gray-400 dark:border-gray-700 bg-gray-300 dark:bg-gray-900">
              <form @submit.prevent="doQuery()" class="flex w-full items-center py-2">
                <input type="search" v-model="query" class="form-input flex-grow rounded-l px-2 py-1 bg-transparent border border-gray-400 dark:border-gray-600 ">
                <button class="rounded-r py-1 px-2 border border-gray-400 dark:border-gray-600 bg-gray-400 dark:bg-gray-600">Search</button>
              </form>
              <div class="flex w-full items-center py-2">
                <button class="rounded py-1 px-2 text-xs dark:border-gray-600 bg-gray-400 dark:bg-gray-600" @click="clearQuery()">Unset</button>
              </div>
            </div>
            <div class="overflow-y-auto">
              <div v-if="results && results.hits" class="flex-grow h-full">
                <table class="table-auto w-full">
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
                </table>
              </div>
              <div v-else class="p-4 text-gray-500 dark:text-gray-600">
                No Results
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { MeiliSearch } from 'meilisearch'
import IndexIcon from './components/icons/index.vue';
import ErrorIcon from './components/icons/error.vue';
import SunIcon from './components/icons/sun.vue';
import MoonIcon from './components/icons/moon.vue';

export default {
    components: {
      IndexIcon,
      ErrorIcon,
      SunIcon,
      MoonIcon,
    },
    data() {
        return {
            theme: 'light',
            busy: false,
            connected: false,
            connecting: false,
            server: localStorage.getItem('server') ?? 'http://localhost',
            port: localStorage.getItem('port') ?? '7700',
            apiKey: localStorage.getItem('apiKey') ?? '',
            client: null,
            indexes: null,
            indexName: null,
            index: null,
            indexFilter: null,
            primaryKey: 'id',
            results: null,
            query: null,
            rowClasses: [
              'text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-900'
            ]
        };
    },

    mounted: function() {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.theme = 'dark'
      } else {
        this.theme = 'light'
      }
    },

    computed: {
      // get only
      hostUrl: function () {
          let hostUrl = this.server;

          if (this.port && this.port !== '80') {
            hostUrl = hostUrl + ':' + this.port
          }

          return hostUrl;
      },
      filteredIndexes: function () {
        if (this.indexFilter) {
          let searchToken = new RegExp(this.indexFilter, 'ig')
          return this.indexes.filter(({ name, uid }) => (name + uid).match(searchToken))
        }

        return this.indexes
      },
    },

    watch: {
        indexName: async function (val) {
          this.index = this.client.index(val);
          this.results = await this.index.search();
        },
        server: function (val) {
          this.$nextTick(()=>{
            this.server = val.replace(/\/$/, "")
          })
        },
    },

    methods: {
        toggleTheme() {
          this.theme = this.theme == 'light' ? 'dark' : 'light'
          localStorage.setItem('theme', this.theme)
        },
        disconnect () {
          this.connected = false
        },
        async connect () {
          this.connecting = true

          localStorage.setItem('server', this.server)
          localStorage.setItem('port', this.port)
          localStorage.setItem('apiKey', this.apiKey)

          this.client = new MeiliSearch({
            host: this.hostUrl,
            apiKey: this.apiKey,
          })

          this.indexes = await this.client.listIndexes();
          this.connecting = false
          this.connected = true
        },
        setIndex (uid) {
          this.indexName = uid;
        },
        async doQuery () {
          this.results = await this.index.search(this.query);
        },
        async clearQuery () {
          this.query = null;
          this.results = await this.index.search();
        }
    }
};
</script>
