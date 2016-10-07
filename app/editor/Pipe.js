import { ipcRenderer as ipc } from 'electron';
import { saveToFile } from '../main/utils/file';

// Actions
import { exportPdf, exportPdfComplete, setTotalPages } from './actions';

export default class Pipe {
  constructor({ dispatch, uuid }) {
    this.dispatch = dispatch;
    this.uuid = uuid;
  }

  getEvents() {
    return {
      publishPdf: this.publishPdf,
      responsePdfOptions: this.responsePdfOptions,
      totalPages: this.totalPages,
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

  totalPages = (event, pages) => {
    this.dispatch(setTotalPages(this.uuid, pages));
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
    this.webview.removeEventListener('ipc-message');
  }
}
