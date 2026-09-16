const repoList = document.querySelector('#repo-list');
const status = document.querySelector('#status');

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
  meta.innerHTML = [
    `<span>${repository.language}</span>`,
    `<span>${formatStarCount(repository.stars)} stars</span>`,
    `<span>Starred ${formatStarredDate(repository.starredAt)}</span>`
  ].join('');

  item.append(title, description, meta);
  return item;
}

function renderRepositories(repositories) {
  repoList.innerHTML = '';

  if (!repositories.length) {
    repoList.innerHTML = '<li><p class="empty-state">No starred repositories available.</p></li>';
    status.textContent = '0 repositories loaded';
    return;
  }

  repositories.forEach((repository) => {
    repoList.append(createRepositoryItem(repository));
  });

  status.textContent = `${repositories.length} repositories loaded`;
}

async function loadRepositories() {
  try {
    const response = await fetch('events.json');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    renderRepositories(repositories);
  } catch (error) {
    repoList.innerHTML = '<li><p class="error-state">Unable to load starred repositories right now.</p></li>';
    status.textContent = 'Load failed';
    console.error(error);
  }
}

loadRepositories();