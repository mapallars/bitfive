export const getLocalDateString = (date, timezone) => {
  try {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (timezone) {
      options.timeZone = timezone;
    }
    return new Intl.DateTimeFormat('en-CA', options).format(date);
  } catch (e) {
    console.error(e);
    return new Intl.DateTimeFormat('en-CA').format(date);
  }
};

export const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  // Previous month days to fill the first week
  const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday
  for (let i = firstDayOfWeek; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Next month days to fill the last week
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const getWeekDays = (date) => {
  const current = new Date(date);
  current.setDate(current.getDate() - current.getDay()); // Start of week (Sunday)

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const getDayHours = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const isSameDay = (date1, date2) => {
  return getLocalDateString(date1) === getLocalDateString(date2);
};

export const getEventsForDay = (events, date) => {
  const targetDayStr = getLocalDateString(date);

  return events.filter(event => {
    if (!event.startAt) return false;
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : start;

    if (isNaN(start.getTime())) return false;

    const tz = event.timezone;
    const startDayStr = getLocalDateString(start, tz);
    const endDayStr = getLocalDateString(end, tz);

    return targetDayStr >= startDayStr && targetDayStr <= endDayStr;
  });
};

export const isMultiDayEvent = (event) => {
  if (!event.startAt) return false;
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : start;
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const tz = event.timezone;
  return getLocalDateString(start, tz) !== getLocalDateString(end, tz);
};

export const isAllDayEvent = (event) => {
  if (!event.startAt) return false;
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : start;
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const duration = end.getTime() - start.getTime();
  return duration >= 24 * 60 * 60 * 1000 || isMultiDayEvent(event);
};

export const formatEventTime = (dateString, timezone) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  if (timezone) {
    options.timeZone = timezone;
  }
  return date.toLocaleTimeString('en-US', options);
};

export const navigateDate = (currentDate, view, direction) => {
  const newDate = new Date(currentDate);
  if (view === 'month') {
    newDate.setMonth(newDate.getMonth() + direction);
  } else if (view === 'week') {
    newDate.setDate(newDate.getDate() + direction * 7);
  } else if (view === 'day') {
    newDate.setDate(newDate.getDate() + direction);
  }
  return newDate;
};
