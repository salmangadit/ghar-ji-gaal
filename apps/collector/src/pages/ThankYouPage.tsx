export function ThankYouPage() {
  const shareText = 'Help preserve the Memoni language! Share your knowledge with the Ghar ji Ghaal project.';

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: 'Ghar ji Ghaal — Memoni Language', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Message copied to clipboard!');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-6 text-center max-w-lg mx-auto">
      <div className="text-6xl">🙏</div>
      <div>
        <h1 className="text-2xl font-extrabold">Shukriya!</h1>
        <p className="text-gray-500 mt-1">Thank you for your contribution</p>
      </div>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-sm text-gray-600 leading-relaxed">
        <p>
          Every word you share helps preserve the Memoni language for the next generation.
          Your contribution will be reviewed and — if verified — used to teach Memoni children around the world.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Share with another Memon speaker
        </button>
        <p className="text-xs text-gray-400">
          Know someone else who speaks Memoni? Invite them to contribute!
        </p>
      </div>
    </div>
  );
}
