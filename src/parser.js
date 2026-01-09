export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const rssElement = doc.querySelector('rss');
  if (!rssElement) {
    const error = new Error('Ресурс не содержит валидный RSS');
    error.isParseError = true;
    throw error;
  }

  const feed = {
    title: rssElement.querySelector('channel > title').textContent,
    description: rssElement.querySelector('channel > description').textContent,
  };

  const posts = [];
  const items = rssElement.querySelectorAll('item');
  items.forEach((item) => {
    posts.push({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
    });
  });

  return { feed, posts };
};
