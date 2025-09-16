Hooks.on("getSceneControlButtons", (controls) => {
  controls.imagedisplay = {
    activeTool: "popup",
    name: "imagedisplay",
    title: "Display Images",
    icon: "fa-solid fa-images",
    order: 11,
    visible: game.user.isGM,
    onChange: (event, active) => {
        console.log("group on change");
    },
    tools: {
      popup: {
        name: "popup",
        order: 1,
        title: "Popup Image",
        icon: "fa-solid fa-image",
        button: true,
        onChange: (event, active) => {
            if (active) {
                console.log("clicked");
            }
        }
      }
    }
  };

  console.log(controls);
});

