import { Link } from 'react-router-dom';

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="mb-6">If you can see this, routing is working correctly!</p>
      <Link 
        to="/" 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
}
