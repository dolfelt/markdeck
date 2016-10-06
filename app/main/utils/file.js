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

export const getAppPath = () => {
  if (process.env.NODE_ENV === 'production') {
    return `${process.resourcesPath}/app`;
  }
  const dir = `${__dirname}/../../..`;
  return dir;
};

export default {
  exists,
  loadFromFile,
  saveToFile,
  getAppPath,
};
