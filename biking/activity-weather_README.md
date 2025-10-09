# Activity Weather Advisor

A web-based tool to get weather-based advice for your outdoor activities.

**[Live Demo](https://austegard.com/biking/activity-weather.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/biking/activity-weather.html)**

## Overview

This tool helps you decide the best time to go for an outdoor activity by fetching detailed, location-specific weather forecasts. It integrates with Claude AI to provide a natural language recommendation based on the weather data.

## Features

- **Location-based Forecasts**: Uses your device's location or a manually selected point on a map to get forecasts from the National Weather Service (weather.gov).
- **Custom Activities**: Input any activity, like "go for a bike ride" or "have a picnic".
- **Flexible Timeframes**: Get forecasts for today, tomorrow, the next day, or the entire week.
- **AI-Powered Advice**: Sends the filtered weather data to Claude AI with a tailored prompt to get the best time for your activity.
- **Privacy-Focused**: Runs entirely in your browser. No location data is stored or sent to any server except for the weather and AI providers.

## Usage

1.  Allow location access when prompted, or click on the map to set your location.
2.  Type in the activity you want to do (e.g., "ride my bike").
3.  Select your desired timeframe ("Today", "Tomorrow", etc.).
4.  The tool will fetch and display the relevant weather data.
5.  Click "Get Claude's Best Weather Recommendation" to open Claude.ai with a pre-filled prompt containing the weather data and your question.

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS.
- Uses the [OpenLayers](https://openlayers.org/) library for map functionality.
- Fetches data directly from the [weather.gov API](https://www.weather.gov/documentation/services-web-api).
- No server-side backend; the entire application is client-side.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))