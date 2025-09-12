const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./supabase/**/*.{js,ts,jsx,tsx}",
	],
	presets: [require("nativewind/preset")],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				black: "#0D0D0D",
				white: "#FFFFFF",
				gray: {
					50: "#F9FAFB",
					100: "#F3F4F6",
					200: "#E5E7EB",
					300: "#D1D5DB",
					400: "#9CA3AF",
					500: "#6B7280",
					600: "#4B5563",
					700: "#374151",
					800: "#1F2937",
					900: "#111827",
					950: "#030712",
				},
				brand: {
					DEFAULT: "#1C1C1C",
					50: "#F6F6F6",
					100: "#E7E7E7",
					200: "#D1D1D1",
					300: "#B0B0B0",
					400: "#888888",
					500: "#6D6D6D",
					600: "#5D5D5D",
					700: "#4F4F4F",
					800: "#454545",
					900: "#3D3D3D",
					950: "#262626",
				},
				background: {
					light: "#FFFFFF",
					dark: "#0F0F0F",
				},
				foreground: {
					light: "#0D0D0D",
					dark: "#F9FAFB",
				},
				muted: {
					light: "#F3F4F6",
					dark: "#1F2937",
				},
				border: {
					light: "#E5E7EB",
					dark: "#374151",
				},
				card: {
					light: "#FFFFFF",
					dark: "#1F2937",
				},
			},
			borderWidth: {
				hairline: hairlineWidth(),
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("nativewind/preset")],
};
