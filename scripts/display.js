Hooks.on("getSceneControlButtons", (controls) => {
  controls.push({
    name: "delete-resource",
    title: "Delete Resource",
    icon: "fas fa-trash",
    layer: "controls",
    tools: [{
      name: "delete-resource-tool",
      title: "Delete Resource",
      icon: "fas fa-trash-alt",
      onClick: () => {
        // Your delete logic here
        ui.notifications.info("Delete button clicked!");
        // Example: delete a tile or file reference
      },
      button: true
    }]
  });
});
