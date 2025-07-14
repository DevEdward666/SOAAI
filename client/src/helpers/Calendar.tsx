
import { CapacitorCalendar } from '@ebarooni/capacitor-calendar';
import { EventsData, RemindersData, RemindersWebData } from "../interface/CalendarInterface";

export const CreateReminder = async (data:RemindersData) => {
    try {
      await CapacitorCalendar.createReminder({
        title: data.title,
        startDate: data.startDate,
        listId:data.listId,
        priority:data.priority,
        isCompleted:data.isCompleted,
        location: data.location,
      });
      alert('Event added!');
    } catch (e) {
      console.error(e);
      alert('Failed to add event');
    }
  };

  export function generateAndDownloadICS(
    data:RemindersWebData) {
    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(data.startDate)}`,
      `DTEND:${formatDate(data.completionDate)}`,
      `SUMMARY:${data.title}`,
      `DESCRIPTION:${data.description ?? ''}`,
      `LOCATION:${location ?? ''}`,
      'BEGIN:VALARM',
      `TRIGGER:-PT${10}M`,
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
  
    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link); // needed for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }