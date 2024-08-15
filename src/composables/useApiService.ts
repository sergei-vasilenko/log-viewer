import api from "@/lib/api/apiService";
import { reactive } from "vue";

export default function useApiService() {
  const apiService = reactive(api);
  return { apiService };
}
