import { Request, Response } from 'express';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export const searchBGG = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query) {
      res.status(400).json({ message: 'Parametar pretrage je obavezan.' });
      return;
    }

    const response = await axios.get(
      `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query as string)}&type=boardgame`
    );

    const result = await parseStringPromise(response.data);

    if (!result.items || !result.items.item) {
      res.json([]);
      return;
    }

    const games = result.items.item.slice(0, 10).map((item: any) => ({
      bggId: item.$.id,
      name: item.name?.[0]?.$.value || 'Unknown',
      yearPublished: item.yearpublished?.[0]?.$.value || null
    }));

    res.json(games);
  } catch (error) {
    console.error('BGG search error:', error);
    res.status(500).json({ message: 'Greska pri pretrazi BoardGameGeek.' });
  }
};

export const getBGGDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`
    );

    const result = await parseStringPromise(response.data);

    if (!result.items || !result.items.item || result.items.item.length === 0) {
      res.status(404).json({ message: 'Igra nije pronadjena na BGG.' });
      return;
    }

    const item = result.items.item[0];

    const game = {
      bggId: item.$.id,
      name: item.name?.find((n: any) => n.$.type === 'primary')?.$.value || item.name?.[0]?.$.value,
      description: item.description?.[0] || '',
      minPlayers: parseInt(item.minplayers?.[0]?.$.value) || 2,
      maxPlayers: parseInt(item.maxplayers?.[0]?.$.value) || 4,
      yearPublished: item.yearpublished?.[0]?.$.value || null
    };

    res.json(game);
  } catch (error) {
    console.error('BGG details error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju detalja igre sa BGG.' });
  }
};

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.query;

    if (!city) {
      res.status(400).json({ message: 'Grad je obavezan parametar.' });
      return;
    }

    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo';

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city as string)}&appid=${apiKey}&units=metric&lang=sr`
    );

    const weather = {
      city: response.data.name,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };

    res.json(weather);
  } catch (error: any) {
    if (error.response?.status === 404) {
      res.status(404).json({ message: 'Grad nije pronadjen.' });
      return;
    }
    console.error('Weather API error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju vremenske prognoze.' });
  }
};
