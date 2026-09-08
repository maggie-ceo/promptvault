import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            PromptVault
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/prompts" className="text-gray-600 hover:text-blue-600 font-medium">
              Prompts
            </Link>
            <Link href="/prompts?type=skill" className="text-gray-600 hover:text-blue-600 font-medium">
              Skills
            </Link>
            <Link href="/prompts?type=workflow" className="text-gray-600 hover:text-blue-600 font-medium">
              Workflows
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Submit
            </Link>
            <Link
              href="/api/auth/login"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
