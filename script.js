const repoList = document.querySelector('#repo-list');
const status = document.querySelector('#status');
const loadHelp = document.querySelector('#load-help');

function setStatus(message) {
  if (status) {
    status.textContent = message;
  }
}

function showLoadHelp(visible) {
  if (loadHelp) {
    loadHelp.hidden = !visible;
  }
}

function formatStarCount(stars) {
  return new Intl.NumberFormat('en-US').format(stars);
}

function formatStarredDate(starredAt) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(starredAt));
}

function createMetaTag(text) {
  const tag = document.createElement('span');
  tag.textContent = text;
  return tag;
}

function isValidRepository(repository) {
  return Boolean(
    repository &&
    typeof repository.name === 'string' &&
    typeof repository.description === 'string' &&
    typeof repository.language === 'string' &&
    Number.isFinite(repository.stars) &&
    typeof repository.url === 'string' &&
    !Number.isNaN(new Date(repository.starredAt).getTime())
  );
}

function validateRepositories(repositories) {
  if (!Array.isArray(repositories)) {
    throw new Error('Repository payload must be an array.');
  }

  repositories.forEach((repository, index) => {
    if (!isValidRepository(repository)) {
      throw new Error(`Repository at index ${index} is missing required fields.`);
    }
  });

  return repositories;
}

function createRepositoryItem(repository) {
  const item = document.createElement('li');
  item.className = 'repo-item';

  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = repository.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = repository.name;
  title.append(link);

  const description = document.createElement('p');
  description.className = 'repo-description';
  description.textContent = repository.description;

  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  meta.append(
    createMetaTag(repository.language),
    createMetaTag(`${formatStarCount(repository.stars)} stars`),
    createMetaTag(`Starred ${formatStarredDate(repository.starredAt)}`)
  );

  item.append(title, description, meta);
  return item;
}

function renderRepositories(repositories) {
  repoList.innerHTML = '';
  showLoadHelp(false);

  if (!repositories.length) {
    repoList.innerHTML = '<li><p class="empty-state">No starred repositories available.</p></li>';
    setStatus('0 repositories loaded');
    return;
  }

  repositories.forEach((repository) => {
    repoList.append(createRepositoryItem(repository));
  });

  setStatus(`${repositories.length} repositories loaded`);
}

function renderLoadError(error) {
  repoList.innerHTML = '<li><p class="error-state">Unable to load starred repositories right now.</p></li>';
  setStatus('Load failed');
  showLoadHelp(window.location.protocol === 'file:');
  console.error(error);
}

async function loadRepositories() {
  try {
    const response = await fetch('events.json');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = validateRepositories(await response.json());
    renderRepositories(repositories);
  } catch (error) {
    renderLoadError(error);
  }
}

if (repoList && status) {
  loadRepositories();
}