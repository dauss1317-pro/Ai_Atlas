export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 z-50">
      {/* Icon */}
      <div className="w-20 h-20 mb-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg animate-spin-slow">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v4m0 8v4m8-8h-4M4 12H0m15.364-6.364l-2.828 2.828M6.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M6.464 6.464l-2.828-2.828"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-white text-2xl font-bold tracking-wide animate-pulse">
        Loading...
      </h1>
    </div>
  );
}
