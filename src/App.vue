<template>
  <Header />
  <template v-if="isAuth">
    <LogViewer />
  </template>
  <div v-else class="no-auth-screen">Необходимо авторизоваться</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "@/components/Header.vue";
import LogViewer from "@/components/LogViewer.vue";
import useAuth from "@/composables/useAuth";

export default defineComponent({
  name: "App",
  components: {
    Header,
    LogViewer,
  },
  setup() {
    const { isAuth } = useAuth();
    return { isAuth };
  },
});
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  font-size: 17px;
  color: #484343;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

.no-auth-screen {
  padding: 20px;
}
</style>
