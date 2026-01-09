import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/ru.js';
import createView from './view.js';
import parse from './parser.js';
import getProxyUrl from './utils.js';

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru: resources },
  });

  const state = {
    rssForm: { status: 'filling', error: null },
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
  };

  const watchedState = onChange(state, createView(state, elements, i18nInstance));

  document.querySelector('h1').textContent = i18nInstance.t('ui.mainTitle');
  document.querySelector('.lead').textContent = i18nInstance.t('ui.mainSubtitle');
  document.querySelector('label[for="url-input"]').textContent = i18nInstance.t('ui.formPlaceholder');
  elements.submitButton.textContent = i18nInstance.t('ui.addButton');
  document.querySelector('.text-body-secondary').textContent = i18nInstance.t('ui.example');
  document.querySelector('.posts .card-title').textContent = i18nInstance.t('ui.postsTitle');
  document.querySelector('.feeds .card-title').textContent = i18nInstance.t('ui.feedsTitle');
  document.querySelector('.full-article').textContent = i18nInstance.t('ui.modalReadButton');
  document.querySelector('.modal-footer .btn-secondary').textContent = i18nInstance.t('ui.modalCloseButton');
  
  const validateUrl = (url, existingUrls) => {
    yup.setLocale({
      mixed: { required: 'errors.notEmpty', notOneOf: 'errors.duplicateUrl' },
      string: { url: 'errors.invalidUrl' },
    });
    const schema = yup.string().trim().required().url().notOneOf(existingUrls);
    return schema.validate(url);
  };
  
const loadRss = (url) => {
  const proxyUrl = getProxyUrl(url);
  return axios.get(proxyUrl).then((response) => {
    return parse(response.data.contents);
  });
};
  
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    
    watchedState.rssForm.status = 'sending';
    
    validateUrl(url, state.feeds.map((feed) => feed.url))
      .then(() => loadRss(url))
      .then(({ feed, posts }) => {
        const feedId = crypto.randomUUID();
        watchedState.feeds.unshift({ id: feedId, url, ...feed });
        const postsWithIds = posts.map((post) => ({ id: crypto.randomUUID(), feedId, ...post }));
        watchedState.posts.unshift(...postsWithIds);
        watchedState.rssForm.status = 'success';
      })
.catch((err) => {
        
        if (err.isAxiosError) {
          watchedState.rssForm.error = 'errors.networkError';
        } else if (err.isParseError) {
          watchedState.rssForm.error = 'errors.parseError';
        } else {
          watchedState.rssForm.error = err.message || 'errors.unknown';
        }
        watchedState.rssForm.status = 'error';
      });
  });
};
