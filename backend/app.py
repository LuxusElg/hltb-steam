from flask import Flask, render_template, request
from howlongtobeatpy import HowLongToBeat
from flask_cors import CORS
import requests
import redis
import json

redisCxn = None
app = Flask(__name__)
CORS(app)

# Steam Web API endpoints
STEAM_API_BASE_URL = "http://api.steampowered.com/"
STEAM_API_OWNED_GAMES = "IPlayerService/GetOwnedGames/v0001/"
STEAM_API_RESOLVE_VANITY = "ISteamUser/ResolveVanityURL/v1/"

# steam web api key
STEAM_API_KEY = '6DF81CF5503472E1530B49404D6A591D'

def getOwnedGamesById(steamid):
    params = {
        'key': STEAM_API_KEY,
        'steamid': steamid,
        'include_appinfo': 1,
        'format': 'json'
    }
    response = requests.get(STEAM_API_BASE_URL + STEAM_API_OWNED_GAMES, params=params)
    try:
        rjson = response.json()
        return rjson['response']['games']
    except:
        print('couldn\'nt get owned games from steamid')
        exit

def getSteamIdByVanityUrl(vanityUrl):
    params = {
        'key': STEAM_API_KEY,
        'vanityurl': vanityUrl,
        'format': 'json'
    }
    response = requests.get(STEAM_API_BASE_URL + STEAM_API_RESOLVE_VANITY, params=params)
    try:
        rjson = response.json()
        return rjson['response']['steamid']
    except:
        print('couldn\'nt get steamid from vanity url')
        exit

def getHowLongToBeatByName(gameName):
    redis_value = redisCxn.get(gameName)
    if redis_value is not None:
        return json.loads(redis_value)
    results = HowLongToBeat().search(gameName)
    if results is not None and len(results) > 0:
        best_result = max(results, key=lambda element: element.similarity)
        redisCxn.set(gameName, json.dumps(best_result))
        return {
            'name': best_result.game_name,
            'main': best_result.main_story,
            'extra': best_result.main_extra,
            'complete': best_result.completionist,
            'all': best_result.all_styles
        }
    return None

def getGamesFromSteamAccount(identifier):
    if not identifier.isnumeric():
        identifier = getSteamIdByVanityUrl(identifier)
    games = getOwnedGamesById(identifier)
    return games

def getHltbForGames(games):
    for game in games:
        hltb = getHowLongToBeatByName(game['name'])
        if hltb is not None:
            game['hltb'] = hltb
    return games

def filterGameName(name):
    alphabet = list('abcdefghijklmnopqrstxyz0123456789 ')
    filtered = ''.join(i for i in name if any(i in x for x in alphabet))
    return filtered

@app.route('/hltb', methods=['GET', 'POST'])
def hltb():
    if request.method == 'POST':
        game_name = request.json['game']
    else:
        game_name = request.args.get('game')
    game_result = getHowLongToBeatByName(game_name)
    if game_result is None:
        game_name = filterGameName(game_name.lower())
        game_result = getHowLongToBeatByName(game_name)
    if game_result is None:
        return {'error': "no game found"}, 404
    return game_result

@app.route('/games', methods=['GET', 'POST'])
def games():
    if request.method == 'POST':
        steamid = request.json['id']
    else:
        steamid = request.args.get('id')
    return getGamesFromSteamAccount(steamid)

if __name__ == '__main__':
    redisCxn = redis.Redis(decode_responses=True)
    redisCxn.ping()
    app.run(debug=True)
