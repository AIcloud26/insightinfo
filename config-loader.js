// Insightinfo Site Config Loader
// All pages include this script to load site configuration
var siteConfig = null;

function applyConfig(config) {
  siteConfig = config;

  // Apply accent color
  document.documentElement.style.setProperty('--accent-color', config.accentColor);

  // Apply site name and logo
  var logoEl = document.querySelector('.logo');
  if (logoEl) {
    var iconEl = logoEl.querySelector('.logo-icon');
    var nameEl = logoEl.querySelector('span');
    if (iconEl) iconEl.textContent = config.logoLetter;
    // Split siteName: last 3 chars in <span>, rest before
    if (nameEl && config.siteName.length > 3) {
      logoEl.innerHTML = '<div class="logo-icon">' + config.logoLetter + '</div>' +
        config.siteName.slice(0, -3) + '<span>' + config.siteName.slice(-3) + '</span>';
    } else if (nameEl) {
      logoEl.innerHTML = '<div class="logo-icon">' + config.logoLetter + '</div>' +
        config.siteName;
    }
  }

  // Build category navigation
  var navUl = document.querySelector('ul.nav');
  if (navUl) {
    var isActive = navUl.querySelector('a.active');
    var currentPath = window.location.pathname;
    var firstLi = navUl.querySelector('li:first-child a');
    var homeHtml = firstLi ? '<li><a href="index.html"' + (firstLi.classList.contains('active') ? ' class="active"' : '') + '>All</a></li>' : '<li><a href="index.html">All</a></li>';
    var catHtml = '';
    for (var i = 0; i < config.categories.length; i++) {
      var cat = config.categories[i];
      catHtml += '<li><a href="category.html?cat=' + cat.id + '">' + cat.name + '</a></li>';
    }
    navUl.innerHTML = homeHtml + catHtml;
  }

  // Build footer quick links
  var footerSections = document.querySelectorAll('.footer-section');
  if (footerSections.length >= 2) {
    // About section
    var aboutH4 = footerSections[0].querySelector('h4');
    var aboutP = footerSections[0].querySelector('p');
    if (aboutH4) aboutH4.textContent = 'About ' + config.siteName;
    if (aboutP) aboutP.textContent = config.footer.about;

    // Quick links section
    var quickLinksUl = footerSections[1].querySelector('ul');
    if (quickLinksUl) {
      var linksHtml = '<li><a href="index.html">Home</a></li>';
      for (var i = 0; i < config.categories.length; i++) {
        var cat = config.categories[i];
        linksHtml += '<li><a href="category.html?cat=' + cat.id + '">' + cat.name + '</a></li>';
      }
      quickLinksUl.innerHTML = linksHtml;
    }

    // Footer bottom
    var footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) {
      footerBottom.innerHTML = '© <script>document.write(new Date().getFullYear())<\/script> ' + config.siteName + '. All rights reserved.';
    }
  }

  // Update page title
  var titleSuffix = config.siteName;
  var currentTitle = document.title;
  if (currentTitle.indexOf('Insightinfo') !== -1) {
    document.title = currentTitle.replace(/Insightinfo/g, titleSuffix);
  }

  // Update meta description
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && config.seo && config.seo.description) {
    metaDesc.setAttribute('content', config.seo.description);
  }
}

function loadSiteConfig(callback) {
  fetch('config.json')
    .then(function(res) { return res.json(); })
    .then(function(config) {
      applyConfig(config);
      if (callback) callback(config);
    })
    .catch(function(err) {
      console.warn('Failed to load config.json:', err);
      if (callback) callback(null);
    });
}
