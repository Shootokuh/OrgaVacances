import FullCalendar from '@fullcalendar/react';
import '../styles/CalendarView.css';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import type { Activity } from '../types/activity';
import type { Hotel } from '../types/hotel';
import { useEffect, useMemo, useRef, useState } from 'react';

type CalendarViewProps = {
  activities: Activity[];
  hotels?: Hotel[];
  defaultDate?: string;
};

type CalendarEventType = 'activity' | 'hotel' | 'transport' | 'meal';

type CalendarFeedEvent = {
  id: string;
  title: string;
  type: CalendarEventType;
  start: string;
  end?: string;
  startAt: Date;
  endAt?: Date;
  allDay: boolean;
  location?: string;
  timeLabel?: string;
  description?: string;
};

function extractClock(timeValue?: string) {
  if (!timeValue) return null;
  const match = timeValue.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? '0');

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function toLocalDateTimeString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function parseDateOnly(dateValue: string) {
  const [yearRaw, monthRaw, dayRaw] = dateValue.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return { year, month, day };
}

function createLocalDate(dateOnly: string, clockValue = '00:00:00') {
  const dateParts = parseDateOnly(dateOnly);
  if (!dateParts) return null;

  const [hoursRaw, minutesRaw, secondsRaw] = clockValue.split(':');
  const hours = Number(hoursRaw ?? '0');
  const minutes = Number(minutesRaw ?? '0');
  const seconds = Number(secondsRaw ?? '0');
  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

  return new Date(dateParts.year, dateParts.month - 1, dateParts.day, hours, minutes, seconds, 0);
}

function toFullCalendarTime(hourValue: number) {
  const hh = String(hourValue).padStart(2, '0');
  return `${hh}:00:00`;
}

function computeVisibleTimeRange(events: CalendarFeedEvent[], rangeStart: Date, rangeEnd: Date) {
  const fallback = {
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    scrollTime: '08:00:00',
  };

  const timedVisibleEvents = events.filter((event) => {
    if (event.allDay) return false;
    if (!event.startAt) return false;
    const eventStart = event.startAt.getTime();
    const eventEnd = (event.endAt ?? event.startAt).getTime();
    return eventEnd > rangeStart.getTime() && eventStart < rangeEnd.getTime();
  });

  if (timedVisibleEvents.length === 0) {
    return fallback;
  }

  let earliestStartHour = 23;
  let latestEndHour = 0;

  for (const event of timedVisibleEvents) {
    const eventStart = event.startAt;
    const eventEnd = event.endAt ?? event.startAt;
    earliestStartHour = Math.min(earliestStartHour, eventStart.getHours());
    latestEndHour = Math.max(latestEndHour, eventEnd.getHours());
  }

  const minHour = Math.max(6, earliestStartHour - 1);
  const maxHour = Math.min(23, latestEndHour + 2);

  if (maxHour <= minHour) {
    const repairedMax = Math.min(23, minHour + 2);
    return {
      slotMinTime: toFullCalendarTime(minHour),
      slotMaxTime: toFullCalendarTime(repairedMax),
      scrollTime: toFullCalendarTime(minHour),
    };
  }

  return {
    slotMinTime: toFullCalendarTime(minHour),
    slotMaxTime: toFullCalendarTime(maxHour),
    scrollTime: toFullCalendarTime(minHour),
  };
}

function toCompactDateLabel(dateValue: string) {
  if (!dateValue) return '';
  const parsedDate = dateValue.includes('T') || dateValue.includes(' ')
    ? new Date(dateValue)
    : new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(parsedDate);
}

function toTimeLabel(timeValue?: string, endTimeValue?: string) {
  if (!timeValue) return '';

  const normalizedStart = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const start = normalizedStart.slice(0, 5);

  if (!endTimeValue) return start;

  const normalizedEnd = endTimeValue.length === 5 ? `${endTimeValue}:00` : endTimeValue;
  return `${start} - ${normalizedEnd.slice(0, 5)}`;
}

