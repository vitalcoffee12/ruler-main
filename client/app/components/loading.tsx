export default function Loading() {
  return (
    <div className="h-full w-full bg-white flex flex-col justify-center items-center min-h-screen">
      <div className="loader mb-2"></div>
      Loading...
      <div className="absolute bottom-24">
        <span className="border rounded-md px-2 py-1 mr-2">Tip</span>
        {tips[0]}
      </div>
    </div>
  );
}

const tips = [
  "You can access your rulers from any device by logging into your account.",
  "Regularly update your password to keep your account secure.",
  "Use the search feature to quickly find specific rulers in your collection.",
  "Customize your profile to make your account uniquely yours.",
  "Check out our FAQ section for answers to common questions.",
];
