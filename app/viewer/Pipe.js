import { ipcRenderer as ipc } from 'electron';

import { getSlideSize } from './utils';

export default class Pipe {
  connect() {
    ipc.on('requestPdfOptions', this.requestPdfOptions);
  }

  requestPdfOptions = (event, payload) => {
    const slideSize = getSlideSize();
    const opts = payload;
    opts.exportSize = {
      width: Math.floor((slideSize.w * 25400) / 96),
      height: Math.floor((slideSize.h * 25400) / 96),
    };

    document.body.classList.add('to-pdf');
    setTimeout(() => ipc.sendToHost('responsePdfOptions', opts), 0);
  }
}
