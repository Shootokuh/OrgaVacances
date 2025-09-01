import FullCalendar from '@fullcalendar/react';
import '../styles/CalendarView.css';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { Activity } from '../types/activity';

import { useEffect, useState } from 'react';

// Affiche les activités dans un calendrier FullCalendar


import type { Hotel } from '../types/hotel';

type CalendarViewProps = {
  activities: Activity[];
  hotels?: Hotel[];
};

export default function CalendarView({ activities, hotels }: CalendarViewProps) {
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
  // Mappe les activités au format FullCalendar
  const activityEvents = activities.map(act => {
    const dateOnly = act.date.slice(0, 10);
    // Formatage sûr des heures
    const pad = (n: number) => n.toString().padStart(2, '0');
    let start = dateOnly;
    let end = undefined;
    if (act.time) {
      // force HH:mm:ss
      const t = act.time.length === 5 ? act.time + ':00' : act.time;
      start = `${dateOnly}T${t}`;
      if (act.end_time) {
        const et = act.end_time.length === 5 ? act.end_time + ':00' : act.end_time;
        end = `${dateOnly}T${et}`;
      } else {
        // Si pas d'heure de fin, ajoute 1h à l'heure de début
      const dateObj = new Date(`${dateOnly}T${t}`);
      dateObj.setHours(dateObj.getHours() + 1);
      end = `${dateOnly}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
      }
    }
    return {
      id: `activity-${act.id}`,
      title: act.title,
      start,
      end,
      description: act.description,
      color: '#2563eb',
    };
  });

  // Mappe les hôtels réservés au format FullCalendar
  const hotelEvents = (hotels || [])
    .filter(h => h.reserved)
    .map(hotel => ({
      id: `hotel-${hotel.id}`,
      title: `Hôtel réservé : ${hotel.name}`,
      start: hotel.start_date.slice(0, 10),
      end: hotel.end_date ? new Date(new Date(hotel.end_date).getTime() + 24*60*60*1000).toISOString().slice(0,10) : undefined,
      description: hotel.address || '',
      color: '#eab308', // jaune
      allDay: true,
    }));

  const events = [...activityEvents, ...hotelEvents];

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
        slotDuration="01:00:00"
        slotLabelInterval="01:00"
        allDaySlot={true}
        expandRows={true}
        slotLabelContent={(arg) => {
          // Affiche seulement les heures impaires
          const hour = arg.date.getHours();
          if (hour % 2 === 1) {
            return arg.text;
          }
          return '';
        }}
      />
    </div>
  );
}
