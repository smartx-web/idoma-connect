const BASE = 'https://idoma-connect-api.onrender.com/api/v1';
const notice = document.getElementById('notice');
let artists = [];
const tell = text => { notice.textContent = text; };
const el = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
async function api(path, method = 'GET', body) {
 const res = await fetch(BASE + path, {method, headers: authHeaders(), body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60000)});
 if (res.status === 401 || res.status === 403) { logout(); throw Error('Please sign in again.'); }
 const data = await res.json();
 if (!res.ok) throw Error(data.error || data.message || 'Request failed.');
 return data;
}
function httpsURL(value) {
 const url = new URL(value);
 if (url.protocol !== 'https:') throw Error('Use a complete HTTPS media URL.');
 return url.href;
}
async function upload(file, type) {
 if (!file) return '';
 const max = type === 'image' ? 10 : 50;
 if (file.size > max * 1024 * 1024) throw Error('File exceeds the ' + max + ' MB limit.');
 if (!file.type.startsWith(type === 'image' ? 'image/' : 'audio/')) throw Error('Choose a valid ' + (type === 'image' ? 'image' : 'audio') + ' file.');
 const form = new FormData(); form.append('file', file); form.append('upload_preset', 'idoma_connect_upload');
 const res = await fetch('https://api.cloudinary.com/v1_1/gvmcwi4b/' + type + '/upload', {method:'POST',body:form,signal:AbortSignal.timeout(180000)});
 const data = await res.json();
 if (!res.ok) throw Error(data.error?.message || 'Media upload failed. Try a hosted audio URL.');
 return httpsURL(data.secure_url);
}
function controls(container, type, item) {
 for (const status of ['approved','pending','rejected']) {
  const button = el('button', status === 'approved' ? 'Approve' : status === 'pending' ? 'Unpublish' : 'Reject');
  button.type = 'button'; button.disabled = item.status === status;
  button.addEventListener('click', async () => {
   button.disabled = true;
   try { await api('/admin/sounds/' + type + '/' + item.id + '/status','PUT',{status}); tell('Status updated.'); await refresh(); }
   catch(e) { tell(e.message); button.disabled = false; }
  });
  container.append(button);
 }
}
async function refresh() {
 const results = await Promise.allSettled([api('/admin/sounds/artists'),api('/admin/sounds/songs'),api('/sounds/categories')]);
 if (results[0].status === 'fulfilled') {
  artists = results[0].value.data || [];
  const select = document.getElementById('artistId'); const selected = select.value;
  select.replaceChildren(new Option('Choose an artist',''));
  const list = document.getElementById('artistList'); list.replaceChildren();
  for (const artist of artists) {
   select.add(new Option((artist.stage_name || artist.name) + ' (' + artist.status + ')', artist.id));
   const row = el('article',''); row.append(el('h3',artist.stage_name || artist.name),el('p',artist.status)); controls(row,'artists',artist); list.append(row);
  }
  select.value = selected;
 } else tell('Could not load artists: ' + results[0].reason.message);
 const list = document.getElementById('songList'); list.replaceChildren();
 if (results[1].status === 'fulfilled') {
  const songs = results[1].value.data || [];
  if (!songs.length) list.append(el('p','No songs yet. Add your first song above.'));
  for (const song of songs) {
   const row = el('article','');
   const artist = artists.find(a => a.id === song.artist_id);
   row.append(el('h3',song.title),el('p',(artist?.stage_name || artist?.name || 'Artist #' + song.artist_id) + ' · ' + song.status));
   try { const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none'; audio.src = httpsURL(song.audio_url); row.append(audio); } catch {}
   if (artist?.status !== 'approved') row.append(el('p','Approve this artist as well before the song appears publicly.'));
   controls(row,'songs',song); list.append(row);
  }
 } else list.append(el('p','Could not load songs: ' + results[1].reason.message));
 if (results[2].status === 'fulfilled') {
  const select = document.getElementById('categoryId'); const selected = select.value; select.replaceChildren(new Option('No category',''));
  for (const category of results[2].value.data || []) select.add(new Option(category.name,category.id));
  select.value = selected;
 }
}
function bindForm(id, submit) {
 const form = document.getElementById(id);
 form.addEventListener('submit',async event => {
  event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
  try { await submit(form); } catch(e) { tell(e.message); } finally { button.disabled = false; }
 });
}
bindForm('artistForm',async form => {
 tell('Saving artist…');
 const name = document.getElementById('artistName').value.trim();
 if (!name) throw Error('Enter an artist name.');
 await api('/admin/sounds/artists','POST',{name,stage_name:document.getElementById('stageName').value.trim(),biography:document.getElementById('biography').value.trim()});
 form.reset(); tell('Artist saved as pending. Approve it below.'); await refresh();
});
bindForm('songForm',async form => {
 const title = document.getElementById('title').value.trim();
 const artist_id = Number(document.getElementById('artistId').value);
 const file = document.getElementById('audioFile').files[0];
 const url = document.getElementById('audioUrl').value.trim();
 if (!title || !artist_id) throw Error('Enter a title and choose an artist.');
 if (!file && !url) throw Error('Choose an audio file or paste its HTTPS URL.');
 if (file && url) throw Error('Choose either a file or an audio URL.');
 const audioInput = document.getElementById('audioUrl');
 const coverInput = document.getElementById('coverFile');
 tell('Uploading media…');
 const audio_url = file ? await upload(file,'video') : httpsURL(url);
 // Preserve uploaded URLs for retry if saving to the database fails.
 audioInput.value = audio_url; document.getElementById('audioFile').value = '';
 let cover_image_url = form.dataset.coverUrl || '';
 if (coverInput.files[0]) { cover_image_url = await upload(coverInput.files[0],'image'); form.dataset.coverUrl = cover_image_url; coverInput.value = ''; }
 tell('Saving song…');
 const value = document.getElementById('categoryId').value;
 await api('/admin/sounds/songs','POST',{title,artist_id,category_id:value ? Number(value) : null,audio_url,cover_image_url,description:document.getElementById('description').value.trim()});
 form.reset(); delete form.dataset.coverUrl; tell('Song saved as pending. Approve the song and artist below to publish.'); await refresh();
});
document.getElementById('refresh').addEventListener('click',refresh);
if (getToken()) refresh();
