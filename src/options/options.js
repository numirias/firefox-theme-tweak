async function applyTheme() {
  let theme = {};
  let cat;
  for (let item of document.querySelectorAll('.option-input')) {
    if (!item.parentElement.querySelector('.option-active').checked) {
      continue;
    }
    cat = item.dataset.cat;
    cat in theme || (theme[cat] = {});
    theme[cat][item.dataset.key] = item.value;
  }
  browser.theme.update(theme);
}

function warn(msg) {
  let warningEl = document.querySelector('#warning');
  warningEl.innerText = `\u26a0\ufe0f ${msg}`;
  warningEl.setAttribute('active', '');
}

async function getCurrentThemeInfo() {
  let theme = await browser.theme.getCurrent();
  if (!theme.colors) {
    warn('The current theme cannot be tweaked. (Default themes usually can\'t be tweaked.) Install a theme from addons.mozilla.org.');
    return;
  }
  Object.entries(theme).forEach(([category, options]) => {
    if (options === null) {
      return;
    }
    let template = document.querySelector('template#options-cat');
    let catDiv = template.content.cloneNode(true);
    catDiv.querySelector('.cat-title').innerText = category;
    Object.entries(options).forEach(([key, val]) => {
      let template = document.querySelector('template#option');
      let clone = template.content.cloneNode(true);
      let keyDiv = clone.querySelector('.key');
      keyDiv.innerText = key;
      let valInput = clone.querySelector('.val .option-input');
      let activeEl = clone.querySelector('.val .option-active');

      if (category == 'colors') {
        valInput.type = 'color';
      } else if (category == 'images' && val) {
        let img = new Image();
        img.addEventListener('load', () => {
          // TODO extract
          canvas = document.createElement('canvas'),
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
          url = canvas.toDataURL('image/png');
          valInput.value = url;
          canvas.remove();
          img.remove();
        });
        img.src = val;
      }
      valInput.dataset.cat = category;
      valInput.dataset.key = key;
      if (val) {
        valInput.value = val;
        activeEl.checked = true;

      }
      valInput.addEventListener('change', applyTheme);
      catDiv.appendChild(clone);
    });
    document.body.querySelector('#options').appendChild(catDiv);
  });
}

async function fillThemeSelector() {
  let all = await browser.management.getAll();
  let addon, opt;
  let select = document.querySelector('#theme-select');
  for (addon of all) {
    if (addon.type != 'theme') {
      continue;
    }
    opt = document.createElement('option');
    opt.value = addon.id;
    opt.innerText = `${addon.name} (${addon.id})`;
    if (addon.enabled) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }
}

getCurrentThemeInfo();
fillThemeSelector();

async function resetTheme() {
  let current = document.querySelector('#theme-select').value;
  await browser.management.setEnabled(current, false);
  await browser.management.setEnabled(current, true);
  window.location.reload();
}

document.querySelector('#reset-theme').addEventListener('click', resetTheme);

async function selectTheme(el) {
  let selected = document.querySelector('#theme-select').value;
  await browser.management.setEnabled(selected, true);
  window.location.reload();
}

document.querySelector('#theme-select').addEventListener('change', selectTheme);
