import { reactive, computed, ref } from "vue";
import useApiService from "./useApiService";

export default function useAuth() {
  const { apiService } = useApiService();

  const loginData = reactive({
    username: "enter",
    password: "A505a",
  });

  const username = ref("");

  const isAuth = computed(() => apiService.isAuth);

  const login = async () => {
    const data = await apiService.login(loginData.username, loginData.password);
    username.value = data.username;
  };

  const logout = () => {
    apiService.logout();
  };

  return {
    login,
    logout,
    loginData,
    isAuth,
    username,
  };
}
