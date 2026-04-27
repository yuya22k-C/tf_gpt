"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { METRICS } from "@/lib/metrics";
import { DailyRecord, MetricKey, TrackerPayload } from "@/lib/types";
import {
  emptyRecord,
  getRecordKey,
  normalizeDateInput,
  setMetricValue,
} from "@/lib/utils";

type TrackerAppProps = {
  initialData: TrackerPayload;
  editSecretHeader: string;
};

type Toast = {
  tone: "neutral" | "error";
  message: string;
};

export function TrackerApp({ initialData, editSecretHeader }: TrackerAppProps) {
  const [data, setData] = useState<TrackerPayload>(initialData);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("flowerCount");
  const [newPlantName, setNewPlantName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [editSecret, setEditSecret] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const cachedSecret = window.localStorage.getItem("tomato-tracker-edit-secret");
    if (cachedSecret) {
      setEditSecret(cachedSecret);
    }
  }, []);

  const recordsMap = new Map(
    data.records.map((record) => [getRecordKey(record.date, record.plantId), record]),
  );

  async function callApi(path: string, init?: RequestInit, requireSecret = false) {
    const headers = new Headers(init?.headers);

    if (init?.body) {
      headers.set("Content-Type", "application/json");
    }

    if (requireSecret && editSecret) {
      headers.set(editSecretHeader, editSecret);
    }

    const response = await fetch(path, {
      ...init,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed");
    }

    return payload;
  }

  function updateLocalRecord(nextRecord: DailyRecord) {
    setData((current) => {
      const nextRecords = current.records.filter(
        (record) => getRecordKey(record.date, record.plantId) !== getRecordKey(nextRecord.date, nextRecord.plantId),
      );
      nextRecords.push(nextRecord);
      nextRecords.sort((a, b) => {
        if (a.date === b.date) {
          return a.plantId.localeCompare(b.plantId);
        }
        return b.date.localeCompare(a.date);
      });
      return { ...current, records: nextRecords };
    });
  }

  function removeLocalRecord(date: string, plantId: string) {
    setData((current) => ({
      ...current,
      records: current.records.filter(
        (record) => getRecordKey(record.date, record.plantId) !== getRecordKey(date, plantId),
      ),
    }));
  }

  function updateToast(message: string, tone: Toast["tone"] = "neutral") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2200);
  }

  function persistSecret(value: string) {
    setEditSecret(value);
    window.localStorage.setItem("tomato-tracker-edit-secret", value);
  }

  async function handleAddPlant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newPlantName.trim();
    if (!name) {
      updateToast("株名を入力してください", "error");
      return;
    }

    startTransition(async () => {
      try {
        const payload = await callApi(
          "/api/plants",
          {
            method: "POST",
            body: JSON.stringify({ name }),
          },
          true,
        );

        setData((current) => ({
          ...current,
          plants: [...current.plants, payload.plant],
        }));
        setNewPlantName("");
        updateToast("株を追加しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "株を追加できませんでした", "error");
      }
    });
  }

  async function handleAddDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const date = normalizeDateInput(newDate);
    if (!date) {
      updateToast("日付を入力してください", "error");
      return;
    }

    startTransition(async () => {
      try {
        const payload = await callApi(
          "/api/dates",
          {
            method: "POST",
            body: JSON.stringify({ date }),
          },
          true,
        );

        setData((current) => {
          const exists = current.dates.some((item) => item.observedOn === payload.observationDate.observedOn);
          if (exists) {
            return current;
          }
          const nextDates = [...current.dates, payload.observationDate].sort((a, b) =>
            b.observedOn.localeCompare(a.observedOn),
          );
          return { ...current, dates: nextDates };
        });
        setNewDate("");
        updateToast("日付を追加しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "日付を追加できませんでした", "error");
      }
    });
  }

  function buildRecordBody(record: DailyRecord) {
    return {
      flowerCount: record.flowerCount,
      fruitCount: record.fruitCount,
      flowered: record.flowered,
      harvestStarted: record.harvestStarted,
      harvestEnded: record.harvestEnded,
    };
  }

  function isRecordEmpty(record: DailyRecord) {
    return (
      record.flowerCount === null &&
      record.fruitCount === null &&
      record.flowered === null &&
      record.harvestStarted === null &&
      record.harvestEnded === null
    );
  }

  async function saveMetricValue(date: string, plantId: string, value: number | boolean | null) {
    const current = recordsMap.get(getRecordKey(date, plantId)) ?? emptyRecord(date, plantId);
    const nextRecord = setMetricValue(current, activeMetric, value);
    const url = `/api/records/${encodeURIComponent(date)}/${encodeURIComponent(plantId)}`;

    startTransition(async () => {
      try {
        if (isRecordEmpty(nextRecord)) {
          await callApi(url, { method: "DELETE" }, true);
          removeLocalRecord(date, plantId);
        } else {
          const payload = await callApi(
            url,
            {
              method: "PUT",
              body: JSON.stringify(buildRecordBody(nextRecord)),
            },
            true,
          );
          updateLocalRecord(payload.record);
        }
        updateToast("保存しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "保存できませんでした", "error");
      }
    });
  }

  async function renamePlant(plantId: string, name: string) {
    const nextName = name.trim();
    if (!nextName) {
      updateToast("株名を空にはできません", "error");
      return;
    }

    startTransition(async () => {
      try {
        const payload = await callApi(
          `/api/plants/${encodeURIComponent(plantId)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ name: nextName }),
          },
          true,
        );
        setData((current) => ({
          ...current,
          plants: current.plants.map((plant) => (plant.id === plantId ? payload.plant : plant)),
        }));
        updateToast("株名を更新しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "株名を更新できませんでした", "error");
      }
    });
  }

  async function deletePlant(plantId: string) {
    startTransition(async () => {
      try {
        await callApi(`/api/plants/${encodeURIComponent(plantId)}`, { method: "DELETE" }, true);
        setData((current) => ({
          ...current,
          plants: current.plants.filter((plant) => plant.id !== plantId),
          records: current.records.filter((record) => record.plantId !== plantId),
        }));
        updateToast("株を削除しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "株を削除できませんでした", "error");
      }
    });
  }

  async function deleteDate(date: string) {
    startTransition(async () => {
      try {
        await callApi(`/api/dates/${encodeURIComponent(date)}`, { method: "DELETE" }, true);
        setData((current) => ({
          ...current,
          dates: current.dates.filter((item) => item.observedOn !== date),
          records: current.records.filter((record) => record.date !== date),
        }));
        updateToast("日付を削除しました");
      } catch (error) {
        updateToast(error instanceof Error ? error.message : "日付を削除できませんでした", "error");
      }
    });
  }

  const activeMetricDefinition = METRICS.find((metric) => metric.key === activeMetric)!;

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Tomato Tracker</p>
          <h1>トマトの記録を、表でそのまま管理。</h1>
          <p className="hero-text">
            開花数、結実数、収穫開始日と終了日を、日付ごと・株ごとに一覧で記録できます。
          </p>
        </div>

        <div className="secret-panel">
          <label className="panel-label" htmlFor="edit-secret">
            編集キー
          </label>
          <input
            id="edit-secret"
            className="text-input"
            type="password"
            value={editSecret}
            onChange={(event) => persistSecret(event.target.value)}
            placeholder="APP_EDIT_SECRET"
          />
          <p className="panel-help">編集操作時だけ送信します。閲覧には不要です。</p>
        </div>
      </section>

      <section className="controls-card">
        <form className="inline-form" onSubmit={handleAddPlant}>
          <label className="panel-label" htmlFor="new-plant">
            株を追加
          </label>
          <div className="inline-field">
            <input
              id="new-plant"
              className="text-input"
              value={newPlantName}
              onChange={(event) => setNewPlantName(event.target.value)}
              placeholder="例: A-1"
            />
            <button className="primary-button" type="submit" disabled={isPending}>
              追加
            </button>
          </div>
        </form>

        <form className="inline-form" onSubmit={handleAddDate}>
          <label className="panel-label" htmlFor="new-date">
            日付を追加
          </label>
          <div className="inline-field">
            <input
              id="new-date"
              className="text-input"
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
            <button className="primary-button" type="submit" disabled={isPending}>
              追加
            </button>
          </div>
        </form>

        <a className="ghost-button" href="/api/export.csv">
          CSVエクスポート
        </a>
      </section>

      <section className="tabs-card">
        <div className="tab-list" role="tablist" aria-label="記録タブ">
          {METRICS.map((metric) => (
            <button
              key={metric.key}
              type="button"
              className={metric.key === activeMetric ? "tab-button active" : "tab-button"}
              onClick={() => setActiveMetric(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="metric-caption">
          <span>{activeMetricDefinition.label}</span>
          <span>{activeMetricDefinition.kind === "count" ? "数値入力" : "チェック入力"}</span>
        </div>

        <div className="grid-frame">
          <table className="tracker-table">
            <thead>
              <tr>
                <th className="sticky-col date-header">日付</th>
                {data.plants.map((plant) => (
                  <th key={plant.id}>
                    <div className="plant-header">
                      <input
                        className="plant-name-input"
                        defaultValue={plant.name}
                        onBlur={(event) => {
                          if (event.target.value !== plant.name) {
                            void renamePlant(plant.id, event.target.value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => void deletePlant(plant.id)}
                        aria-label={`${plant.name} を削除`}
                      >
                        削除
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.dates.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={Math.max(data.plants.length + 1, 2)}>
                    まだ日付がありません。上のフォームから追加してください。
                  </td>
                </tr>
              ) : (
                data.dates.map((dateItem) => (
                  <tr key={dateItem.observedOn}>
                    <th className="sticky-col row-header">
                      <div className="date-cell">
                        <span>{dateItem.observedOn}</span>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => void deleteDate(dateItem.observedOn)}
                          aria-label={`${dateItem.observedOn} を削除`}
                        >
                          削除
                        </button>
                      </div>
                    </th>
                    {data.plants.map((plant) => {
                      const record =
                        recordsMap.get(getRecordKey(dateItem.observedOn, plant.id)) ??
                        emptyRecord(dateItem.observedOn, plant.id);
                      const value = record[activeMetric];

                      return (
                        <td key={`${dateItem.observedOn}-${plant.id}`}>
                          {activeMetricDefinition.kind === "count" ? (
                            <input
                              className="cell-input"
                              inputMode="numeric"
                              defaultValue={typeof value === "number" ? String(value) : ""}
                              onBlur={(event) => {
                                const nextValue = event.target.value.trim();
                                if (nextValue === "") {
                                  void saveMetricValue(dateItem.observedOn, plant.id, null);
                                  return;
                                }

                                const parsed = Number(nextValue);
                                if (!Number.isNaN(parsed)) {
                                  void saveMetricValue(dateItem.observedOn, plant.id, parsed);
                                }
                              }}
                            />
                          ) : (
                            <label className="checkbox-wrap">
                              <input
                                type="checkbox"
                                checked={value === true}
                                onChange={(event) =>
                                  void saveMetricValue(
                                    dateItem.observedOn,
                                    plant.id,
                                    event.target.checked ? true : null,
                                  )
                                }
                              />
                              <span>{value === true ? "記録済み" : "未記録"}</span>
                            </label>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {toast ? (
        <div className={toast.tone === "error" ? "toast error" : "toast"}>{toast.message}</div>
      ) : null}
    </main>
  );
}
