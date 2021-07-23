<template>
  <div>
    <header class="bg-gray-100 px-10 py-12">
        <h1 class="text-4xl">Welcome to MeiliPlus Hey?</h1>
        <div>
            <input type="search" class="form-input px-4 py-3 rounded-full">
        </div>
    </header>
  </div>
</template>

<script>
export default {
    props: {
        server: {
            type: String,
            default: 'localhost:7000'
        },
    },

    data() {
        return {
            connected: false
        };
    },

    mounted: function() {
        
    },

    watch: {
        connected: function (val) {
            
        },
    },

    methods: {
        inputFile(newFile, oldFile, prevent) {

        }
    }
};
</script>
