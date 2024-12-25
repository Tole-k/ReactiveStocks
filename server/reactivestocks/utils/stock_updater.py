from django.core.cache import cache
from datetime import datetime
import requests

updater = True
APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'
CACHE_TIMEOUT = 300


def update(stocks):
    if not updater:
        return
    if len(stocks) == 0:
        return
    symbols = ','.join([stock.symbol for stock in stocks])
    cache_key = f'stock_data_{symbols}'
    cached_data = cache.get(cache_key)
    current_time = datetime.now()

    if cached_data and (current_time - cached_data['timestamp']).total_seconds() < CACHE_TIMEOUT:
        data = cached_data['data']
    else:
        data = requests.get(
            f'https://financialmodelingprep.com/api/v3/quote/{symbols}?apikey={APIKEY}').json()
        cache.set(cache_key, {'data': data,
                  'timestamp': current_time}, CACHE_TIMEOUT)
    for i, stock in enumerate(stocks):
        stock.price = data[i]['price']
        stock.changesPercentage = data[i]['changesPercentage']
        stock.change = data[i]['change']
        stock.dayLow = data[i]['dayLow']
        stock.dayHigh = data[i]['dayHigh']
        stock.yearHigh = data[i]['yearHigh']
        stock.yearLow = data[i]['yearLow']
        stock.marketCap = data[i]['marketCap']
        stock.priceAvg50 = data[i]['priceAvg50']
        stock.priceAvg200 = data[i]['priceAvg200']
        stock.volume = data[i]['volume']
        stock.avgVolume = data[i]['avgVolume']
        stock.open = data[i]['open']
        stock.previousClose = data[i]['previousClose']
        stock.eps = data[i]['eps']
        stock.pe = data[i]['pe']
        stock.earningsAnnouncement = data[i]['earningsAnnouncement']
        stock.sharesOutstanding = data[i]['sharesOutstanding']
        stock.timestamp = data[i]['timestamp']
        stock.save()
