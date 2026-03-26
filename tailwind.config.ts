import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		screens: {
  			'xs': '475px',
  			'3xl': '1600px',
  		},
  		spacing: {
  			'safe-top': 'env(safe-area-inset-top)',
  			'safe-bottom': 'env(safe-area-inset-bottom)',
  			'safe-left': 'env(safe-area-inset-left)',
  			'safe-right': 'env(safe-area-inset-right)',
  		},
  		colors: {
  			// Campus Aid Buddy Global Color Palette - Orange, Black, #74aa95
  			border: '#b8d4c7',
  			input: '#b8d4c7',
  			ring: '#ff8000',
  			background: '#fefefe',
  			foreground: '#000000',
  			primary: {
  				50: '#fff7ed',
  				100: '#ffedd5',
  				200: '#fed7aa',
  				300: '#fdba74',
  				400: '#fb923c',
  				500: '#ff8000',
  				600: '#ea580c',
  				700: '#c2410c',
  				800: '#9a3412',
  				900: '#7c2d12',
  				950: '#000000',
  				DEFAULT: '#ff8000',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				50: '#f0f9f6',
  				100: '#dcf2ea',
  				200: '#bce5d6',
  				300: '#8dd1b8',
  				400: '#5eb899',
  				500: '#74aa95',
  				600: '#5d8a77',
  				700: '#4a6e5f',
  				800: '#3d5850',
  				900: '#344943',
  				950: '#1c2925',
  				DEFAULT: '#74aa95',
  				foreground: '#ffffff'
  			},
  			destructive: {
  				DEFAULT: '#dc2626',
  				foreground: '#ffffff'
  			},
  			muted: {
  				DEFAULT: '#d4e8dd',
  				foreground: '#000000'
  			},
  			accent: {
  				50: '#fff7ed',
  				100: '#ffedd5',
  				200: '#fed7aa',
  				300: '#fdba74',
  				400: '#fb923c',
  				500: '#ff8000',
  				600: '#ea580c',
  				700: '#c2410c',
  				800: '#9a3412',
  				900: '#7c2d12',
  				950: '#431407',
  				DEFAULT: '#ff8000',
  				foreground: '#000000'
  			},
  			popover: {
  				DEFAULT: '#fefefe',
  				foreground: '#000000'
  			},
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#000000'
  			},
  			sidebar: {
  				DEFAULT: '#ffffff',
  				foreground: '#000000',
  				primary: '#ff8000',
  				'primary-foreground': '#ffffff',
  				accent: '#74aa95',
  				'accent-foreground': '#ffffff',
  				border: '#b8d4c7',
  				ring: '#ff8000'
  			},
  			// Additional semantic colors
  			success: '#74aa95',
  			warning: '#ff8000',
  			error: '#dc2626',
  			info: '#74aa95'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  			],
  			inter: [
  				'Inter',
  				'sans-serif',
  			],
  			headline: [
  				'Manrope',
  				'sans-serif',
  			],
  			serif: [
  				'Libre Caslon Text',
  				'ui-serif',
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  			]
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;