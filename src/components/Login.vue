<template>
  <div class="login">
    <template v-if="!isAuth">
      <div>
        <label>Login <input type="text" v-model="username" /></label>
      </div>
      <div>
        <label>Password <input type="text" v-model="password" /></label>
      </div>
      <button @click="login">Авторизоваться</button>
    </template>
    <button v-else @click="logout">Выйти</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useApiService from "@/composables/useApiService";

export default defineComponent({
  name: "LoginLogViewer",
  setup() {
    const { login, logout, loginData, isAuth } = useApiService();
    return {
      login,
      logout,
      isAuth,
      username: loginData.username,
      password: loginData.password,
    };
  },
});
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
