# Age Multiplier Calculator

A web-based tool to calculate when one person's age is a multiple of another's.

**[Live Demo](https://austegard.com/fun-and-games/IAmNTimesAsOldAsYou.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/IAmNTimesAsOldAsYou.html)**

## Overview

This calculator takes the birthdates of two people and determines the ratio of their ages. It displays their current ages, the current multiplier (e.g., the older person is 2.5x the age of the younger person), and calculates future dates when the older person's age will be an exact integer multiple (2x, 3x, 4x, etc.) of the younger person's age.

## Features

-   **Current Age Calculation**: Calculates the current age of both individuals based on their birthdates.
-   **Age Multiplier**: Shows the current non-integer multiplier of the older person's age relative to the younger person's.
-   **Future Date Prediction**: Lists upcoming dates when the older person will be exactly twice, three times, etc., the age of the younger person.
-   **Variable Precision**: Allows for calculations to be based on years, months, or days for different levels of accuracy.
-   **Shareable Links**: Saves the entered birthdates and precision in the URL, so you can share your calculations.
-   **Client-Side Operation**: All calculations are performed in your browser, and no data is sent to a server.

## Usage

1.  Open the [Age Multiplier Calculator](https://austegard.com/fun-and-games/IAmNTimesAsOldAsYou.html).
2.  Enter the birthdate for the **Older Person**.
3.  Enter the birthdate for the **Younger Person**.
4.  Optionally, change the **Calculation Precision** (defaults to Years).
5.  Click **Calculate Ages**.
6.  The results will appear below, showing the current ages and a list of future dates for integer multiples.

## Technical Details

-   Built with vanilla JavaScript, HTML, and CSS.
-   Uses URL `searchParams` to store and retrieve input data, allowing for easy sharing of results.
-   Performs all date and age calculations client-side.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.