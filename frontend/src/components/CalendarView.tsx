import FullCalendar from '@fullcalendar/react';
import '../styles/CalendarView.css';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { Activity } from '../types/activity';

// Affiche les activités dans un calendrier FullCalendar

type CalendarViewProps = {
  activities: Activity[];
};

export default function CalendarView({ activities }: CalendarViewProps) {
  // Mappe les activités au format FullCalendar avec format ISO correct
  const events = activities.map(act => {
    // Prend uniquement la partie date (YYYY-MM-DD)
    const dateOnly = act.date.slice(0, 10);
    let start = dateOnly;
    let end = undefined;
    if (act.time) {
      start = `${dateOnly}T${act.time.length === 5 ? act.time + ':00' : act.time}`;
    }
    if (act.end_time) {
      end = `${dateOnly}T${act.end_time.length === 5 ? act.end_time + ':00' : act.end_time}`;
    }
    return {
      id: String(act.id),
      title: act.title,
      start,
      ...(end ? { end } : {}),
      description: act.description,
    };
  });

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        height={600}
        locale={frLocale}
      />
    </div>
  );
}
