/**
 * Creates new control group and tools by hooking into getScenControlButtons
 */
Hooks.on("getSceneControlButtons", (controls) => {
    controls.imagedisplay = {
        activeTool: "",
        name: "imagedisplay",
        title: "Display Images",
        icon: "fa-solid fa-images",
        order: 11,
        visible: game.user.isGM,
        onChange: (event, active) => { },
        tools: {
            popup: {
                name: "popup",
                order: 1,
                title: "Popup Image",
                icon: "fa-solid fa-image",
                button: true,
                onChange: (event, active) => {
                    if (active) {
                        getUrlDialog();
                    }
                }
            }
        }
    };

    console.log(controls);
});

async function getUrlDialog() {
    new foundry.applications.api.DialogV2({
        window: { title: "Image Popup" },
        content: `
            <label><input type="file" id="share" name="choice" value="" checked></label>
        `,
        buttons: [{
            action: "choice",
            label: "Share With Players!",
            default: false,
            callback: (event, button, dialog) => {
                button.form.elements.choice.value
            }
        }],
        submit: result => {

            // Must match DialogV2 content id.
            const fileInput = document.getElementById("share");
            const file = fileInput.files[0];
            const delimiterIndex = file.name.lastIndexOf(".");

            let newFileName;

            if ((delimiterIndex < 1) || (delimiterIndex === file.name.length - 1)) {
                // Ignore files like: ".local", "missingExtension."
                newFileName = file.name;
            }

            // Get proper slice index
            newFileName = `temp${file.name.slice(-(file.name.length - delimiterIndex))}`;

            if (file) {
                try {
                    foundry.applications.apps.FilePicker.implementation.upload(
                        "data", 
                        `worlds/${game.world.id}`,
                        new File([file], newFileName, { type: file.type }), 
                        { notify: false });
                } catch {
                    ui.notifications.warn("Image upload unsuccessful");
                }
                // Render image
                renderPopup(`worlds/${game.world.id}/${newFileName}`);

            }
        }
    }).render({ force: true });
}

/**
 * Renders ImagePopout object using the provided image url.
 * @param {string} imageUrl Formatted image url.
 */
async function renderPopup(imageUrl) {
  const ip = new foundry.applications.apps.ImagePopout({
    src: imageUrl,
    window: {title: "Shared Image"}
  });
  await ip.render(true);
  await ip.shareImage();
}

/**
 * Decodes url and removes unecessary parentheses
 * @param {string} rawUrl Unformatted image url.
 * @returns Image url without parentheses encoding or parentheses.
 */
function decodeImageUrl(rawUrl) {
    const decodedUrl = decodeURIComponent(rawUrl || "");
    const cleanedUrl = decodedUrl.replace(/^"|"$/g, "");
    return cleanedUrl;
}