function addOneDay(dateValue: string) {
  if (!dateValue) return '';
  const date = dateValue.includes('T') || dateValue.includes(' ')
    ? new Date(dateValue)
    : new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getEventIcon(type: CalendarEventType) {
  if (type === 'hotel') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 20.25V7.5C4.5 6.12 5.62 5 7 5h7.5c1.38 0 2.5 1.12 2.5 2.5v12.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4.5 20.25h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 9h2.5M8 12.5h2.5M8 16h2.5M14.5 9h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'transport') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 15.5h14l-1.5-6.5H6.5L5 15.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 19.5h1.2M15.8 19.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 9h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'meal') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.5v15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 4.5c1.8 0 3 1.3 3 3v3c0 1.7-1.2 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 4.5v15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M17 4.5v15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4.5 20 8.8v6.4L12 19.5 4 15.2V8.8L12 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 4.5v15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.2 8.8 12 13l7.8-4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getMetaIcon(kind: 'time' | 'location') {
  if (kind === 'location') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21c4.5-4.2 7-7.4 7-10.6A7 7 0 0 0 5 10.4C5 13.6 7.5 16.8 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function eventMatchesDate(event: CalendarFeedEvent, date: Date) {
  if (!event.start) return false;
  const start = new Date(event.start.includes('T') || event.start.includes(' ')
    ? event.start
    : `${event.start}T00:00:00`);
  if (Number.isNaN(start.getTime())) return false;
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return start.getTime() >= dayStart.getTime();
}

export default function CalendarView({ activities, hotels, defaultDate }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [currentTitle, setCurrentTitle] = useState('');
  const [visibleDateRange, setVisibleDateRange] = useState<{ start: Date; end: Date } | null>(null);

  const feedEvents = useMemo<CalendarFeedEvent[]>(() => {
    const mappedActivities = activities.map((act) => {
      const dateOnly = act.date.slice(0, 10);
      let start = dateOnly;
      let end: string | undefined;
      let startAt = createLocalDate(dateOnly) || new Date();
      let endAt: Date | undefined;

      const startClock = extractClock(act.time);
      if (startClock) {
        start = `${dateOnly}T${startClock}`;
        const startDate = createLocalDate(dateOnly, startClock);
        if (startDate) {
          startAt = startDate;
        }

        if (act.end_time) {
          const endClock = extractClock(act.end_time);
          if (endClock) {
            let endDate = createLocalDate(dateOnly, endClock);
            if (endDate) {
              // If an activity crosses midnight, keep visual duration correct.
              if (endDate.getTime() <= startAt.getTime()) {
                endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
              }
              endAt = endDate;
              end = toLocalDateTimeString(endDate);
            }
          }
        }

        if (!endAt) {
          const dateObj = new Date(startAt);
          dateObj.setHours(dateObj.getHours() + 1);
          endAt = dateObj;
          end = toLocalDateTimeString(dateObj);
        }
      }

      return {
        id: `activity-${act.id}`,
        title: act.title,
        start,
        end,
        startAt,
        endAt,
        type: 'activity' as const,
        allDay: !act.time,
        location: act.location || undefined,
        timeLabel: toTimeLabel(act.time, act.end_time),
        description: act.description,
      };
    });

    const mappedHotels = (hotels || [])
      .filter((hotel) => hotel.reserved)
      .map((hotel) => ({
        id: `hotel-${hotel.id}`,
        title: hotel.name,
        start: hotel.start_date ? hotel.start_date.slice(0, 10) : '',
        end: hotel.end_date ? addOneDay(hotel.end_date) : undefined,
        startAt: hotel.start_date ? (createLocalDate(hotel.start_date.slice(0, 10)) || new Date()) : new Date(),
        endAt: hotel.end_date
          ? createLocalDate(addOneDay(hotel.end_date), '00:00:00') || undefined
          : undefined,
        type: 'hotel' as const,
        allDay: true,
        location: hotel.address || undefined,
        description: hotel.notes || undefined,
      }));

    return [...mappedHotels, ...mappedActivities].filter((event) => !!event.start).sort((left, right) => {
      return left.startAt.getTime() - right.startAt.getTime();
    });
  }, [activities, hotels]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = feedEvents.find((event) => event.id === selectedEventId) || null;

  const upcomingEvents = useMemo(() => {
    const referenceDate = new Date();
    const filtered = feedEvents.filter((event) => eventMatchesDate(event, referenceDate));
    return (filtered.length > 0 ? filtered : feedEvents).slice(0, 6);
  }, [feedEvents]);

  const primaryEvent = selectedEvent || upcomingEvents[0] || feedEvents[0] || null;

  const listEvents = useMemo(() => {
    const remainder = upcomingEvents.filter((event) => event.id !== primaryEvent?.id);
    return primaryEvent ? [primaryEvent, ...remainder].slice(0, 6) : remainder;
  }, [primaryEvent, upcomingEvents]);

  const calendarEvents: EventInput[] = feedEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    allDay: event.allDay,
    extendedProps: {
      type: event.type,
      location: event.location,
      timeLabel: event.timeLabel,
      description: event.description,
    },
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: 'inherit',
  }));

  const dynamicRange = useMemo(() => {
    if (currentView !== 'timeGridWeek') {
      return {
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        scrollTime: '08:00:00',
      };
    }

    if (!visibleDateRange) {
      return {
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        scrollTime: '08:00:00',
      };
    }

    return computeVisibleTimeRange(feedEvents, visibleDateRange.start, visibleDateRange.end);
  }, [currentView, feedEvents, visibleDateRange]);

  useEffect(() => {
    const nextDate = defaultDate?.slice(0, 10);
    if (!nextDate) return;
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(nextDate);
  }, [defaultDate]);

  const renderEventContent = (content: EventContentArg) => {
    const eventType = (content.event.extendedProps.type as CalendarEventType) || 'activity';
    const location = content.event.extendedProps.location as string | undefined;
    const timeLabel = content.event.extendedProps.timeLabel as string | undefined;

    return (
      <div className={`calendar-event-card calendar-event-card--${eventType}`}>
        <div className="calendar-event-card__top">
          <span className="calendar-event-card__icon" aria-hidden="true">
            {getEventIcon(eventType)}
          </span>
          <span className="calendar-event-card__title" title={content.event.title}>
            {content.event.title}
          </span>
        </div>

        {(timeLabel || location) && (
          <div className="calendar-event-card__meta-row">
            {timeLabel && (
              <span className="calendar-event-card__meta">
                <span className="calendar-event-card__meta-icon" aria-hidden="true">
                  {getMetaIcon('time')}
                </span>
                <span className="calendar-event-card__meta-text">{timeLabel}</span>
              </span>
            )}
            {location && (
              <span className="calendar-event-card__meta">
                <span className="calendar-event-card__meta-icon" aria-hidden="true">
                  {getMetaIcon('location')}
                </span>
                <span className="calendar-event-card__meta-text">{location}</span>
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEventId(arg.event.id);
  };

  const withCalendarApi = (callback: (api: ReturnType<FullCalendar['getApi']>) => void) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    callback(api);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setCurrentTitle(arg.view.title);
    setVisibleDateRange({ start: arg.start, end: arg.end });
    if (arg.view.type === 'dayGridMonth' || arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay') {
      setCurrentView(arg.view.type);
    }
  };

  const handleViewChange = (nextView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    withCalendarApi((api) => {
      api.changeView(nextView);
    });
  };

  const handlePrev = () => {
    withCalendarApi((api) => {
      api.prev();
    });
  };

  const handleNext = () => {
    withCalendarApi((api) => {
      api.next();
    });
  };

  const handleToday = () => {
    withCalendarApi((api) => {
      api.today();
    });
  };

  return (
    <div className="calendar-view-stack">
      <section className="calendar-card">
        <div className="calendar-custom-toolbar" aria-label="Contrôles du calendrier">
          <div className="calendar-custom-toolbar__left">
            <button type="button" className="calendar-toolbar-btn" onClick={handleToday}>Aujourd'hui</button>
            <button type="button" className="calendar-toolbar-btn calendar-toolbar-btn--icon" onClick={handlePrev} aria-label="Période précédente">‹</button>
            <button type="button" className="calendar-toolbar-btn calendar-toolbar-btn--icon" onClick={handleNext} aria-label="Période suivante">›</button>
          </div>

          <div className="calendar-custom-toolbar__title">{currentTitle}</div>

          <div className="calendar-custom-toolbar__right">
            <label className="calendar-view-select-wrap" htmlFor="calendar-view-select">
              <select
                id="calendar-view-select"
                className="calendar-view-select"
                value={currentView}
                onChange={(e) => handleViewChange(e.target.value as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')}
              >
                <option value="dayGridMonth">Mois</option>
                <option value="timeGridWeek">Semaine</option>
                <option value="timeGridDay">Jour</option>
              </select>
            </label>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={defaultDate || new Date().toISOString().slice(0, 10)}
          headerToolbar={false}
          events={calendarEvents}
          height="auto"
          locale={frLocale}
          slotMinTime={dynamicRange.slotMinTime}
          slotMaxTime={dynamicRange.slotMaxTime}
          scrollTime={dynamicRange.scrollTime}
          eventMinHeight={26}
          eventShortHeight={26}
          dayMaxEventRows={3}
          displayEventTime={false}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          moreLinkText="+"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          firstDay={1}
          dayHeaderFormat={{ weekday: 'short' }}
          navLinks={false}
          nowIndicator={false}
          editable={false}
          selectable={false}
          datesSet={handleDatesSet}
        />
      </section>

      <section className="calendar-events-card">
        <div className="calendar-events-header">
          <div>
            <h3 className="calendar-events-title">Événements à venir</h3>
            <p className="calendar-events-subtitle">Une vue claire des prochains hôtels et activités du voyage.</p>
          </div>
          {primaryEvent && (
            <div className="calendar-events-highlight">
              <span className={`calendar-events-badge calendar-events-badge--${primaryEvent.type}`}>
                {primaryEvent.type === 'hotel' ? 'Hôtel' : 'Activité'}
              </span>
              <strong>{primaryEvent.title}</strong>
            </div>
          )}
        </div>

        <div className="calendar-events-list">
          {listEvents.length === 0 ? (
            <div className="calendar-events-empty">Aucun événement planifié pour le moment.</div>
          ) : (
            listEvents.map((event) => {
              const isSelected = event.id === primaryEvent?.id;

              return (
                <button
                  key={event.id}
                  type="button"
                  className={`calendar-event-row ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <span className={`calendar-event-row__icon calendar-event-row__icon--${event.type}`} aria-hidden="true">
                    {getEventIcon(event.type)}
                  </span>

                  <span className="calendar-event-row__content">
                    <span className="calendar-event-row__title">{event.title}</span>
                    <span className="calendar-event-row__meta">
                      <span>{toCompactDateLabel(event.start)}</span>
                      {event.timeLabel && <span>{event.timeLabel}</span>}
                      {event.location && <span>{event.location}</span>}
                    </span>
                  </span>

                  <span className={`calendar-event-row__tag calendar-event-row__tag--${event.type}`}>
                    {event.type === 'hotel' ? 'Séjour' : 'Sortie'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
