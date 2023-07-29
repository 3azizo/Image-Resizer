// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI
const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];
  if (!isFileImage(file)) {
    alertError("Please select an image ");
    return;
  }
  //Get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };
  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
  alertSuccess("success");
}

// Send image data to main
function sendImage(e) {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;
  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }
  if (width == "" || height == "") {
    alertError("Please fill in a height and width");
    return;
  }

  //send to main use ipc renderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// catch the image:done event
ipcRenderer.on("image:done", () => {
  alertSuccess(`Image resized to ${widthInput.value} X ${heightInput.value}`);
});
// make sure file is image
function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];
  return file && acceptedImageTypes.includes(file["type"]);
}

function alertError(massage) {
  Toastify.toast({
    text: massage,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}
function alertSuccess(massage) {
  Toastify.toast({
    text: massage,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);