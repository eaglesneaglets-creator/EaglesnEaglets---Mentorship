/**
 * ImpactStories
 *
 * Static impact stories section shown below the donation form.
 * In a future iteration these can be fetched from the CMS.
 */

const STORIES = [
  {
    id: 1,
    tag: 'SCHOLARSHIP',
    tagColor: 'bg-green-500',
    title: "Sarah's Journey to Seminary",
    body: "Thanks to the Nest Scholarship Fund, Sarah was able to complete her theology degree without the burden of debt.",
    image: null,
  },
  {
    id: 2,
    tag: 'LEADERSHIP',
    tagColor: 'bg-teal-500',
    title: 'Urban Youth Mentorship',
    body: 'Our community outreach program reached over 500 teenagers this year, providing mentorship and safe spaces.',
    image: null,
  },
  {
    id: 3,
    tag: 'INNOVATION',
    tagColor: 'bg-emerald-500',
    title: 'Digital Ministry Lab',
    body: 'Your donations funded the creation of our digital curriculum, now used by over 200 small churches worldwide.',
    image: null,
  },
];

export default function ImpactStories() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Impact Stories</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
            See how your contributions are changing lives and shaping the next generation of
            spiritual leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="relative h-44 bg-gradient-to-br from-green-100 to-teal-50 flex items-center justify-center">
                <span className="text-5xl opacity-30">🦅</span>
                <span
                  className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${story.tagColor}`}
                >
                  {story.tag}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">{story.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{story.body}</p>
                <button className="text-green-600 text-xs font-semibold hover:underline">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
