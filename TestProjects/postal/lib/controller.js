'use strict';

const ipcClient = require('node-ipc') 

var processBridge;

function OpenUI(command, formatId) {
  
  if (!processBridge) {
    processBridge = require('process-bridge');
    delete process.env.ELECTRON_RUN_AS_NODE;
    delete process.env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    process.env.ELECTRON_NO_ATTACH_CONSOLE = true;
  }
  
  try {
    processBridge.sendRequest({
      command: command,
      value: command === 'pick' ? orgColor :
        selections.map(selection => textEditor.document.getText(selection)), // convert
      formatId: formatId, // convert
      form: config.get('pickerForm'),
      storeDir: config.get('storeDir'),
      formatsOrder: config.get('formatsOrder') // pick
    }, ARGS, (error, message) => {
      showMessage(false);
      
      if (error) {
        if (error.isRetried) {
          console.warn('Retry (' + error + ')');
          showMessage('$(watch)\tPlease wait a while for setting up the extension...');
          return;
        }
        console.error(error);
        return;
      }
    },
    () => { showMessage(false); },
    stderr => { console.warn('[STDERR]: ' + stderr); return true; });
    } 
    
    catch (error) {
      console.error(error);
    return;
  }
}

