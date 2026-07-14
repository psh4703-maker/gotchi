function Avatar({ avatarUrl, name, size = 40 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 font-black text-white"
    >
      {initial}
    </div>
  );
}

export default Avatar;
