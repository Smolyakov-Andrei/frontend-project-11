
const renderFeedback = (elements, i18nInstance, state) => {
  const { feedback } = elements;
  feedback.classList.remove('text-success', 'text-danger');

  if (state.rssForm.status === 'error') {
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(state.rssForm.error);
    return;
  }
  
  if (state.rssForm.status === 'success') {
    feedback.classList.add('text-success');
    feedback.textContent = i18nInstance.t('success');
    return;
  }

  feedback.textContent = '';
};

const renderForm = (elements, state) => {
  const { input, submitButton } = elements;

  if (state.rssForm.status === 'sending') {
    submitButton.disabled = true;
    input.setAttribute('readonly', true);
  } else {
    submitButton.disabled = false;
    input.removeAttribute('readonly');
  }

  if (state.rssForm.status === 'error') {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }

  if (state.rssForm.status === 'success') {
    input.value = '';
    input.focus();
  }
};

export default (state, elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'rssForm.status':
      renderForm(elements, state);
      renderFeedback(elements, i18nInstance, state);
      break;
      
    default:
      break;
  }
};
