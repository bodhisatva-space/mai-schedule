// Подтверждённый понедельник верхней недели.
const calendar = { upperMonday: '2026-09-28' };
const dayNames = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day:'numeric',month:'long'});
const todayParts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const part = type => todayParts.find(p=>p.type===type).value;
const today = new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00`);
const addDays = (date, days) => {const result = new Date(date);result.setDate(result.getDate()+days);return result;};
const monday = date => addDays(date,-((date.getDay()+6)%7));
const sameDate = (a,b) => a.toDateString()===b.toDateString();
let weekStart = monday(today);
let selectedDate = today;
function weekType(date) {
 if(!calendar.upperMonday) return null;
 const anchor = new Date(`${calendar.upperMonday}T12:00:00`);
 const delta = Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()))/86400000);
 return Math.floor(delta/7)%2===0?'upper':'lower';
}
function dayLessons(date) {
 const type = weekType(monday(date));
 return lessons.filter(lesson=>lesson.day===date.getDay()&&lesson.day!==0&&(lesson.week==='both'||!type||lesson.week===type));
}
function weekLabel(type) {return type==='upper'?'Верхняя':type==='lower'?'Нижняя':'Тип недели уточняется';}
function openSubject(id) {
 const detail = document.getElementById(id);
 detail.open = true;
 detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 detail.querySelector('summary').focus({preventScroll:true});
}
function renderDay(focus=false) {
 const type=weekType(weekStart);
 const entries=dayLessons(selectedDate);
 document.getElementById('date-detail').innerHTML=`<div class="date-heading"><div><p class="eyebrow">${dayNames[(selectedDate.getDay()+6)%7]}${sameDate(selectedDate,today)?' · сегодня':''}</p><h3 tabindex="-1" id="selected-heading">${dateFormat.format(selectedDate)}</h3></div></div>${entries.length?entries.map(lesson=>{const subject=subjects.find(s=>s.id===lesson.id);return `<button class="lesson" data-subject="${subject.id}"><span class="time">${lesson.time}</span><span class="lesson-main"><strong>${subject.short}</strong><span>${lesson.note}${!type&&lesson.week!=='both'?` · только ${lesson.week==='upper'?'верхняя':'нижняя'} неделя`:''}</span></span><span class="place">${subject.place}</span><span class="arrow" aria-hidden="true">↗</span></button>`;}).join(''):'<p class="empty-day">Занятий нет.</p>'}`;
 document.querySelectorAll('[data-subject]').forEach(button=>button.addEventListener('click',()=>openSubject(button.dataset.subject)));
 if(focus) document.getElementById('selected-heading').focus({preventScroll:true});
}
function renderWeek() {
 const type=weekType(weekStart);
 const end=addDays(weekStart,6);
 document.getElementById('week-title').textContent=`${dateFormat.format(weekStart)} — ${dateFormat.format(end)} ${end.getFullYear()}`;
 document.getElementById('week-hint').textContent=type?`${weekLabel(type)} неделя`:'Чередование пока не подтверждено: показаны возможные пары с пометками верхней и нижней недели.';
 document.getElementById('today-button').disabled=sameDate(weekStart,monday(today))&&sameDate(selectedDate,today);
 document.getElementById('schedule').innerHTML=Array.from({length:7},(_,index)=>{
 const date=addDays(weekStart,index),entries=dayLessons(date);
 return `<button class="calendar-day${sameDate(date,today)?' is-today':''}" data-day="${index}" aria-pressed="${sameDate(date,selectedDate)}" aria-label="${dayNames[index]}, ${dateFormat.format(date)}${sameDate(date,today)?', сегодня':''}"><span class="weekday">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][index]}</span><span class="day-number">${date.getDate()}</span><span class="day-preview">${entries.length?[...new Set(entries.map(entry=>entry.id))].map(id=>`<span>${subjects.find(s=>s.id===id).short}</span>`).join(''):'—'}</span><span class="today-label">${sameDate(date,today)?'Сегодня':'&nbsp;'}</span></button>`;
 }).join('');
 document.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{selectedDate=addDays(weekStart,Number(button.dataset.day));renderWeek();document.querySelector(`[data-day="${button.dataset.day}"]`).focus();}));
 renderDay();
}
document.getElementById('subjects').innerHTML=subjects.map(subject=>`<details id="${subject.id}"><summary><span>${subject.name}</span><span class="plus" aria-hidden="true">+</span></summary><div class="rules"><ul>${subject.rules.map(rule=>`<li>${rule}</li>`).join('')}</ul>${subject.file?`<a class="download" href="${subject.file}" download>Скачать задания Python · ZIP ↗</a>`:''}</div></details>`).join('');
document.querySelectorAll('[data-shift]').forEach(button=>button.addEventListener('click',()=>{const shift=Number(button.dataset.shift)*7;weekStart=addDays(weekStart,shift);selectedDate=addDays(selectedDate,shift);renderWeek();}));
document.getElementById('today-button').addEventListener('click',()=>{weekStart=monday(today);selectedDate=today;renderWeek();});
renderWeek();
