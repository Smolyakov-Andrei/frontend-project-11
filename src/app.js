import i18next from 'i18next'
import * as yup from 'yup'
import onChange from 'on-change'
import axios from 'axios'
import resources from './locales/ru'
import createView from './view'
import parse from './parser'
import getProxyUrl from './utils'

export default () => {
  const i18nInstance = i18next.createInstance()
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru: resources },
  })

  const state = {
    rssForm: { status: 'filling', error: null },
    feeds: [],
    posts: [],
    ui: {
      viewedPostIds: new Set(),
      modalPostId: null,
    },
  }

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalReadButton: document.querySelector('.full-article'),
  }

  const watchedState = onChange(state, createView(state, elements, i18nInstance))

  document.querySelector('h1').textContent = i18nInstance.t('ui.mainTitle')
  document.querySelector('.lead').textContent = i18nInstance.t('ui.mainSubtitle')
  document.querySelector('label[for="url-input"]').textContent = i18nInstance.t('ui.formPlaceholder')
  elements.submitButton.textContent = i18nInstance.t('ui.addButton')
  document.querySelector('.text-body-secondary').textContent = i18nInstance.t('ui.example')
  document.querySelector('.posts .card-title').textContent = i18nInstance.t('ui.postsTitle')
  document.querySelector('.feeds .card-title').textContent = i18nInstance.t('ui.feedsTitle')
  elements.modalReadButton.textContent = i18nInstance.t('ui.modalReadButton')
  document.querySelector('.modal-footer .btn-secondary').textContent = i18nInstance.t('ui.modalCloseButton')

  const validateUrl = (url, existingUrls) => {
    yup.setLocale({
      mixed: { required: 'errors.notEmpty', notOneOf: 'errors.duplicateUrl' },
      string: { url: 'errors.invalidUrl' },
    })
    const schema = yup.string().trim().required().url()
      .notOneOf(existingUrls)
    return schema.validate(url)
  }

  const loadRss = (url) => {
    const proxyUrl = getProxyUrl(url)
    return axios.get(proxyUrl).then(response => parse(response.data.contents))
  }

  const checkForUpdates = () => {
    const promises = state.feeds.map(feed => loadRss(feed.url)
      .then(({ posts }) => {
        const existingPostTitles = new Set(state.posts.map(p => p.title))
        const newPosts = posts.filter(p => !existingPostTitles.has(p.title))
        if (newPosts.length > 0) {
          const postsWithIds = newPosts.map(post => ({
            id: crypto.randomUUID(),
            feedId: feed.id,
            ...post,
          }))
          watchedState.posts.unshift(...postsWithIds)
        }
      })
      .catch((err) => {
        console.error(`Ошибка при обновлении фида ${feed.url}:`, err)
      }))

    Promise.all(promises).finally(() => {
      setTimeout(checkForUpdates, 5000)
    })
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const url = formData.get('url').trim()
    watchedState.rssForm.status = 'sending'

    validateUrl(url, state.feeds.map(feed => feed.url))
      .then(() => loadRss(url))
      .then(({ feed, posts }) => {
        const feedId = crypto.randomUUID()
        watchedState.feeds.unshift({ id: feedId, url, ...feed })
        const postsWithIds = posts.map(post => ({ id: crypto.randomUUID(), feedId, ...post }))
        watchedState.posts.unshift(...postsWithIds)
        watchedState.rssForm.status = 'success'
      })
      .catch((err) => {
        if (err.isAxiosError) {
          watchedState.rssForm.error = 'errors.networkError'
        } 
        else if (err.isParseError) {
          watchedState.rssForm.error = 'errors.parseError'
        } 
        else {
          watchedState.rssForm.error = err.message || 'errors.unknown'
        }
        watchedState.rssForm.status = 'error'
      })
  })

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset
    if (!id) return

    watchedState.ui.viewedPostIds.add(id)

    if (e.target.tagName === 'BUTTON') {
      watchedState.ui.modalPostId = id
    }
  })

  setTimeout(checkForUpdates, 5000)
}
