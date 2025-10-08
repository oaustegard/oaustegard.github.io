# The Bsky Report (SPA Edition)

A single-page application that displays the current top links on BlueSky.

**[Live Demo](https://austegard.com/bsky/report.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/report.html)**

## Overview

This tool provides a continuously updated report of the most frequently shared links on the BlueSky network over the last 24 hours. It is a pure client-side implementation that fetches data directly from the BlueSky firehose and aggregates the links in real-time.

## Features

- **Top Links**: Displays a ranked list of the most popular links.
- **Real-time Updates**: The report is updated automatically at a configurable interval.
- **Language Filtering**: Allows you to filter the firehose stream by language.
- **Statistics**: Shows the number of processed posts and unique URLs found.

## Usage

1. **Open the Page**: Simply navigate to the page to start the report.
2. **Select Language**: Choose a language from the dropdown to filter the posts.
3. **Set Update Interval**: Select how frequently you want the report to update.
4. **View Links**: The list of top links will populate and update automatically.

## Technical Details

- Built with vanilla JavaScript.
- Connects to the BlueSky firehose to process posts in real-time.
- All processing and aggregation happens in the user's browser.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
Inspired by George Black's [theblue.report](https://theblue.report/).