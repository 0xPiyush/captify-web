const daisyui = require("daisyui");
const typography = require("@tailwindcss/typography");

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {}
	},

	plugins: [typography, daisyui],

	daisyui: {
		themes: ["dracula", "retro"]
	}
};

module.exports = config;
