import React, { useState } from 'react'
import GameList from './components/GameList.tsx';
import './App.css'

const App: React.FC = () => {
  const [steamId, setSteamId] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSteamId(e.currentTarget.elements.namedItem('steamId')?.value || '');
  };

  return (
    <>
      <div className="w-full sm:max-w-6xl mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl space-y-8">
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-300">How Long To Beat Your Steam Library?</h2>
            <form onSubmit={handleSearch}>
              <div className="md:flex md:justify-center mb-6 space-x-4">
                <input type="text" name="steamId" className="text-sm text-gray-300 p-2 w-80 ring-1 ring-slate-900/10 shadow-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 caret-indigo-600 dark:bg-slate-900 dark:ring-0 dark:highlight-white/5 dark:focus:ring-2 dark:focus:ring-indigo-600 dark:focus:bg-slate-900" placeholder="Enter Steam username or userid" />
                <button type="submit" className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Search</button>
              </div>
            </form>
            {steamId && <GameList steamId={steamId} />}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
