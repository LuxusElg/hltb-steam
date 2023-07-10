import React,{ useEffect, useState } from 'react';
import { fetchGames, fetchHltb, GameProps, HltbProps } from '../api.js';

interface GameListProps {
    steamId: string;
}

const GameList: React.FC<GameListProps> = ({ steamId }) => {
  const [games, setGames] = useState<GameProps[]>([]);
  const theads = [
    { label: 'Game Name', accessor: 'name' },
    { label: 'Playtime (Hours)', accessor: 'playtime_forever' },
    { label: 'Main Story', accessor: 'main' },
    { label: 'Main + Extras', accessor: 'extras' },
    { label: 'Completionist', accessor: 'complete' },
    { label: 'All Styles', accessor: 'all' },
  ];
  const [updatedGames, setUpdatedGames] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [sortField, setSortField] = useState<string>('name');
  const [currentSteamId, setCurrentSteamId] = useState<string>('');

  useEffect(() => {
    if (games.length === 0 || steamId !== currentSteamId) {
      getGames();
    }
  }, [steamId]);

  useEffect(() => {
    if (games.length > 0) {
      games.map(async (game) => {
        const hltbData = await fetchHltbForGame(game);
        if (hltbData === null) {
          return;
        }
        game.main = hltbData.main;
        game.extra = hltbData.extra;
        game.complete = hltbData.complete;
        game.all = hltbData.all;
        setGames((prevGames) => 
          prevGames.map((prevGame) => (prevGame.appid === game.appid ? game : prevGame))
        );
      });
    }
  });

  const getGames = async (): Promise<void> => {
    setCurrentSteamId(steamId);
    setGames([]);
    const gamesData = await fetchGamesForUser(steamId);
    setGames(gamesData);
  }

  const fetchGamesForUser = async (steamId: string): Promise<GameProps[]> => {
    setUpdatedGames([]);
    const gamesData = await fetchGames(steamId);
    return gamesData;
  };

  const fetchHltbForGame = async (game: GameProps): Promise<HltbProps | null> => {
    if (updatedGames.includes(game.appid)) {
      return null;
    }

    const newUpdatedGames = updatedGames;
    newUpdatedGames.push(game.appid);
    setUpdatedGames(newUpdatedGames);

    const hltbData = await fetchHltb(game.name);
    return hltbData;
  };

  const convertHoursToTime = (hours: number): string => {
    if (typeof hours === 'undefined' || Number.isNaN(hours)) return '-';

    let tHours = Math.floor(hours);
    let tMinutes = Math.floor((hours - tHours) * 60);
    
    return tHours+"h "+tMinutes+"m";
  };

  const handleSortingChange = (accessor: string) => {
    const newSortOrder = accessor === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(accessor);
    setSortOrder(newSortOrder);
    handleSorting(accessor, newSortOrder);
  };

  const handleSorting = (newSortField:string, newSortOrder:string) => {
    if (newSortField) {
      const sorted = [...games].sort((a,b) => {
        let sortA = a[newSortField];
        sortA = typeof sortA === 'undefined' ? 0 : sortA;
        let sortB = b[newSortField];
        sortB = typeof sortB === 'undefined' ? 0 : sortB;
        return (
          sortA.toString().localeCompare(sortB.toString(), "en", {
            numeric: true,
          }) * (newSortOrder == "asc" ? 1 : -1)
        );
      });
      setGames(sorted);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-center tracking-tight text-gray-300">Found {games.length} games for user {steamId}</h1>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr>
            {theads.map((title) => (
              <th key={title.accessor} onClick={() => handleSortingChange(title.accessor)} className="border-b dark:border-slate-600 font-medium text-left text-gray-300">{title.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.appid} className="odd:bg-slate-700">
              <td className="text-gray-300">{game.name}</td>
              <td className="text-gray-300">{convertHoursToTime(game.playtime_forever/60)}</td>
              <td className="text-gray-300">{convertHoursToTime(game.main)}</td>
              <td className="text-gray-300">{convertHoursToTime(game.extra)}</td>
              <td className="text-gray-300">{convertHoursToTime(game.complete)}</td>
              <td className="text-gray-300">{convertHoursToTime(game.all)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameList;