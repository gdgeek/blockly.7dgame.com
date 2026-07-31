export interface NamedResource {
  name: string | null;
  uuid: string;
  animations?: unknown;
  hasTooltips?: boolean;
  moved?: boolean;
  rotate?: boolean;
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
  if (ANIMATION_PARENT_TYPES.has(parentType || "")) {
    return buildNamedResourceOptions(
      polygens?.filter(
        (polygen) =>
          Array.isArray(polygen.animations) && polygen.animations.length > 0
      )
    );
  }

  if (parentType === "polygen_movable") {
    return buildNamedResourceOptions(
      polygens?.filter((polygen) => polygen.moved === true)
    );
  }

  if (parentType === "polygen_rotatable") {
    return buildNamedResourceOptions(
      polygens?.filter((polygen) => polygen.rotate === true)
    );
  }

  return buildNamedResourceOptions(polygens);
}

export function buildEntityOptions(
  resource: ResourceFilterIndex | undefined,
  parentType?: string
): [string, string][] {
  const entities = resource?.entity;

  if (parentType === "entity_movable") {
    return buildNamedResourceOptions(
      entities?.filter((entity) => entity.moved === true)
    );
  }

  if (parentType === "entity_rotatable") {
    return buildNamedResourceOptions(
      entities?.filter((entity) => entity.rotate === true)
    );
  }

  return buildNamedResourceOptions(entities);
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
