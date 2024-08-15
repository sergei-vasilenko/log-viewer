<template>
  <div class="login">
    <template v-if="!isAuth">
      <div class="login__input-wrapper">
        <label for="login">Login</label>
        <input id="login" type="text" v-model="loginData.username" />
      </div>
      <div class="login__input-wrapper">
        <label for="password">Password</label>
        <input id="password" type="text" v-model="loginData.password" />
      </div>
      <button @click="login">Войти</button>
    </template>
    <template v-else>
      <div class="user">
        <div class="user__avatar">{{ name.first }}</div>
        <div class="user__name">{{ name.tail }}</div>
      </div>
      <button @click="logout">Выйти</button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import useAuth from "@/composables/useAuth";

export default defineComponent({
  name: "LoginLogViewer",
  setup() {
    const { login, logout, loginData, isAuth, username } = useAuth();

    const name = computed(() => {
      const firstChar = username.value.slice(0, 1);
      return {
        first: firstChar ? firstChar.toUpperCase() : "U",
        tail: username.value.slice(1),
      };
    });

    return {
      login,
      logout,
      isAuth,
      loginData,
      name,
    };
  },
});
</script>

<style scoped lang="scss">
.login {
  display: flex;
  gap: 48px;

  & button {
    font-size: 16px;
    font-weight: 600;
    align-self: flex-end;
    padding: 12px 18px;
    cursor: pointer;
    border-radius: 6px;
    background-color: #c9e7ff;
    color: #484343;
    transition: 300ms background-color ease-in;

    &:hover {
      background-color: rgb(217, 255, 171);
      transition: 300ms background-color ease-in;
    }
  }
}

.login__input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;

  & label {
    color: #ffebeb;
    font-weight: 600;
  }

  & input {
    font-size: 18px;
    border-radius: 6px;
    padding: 4px 8px;
    font-family: "Courier New", Courier, monospace;
  }
}

.user {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #487eaa;
  border: 3px solid #ffffff;
}

.user__name {
  color: #ffebeb;
  font-size: 22px;
  font-weight: 600;
}
</style>
