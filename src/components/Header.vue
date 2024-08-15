<template>
  <header class="header">
    <Login />
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Login from "@/components/Login.vue";

export default defineComponent({
  name: "HeaderLoger",
  components: { Login },
});
</script>

<style lang="scss" scope>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  align-items: center;
  background-color: #404040;
  padding: 10px;
}
</style>
