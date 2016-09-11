import { ipcRenderer as ipc } from 'electron';
import { saveToFile } from '../main/utils/file';

export default class Pipe {
  getEvents() {
    return {
      publishPdf: this.publishPdf,
      responsePdfOptions: this.responsePdfOptions,
    };
  }

  connect(webview) {
    this.webview = webview;

    const events = this.getEvents();
    Object.keys(events).forEach(e => ipc.on(e, events[e]));
    webview.addEventListener('ipc-message', (event) => {
      const chan = event.channel;
      if (chan in events) {
        events[chan].call(null, event, ...event.args);
      }
    });
  }

  publishPdf = (event, opts) => {
    // Request options from the webview
    this.webview.send('requestPdfOptions', opts);
  }

  responsePdfOptions = (event, opts) => {
    const startPublish = () => {
      this.webview.printToPDF({
        marginsType: 1,
        pageSize: opts.exportSize,
        printBackground: true,
      }, (err, data) => {
        if (err) {
          // TODO: Error
        }
        saveToFile(opts.filename, data).then(() => {
          // TODO: Loading
        });
      });
    };
    setTimeout(startPublish, 1000);
  }
}
