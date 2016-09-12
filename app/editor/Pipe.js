import { ipcRenderer as ipc } from 'electron';
import { saveToFile } from '../main/utils/file';

// Actions
import { exportPdf, exportPdfComplete } from './actions';

export default class Pipe {
  constructor({ dispatch, uuid }) {
    this.dispatch = dispatch;
    this.uuid = uuid;
  }

  getEvents() {
    return {
      publishPdf: this.publishPdf,
      responsePdfOptions: this.responsePdfOptions,
    };
  }

  publishPdf = (event, opts) => {
    // Request options from the webview
    this.dispatch(exportPdf(this.uuid));
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
          this.dispatch(exportPdfComplete(this.uuid, opts.filename));
        });
      });
    };
    setTimeout(startPublish, 1000);
  }


  // Connect and disconnect helpers

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

  disconnect() {
    // TODO
  }
}
