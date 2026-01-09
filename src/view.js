const renderFeedback = (elements, i18nInstance, state) => {
  const { feedback } = elements
  feedback.classList.remove('text-success', 'text-danger')
  if (state.rssForm.status === 'error') {
    feedback.classList.add('text-danger')
    feedback.textContent = i18nInstance.t(state.rssForm.error)
  } else if (state.rssForm.status === 'success') {
    feedback.classList.add('text-success')
    feedback.textContent = i18nInstance.t('success')
  } else {
    feedback.textContent = ''
  }
}

const renderForm = (elements, state) => {
  const { input, submitButton } = elements
  if (state.rssForm.status === 'sending') {
    submitButton.disabled = true
    input.setAttribute('readonly', true)
  } else {
    submitButton.disabled = false
    input.removeAttribute('readonly')
  }

  if (state.rssForm.status === 'error') {
    input.classList.add('is-invalid')
  } else {
    input.classList.remove('is-invalid')
  }

  if (state.rssForm.status === 'success') {
    input.value = ''
    input.focus()
  }
}

const renderFeeds = (elements, feeds) => {
  const { feedsContainer } = elements
  const list = feedsContainer.querySelector('ul')
  list.innerHTML = ''
  feeds.forEach(feed => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')
    const h3 = document.createElement('h3')
    h3.classList.add('h6', 'm-0')
    h3.textContent = feed.title
    const p = document.createElement('p')
    p.classList.add('m-0', 'small', 'text-black-50')
    p.textContent = feed.description
    li.append(h3, p)
    list.prepend(li)
  })
}

const renderModal = (elements, state) => {
  const { modalTitle, modalBody, modalReadButton } = elements
  const { modalPostId } = state.ui
  if (!modalPostId) return

  const post = state.posts.find(p => p.id === modalPostId)
  if (!post) return

  modalTitle.textContent = post.title
  modalBody.textContent = post.description
  modalReadButton.href = post.link
}

const renderPosts = (elements, state, i18nInstance) => {
  const { postsContainer } = elements
  const { posts, ui: { viewedPostIds } } = state
  const list = postsContainer.querySelector('ul')
  list.innerHTML = ''

  posts.forEach(post => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
    const a = document.createElement('a')
    a.setAttribute('href', post.link)
    const isViewed = viewedPostIds.has(post.id)
    a.classList.add(isViewed ? 'fw-normal' : 'fw-bold')
    if (isViewed) a.classList.add('link-secondary')
    a.dataset.id = post.id
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.textContent = post.title

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.dataset.id = post.id
    button.dataset.bsToggle = 'modal'
    button.dataset.bsTarget = '#modal'
    button.textContent = i18nInstance.t('ui.viewButton', 'Просмотр')

    li.append(a, button)
    list.append(li)
  })
}

export default (state, elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'rssForm.status':
      renderForm(elements, state)
      renderFeedback(elements, i18nInstance, state)
      break
    case 'feeds':
      renderFeeds(elements, value)
      break
    case 'posts':
    case 'ui.viewedPostIds':
      renderPosts(elements, state, i18nInstance)
      break
    case 'ui.modalPostId':
      renderModal(elements, state)
      break
    default:
      break
  }
}
