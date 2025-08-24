const WritingResources: React.FC = () => {
  return (
    <div className="writing-resources-container p-6 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Writing Resources</h2>

      {/* Blog Post Content */}
      <div className="resource-post  rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          How to Write an Amazing Story
        </h3>

        <p className="text-gray-800 mb-4">
          Writing an amazing story is both an art and a craft. It requires
          creativity, dedication, and a deep understanding of what captivates
          readers. Here are some essential tips to help you write a story that
          resonates:
        </p>

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          1. Start with a Compelling Concept
        </h4>
        <p className="text-gray-700 mb-4">
          Every great story begins with an interesting idea or concept. Think
          about what makes your story unique and how it stands out from others
          in the genre. This could be a fresh perspective, an unusual setting,
          or a surprising twist.
        </p>

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          2. Develop Strong, Relatable Characters
        </h4>
        <p className="text-gray-700 mb-4">
          Characters are the heart of any story. Create characters with clear
          goals, motivations, and weaknesses. Make them relatable to the
          audience, even if they’re flawed or complex. Readers connect with
          characters who feel real and whose journeys they can empathize with.
        </p>

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          3. Build Tension and Conflict
        </h4>
        <p className="text-gray-700 mb-4">
          Conflict is what drives a story forward. It keeps readers engaged and
          curious about what will happen next. Whether it’s internal conflict
          within a character or external challenges, ensure that tension builds
          as the story progresses.
        </p>

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          4. Focus on Pacing
        </h4>
        <p className="text-gray-700 mb-4">
          A well-paced story keeps readers interested without overwhelming them.
          Vary the pace by mixing action-packed scenes with quieter, more
          reflective moments. This gives readers a chance to catch their breath
          and connect with the characters.
        </p>

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          5. Craft a Satisfying Ending
        </h4>
        <p className="text-gray-700 mb-4">
          The ending is often what stays with readers the most. Aim for a
          conclusion that feels earned and resolves the central conflict.
          Whether it’s a happy ending, a tragic one, or something bittersweet,
          make sure it aligns with the story’s themes and character arcs.
        </p>

        <p className="text-gray-800 mt-4">
          Writing an amazing story takes practice and patience. Keep challenging
          yourself, seek feedback, and remember that every writer improves with
          time. Happy writing!
        </p>
      </div>
    </div>
  );
};

export default WritingResources;
