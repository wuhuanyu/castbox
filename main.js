// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem,webContents} = require('electron')
const electron=require('electron')
const electronLocalshortcut = require('electron-localshortcut')
// const fs=require('fs')
const Config=require('electron-config');
const config=new Config()
const prompt=require('electron-prompt');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
// let menu=Menu.buildFromTemplate([])

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1000, height: 800 })

  

  electronLocalshortcut.register(mainWindow, 'Ctrl+R', function () {
    mainWindow.reload()
  });

  electronLocalshortcut.register(mainWindow,'Ctrl+B',function(){
    console.log('go back')
    if(mainWindow.webContents.canGoBack()){
      mainWindow.webContents.goBack()
    }
  })

  electronLocalshortcut.register(mainWindow,'Ctrl+F',function(){
    console.log('go forward')
    if(mainWindow.webContents.canGoForward()){
      mainWindow.webContents.goForward()
    }
  })

  mainWindow.webContents.session.setProxy({
    proxyRules: `socks5://localhost:${config.get('socks5_port')}`
  }, function () {
    app.on('before-quit',()=>{
      electronLocalshortcut.unregisterAll(mainWindow)
    })
    mainWindow.loadURL("https://castbox.fm/my/subscribed?country=us")
  })

  // and load the index.html of the app.

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    //electronLocalshortcut.unregisterAll(mainWindow);
    mainWindow = null
  })
};




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  const template=[
    {
      label:"设置",
      submenu:[
        {
          label:'Socks5代理端口',
          click:()=>{
            prompt({
              title:"请输入代理端口(生效后将重启Castbox）",
              label:"端口号(0-65535)",
              value:config.get("socks5_port")
            }).then(port=>{
              if(!isNaN(port)){
                config.set("socks5_port",port)
                BrowserWindow.getAllWindows().forEach(window=>{
                  window.close()
                })
                createWindow()
              }
            })
          }
        }
      ]
    }
  ];
  if(process.platform==="darwin"){
    template.unshift({
      label:electron.app.getName(),
      submenu:[
        {
          label:"退出",
          click:function(){
            app.quit()
          }
        }
      ]
    })
  }
  
  const menu=Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu)
  if(!config.get('socks5_port')){
    console.log("You have not set socks5_port")
    prompt({
      title:"请输入代理端口",
      label:"端口号(0-65535)",
      value:"1080"
    }).then((port)=>{
      if(!isNaN(port)){
        config.set("socks5_port",port)
        createWindow()
      }
    })
  } 
  else{
    createWindow()
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

process.on('uncaughtException',(e)=>{})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
