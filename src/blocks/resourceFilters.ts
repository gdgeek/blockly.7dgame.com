export interface NamedResource {
  name: string | null;
  uuid: string;
  animations?: unknown;
  hasTooltips?: boolean;
}

export interface ResourceAction {
  type?: string | null;
  parentUuid?: string | null;
}

export interface ResourceFilterIndex {
  action?: ResourceAction[];
  entity?: NamedResource[];
  polygen?: NamedResource[];
  voxel?: NamedResource[];
}

const ANIMATION_PARENT_TYPES = new Set([
  "play_animation",
  "play_animation_task",
]);

export function buildNamedResourceOptions(
  resources: NamedResource[] | undefined
): [string, string][] {
  const options: [string, string][] = [["none", ""]];

  resources?.forEach((resource) => {
    options.push([resource.name || resource.uuid, resource.uuid]);
  });

  return options;
}

export function buildPolygenOptions(
  resource: ResourceFilterIndex | undefined,
  parentType?: string
): [string, string][] {
  const polygens = resource?.polygen;
  if (!ANIMATION_PARENT_TYPES.has(parentType || "")) {
    return buildNamedResourceOptions(polygens);
  }

  return buildNamedResourceOptions(
    polygens?.filter(
      (polygen) =>
        Array.isArray(polygen.animations) && polygen.animations.length > 0
    )
  );
}

export function collectTooltipParentUuids(
  resource: ResourceFilterIndex | undefined
): Set<string> {
  const parentUuids = new Set<string>();

  resource?.action?.forEach((action) => {
    if (
      action.type?.toLowerCase() === "tooltip" &&
      typeof action.parentUuid === "string" &&
      action.parentUuid
    ) {
      parentUuids.add(action.parentUuid);
    }
  });

  [resource?.entity, resource?.polygen, resource?.voxel].forEach(
    (resources) => {
      resources?.forEach((item) => {
        if (item.hasTooltips === true) {
          parentUuids.add(item.uuid);
        }
      });
    }
  );

  return parentUuids;
}

export function buildTooltipResourceOptions(
  resources: NamedResource[] | undefined,
  parentUuids: Iterable<string>
): [string, string][] {
  const allowedUuids = new Set(parentUuids);
  return buildNamedResourceOptions(
    resources?.filter((resource) => allowedUuids.has(resource.uuid))
  );
}
