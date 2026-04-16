const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('servicehub', {
  apiBase: 'http://localhost:8000'
});
