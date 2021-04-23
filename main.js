const { app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')
const FB = require('fb')

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
    }
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

ipcMain.on('fb-authenticate', function (event, arg) {
  var options = {
    client_id: '3008138566177268',
    scopes: 'email',
    redirect_uri: 'https://www.facebook.com/connect/login_success.html'
  }

  var authWindow = new BrowserWindow({
    height: 500,
    width: 500,
    show: false,
    parent: login,
    modal: true,
    webPreferences: {
      nodeIntegration: false
    }
  })
  // authWindow.maximize()
  var facebookAuthURL = `https://www.facebook.com/v3.2/dialog/oauth?client_id=${options.client_id}&redirect_uri=${options.redirect_uri}&response_type=token,granted_scopes&scope=${options.scopes}&display=popup`

  authWindow.loadURL(facebookAuthURL)
  authWindow.webContents.on('did-finish-load', function () {
    authWindow.show()
  })

  var access_token, error
  var closedByUser = true

  var handleUrl = function (url) {
    var raw_code = /access_token=([^&]*)/.exec(url) || null
    access_token = raw_code && raw_code.length > 1 ? raw_code[1] : null
    error = /\?error=(.+)$/.exec(url)

    if (access_token || error) {
      closedByUser = false
      FB.setAccessToken(access_token)
      FB.api(
        '/me',
        {
          fields: ['id', 'name', 'picture.width(800).height(800)']
        },
        function (res) {
          mainWindow.webContents.executeJavaScript(
            'document.getElementById("fb-name").innerHTML = " Name: ' +
              res.name +
              '"'
          )
          mainWindow.webContents.executeJavaScript(
            'document.getElementById("fb-id").innerHTML = " ID: ' + res.id + '"'
          )
          mainWindow.webContents.executeJavaScript(
            'document.getElementById("fb-pp").src = "' +
              res.picture.data.url +
              '"'
          )
        }
      )
      authWindow.close()
    }
  }

  authWindow.webContents.on('will-navigate', (event, url) => handleUrl(url))
  var filter = {
    urls: [options.redirect_uri + '*']
  }
  session.defaultSession.webRequest.onCompleted(filter, details => {
    var url = details.url
    handleUrl(url)
  })

  authWindow.on(
    'close',
    () =>
      (event.returnValue = closedByUser
        ? { error: 'The popup window was closed' }
        : { access_token, error })
  )
})
