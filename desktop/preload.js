const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startService: (serviceType) => ipcRenderer.invoke('start-service', serviceType),
  stopService: (serviceType) => ipcRenderer.invoke('stop-service', serviceType),
  checkServiceStatus: (serviceType) => ipcRenderer.invoke('check-service-status', serviceType),
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url)
});
