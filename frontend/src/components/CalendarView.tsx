import FullCalendar from '@fullcalendar/react';
import '../styles/CalendarView.css';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { Activity } from '../types/activity';

import { useEffect, useState } from 'react';

// Affiche les activités dans un calendrier FullCalendar

type CalendarViewProps = {
  activities: Activity[];
};

export default function CalendarView({ activities }: CalendarViewProps) {
  // Gère la vue initiale selon la largeur d'écran
  const [initialView, setInitialView] = useState('dayGridMonth');
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 700) {
        setInitialView('timeGridDay');
      } else {
        setInitialView('dayGridMonth');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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

  // Détermine la fin la plus tardive des activités (par défaut 24:00), début à 06:00
  const earliestStart = "00:00:00";
  const latestEnd = "24:00:00";

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        height={"auto"}
        locale={frLocale}
  slotMinTime={earliestStart}
  slotMaxTime={latestEnd}
        slotDuration="02:00:00"
        slotLabelInterval="02:00"
        allDaySlot={true}
        expandRows={true}
      />
    </div>
  );
}
