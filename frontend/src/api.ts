async function postData(url:string, data:any) {
    const response = await fetch(url, {
        method: "POST",
        cache: "force-cache",
        mode: "cors", 
        headers: new Headers({
            "content-type": "application/json",
            "accept": "application/json"
        }),
        body: JSON.stringify(data),
    });
    return response.json();
}
export async function fetchGames(steamId:string): Promise<GameProps[]> {
    return await postData('http://127.0.0.1:5000/games', {id:steamId});
}
export async function fetchHltb(gameName:string): Promise<HltbProps> {
    return await postData('http://127.0.0.1:5000/hltb', {game:gameName});
}

export interface GameProps {
    appid: string;
    name: string;
    img_icon_url: string;
    playtime_forever: number;
    all: number;
    complete: number;
    extra: number;
    main: number;
}

export interface HltbProps {
    all: number;
    complete: number;
    extra: number;
    main: number;
    name: string;
}