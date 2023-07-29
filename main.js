const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
let mainWindow;
//creat main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // remove main menu
  mainWindow.setMenuBarVisibility(false);
  // open devTools i in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}
//app is rady
app.whenReady().then(() => {
  createMainWindow();
  //implement menu

  // const mainMenu = Menu.buildFromTemplate(menu);
  // Menu.setApplicationMenu(mainMenu);

  //Remove main window form memory on close
  mainWindow.on("closed", () => (mainWindow = null));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      createMainWindow();
    }
  });
});
// Menu template
// const menu = [
//   ...(isMac
//     ? [
//         {
//           label: app.name,
//           submenu: [{ label: "About" }],
//         },
//       ]
//     : []),
//   {
//     role: "fileMenu",
//   },
//   ...(!isMac ? [{}] : []),
// ];
//tespond to ipcRender resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer ");
  console.log(options);
  resizeImage(options);
});

//resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    //creat filename
    const filename = path.basename(imgPath);
    //create dest folder if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to dest
    fs.writeFileSync(path.join(dest, filename), newPath);

    //send succes to render
    mainWindow.webContents.send("image:done");
    //open dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

app.on("window-all-closed", () => {
  if (isMac) {
    app.quit();
  }
});
