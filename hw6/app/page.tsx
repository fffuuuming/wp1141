import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Line Chatbot System
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Welcome to the Line Chatbot Management System
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            📊 進入管理後台
          </Link>
        </div>
      </div>
    </main>
  );
}

