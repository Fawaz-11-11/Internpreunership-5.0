import { useEffect, useState } from "react";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [color, setColor] = useState("bg-yellow-200");
  const [emoji, setEmoji] = useState("📝");
  const [darkMode, setDarkMode] = useState(false);
  const [password, setPassword] = useState("");
  const [notePasswordInput, setNotePasswordInput] = useState("");
  const [unlockedNotes, setUnlockedNotes] = useState({}); // To track unlocked notes by index

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSave = () => {
  if (!title.trim()) return;

  const now = new Date().toLocaleString();

  if (editIndex !== null) {
    // Editing existing note
    const updatedNotes = [...notes];
    updatedNotes[editIndex] = {
      ...updatedNotes[editIndex], // keep existing fields like time
      title,
      content,
      color,
      emoji,
      password: password.trim() ? password : null,
      updatedTime: now,  // update only updatedTime
    };
    setNotes(updatedNotes);
    setEditIndex(null);
  } else {
    // Adding new note
    const newNote = {
      title,
      content,
      color,
      emoji,
      password: password.trim() ? password : null,
      time: now,
      updatedTime: now,
    };
    setNotes([...notes, newNote]);
  }

  // Clear input fields after saving
  setTitle("");
  setContent("");
  setColor("bg-yellow-200");
  setEmoji("📝");
  setPassword("");
};


  const handleEdit = (index) => {
    const note = notes[index];
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setEmoji(note.emoji);
    setPassword(note.password || "");
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
    if (editIndex === index) {
      setTitle("");
      setContent("");
      setEditIndex(null);
      setPassword("");
    }
    // Also remove from unlockedNotes if present
    setUnlockedNotes((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  // Unlock note by password
  const handleUnlockNote = (index) => {
    if (notes[index].password === notePasswordInput) {
      setUnlockedNotes((prev) => ({ ...prev, [index]: true }));
      setNotePasswordInput("");
    } else {
      alert("Incorrect password!");
    }
  };

  // Forgot password => Delete note with confirmation
  const handleForgotPassword = (index) => {
    const confirmDelete = window.confirm(
      "Forgot Password? This will DELETE the note permanently. Are you sure?"
    );
    if (confirmDelete) {
      handleDelete(index);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  return (
    <div
        className={`min-h-screen p-6 font-sans transition-all duration-700 ease-in-out ${

        darkMode
          ? "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white"

          : "bg-gradient-to-br from-[#ffe9e3] via-[#ffd9ec] to-[#e0f7fa]"

      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-center text-orange-600 drop-shadow">
          {emoji} My Sticky Notes
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const data = JSON.stringify(notes, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "my_notes.json";
              link.click();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
          >
            Export Notes
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Top panel */}
      <div className="bg-white bg-opacity-70 p-6 rounded-xl flex flex-col md:flex-row justify-between mb-8 shadow-xl backdrop-blur border border-orange-300">
        {/* Create note */}
        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-4 border-r border-dashed border-orange-300">
          <h2 className="text-2xl font-bold mb-4 text-orange-700">
            Create New Note
          </h2>
          <label className="block mb-1 font-semibold text-gray-700">Title</label>
          <input
            className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="block mb-1 font-semibold text-gray-700">Content</label>
          <textarea
            className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Color Picker */}
          <label className="block mb-1 font-semibold text-gray-700">
            Choose Color
          </label>
          <div className="flex gap-2 mb-3">
            {[
                "bg-yellow-200",
                "bg-green-200",
                "bg-pink-200",
                "bg-blue-200",
                "bg-purple-200",
                "bg-rose-200",
                "bg-cyan-200",
                "bg-fuchsia-200",
                "bg-lime-200",
                "bg-orange-200",
                "bg-amber-200",
              ].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`${c} w-8 h-8 rounded-full border ${
                    color === c ? "ring-2 ring-black" : ""
                  }`}
                ></button>
              )
            )}
          </div>

          {/* Emoji Picker */}
          <label className="block mb-1 font-semibold text-gray-700">Mood Emoji</label>
          <div className="flex gap-2 mb-4 text-xl">
            {["📝", "😃", "😢", "🤔", "🔥", "💡"].map((e) => (
              <button key={e} onClick={() => setEmoji(e)} className={`transition transform hover:scale-125 text-2xl ${emoji === e ? "ring-2 ring-orange-500 rounded-full" : ""}`}>
                {e}
              </button>
            ))}
          </div>

          {/* Password input */}
          <label className="block mb-1 font-semibold text-gray-700">
            Password (Set a password if you want to keep this note safe and private)
          </label>
          <input
            type="password"
            className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Set a password to protect this note"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-red-600 mb-4">
            ⚠️ Remember your password! If you forget it, you won't be able to
            access this note.
          </p>

          <button
            className="bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-400/40 text-white px-4 py-2 rounded transition"
            onClick={handleSave}
          >
            {editIndex !== null ? "Update Note" : "Add Note"}
          </button>
        </div>

        {/* Search */}
        <div className="md:w-1/2 md:pl-4 mt-4 md:mt-0">
          <h2 className="text-2xl font-bold mb-4 text-orange-700">Search Notes</h2>
          <input
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Search by title or content"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notes display */}
      <div className="flex flex-wrap gap-6 justify-center">
        {filteredNotes.map((note, index) => {
          // If note is password protected and NOT unlocked, show password input
          if (note.password && !unlockedNotes[index]) {
            return (
              <div
                key={index}
               className={`w-72 p-4 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md bg-white/10 hover:scale-105 transition-transform duration-300 ${note.color}`}
              >
                <h3 className="font-bold text-lg text-orange-800 mb-2">
                  {note.emoji} {note.title}
                </h3>
                <p className="mb-2">🔒 This note is password protected.</p>
                <input
                  type="password"
                  placeholder="Enter password to unlock"
                  value={notePasswordInput}
                  onChange={(e) => setNotePasswordInput(e.target.value)}
                  className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={() => handleUnlockNote(index)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded mb-2 transition"
                >
                  Unlock
                </button>
                <button
                  onClick={() => handleForgotPassword(index)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded transition"
                >
                  Forgot Password? Delete Note
                </button>
              </div>
            );
          }

          // Otherwise show normal note content
          return (
            <div
              key={index}
              className={`p-4 rounded-xl shadow-lg w-72 border border-orange-300 backdrop-blur hover:scale-105 transition transform duration-300 ${note.color}`}
            >
              <h3 className="font-bold text-lg text-orange-800 mb-2">
                {note.emoji} {note.title}
              </h3>
              <p className="text-gray-800 mb-2">{note.content}</p>
              <p className="text-xs text-gray-600 mb-4">
                Created: {note.time}
                {note.updatedTime && note.updatedTime !== note.time
                  ? ` |Last Updated: ${note.updatedTime}`
                  : ""}
              </p>
              <button
                onClick={() => handleEdit(index)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded mb-2 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded transition"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}