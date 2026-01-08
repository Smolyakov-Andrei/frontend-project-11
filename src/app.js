import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import resources from './locales/ru.js';
import createView from './view.js';

const validateUrl = (url, existingUrls) => {
  yup.setLocale({
    mixed: {
      required: 'errors.notEmpty',
      notOneOf: 'errors.duplicateUrl',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  });

  const schema = yup.string()
    .trim()
    .required()
    .url()
    .notOneOf(existingUrls);
  return schema.validate(url);
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: resources,
    },
  });
  
  const state = {
    rssForm: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
  };
  
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    mainTitle: document.querySelector('h1'),
    mainSubtitle: document.querySelector('.lead'),
    formLabel: document.querySelector('label[for="url-input"]'),
    example: document.querySelector('.text-body-secondary'),
    modalReadButton: document.querySelector('.full-article'),
    modalCloseButton: document.querySelector('.modal-footer .btn-secondary'),
    postsTitle: document.querySelector('.posts .card-title'),
    feedsTitle: document.querySelector('.feeds .card-title'),
  };

  const view = createView(state, elements, i18nInstance);
  const watchedState = onChange(state, view);

  elements.mainTitle.textContent = i18nInstance.t('ui.mainTitle');
  elements.mainSubtitle.textContent = i18nInstance.t('ui.mainSubtitle');
  elements.formLabel.textContent = i18nInstance.t('ui.formPlaceholder');
  elements.submitButton.textContent = i18nInstance.t('ui.addButton');
  elements.example.textContent = i18nInstance.t('ui.example');
  elements.postsTitle.textContent = i18nInstance.t('ui.postsTitle');
  elements.feedsTitle.textContent = i18nInstance.t('ui.feedsTitle');
  elements.modalReadButton.textContent = i18nInstance.t('ui.modalReadButton');
  elements.modalCloseButton.textContent = i18nInstance.t('ui.modalCloseButton');

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    
    const existingUrls = state.feeds.map((feed) => feed.url);

    watchedState.rssForm.status = 'sending';

    validateUrl(url, existingUrls)
      .then((validatedUrl) => {
        console.log('URL валиден:', validatedUrl);
        watchedState.feeds.push({ url: validatedUrl, id: Date.now() });
        watchedState.rssForm.status = 'success';
        watchedState.rssForm.error = null;
      })
      .catch((err) => {
        watchedState.rssForm.error = err.message;
        watchedState.rssForm.status = 'error';
      });
  });

  watchedState.rssForm.status = 'filling';
};
