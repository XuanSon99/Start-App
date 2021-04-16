const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow
let login

function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true
      // "devTools": false,
    },
  })

  mainWindow.loadFile('index.html')
  mainWindow.setMenuBarVisibility(false)
  mainWindow.maximize()
  mainWindow.webContents.openDevTools()
}

function loginWindow () {
  login = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true
    }
    // icon: __dirname + '/icon/king.png'
  })
  login.loadFile('Client/components/Login.html')
  login.setMenuBarVisibility(false)
  login.webContents.openDevTools()
  login.maximize()
}

app.whenReady().then(() => {
  loginWindow()

  // app.on('activate', function () {
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
  // })
})

app.on('window-all-closed', function () {
  app.quit()
})

ipcMain.on('auth', (event, arg) => {
  if (arg == 'logged') {
    createWindow()
    mainWindow.show()
    login.hide()
  } else {
    loginWindow()
    mainWindow.hide()
    login.show()
  }
})
