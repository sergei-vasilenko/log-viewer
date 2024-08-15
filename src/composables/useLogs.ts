import { ref, computed } from "vue";
import { LogItem, LogItemData } from "@/lib/api/types";
import { LogsChank } from "@/types";
import { Action, LogLevel } from "@/lib/api/enums";
import { chankArray } from "@/assets/utils";
import useApiService from "./useApiService";

export default function useLogs() {
  const { apiService } = useApiService();

  let currentLogIndex = 0;

  const filters = ref<Set<LogLevel>>(new Set());

  const setFilters = (newValue: Set<LogLevel>) => {
    filters.value = newValue;
  };

  const logList = ref<LogItem[]>([]);
  const messagesForIndex = ref<{ index: number; value: string }[]>([]);

  apiService.logs(async ({ Action: actionType, Items }) => {
    /* ToDo: переписать prepareData без промежуточных структур, а указывать
    для каждого чанка индекс старта и заполнять массив одновременно.
    Так не придется тратить время на склеивание обработанных часте.
    Учесть, что
    */
    const prepareData = (
      list: LogItemData[]
    ): { forView: LogItem[]; forIndex: { index: number; value: string }[] } => {
      const forView: LogItem[] = [];
      const forIndex: { index: number; value: string }[] = [];

      list.forEach((item) => {
        const index = currentLogIndex++;
        forView.push({
          index,
          data: item,
        });
        forIndex.push({
          index,
          value: item.Message,
        });
      });

      return { forView, forIndex };
    };

    const logChanks = chankArray(Items).reduce((acc, chank) => {
      acc.push({
        then(
          onFulfilled: (data: {
            forView: LogItem[];
            forIndex: { index: number; value: string }[];
          }) => void
        ) {
          const { forView, forIndex } = prepareData(chank);
          onFulfilled({ forView, forIndex });
        },
      });
      return acc;
    }, []);

    const preparedChanks: LogsChank[] = await Promise.all(logChanks);

    const { forView, forIndex } = preparedChanks.reduce(
      (acc: LogsChank, chank: LogsChank) => {
        chank.forView.forEach((log) => acc.forView.push(log));
        chank.forIndex.forEach((log) => acc.forIndex.push(log));
        return acc;
      },
      {
        forView: [],
        forIndex: [],
      }
    );

    switch (actionType) {
      case Action.Initial:
        logList.value = forView;
        messagesForIndex.value = forIndex;
        break;
      case Action.Add:
        logList.value = logList.value.concat(forView);
        messagesForIndex.value = forIndex;
        break;
    }
  });

  const filteredLogList = computed(() => {
    const result = logList.value.filter((item) => {
      if (filters.value.size === 0) return true;
      return filters.value.has(item.data.Level);
    });
    return result;
  });

  const logIds = computed(() => {
    const indices = filteredLogList.value.map((item) => item.index);
    return new Set(indices);
  });

  return {
    logs: filteredLogList,
    logIds,
    messagesForIndex,
    setFilters,
  };
}
