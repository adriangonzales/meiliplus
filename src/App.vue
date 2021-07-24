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
            <button-base class="rounded" @click="toggleTheme()">
              <SunIcon v-if="theme === 'dark'" class="w-3 fill-current" />
              <MoonIcon v-if="theme === 'light'" class="w-3 fill-current" />
            </button-base>
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
                <input type="input" v-model="server" class="flex-grow px-2 py-3 bg-transparent">
                <input type="input" v-model="port" class="w-20 px-2 py-3 bg-transparent border-l border-gray-200 dark:border-gray-600">
              </div>

              <div class="border-t border-gray-200 dark:border-gray-600">
                <input type="password" v-model="apiKey" placeholder="API Key" class="border-0 w-full px-2 py-3 bg-transparent">
              </div>

              <button-base class="bg-primary-200 dark:bg-primary-800 rounded-b px-2 py-3" @click="connect()">Connect</button-base>
            </div>
        </div>

        <div v-if="connected" class="h-full w-full flex items-center justify-center">
          <index-list
            :indexes="indexes"
            @refresh-indexes="handleIndexRefresh"
            @select-index="handleIndexSelect"
            class="h-full flex flex-col flex-shrink-0 text-sm w-60 bg-gray-300 dark:bg-gray-800 border-r border-gray-400 dark:border-gray-900" />

          <index-results
            :index="index"
            class="flex-grow flex flex-col h-full" />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { MeiliSearch } from 'meilisearch'
import ButtonBase from "./components/controls/ButtonBase.vue";
import IndexIcon from './components/icons/index.vue';
import ErrorIcon from './components/icons/error.vue';
import SunIcon from './components/icons/sun.vue';
import MoonIcon from './components/icons/moon.vue';
import IndexResults from "./components/views/IndexResults.vue";
import IndexList from './components/views/IndexList.vue';

export default {
    components: {
      ButtonBase,
      IndexIcon,
      ErrorIcon,
      SunIcon,
      MoonIcon,
      IndexResults,
      IndexList
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
      }
    },

    watch: {
        indexName: function (val) {
          this.index = this.client.index(val);
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
        connect () {
          this.connecting = true

          localStorage.setItem('server', this.server)
          localStorage.setItem('port', this.port)
          localStorage.setItem('apiKey', this.apiKey)

          this.client = new MeiliSearch({
            host: this.hostUrl,
            apiKey: this.apiKey,
          })

          this.getIndexes()
          this.connecting = false
          this.connected = true
        },
        async getIndexes () {
          this.indexes = await this.client.listIndexes();
        },
        handleIndexRefresh () {
          this.getIndexes()
        },
        handleIndexSelect (uid) {
          this.indexName = uid
        }
    }
};
</script>
