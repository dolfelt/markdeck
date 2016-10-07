import path from 'path';

const validProps = {
  global: ['width', 'height', 'size', 'theme'],
  page: ['page_number', 'template', 'footer', 'prerender'],
};

const duckTypes = {
  size: (v) => {
    let ret = {};
    const cmd = `${v}`.toLowerCase();

    if (cmd.startsWith('4:3')) {
      ret = { width: 1024, height: 768 };
    } else if (cmd.startsWith('16:9')) {
      ret = { width: 1366, height: 768 };
    } else if (cmd.startsWith('a0')) {
      ret = { width: '1189mm', height: '841mm' };
    } else if (cmd.startsWith('a1')) {
      ret = { width: '841mm', height: '594mm' };
    } else if (cmd.startsWith('a2')) {
      ret = { width: '594mm', height: '420mm' };
    } else if (cmd.startsWith('a3')) {
      ret = { width: '420mm', height: '297mm' };
    } else if (cmd.startsWith('a4')) {
      ret = { width: '297mm', height: '210mm' };
    } else if (cmd.startsWith('a5')) {
      ret = { width: '210mm', height: '148mm' };
    } else if (cmd.startsWith('a6')) {
      ret = { width: '148mm', height: '105mm' };
    } else if (cmd.startsWith('a7')) {
      ret = { width: '105mm', height: '74mm' };
    } else if (cmd.startsWith('a8')) {
      ret = { width: '74mm', height: '52mm' };
    } else if (cmd.startsWith('b0')) {
      ret = { width: '1456mm', height: '1030mm' };
    } else if (cmd.startsWith('b1')) {
      ret = { width: '1030mm', height: '728mm' };
    } else if (cmd.startsWith('b2')) {
      ret = { width: '728mm', height: '515mm' };
    } else if (cmd.startsWith('b3')) {
      ret = { width: '515mm', height: '364mm' };
    } else if (cmd.startsWith('b4')) {
      ret = { width: '364mm', height: '257mm' };
    } else if (cmd.startsWith('b5')) {
      ret = { width: '257mm', height: '182mm' };
    } else if (cmd.startsWith('b6')) {
      ret = { width: '182mm', height: '128mm' };
    } else if (cmd.startsWith('b7')) {
      ret = { width: '128mm', height: '91mm' };
    } else if (cmd.startsWith('b8')) {
      ret = { width: '91mm', height: '64mm' };
    }

    if (Object.keys(ret).length > 0 && cmd.endsWith('-portrait')) {
      const tmp = ret.width;
      ret.width = ret.height;
      ret.height = tmp;
    }
    return ret;
  }
};

const generalTransfomer = {
  bool: (v) => v === 'true',
  unit: (v) => {
    let val;
    const m = `${v}`.match(/^(\d+(?:\.\d+)?)((?:px|cm|mm|in|pt|pc)?)$/);
    if (m) {
      val = parseFloat(m[1]);

      if (m[2] === 'cm') {
        val = (val * 960) / 25.4;
      } else if (m[2] === 'mm') {
        val = (val * 96) / 25.4;
      } else if (m[2] === 'in') {
        val *= 96;
      } else if (m[2] === 'pt') {
        val = (val * 4) / 3;
      } else if (m[2] === 'pc') {
        val *= 16;
      }
    }
    return Math.floor(val) || undefined;
  }
};

const transformers = {
  page_number: generalTransfomer.bool,
  width: generalTransfomer.unit,
  height: generalTransfomer.unit,
  theme: (v) => path.basename(v),
  template: (v) => v,
  footer: (v) => v,
  prerender: generalTransfomer.bool,
};

export default class Settings {

  constructor(settings = []) {
    this.settings = settings;
  }

  clear() {
    this.settings = [];
  }

  set(page, prop, value, noFollowing = false) {
    if (!Settings.isValidProp(page, prop)) {
      return false;
    }
    let target;
    const duckType = Settings.findDuckTypes(prop);
    if (duckType) {
      target = duckType(value);
    } else {
      target = {
        [prop]: value,
      };
    }

    Object.keys(target).forEach((targetProp) => {
      let targetValue = target[targetProp];
      const transformer = Settings.findTransformer(targetProp);
      if (transformer) {
        targetValue = transformer(targetValue);
      }

      const setting = {
        page,
        prop: targetProp,
        value: targetValue,
        noFollowing,
      };

      this.settings.push(setting);
    });
  }

  setGlobal(prop, value) {
    return this.set(0, prop, value);
  }

  get(page, prop, withGlobal = true) {
    return this.getAt(page, withGlobal)[prop];
  }

  getGlobal(prop) {
    return this.getAt(0)[prop];
  }

  getAt(page, withGlobal = true) {
    const props = this.settings.filter(
      obj => obj.page <= page && (withGlobal || obj.page > 0)
    );
    props.sort((a, b) => a.page - b.page);

    const ret = {};
    const noFollows = {};
    props.forEach(obj => {
      if (obj.noFollowing) {
        if (!(obj.page in noFollows)) {
          noFollows[obj.page] = {};
        }
        noFollows[obj.page][obj.prop] = obj.value;
      } else {
        ret[obj.prop] = obj.value;
      }
    });
    return Object.assign(ret, noFollows[page] || {});
  }

  static isValidProp(page, prop) {
    const target = (page > 0) ? 'page' : 'global';
    return validProps[target].indexOf(prop) !== -1;
  }

  static findDuckTypes(prop) {
    if (prop in duckTypes) {
      return duckTypes[prop];
    }
    return null;
  }

  static findTransformer(prop) {
    if (prop in transformers) {
      return transformers[prop];
    }
    return null;
  }
}
