let selectedPolygenUuid = "";

function setSelectedPolygenUuid(uuid) {
  selectedPolygenUuid = uuid;
}

function getSelectedPolygenUuid() {
  return selectedPolygenUuid;
}

export { setSelectedPolygenUuid, getSelectedPolygenUuid };
