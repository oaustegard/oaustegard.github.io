# Bicycle Tire Air Volume Calculator

A web-based tool for calculating bicycle tire air volume and understanding the effects of temperature on tire pressure.

**[Live Demo](https://austegard.com/biking/tire-volume.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/biking/tire-volume.html)**

## Overview

This tool provides detailed calculations for bicycle tire volume based on tire width, rim width, and wheel diameter. It also includes a feature to calculate how ambient and operating temperatures affect tire pressure, based on Gay-Lussac's Law.

## Features

-   **Tire Volume Calculation**: Calculates the internal air volume of a tire in milliliters.
-   **Equivalent Air Volume**: Shows the volume of air at ambient pressure required to inflate the tire to the target pressure.
-   **Temperature Adjustment**: Calculates the necessary inflation pressure at a given ambient temperature to achieve a target pressure at a different operating temperature.
-   **Component-based UI**: Built with Preact for a reactive and modern user experience.
-   **Configuration Comparison**: Save a tire setup and compare it against a new one to see the percentage difference in volume and air mass.
-   **Unit Conversion**: Easily switch between PSI and BAR for pressure inputs.

## Usage

1.  Use the sliders to set your tire's width and your rim's internal width.
2.  Select your wheel's Bead Seat Diameter (BSD) from the dropdown.
3.  Set your target inflation pressure.
4.  Optionally, enable "temperature adjustment" to see how temperature changes will affect pressure.
5.  Use the "Save Current Setup" button to store a configuration for comparison.

## Technical Details

-   Frontend built with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm) for a JSX-like syntax in plain JavaScript.
-   State management handled by [@preact/signals](https://preactjs.com/guide/v10/signals/).
-   Styled with [TailwindCSS](https://tailwindcss.com/).
-   Uses a cylindrical volume formula with a correction factor for tire type.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)), with methodology inspired by Fast Fitness Tips.