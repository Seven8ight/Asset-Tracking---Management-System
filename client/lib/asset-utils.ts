export type UiStatus = "Available" | "In Use" | "Under repair" | "Broken";

export type BackendAsset = {
  id: string;
  name: string;
  description: string;
  department_id: string;
  quantity: number;
  image: string | null;
  created_at: string;
  last_updated: string;
};

export type BackendIndividualAsset = {
  id: string;
  asset_id: string;
  assigned: string;
  is_repaired: boolean;
  is_broken: boolean;
  department_id: string;
};

export type UiAsset = {
  id: string;
  name: string;
  description: string;
  department_id: string;
  quantity: number;
  image_url: string | null;
  created_at: string;
  status: UiStatus;
};

const normalizeAssigned = (assigned: string | undefined) =>
  (assigned || "").toLowerCase().trim();

export const deriveUiStatus = (items: BackendIndividualAsset[]): UiStatus => {
  if (!items.length) return "Available";

  const hasBroken = items.some(
    (item) => item.is_broken || normalizeAssigned(item.assigned) === "broken",
  );

  if (hasBroken) return "Broken";

  const hasRepairing = items.some(
    (item) =>
      item.is_repaired || normalizeAssigned(item.assigned) === "repaired",
  );

  if (hasRepairing) return "Under repair";

  const hasInUse = items.some(
    (item) => normalizeAssigned(item.assigned) === "in use",
  );

  if (hasInUse) return "In Use";

  return "Available";
};

export const toUiAsset = (
  asset: BackendAsset,
  individualAssets: BackendIndividualAsset[],
): UiAsset => ({
  id: asset.id,
  name: asset.name,
  description: asset.description,
  department_id: asset.department_id,
  quantity: asset.quantity,
  image_url: asset.image,
  created_at: asset.created_at,
  status: deriveUiStatus(individualAssets),
});
