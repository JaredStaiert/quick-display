/**
 * Creates new control group and tools by hooking into getScenControlButtons
 */
Hooks.on("getSceneControlButtons", (controls) => {
    console.log(controls);

    controls.imagedisplay = {
        active: false,
        activeTool: "div",
        name: "imagedisplay",
        title: "Display Images",
        icon: "fa-solid fa-images",
        order: 20,
        visible: game.user.isGM,
        onChange: (event, active) => { },
        onToolChange: () => { },
        tools: {
            div: {
                name: "div",
                order: 0,
                title: "",
                icon: "fa-solid fa-toolbox",
                button: true,
                onChange: (event, active) => {
                    /** This is a load bearing tool. 
                    *   Foundry throws an error when activeTool 
                    *   is not defined, but since I want the tools 
                    *   to be buttons having one designated as active 
                    *   would cause it to execute immediately,
                    *   will consider redesign. 
                    */
                }
            },
            popup: {
                name: "popup", 
                order: 1,
                title: "popup",
                icon: "fa-solid fa-image",
                button: true,
                onChange: (event, active) => {
                    if (active) {
                        console.log(controls);
                        uploadAndDisplayDialog("Popup");
                    }
                }
            },
            chat: {
                name: "chat",
                order: 2,
                title: "chat",
                icon: "fa-solid fa-comments",
                button: true,
                onChange: (event, active) => {
                    if (active) {
                        uploadAndDisplayDialog("Chat");
                    }
                }
            }
        }
    };
});

/**
 * Displays dialog prompting user to choose image on their PC. Renders according to given option.
 * @param {"Popup" | "Chat"} renderOption 
 */
async function uploadAndDisplayDialog(renderOption) {
    new foundry.applications.api.DialogV2({
        window: { title: `Image ${renderOption}` },
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

                if (renderOption === "Popup") {
                    renderPopup(`worlds/${game.world.id}/${newFileName}`);
                }
                if (renderOption === "Chat") {
                    renderChat(`worlds/${game.world.id}/${newFileName}`);
                }
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
 * Renders ChatMessage (style: OOC) using the provided image url.
 * @param {string} imageUrl Formatted image url.
 */
async function renderChat(imageUrl) {
  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content: `<img src="${imageUrl}" style="max-width: 100%" />`,
    type: CONST.CHAT_MESSAGE_STYLES.OOC
  });
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