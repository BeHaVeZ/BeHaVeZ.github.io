/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    const progressTrack = preloader.querySelector('.preloader-track');
    const progressBar = preloader.querySelector('.preloader-bar');
    const progressPercent = preloader.querySelector('.preloader-percent');
    const progressLabel = preloader.querySelector('.preloader-label');
    const criticalAssets = Array.from(document.querySelectorAll('[data-preloader-critical]'));
    const totalTasks = criticalAssets.length + 1;
    let completedTasks = 0;
    let isFinished = false;

    function updatePreloader() {
      const percentage = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

      if (progressBar) progressBar.style.width = `${percentage}%`;
      if (progressPercent) progressPercent.textContent = `${percentage}%`;
      if (progressTrack) progressTrack.setAttribute('aria-valuenow', percentage);
    }

    function finishPreloader() {
      if (isFinished) return;

      isFinished = true;
      completedTasks = totalTasks;
      updatePreloader();
      if (progressLabel) progressLabel.textContent = 'Ready';

      requestAnimationFrame(() => {
        preloader.classList.add('preloader-hidden');
        window.setTimeout(() => preloader.remove(), 400);
      });
    }

    function completeTask() {
      if (isFinished) return;

      completedTasks += 1;
      updatePreloader();
      if (completedTasks >= totalTasks) finishPreloader();
    }

    function trackCriticalAsset(asset) {
      const isVideo = asset.tagName === 'VIDEO';
      const isReady = isVideo ? asset.readyState >= 2 : asset.complete;
      let isSettled = false;

      function settleAsset() {
        if (isSettled) return;

        isSettled = true;
        completeTask();
      }

      if (isReady) {
        settleAsset();
        return;
      }

      const readyEvent = isVideo ? 'loadeddata' : 'load';
      asset.addEventListener(readyEvent, settleAsset, { once: true });
      asset.addEventListener('error', settleAsset, { once: true });
    }

    updatePreloader();
    criticalAssets.forEach(trackCriticalAsset);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', completeTask, { once: true });
    } else {
      completeTask();
    }

    window.setTimeout(finishPreloader, 8000);
  }

  /**
   * Load and play portfolio videos
   */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portfolioVideos = document.querySelectorAll('.portfolio-card-video[data-video-src]');

  function attachPortfolioVideo(video) {
    if (video.src) return;

    video.src = video.dataset.videoSrc;
    video.preload = 'metadata';
    video.load();
  }

  function playPortfolioVideo(video) {
    attachPortfolioVideo(video);
    if (!reducedMotion.matches) {
      video.play().catch(() => {});
    }
  }

  portfolioVideos.forEach(playPortfolioVideo);

  reducedMotion.addEventListener?.('change', () => {
    portfolioVideos.forEach((video) => {
      if (reducedMotion.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    });
  });

  if (reducedMotion.matches) {
    document.querySelectorAll('video[autoplay]').forEach((video) => {
      video.autoplay = false;
      video.controls = true;
      video.pause();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Open portfolio details when clicking the project card itself
   */
  const portfolioModalElement = document.querySelector('#portfolio-details-modal');

  if (portfolioModalElement) {
    const portfolioModal = new bootstrap.Modal(portfolioModalElement);
    const modalTitle = portfolioModalElement.querySelector('.portfolio-modal-title');
    const modalDescription = portfolioModalElement.querySelector('.portfolio-modal-description');
    const modalImage = portfolioModalElement.querySelector('.portfolio-modal-image');
    const modalVideo = portfolioModalElement.querySelector('.portfolio-modal-video');
    const modalContributions = portfolioModalElement.querySelector('.portfolio-modal-contributions');
    const modalContributionsList = portfolioModalElement.querySelector('.portfolio-modal-contributions-list');
    const modalProjectLink = portfolioModalElement.querySelector('.portfolio-modal-project-link');
    const modalDetailLink = portfolioModalElement.querySelector('.portfolio-modal-detail-link');
    const modalPreviousButton = portfolioModalElement.querySelector('.portfolio-modal-prev');
    const modalNextButton = portfolioModalElement.querySelector('.portfolio-modal-next');
    const imageLightbox = document.querySelector('.portfolio-image-lightbox');
    const imageLightboxImage = imageLightbox?.querySelector('.portfolio-image-lightbox-image');
    const imageLightboxClose = imageLightbox?.querySelector('.portfolio-image-lightbox-close');
    let activePortfolioContent = null;

    function getFilteredPortfolioContents() {
      const activeFilter = document.querySelector('.portfolio .isotope-filters .filter-active')?.getAttribute('data-filter') ?? '*';

      return Array.from(document.querySelectorAll('.portfolio .portfolio-item'))
        .filter(function(item) {
          return activeFilter === '*' || item.matches(activeFilter);
        })
        .map(function(item) {
          return item.querySelector('.portfolio-content');
        })
        .filter(Boolean);
    }

    function updatePortfolioModalNav() {
      const filteredPortfolioContents = getFilteredPortfolioContents();
      const hasMultipleProjects = filteredPortfolioContents.length > 1;

      modalPreviousButton.disabled = !hasMultipleProjects;
      modalNextButton.disabled = !hasMultipleProjects;
    }

    function isImageLightboxOpen() {
      return imageLightbox?.classList.contains('is-open') ?? false;
    }

    function openImageLightbox() {
      const imageSource = modalImage.getAttribute('src');

      if (!imageLightbox || !imageLightboxImage || !imageSource) {
        return;
      }

      imageLightboxImage.src = imageSource;
      imageLightboxImage.alt = modalImage.alt;
      imageLightbox.classList.add('is-open');
      imageLightbox.setAttribute('aria-hidden', 'false');
      imageLightboxClose?.focus();
    }

    function closeImageLightbox() {
      if (!isImageLightboxOpen()) {
        return;
      }

      imageLightbox.classList.remove('is-open');
      imageLightbox.setAttribute('aria-hidden', 'true');
      imageLightboxImage?.removeAttribute('src');
      modalImage.focus({ preventScroll: true });
    }

    function stopModalVideo() {
      if (!modalVideo) return;

      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
      modalVideo.classList.add('d-none');
    }

    function openPortfolioModal(portfolioContent) {
      closeImageLightbox();
      stopModalVideo();

      const title = portfolioContent.querySelector('h4')?.textContent.trim() ?? '';
      const description = portfolioContent.querySelector('p')?.textContent.trim() ?? '';
      const previewLink = portfolioContent.querySelector('.preview-link');
      const projectLink = portfolioContent.querySelector('.details-link:not([data-detail-page="true"])');
      const detailPageLink = portfolioContent.querySelector('.detail-page-link, .details-link[data-detail-page="true"]');
      const image = portfolioContent.querySelector('img');
      const video = portfolioContent.querySelector('video');
      const contributionItems = portfolioContent.querySelectorAll('.portfolio-contributions li');
      const modalTheme = portfolioContent.dataset.modalTheme?.trim();
      const mediaSource = previewLink?.getAttribute('href')
        ?? video?.dataset.videoSrc
        ?? image?.getAttribute('src')
        ?? '';
      const isVideo = previewLink?.dataset.type === 'video' || /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(mediaSource);

      activePortfolioContent = portfolioContent;
      if (modalTheme) {
        portfolioModalElement.dataset.modalTheme = modalTheme;
      } else {
        delete portfolioModalElement.dataset.modalTheme;
      }
      modalTitle.textContent = title;
      modalDescription.textContent = previewLink?.getAttribute('title') ?? description;
      if (isVideo && modalVideo) {
        modalImage.removeAttribute('src');
        modalImage.classList.add('d-none');
        modalVideo.src = mediaSource;
        modalVideo.setAttribute('aria-label', `${title} preview`);
        modalVideo.controls = reducedMotion.matches;
        modalVideo.classList.remove('d-none');
        if (!reducedMotion.matches) modalVideo.play().catch(() => {});
      } else {
        modalImage.src = mediaSource;
        modalImage.alt = title;
        modalImage.classList.remove('d-none');
      }

      modalContributionsList.innerHTML = '';
      contributionItems.forEach(function(item) {
        const listItem = document.createElement('li');
        listItem.textContent = item.textContent.trim();
        modalContributionsList.appendChild(listItem);
      });
      modalContributions.classList.toggle('d-none', contributionItems.length === 0);

      if (projectLink) {
        modalProjectLink.href = projectLink.href;
        modalProjectLink.classList.remove('d-none');
      } else {
        modalProjectLink.removeAttribute('href');
        modalProjectLink.classList.add('d-none');
      }

      if (detailPageLink) {
        modalDetailLink.href = detailPageLink.href;
        modalDetailLink.classList.remove('d-none');
      } else {
        modalDetailLink.removeAttribute('href');
        modalDetailLink.classList.add('d-none');
      }

      updatePortfolioModalNav();
      portfolioModal.show();
    }

    function navigatePortfolioModal(direction) {
      const filteredPortfolioContents = getFilteredPortfolioContents();

      if (filteredPortfolioContents.length <= 1) {
        return;
      }

      const activeIndex = filteredPortfolioContents.indexOf(activePortfolioContent);
      const nextIndex = activeIndex === -1
        ? 0
        : (activeIndex + direction + filteredPortfolioContents.length) % filteredPortfolioContents.length;

      openPortfolioModal(filteredPortfolioContents[nextIndex]);
    }

    modalPreviousButton.addEventListener('click', function() {
      navigatePortfolioModal(-1);
    });

    modalNextButton.addEventListener('click', function() {
      navigatePortfolioModal(1);
    });

    modalImage.setAttribute('role', 'button');
    modalImage.setAttribute('tabindex', '0');
    modalImage.setAttribute('aria-label', 'Open full-size image preview');

    modalImage.addEventListener('click', openImageLightbox);

    modalImage.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openImageLightbox();
      }
    });

    imageLightbox?.addEventListener('click', function(e) {
      if (e.target === imageLightbox) {
        closeImageLightbox();
      }
    });

    imageLightboxImage?.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    imageLightboxClose?.addEventListener('click', closeImageLightbox);

    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape' || !isImageLightboxOpen()) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      closeImageLightbox();
    }, true);

    portfolioModalElement.addEventListener('hidden.bs.modal', function() {
      closeImageLightbox();
      stopModalVideo();
    });

    portfolioModalElement.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePortfolioModal(-1);
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigatePortfolioModal(1);
      }
    });

    document.querySelectorAll('.portfolio .portfolio-content').forEach(function(portfolioContent) {
      const title = portfolioContent.querySelector('h4')?.textContent.trim();

      portfolioContent.setAttribute('tabindex', '0');
      portfolioContent.setAttribute('role', 'button');
      if (title) {
        portfolioContent.setAttribute('aria-label', `Open details for ${title}`);
      }

      portfolioContent.addEventListener('click', function(e) {
        if (e.target.closest('a')) {
          return;
        }

        openPortfolioModal(this);
      });

      portfolioContent.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPortfolioModal(this);
        }
      });
    });
  }

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    const initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
      itemSelector: '.isotope-item',
      layoutMode: layout,
      filter: filter,
      sortBy: sort
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();
