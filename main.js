const { app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')
const FB = require('fb')
const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;

let mainWindow
let login

function createWindow() {
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
  // mainWindow.loadURL("http://localhost:3000");
}

function loginWindow() {
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

// app.on('certificate-error', function (event, webContents, url, error,
//   certificate, callback) {
//   event.preventDefault();
//   callback(true);
// });

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
      nodeIntegration: false,
      devTools: false
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
      event.reply("token_fb", { token });
      closedByUser = false
      FB.setAccessToken(access_token)
      FB.api(
        '/me',
        {
          fields: ['id', 'name', 'picture.width(800).height(800)']
        },
        function (res) {
          // event.reply("token_gg", { token });
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

ipcMain.on('gg-authenticate', function (event, arg) {
  const myApiOauth = new ElectronGoogleOAuth2(
    '54859907240-h5q8nl05vlo77j5pv6u1v663750v26mm.apps.googleusercontent.com',
    'BR6EiqQ2qIZ2COpIO2X9akhj',
    ['https://www.googleapis.com/auth/drive.metadata.readonly']
  );
  myApiOauth.openAuthWindowAndGetTokens()
    .then(token => {
      event.reply("token_gg", { token });
    });
})
