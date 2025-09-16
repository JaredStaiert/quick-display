/**
 * Creates new control group and control by hooking into getScenControlButtons
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
                        getUrlFromUser();
                    }
                }
            }
        }
    };

    console.log(controls);
});

async function uploadAndDisplayImage() {
    const url = await getUrlFromUser();

    const uploadUrl = await importImage(decodeImageUrl(url));

    await renderPopup(uploadUrl);

}

async function getUrlFromUser() {
    new foundry.applications.api.DialogV2({
        window: { title: "Image Popup" },
        content: `
            <label><input type="file" id="share" name="choice" value="" checked></label>
        `,
        buttons: [{
            action: "choice",
            label: "Share With Players!",
            default: false,
            callback: (event, button, dialog) => button.form.elements.choice.value
        }],
        submit: result => {

            const fileInput = document.getElementById("share");
            const file = fileInput.files[0];

            const imageFile = new File([blob], `temp`)

            if (file) {
                FilePicker.upload("data", `worlds/${game.world.id}`, imageFile, { notify: false })
                    .then(response => {
                        console.log("Upload successful:", response.path);
                        // The response.path contains the full path to the uploaded file
                    })
                    .catch(error => {
                        console.error("Upload failed:", error);
                    });
            }

        }
    }).render({ force: true });
}