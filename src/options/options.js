async function applyTheme() {
  let theme = {};
  for (let item of document.querySelectorAll('.option-input')) {
    if (!item.nextSibling.checked) {
      continue;
    }
    let cat = item.dataset.cat;
    cat in theme || (theme[cat] = {});
    theme[cat][item.dataset.key] = item.value;
  }
  browser.theme.update(theme);
}

async function getCurrentThemeInfo() {
  let theme = await browser.theme.getCurrent();
  if (!theme.colors) {
    let warningEl = document.querySelector('#warning');
    warningEl.innerText = 'No current theme to tweak available. Install and enable a theme first!';
    warningEl.setAttribute('active', '');
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

getCurrentThemeInfo();
