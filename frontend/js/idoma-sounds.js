const SOUND_API = 'https://idoma-connect-api.onrender.com/api/v1/sounds';
const library = document.getElementById('soundLibrary');
const statusLine = document.getElementById('soundStatus');
const search = document.getElementById('soundSearch');
const category = document.getElementById('soundCategory');
const retry = document.getElementById('soundRetry');
let kind = 'songs';
let rows = [];
let artists = new Map();
let requestNumber = 0;
let activeAudio;
function safeURL(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
    catch { return null; }
}
function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
}
async function fetchRows(path) {
    const response = await fetch(`${SOUND_API}/${path}`, {signal: AbortSignal.timeout(45000)});
    if (!response.ok) throw new Error(`Archive request failed (${response.status})`);
    const body = await response.json();
    if (body.data == null) return [];
    if (!Array.isArray(body.data)) throw new Error('Unexpected archive response');
    return body.data;
}
function render() {
    if (activeAudio) activeAudio.pause();
    library.replaceChildren();
    const query = search.value.trim().toLowerCase();
    const filtered = rows.filter(row => {
        const artist = artists.get(row.artist_id) || '';
        return [row.title, row.name, row.stage_name, row.description, row.biography, row.community, row.lga, artist].join(' ').toLowerCase().includes(query)
            && (!category.value || String(row.category_id) === category.value);
    });
    statusLine.textContent = filtered.length ? `${filtered.length} ${kind.replace('-', ' ')} found` : rows.length ? 'No matches. Try another search or category.' : 'Nothing published here yet. Check back as the archive grows.';
    filtered.forEach(row => {
        const card = node('article', '', 'music-card');
        const art = node('div', '♪', 'music-art');
        art.setAttribute('aria-hidden', 'true');
        const imageURL = safeURL(row.cover_image_url || row.image_url);
        if (imageURL) {
            const img = document.createElement('img'); img.src = imageURL; img.alt = ''; img.loading = 'lazy';
            img.addEventListener('error', () => art.replaceChildren(node('span', '♪')), {once:true}); art.replaceChildren(img);
        }
        card.append(art, node('h3', row.title || row.stage_name || row.name || 'Untitled'));
        const artistName = artists.get(row.artist_id);
        if (artistName) card.append(node('p', artistName, 'music-count'));
        card.append(node('p', row.description || row.biography || [row.community, row.lga].filter(Boolean).join(' · ')));
        const audioURL = safeURL(row.audio_url);
        if (audioURL) {
            const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none'; audio.src = audioURL;
            audio.setAttribute('aria-label', `Listen to ${row.title || 'recording'}`);
            audio.addEventListener('play', () => { if (activeAudio && activeAudio !== audio) activeAudio.pause(); activeAudio = audio; });
            audio.addEventListener('error', () => { card.append(node('p', 'This recording could not be played. Please try again later.')); }, {once:true});
            card.append(audio);
        } else if (kind === 'songs' || kind === 'cultural-recordings') card.append(node('p', 'Audio is not available for this entry.', 'music-count'));
        if (kind === 'artists') {
            const button = node('button', 'Explore songs', 'retry-btn');
            button.addEventListener('click', async () => { search.value = row.stage_name || row.name; category.value = ''; await selectKind('songs'); }); card.append(button);
        }
        library.append(card);
    });
}
async function load() {
    const current = ++requestNumber;
    statusLine.textContent = 'Loading the archive…'; retry.hidden = true; library.replaceChildren();
    if (activeAudio) activeAudio.pause();
    try {
        const data = await fetchRows(kind);
        if (current !== requestNumber) return;
        rows = data; render();
    } catch {
        if (current !== requestNumber) return;
        rows = []; statusLine.textContent = 'The sound archive is unavailable right now. Please try again.'; retry.hidden = false;
    }
}
async function selectKind(value) {
    kind = value;
    document.querySelectorAll('[data-kind]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.kind === kind)));
    category.disabled = kind === 'artists' || kind === 'albums';
    if (category.disabled) category.value = '';
    await load();
}
document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => selectKind(button.dataset.kind)));
search.addEventListener('input', render); category.addEventListener('change', render); retry.addEventListener('click', load);
async function initialize() {
    const results = await Promise.allSettled([fetchRows('artists'), fetchRows('categories')]);
    if (results[0].status === 'fulfilled') artists = new Map(results[0].value.map(a => [a.id, a.stage_name || a.name]));
    if (results[1].status === 'fulfilled') results[1].value.forEach(c => { const option = node('option', c.name); option.value = c.id; category.append(option); });
    await load();
}
initialize();
