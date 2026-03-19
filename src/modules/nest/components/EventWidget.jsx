import { useNestEvents } from '../hooks/useNests';

const EventWidget = ({ nestId }) => {
    const { data: eventsData, isLoading } = useNestEvents(nestId);
    const events = eventsData?.data || [];

    if (isLoading) return <div className="text-center p-4">Loading events...</div>;
    if (!events.length) return null; // Or show empty state

    const nextEvent = events[0]; // Assuming sorted by date ascending in the backend

    return (
        <div className="bg-gradient-to-br from-primary to-blue-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10" style={{ fontSize: '100px' }}>event</span>
            <div className="relative z-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Up Next</div>
                <h3 className="font-bold text-lg mb-4">{nextEvent.title}</h3>
                <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="material-symbols-outlined text-lg text-blue-300">calendar_month</span>
                    <span>{new Date(nextEvent.event_date).toLocaleString()}</span>
                </div>

                {nextEvent.meeting_link && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="material-symbols-outlined text-lg text-blue-300">videocam</span>
                        <span>Virtual Meeting</span>
                    </div>
                )}

                <a
                    href={nextEvent.meeting_link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-white text-primary text-sm font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center"
                >
                    Join Event
                </a>
            </div>
        </div>
    );
};

export default EventWidget;
