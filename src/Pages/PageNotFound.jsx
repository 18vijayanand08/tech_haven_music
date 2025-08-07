import React from 'react';

const PageNotFound = () => {
  return (
    <section className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Glitch Effect for 404 */}
      <h1 className="text-9xl font-extrabold relative glitch text-white-500">
        404
      </h1>

      {/* Rocket with Cool Animation */}
      <div className="relative">
        <p className="text-7xl mt-4 animated-rocket">🚀</p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flame"></div>
      </div>

      {/* Animated Error Text */}
      <p className="text-2xl mt-4 animate-fadeIn">Oops! Page not found.</p>
      <p className="text-gray-400 mt-2 animate-fadeIn">
        The page you're looking for has disappeared into the void.
      </p>

      {/* Home Button with Home Icon 🏠 */}
      <a
        href="/"
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 neon-glow"
      >
        🏠 Return Home
      </a>

      {/* Cyberpunk Glitch, Rocket, and Flame Animation CSS */}
      <style>
        {`
          /* Glitch Animation */
          @keyframes glitch {
            0% { text-shadow: 3px 3px red, -3px -3px blue; transform: translate(0, 0); }
            20% { text-shadow: -3px -3px red, 3px 3px blue; transform: translate(1px, -1px); }
            40% { text-shadow: 3px -3px red, -3px 3px blue; transform: translate(-1px, 1px); }
            60% { text-shadow: -3px 3px red, 3px -3px blue; transform: translate(1px, 1px); }
            80% { text-shadow: 3px 3px red, -3px -3px blue; transform: translate(-1px, -1px); }
            100% { text-shadow: -3px -3px red, 3px 3px blue; transform: translate(0, 0); }
          }
          .glitch {
            animation: glitch 0.8s infinite;
          }

          /* Rocket Animation - Smoother Up & Down with Rotation */
          @keyframes rocketMove {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(-2deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
            75% { transform: translateY(-10px) rotate(-2deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          .animated-rocket {
            animation: rocketMove 3s infinite ease-in-out;
          }

          /* Flickering Flame Animation */
          @keyframes flameFlicker {
            0% { opacity: 0.5; transform: scaleY(1); }
            50% { opacity: 1; transform: scaleY(1.2); }
            100% { opacity: 0.5; transform: scaleY(1); }
          }
          .flame {
            width: 10px;
            height: 20px;
            background: linear-gradient(to top, orange, red, yellow);
            border-radius: 50%;
            animation: flameFlicker 0.2s infinite alternate;
          }

          /* Neon Button Glow */
          .neon-glow {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
          }
          .neon-glow:hover {
            box-shadow: 0 0 20px rgba(59, 130, 246, 1);
          }
        `}
      </style>
    </section>
  );
};

export default PageNotFound;
