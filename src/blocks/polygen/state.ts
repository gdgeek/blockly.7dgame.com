let selectedPolygenUuid: string = "";

function setSelectedPolygenUuid(uuid: string): void {
  selectedPolygenUuid = uuid;
}

function getSelectedPolygenUuid(): string {
  return selectedPolygenUuid;
}

export { setSelectedPolygenUuid, getSelectedPolygenUuid };
