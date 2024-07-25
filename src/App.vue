<template>
  <Login />
  <LogViewer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Login from "./components/Login.vue";
import LogViewer from "./components/LogViewer.vue";

export default defineComponent({
  name: "App",
  components: {
    Login,
    LogViewer,
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
