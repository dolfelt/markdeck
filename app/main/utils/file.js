import fs from 'fs';
import path from 'path';

export const exists = (fname) => {
  try {
    fs.accessSync(fname, fs.R_OK);
    return fs.lstatSync(fname).isFile();
  } catch (e) { /* nothing */ }
  return false;
};

export const loadFromFile = (file) =>
  new Promise((resolve) => {
    fs.readFile(file, (err, txt) => {
      if (err) {
        resolve('');
      }

      resolve(txt.toString());
    });
  });

export const saveToFile = (file, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        reject();
      }

      resolve();
    });
  });

export const isPackaged = () => __dirname.toLowerCase().indexOf('resources/app') > 0;

export const getAppPath = () => {
  if (isPackaged()) {
    return `${process.resourcesPath}/app`;
  }
  const dir = process.appPath || process.cwd();
  if (process.env.NODE_ENV === 'production') {
    return `${dir}/dist`;
  }
  return dir;
};

export default {
  exists,
  loadFromFile,
  saveToFile,
  isPackaged,
  getAppPath,
};
