import api from "@/lib/api/apiService";
import { LogsData } from "@/lib/api/types";
import { reactive, computed } from "vue";

export default function useApiService() {
  const apiService = reactive(api);

  const loginData = reactive({
    username: "enter",
    password: "A505a",
  });

  const isAuth = computed(() => apiService.isAuth);

  const login = () => {
    apiService.login(loginData.username, loginData.password);
  };

  const logout = () => {
    apiService.logout();
  };

  const receiveLogs = (callback: (data: LogsData) => void) => {
    apiService.logs((data) => {
      callback(data);
    });
  };

  return {
    login,
    logout,
    receiveLogs,
    loginData,
    isAuth,
  };
}
