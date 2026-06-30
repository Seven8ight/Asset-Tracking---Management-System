"use client";

import { Fragment, useState, useEffect } from "react";
import { assetApi, assignmentsApi, individualAssetApi } from "../../../lib/api";
import { useAuth } from "@/app/_lib/context/AuthContext";
import {
  type BackendAsset,
  type BackendIndividualAsset,
  type UiAsset,
  type UiStatus,
  deriveUiStatus,
  toUiAsset,
} from "../../../lib/asset-utils";
import { useSocketContext } from "@/app/_lib/context/SocketContext";

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

// asset_id here is the INDIVIDUAL asset id, matching the backend AssetAssignments type
type AssignmentRecord = {
  id: string;
  department_id: string;
  asset_id: string; // individual asset id
  user_id: string;
  username?: string;
  assigned_at?: string;
  returned_at: string | null;
};

const STATUS_STYLES: Record<UiStatus, string> = {
  Available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Use": "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Under repair": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Broken: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function AssetsPage() {
  const { user, hasPermission } = useAuth();
  const [assets, setAssets] = useState<UiAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState<UiAsset | null>(null);
  const [apiError, setApiError] = useState("");
  const [expandedAssets, setExpandedAssets] = useState<Record<string, boolean>>(
    {},
  );
  const [individualByAsset, setIndividualByAsset] = useState<
    Record<string, BackendIndividualAsset[]>
  >({});
  const socket = useSocketContext();

  // Keyed by individual asset id (asset_id from AssignmentRecord)
  const [activeAssignmentsByIndividual, setActiveAssignmentsByIndividual] =
    useState<Record<string, AssignmentRecord>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const canDeclareBrokenPermission = hasPermission("Declare asset broken");
  const canDeclareRepairedPermission = hasPermission("Declare asset repaired");

  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "1",
    image: null as string | null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!socket) console.log("Socket not established");
    socket?.on("connect", () =>
      console.log(`Connection established: ${socket.id}`),
    );
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setApiError("");
      const data = (await assetApi.getDepartmentAssets()) as ApiResponse<
        BackendAsset[]
      >;
      const backendAssets = data?.response?.message ?? [];

      if (!Array.isArray(backendAssets)) {
        setAssets([]);
        setIndividualByAsset({});
        return;
      }

      const individualMap: Record<string, BackendIndividualAsset[]> = {};

      const hydratedAssets = await Promise.all(
        backendAssets.map(async (asset) => {
          try {
            const individualData = (await individualAssetApi.getByAssetId(
              asset.id,
            )) as ApiResponse<BackendIndividualAsset[]>;
            const individualAssets = individualData?.response?.message ?? [];

            individualMap[asset.id] = Array.isArray(individualAssets)
              ? individualAssets
              : [];

            return toUiAsset(
              asset,
              Array.isArray(individualAssets) ? individualAssets : [],
            );
          } catch {
            individualMap[asset.id] = [];
            return toUiAsset(asset, []);
          }
        }),
      );

      setAssets(hydratedAssets);
      setIndividualByAsset(individualMap);

      try {
        const assignmentsResponse =
          (await assignmentsApi.getDepartmentAssignments()) as ApiResponse<
            AssignmentRecord[]
          >;
        const allAssignments = assignmentsResponse?.response?.message ?? [];

        // Key by asset_id which is the INDIVIDUAL asset id from the backend
        const latestActiveAssignments = (
          Array.isArray(allAssignments) ? allAssignments : []
        )
          .filter(
            (assignment) =>
              assignment.asset_id && assignment.returned_at === null,
          )
          .sort((a, b) => {
            const left = new Date(a.assigned_at ?? 0).getTime();
            const right = new Date(b.assigned_at ?? 0).getTime();
            return right - left;
          })
          .reduce(
            (acc, assignment) => {
              // asset_id IS the individual asset id — same key used in canReturnSelf lookup
              if (!acc[assignment.asset_id]) {
                acc[assignment.asset_id] = assignment;
              }
              return acc;
            },
            {} as Record<string, AssignmentRecord>,
          );

        setActiveAssignmentsByIndividual(latestActiveAssignments);
      } catch {
        setActiveAssignmentsByIndividual({});
      }
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const setField =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (formErrors[field])
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Asset name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.quantity || Number(form.quantity) < 1)
      errs.quantity = "Quantity must be at least 1";
    return errs;
  };

  const openAddModal = () => {
    setForm({ name: "", description: "", quantity: "1", image: null });
    setFormErrors({});
    setEditAsset(null);
    setShowAddModal(true);
  };

  const openEditModal = (asset: UiAsset) => {
    setForm({
      name: asset.name,
      description: asset.description ?? "",
      quantity: String(asset.quantity),
      image: asset.image_url,
    });
    setFormErrors({});
    setEditAsset(asset);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      if (editAsset) {
        await assetApi.update(editAsset.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          quantity: Number(form.quantity),
          ...(form.image ? { image: form.image } : {}),
        });
      } else {
        await assetApi.create({
          name: form.name.trim(),
          description: form.description.trim(),
          quantity: Number(form.quantity),
          ...(form.image ? { image: form.image } : {}),
        });
      }
      await fetchAssets();
      setShowAddModal(false);
    } catch (err) {
      setFormErrors({ submit: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    try {
      await assetApi.delete(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const toggleAssetDetails = (assetId: string) => {
    setExpandedAssets((prev) => ({
      ...prev,
      [assetId]: !prev[assetId],
    }));
  };

  const getIndividualLabel = (item: BackendIndividualAsset) => {
    if (item.is_broken) return "Broken";
    if (item.is_repaired) return "Under Repair";
    const assigned = (item.assigned || "").toLowerCase();
    if (assigned === "in use") return "In Use";
    return "Available";
  };

  const canAssignSelf = (item: BackendIndividualAsset) => {
    const assigned = (item.assigned || "").toLowerCase();
    if (item.is_broken) return false;
    return assigned !== "in use";
  };

  const canReturnSelf = (
    item: BackendIndividualAsset,
    currentAssignment?: AssignmentRecord,
  ) => {
    const assigned = (item.assigned || "").toLowerCase();
    if (item.is_broken || item.is_repaired) return false;
    if (assigned !== "in use") return false;
    if (!currentAssignment?.user_id || !user?.id) return false;
    // Compare against current user — asset_id on assignment IS item.id
    return currentAssignment.user_id === user.id;
  };

  const updateIndividualItem = (
    parentAssetId: string,
    itemId: string,
    updater: (item: BackendIndividualAsset) => BackendIndividualAsset,
  ) => {
    setIndividualByAsset((prev) => {
      const current = prev[parentAssetId] ?? [];
      const next = current.map((item) =>
        item.id === itemId ? updater(item) : item,
      );

      setAssets((assetsPrev) =>
        assetsPrev.map((asset) =>
          asset.id === parentAssetId
            ? { ...asset, status: deriveUiStatus(next) }
            : asset,
        ),
      );

      return { ...prev, [parentAssetId]: next };
    });
  };

  const assignAssetToSelf = async (
    parentAssetId: string,
    individualAsset: BackendIndividualAsset,
  ) => {
    setAssigningId(individualAsset.id);
    setApiError("");

    try {
      const assignResponse = (await assignmentsApi.assignToSelf(
        individualAsset.id,
      )) as ApiResponse<Partial<AssignmentRecord>>;
      const createdAssignment = assignResponse?.response?.message;

      if (individualAsset.is_repaired || individualAsset.is_broken) {
        await individualAssetApi.update(individualAsset.id, {
          is_broken: false,
          is_repaired: false,
          assigned: "in use",
        });
      }

      updateIndividualItem(parentAssetId, individualAsset.id, (item) => ({
        ...item,
        assigned: "in use",
        is_broken: false,
        is_repaired: false,
      }));

      // Key by individualAsset.id — same key as asset_id from backend
      setActiveAssignmentsByIndividual((prev) => ({
        ...prev,
        [individualAsset.id]: {
          id: createdAssignment?.id ?? prev[individualAsset.id]?.id ?? "",
          department_id: createdAssignment?.department_id ?? "",
          asset_id: createdAssignment?.asset_id ?? individualAsset.id,
          user_id: createdAssignment?.user_id ?? user?.id ?? "",
          username: createdAssignment?.username ?? user?.name ?? "You",
          returned_at: null,
          assigned_at:
            createdAssignment?.assigned_at ?? new Date().toISOString(),
        },
      }));
    } catch (err) {
      setApiError((err as Error).message || "Failed to assign asset");
    } finally {
      setAssigningId(null);
    }
  };

  const returnAssetToPool = async (
    parentAssetId: string,
    individualAsset: BackendIndividualAsset,
  ) => {
    setAssigningId(individualAsset.id);
    setApiError("");

    try {
      let assignmentId = activeAssignmentsByIndividual[individualAsset.id]?.id;

      if (!assignmentId) {
        const assignmentResponse = (await assignmentsApi.getByIndividualAssetId(
          individualAsset.id,
        )) as ApiResponse<AssignmentRecord[]>;
        const assignments = assignmentResponse?.response?.message ?? [];
        const assignment = assignments.find((record) => !record.returned_at);

        if (!assignment) {
          throw new Error("No active assignment found for this item");
        }

        if (assignment.user_id !== user?.id) {
          throw new Error(`In use by ${assignment.username ?? "another user"}`);
        }

        assignmentId = assignment.id;
      }

      await assignmentsApi.returnToPool(assignmentId, new Date().toISOString());
      updateIndividualItem(parentAssetId, individualAsset.id, (item) => ({
        ...item,
        assigned: "open",
      }));

      setActiveAssignmentsByIndividual((prev) => {
        const next = { ...prev };
        delete next[individualAsset.id];
        return next;
      });
    } catch (err) {
      setApiError((err as Error).message || "Failed to return asset");
    } finally {
      setAssigningId(null);
    }
  };

  const declareAssetBroken = async (
    parentAssetId: string,
    individualAsset: BackendIndividualAsset,
  ) => {
    if (!canDeclareBrokenPermission) {
      setApiError("Missing permission: Declare asset broken");
      return;
    }

    setAssigningId(individualAsset.id);
    setApiError("");

    try {
      await individualAssetApi.update(individualAsset.id, {
        is_broken: true,
        is_repaired: false,
        assigned: "broken",
      });

      updateIndividualItem(parentAssetId, individualAsset.id, (item) => ({
        ...item,
        is_broken: true,
        is_repaired: false,
        assigned: "broken",
      }));
    } catch (err) {
      setApiError((err as Error).message || "Failed to declare asset broken");
    } finally {
      setAssigningId(null);
    }
  };

  const declareAssetRepaired = async (
    parentAssetId: string,
    individualAsset: BackendIndividualAsset,
  ) => {
    if (!canDeclareRepairedPermission) {
      setApiError("Missing permission: Declare asset repaired");
      return;
    }

    setAssigningId(individualAsset.id);
    setApiError("");

    try {
      await individualAssetApi.update(individualAsset.id, {
        is_broken: false,
        is_repaired: true,
        assigned: "repaired",
      });

      updateIndividualItem(parentAssetId, individualAsset.id, (item) => ({
        ...item,
        is_broken: false,
        is_repaired: true,
        assigned: "repaired",
      }));
    } catch (err) {
      setApiError((err as Error).message || "Failed to declare asset repaired");
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || a.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Assets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading
              ? "Loading…"
              : assets.length === 0
                ? "No assets yet. Add your first one."
                : `${assets.length} asset${assets.length === 1 ? "" : "s"} in your department.`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors"
        >
          + Add Asset
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Filters */}
      {assets.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search assets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                       text-sm text-slate-200 placeholder:text-slate-500 w-56
                       focus:outline-none focus:border-indigo-500/50"
          />
          <div className="flex gap-2 flex-wrap">
            {["All", "Available", "In Use", "Under Repair", "Broken"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${
                    filter === s
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                      : "text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#1E293B] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && assets.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10"
        >
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No assets yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Add your department&apos;s first asset to start tracking it.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors"
          >
            + Add your first asset
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && assets.length > 0 && (
        <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
          <table className="w-full text-sm min-w-150">
            <thead>
              <tr className="border-b border-white/5">
                {["Asset", "Status", "Quantity", "Added", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold
                                         text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <Fragment key={asset.id}>
                  <tr className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg bg-slate-800 border border-white/5
                                      flex items-center justify-center shrink-0 overflow-hidden"
                        >
                          {asset.image_url ? (
                            <img
                              src={asset.image_url}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {asset.name}
                          </p>
                          {asset.description && (
                            <p className="text-xs text-slate-500 truncate max-w-45">
                              {asset.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${STATUS_STYLES[asset.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {asset.quantity}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleAssetDetails(asset.id)}
                          className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300"
                        >
                          {expandedAssets[asset.id]
                            ? "Hide units"
                            : "View units"}
                        </button>
                        <button
                          onClick={() => openEditModal(asset)}
                          className="text-xs text-indigo-400 hover:text-indigo-300
                                   font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-xs text-red-400 hover:text-red-300
                                   font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedAssets[asset.id] && (
                    <tr className="border-b border-white/5 bg-slate-900/30">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="rounded-lg border border-white/5 bg-[#0F172A] p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Individual assets (
                            {(individualByAsset[asset.id] ?? []).length})
                          </p>

                          {(individualByAsset[asset.id] ?? []).length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No individual assets found for this item.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {(individualByAsset[asset.id] ?? []).map(
                                (item) => {
                                  const itemStatus = getIndividualLabel(item);
                                  // Lookup by item.id — matches asset_id from backend
                                  const currentAssignment =
                                    activeAssignmentsByIndividual[item.id];
                                  const assignedUserName =
                                    currentAssignment?.username ??
                                    "another user";
                                  const isAssignedToMe =
                                    currentAssignment?.user_id === user?.id;
                                  const canAssign = canAssignSelf(item);
                                  const canReturn = canReturnSelf(
                                    item,
                                    currentAssignment,
                                  );
                                  const canDeclareBroken =
                                    !item.is_broken && !item.is_repaired;
                                  const canDeclareRepaired = item.is_broken;

                                  return (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-slate-900/40 px-3 py-2"
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <span className="text-xs font-medium text-slate-300">
                                          {item.id.slice(0, 8)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          •
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {itemStatus}
                                          {currentAssignment &&
                                            !currentAssignment.returned_at && (
                                              <span className="ml-1 text-slate-500">
                                                {isAssignedToMe
                                                  ? "(you)"
                                                  : `(${assignedUserName})`}
                                              </span>
                                            )}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            if (canAssign)
                                              return assignAssetToSelf(
                                                asset.id,
                                                item,
                                              );
                                            if (canReturn)
                                              return returnAssetToPool(
                                                asset.id,
                                                item,
                                              );
                                          }}
                                          disabled={
                                            (!canAssign && !canReturn) ||
                                            assigningId === item.id
                                          }
                                          className="rounded-md border border-indigo-500/25 px-2.5 py-1 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
                                        >
                                          {assigningId === item.id
                                            ? "Working..."
                                            : canAssign
                                              ? "Assign to me"
                                              : canReturn
                                                ? "Return item"
                                                : (
                                                      item.assigned || ""
                                                    ).toLowerCase() === "in use"
                                                  ? isAssignedToMe
                                                    ? "Return item"
                                                    : `In use by ${assignedUserName}`
                                                  : "Unavailable"}
                                        </button>

                                        <button
                                          onClick={() =>
                                            declareAssetBroken(asset.id, item)
                                          }
                                          disabled={
                                            !canDeclareBroken ||
                                            !canDeclareBrokenPermission ||
                                            assigningId === item.id
                                          }
                                          title={
                                            canDeclareBrokenPermission
                                              ? "Declare this unit broken"
                                              : "Missing permission: Declare asset broken"
                                          }
                                          className="rounded-md border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
                                        >
                                          Declare broken
                                        </button>

                                        <button
                                          onClick={() =>
                                            declareAssetRepaired(asset.id, item)
                                          }
                                          disabled={
                                            !canDeclareRepaired ||
                                            !canDeclareRepairedPermission ||
                                            assigningId === item.id
                                          }
                                          title={
                                            canDeclareRepairedPermission
                                              ? "Declare this unit repaired"
                                              : "Missing permission: Declare asset repaired"
                                          }
                                          className="rounded-md border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
                                        >
                                          Declare repaired
                                        </button>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              No assets match your search.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div
            className="relative z-10 w-full max-w-lg bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl
                          max-h-[90vh] overflow-y-auto"
          >
            <div
              className="flex items-center justify-between p-6 border-b border-white/5
                            sticky top-0 bg-[#1E293B] z-10"
            >
              <h2 className="text-lg font-semibold text-slate-100">
                {editAsset ? "Edit Asset" : "Add New Asset"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Image{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg bg-slate-800 border border-white/5
                                  flex items-center justify-center overflow-hidden shrink-0"
                  >
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <label
                    className="cursor-pointer px-3 py-2 rounded-lg border border-white/10
                                    text-sm text-slate-400 hover:border-white/20
                                    hover:text-slate-200 transition-colors inline-block"
                  >
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. Dell Laptop"
                  value={form.name}
                  onChange={setField("name")}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                    ${formErrors.name ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                />
                {formErrors.name && (
                  <span className="text-xs text-red-400">
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Model, specs, details"
                  value={form.description}
                  onChange={setField("description")}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                    ${formErrors.description ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"} resize-none`}
                />
                {formErrors.description && (
                  <span className="text-xs text-red-400">
                    {formErrors.description}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Quantity <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.quantity}
                    onChange={setField("quantity")}
                    className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                      text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                      ${formErrors.quantity ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                  />
                  {formErrors.quantity && (
                    <span className="text-xs text-red-400">
                      {formErrors.quantity}
                    </span>
                  )}
                </div>
              </div>

              {formErrors.submit && (
                <div
                  className="p-3 rounded-md bg-red-500/10 border border-red-500/20
                                text-sm text-red-300"
                >
                  {formErrors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Saving…"
                    : editAsset
                      ? "Save changes"
                      : "Add asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
